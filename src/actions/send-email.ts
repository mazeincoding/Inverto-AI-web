"use server";

import { z } from "zod";
import { createClient } from '@supabase/supabase-js'

const email_schema = z.object({
  email: z.string().email("Invalid email address"),
});

// Initialize Supabase client
const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabase_anon_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabase_url || !supabase_anon_key) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabase_url, supabase_anon_key)

export async function subscribe_to_waitlist(form_data: FormData) {
  const validated_fields = email_schema.safeParse({
    email: form_data.get("email"),
  });

  if (!validated_fields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated_fields.data;

  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email: email, status: 'waitlisted' }
      ])
      .single()

    if (error) {
      if (error.code === '23505') {
        return { error: "Email already registered" };
      }
      throw error;
    }

    return {
      success: "You're on the list! We'll ping you when it's your turn to join.",
    };
  } catch (error: any) {
    console.error("Failed to store email:", error);
    return { error: "Subscription failed. Please try again" };
  }
}