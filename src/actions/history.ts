"use server";

import { get_user_info } from "./user";
import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function save_handstand_history(duration: number, date: Date) {
  const user_info = await get_user_info();

  if (!user_info) {
    return { error: "User not authenticated" };
  }

  try {
    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", user_info.email)
      .single();

    if (user_error || !user_data) {
      console.error("Error fetching user data:", user_error);
      return { error: "Failed to fetch user data" };
    }

    const { error } = await supabase.from("handstand_history").insert({
      user_id: user_data.id,
      duration,
      date,
    });

    if (error) throw error;

    return { success: "Handstand history saved successfully" };
  } catch (error) {
    console.error("Error saving handstand history:", error);
    return { error: "Failed to save handstand history. Please try again." };
  }
}
