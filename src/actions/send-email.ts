"use server";

import { z } from "zod";
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from "crypto";
import { send_email } from "@/utils/email";

const email_schema = z.object({
  email: z.string().email("Invalid email address"),
});

// Initialize Supabase client
const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function subscribe_to_waitlist(form_data: FormData) {
  // Bot detection checks
  const honeypot = form_data.get('name');
  const token = form_data.get('token');

  if (honeypot) {
    console.log("Bot detected: honeypot filled");
    return { error: "Invalid submission" };
  }

  if (!token) {
    console.log("Bot detected: missing token");
    return { error: "Invalid submission" };
  }

  const validated_fields = email_schema.safeParse({
    email: form_data.get("email"),
  });

  if (!validated_fields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated_fields.data;

  try {
    // Check if email already exists
    const { data: existing_user } = await supabase
      .from('users')
      .select('id, status')
      .eq('email', email)
      .single();

    if (existing_user) {
      if (existing_user.status === 'waitlisted') {
        return { error: "Email already registered. Please check your inbox for confirmation." };
      } else {
        return { error: "Email already registered." };
      }
    }

    // Generate confirmation token
    const confirmation_token = randomBytes(32).toString("hex");

    // Insert user with 'unconfirmed' status
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email: email, status: 'unconfirmed', confirmation_token: confirmation_token }
      ])
      .single();

    if (error) {
      throw error;
    }

    // Send confirmation email
    const confirmation_url = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-waitlist?token=${confirmation_token}`;
    await send_email(
      email,
      "Confirm your StandSync waitlist subscription",
      `Please confirm your email by clicking this link: ${confirmation_url}`,
      `<p>Please confirm your email by clicking this link: <a href="${confirmation_url}">${confirmation_url}</a></p>`
    );

    return {
      success: "Please check your email to confirm your waitlist subscription.",
    };
  } catch (error: any) {
    console.error("Failed to store email:", error);
    return { error: "Subscription failed. Please try again" };
  }
}

export async function confirm_waitlist_subscription(token: string) {
  try {
    // First, check if the user exists with the given token and status
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, status')
      .eq('confirmation_token', token)
      .eq('status', 'unconfirmed')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return { error: "Invalid or expired confirmation link." };
      }
      throw fetchError;
    }

    if (!user) {
      return { error: "Invalid or expired confirmation link." };
    }

    // If user found, update the status
    const { data, error: updateError } = await supabase
      .from('users')
      .update({ status: 'waitlisted', confirmation_token: null })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!data) {
      return { error: "Failed to update user status. Please try again." };
    }

    return { success: "Your waitlist subscription has been confirmed!" };
  } catch (error: any) {
    console.error("Failed to confirm subscription:", error);
    return { error: "Confirmation failed. Please try again" };
  }
}