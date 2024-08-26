"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { User } from "@/types/user";
import { send_email } from "@/utils/email";

const email_schema = z.object({
  email: z.string().email("Invalid email address"),
});

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function initiate_login(
  form_data: FormData
): Promise<{ error: string } | { success: string }> {
  const validated_fields = email_schema.safeParse({
    email: form_data.get("email"),
  });

  if (!validated_fields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated_fields.data;

  try {
    const { data: user, error: user_error } = await supabase
      .from("users")
      .select("id, status")
      .eq("email", email)
      .single();

    if (user_error) {
      if (user_error.code === "PGRST116") {
        return { error: "User not found" };
      }
      throw user_error;
    }

    const typed_user = user as User;

    if (typed_user.status === 'waitlisted') {
      return { error: "You're on the waitlist. We'll notify you when you're invited." };
    }

    if (typed_user.status !== 'active' && typed_user.status !== 'invited') {
      return { error: "Your account is not active. Please contact support." };
    }

    const verification_code = randomBytes(3).toString("hex").toUpperCase();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    const { error: insert_error } = await supabase
      .from("verification_codes")
      .insert({
        user_id: typed_user.id,
        code: verification_code,
        expires_at: expires_at.toISOString(),
      });

    if (insert_error) {
      throw insert_error;
    }

    await send_email(
      email,
      "Your StandSync Verification Code",
      `Your verification code is: ${verification_code}`,
      `<p>Your verification code is: <strong>${verification_code}</strong></p>`
    );

    return { success: "Verification code sent to your email" };
  } catch (error: any) {
    return { error: "Login failed. Please try again" };
  }
}

export async function verify_magic_link(token: string): Promise<{ error: string } | { success: string, user_id: string, session_token: string }> {
  try {

    const { data, error } = await supabase
      .from("magic_links")
      .select("user_id, expires_at")
      .eq("token", token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Check if there's an active session for this token
        const { data: session_data, error: session_error } = await supabase
          .from("user_sessions")
          .select("user_id, token")
          .eq("token", token)
          .single();

        if (session_data) {
          return { success: "Login successful", user_id: session_data.user_id, session_token: session_data.token };
        }
      }
      return { error: "Invalid or expired magic link" };
    }

    if (!data) {
      return { error: "Invalid or expired magic link" };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { error: "Magic link has expired" };
    }

    // Generate and store session token
    const session_token = randomBytes(32).toString("hex");
    await supabase
      .from("user_sessions")
      .insert({ 
        user_id: data.user_id, 
        token: session_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });

    // Update user status to active
    await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", data.user_id);

    // Delete the used magic link
    await supabase
      .from("magic_links")
      .delete()
      .eq("token", token);

    return { success: "Login successful", user_id: data.user_id, session_token };
  } catch (error: any) {
    return { error: "Verification failed. Please try again" };
  }
}

export async function verify_code(email: string, code: string) {
  try {;
    const { data: user, error: user_error } = await supabase
      .from("users")
      .select("id, status")
      .eq("email", email)
      .single();

    if (user_error) {
      throw user_error;
    }

    const typed_user = user as User;

    const { data: verification, error: verification_error } = await supabase
      .from("verification_codes")
      .select()
      .eq("user_id", typed_user.id)
      .eq("code", code)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verification_error) {
      if (verification_error.code === "PGRST116") {
        return { error: "Invalid or expired verification code" };
      }
      throw verification_error;
    }

    // Update user status to active only if it was 'invited' before
    if (typed_user.status === 'invited') {
      const { error: update_error } = await supabase
        .from("users")
        .update({ status: "active" })
        .eq("id", typed_user.id);

      if (update_error) {
        throw update_error;
      }

    }

    // Generate a session token
    const session_token = randomBytes(32).toString("hex");

    // Store the session token
    const { error: insert_error } = await supabase
      .from("user_sessions")
      .insert({ 
        user_id: typed_user.id, 
        token: session_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });

    if (insert_error) {
      throw insert_error;
    }

    // Set the session token as a cookie
    cookies().set({
      name: "session_token",
      value: session_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });


    return { success: "Login successful" };
  } catch (error: any) {
    return { error: "Verification failed. Please try again" };
  }
}