"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function submit_feedback(feedback_text: string) {
  const cookieStore = cookies();
  const session_token = cookieStore.get("session_token")?.value;

  if (!session_token) {
    return { error: "User not authenticated" };
  }

  try {
    const { data: session_data, error: session_error } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("token", session_token)
      .single();

    if (session_error || !session_data) {
      return { error: "Invalid session" };
    }

    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("email")
      .eq("id", session_data.user_id)
      .single();

    if (user_error || !user_data) {
      return { error: "User not found" };
    }

    const { error: feedback_error } = await supabase
      .from("feedback")
      .insert({
        user_email: user_data.email,
        feedback_text: feedback_text,
      });

    if (feedback_error) {
      throw feedback_error;
    }

    return { success: "Feedback submitted successfully" };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: "Failed to submit feedback" };
  }
}
