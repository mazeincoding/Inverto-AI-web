"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "maze@standsync.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function send_verification_email(email: string, code: string) {
  const mail_options = {
    from: '"StandSync" <hello@standsync.com>',
    to: email,
    subject: "Your StandSync Verification Code",
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  };

  await transporter.sendMail(mail_options);
}

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

    if (user.status !== 'invited' && user.status !== 'active') {
      return { error: "Looks like you haven't been invited yet! But don't worry, we'll let you know when it's your turn." };
    }

    const verification_code = randomBytes(3).toString("hex").toUpperCase();
    const expires_at = new Date(Date.now() + 15 * 60 * 1000);

    const { error: insert_error } = await supabase
      .from("verification_codes")
      .insert({
        user_id: user.id,
        code: verification_code,
        expires_at: expires_at.toISOString(),
      });

    if (insert_error) {
      throw insert_error;
    }

    await send_verification_email(email, verification_code);

    return { success: "Verification code sent to your email" };
  } catch (error: any) {
    return { error: "Login failed. Please try again" };
  }
}

export async function verify_code(email: string, code: string) {
  try {
    console.log(`Verifying code for email: ${email}`);

    const { data: user, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (user_error) {
      console.error("Error fetching user:", user_error);
      throw user_error;
    }

    console.log(`User found with id: ${user.id}`);

    const { data: verification, error: verification_error } = await supabase
      .from("verification_codes")
      .select()
      .eq("user_id", user.id)
      .eq("code", code)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verification_error) {
      if (verification_error.code === "PGRST116") {
        console.log("Invalid or expired verification code");
        return { error: "Invalid or expired verification code" };
      }
      console.error("Error verifying code:", verification_error);
      throw verification_error;
    }

    console.log("Verification code is valid");

    // Code is valid, update user status if needed
    const { error: update_error } = await supabase
      .from("users")
      .update({ status: "active" })
      .eq("id", user.id);

    if (update_error) {
      console.error("Error updating user status:", update_error);
      throw update_error;
    }

    console.log("User status updated to active");

    // Generate a session token
    const session_token = randomBytes(32).toString("hex");

    // Store the session token
    const { error: insert_error } = await supabase
      .from("user_sessions")
      .insert({ 
        user_id: user.id, 
        token: session_token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      });

    if (insert_error) {
      console.error("Error inserting session token:", insert_error);
      throw insert_error;
    }

    console.log("Session token stored in database");

    // Set the session token as a cookie
    cookies().set({
      name: "session_token",
      value: session_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    console.log("Session token set as cookie");

    return { success: "Login successful" };
  } catch (error: any) {
    console.error("Verification failed:", error);
    return { error: "Verification failed. Please try again" };
  }
}