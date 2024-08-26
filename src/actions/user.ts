"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function get_user_info() {
  const cookieStore = cookies();
  const session_token = cookieStore.get("session_token")?.value;

  if (!session_token) {
    return null;
  }

  try {
    const { data: session_data, error: session_error } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("token", session_token)
      .single();

    if (session_error || !session_data) {
      return null;
    }

    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("email")
      .eq("id", session_data.user_id)
      .single();

    if (user_error || !user_data) {
      return null;
    }

    return { email: user_data.email };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}