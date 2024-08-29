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
  console.log("Saving handstand history:", duration, date);
  try {
    const user_info = await get_user_info();

    if (!user_info) {
      return { error: "User not authenticated" };
    }

    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", user_info.email)
      .single();

    if (user_error) {
      console.error("Error fetching user data:", user_error);
      return { error: "Failed to fetch user data" };
    }

    if (!user_data) {
      return { error: "User not found" };
    }

    const { error: insert_error } = await supabase
      .from("handstand_history")
      .insert({
        user_id: user_data.id,
        duration,
        date,
      });

    if (insert_error) {
      console.error("Error inserting history:", insert_error);
      return { error: "Failed to save history. Please try again." };
    }

    return { success: "Handstand history saved successfully" };
  } catch (error) {
    console.error("Unexpected error saving handstand history:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function get_handstand_history(
  limit: number = 10,
  offset: number = 0
) {
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

    const { data, error, count } = await supabase
      .from("handstand_history")
      .select("*", { count: "exact" })
      .eq("user_id", user_data.id)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data,
      total: count,
      hasMore: offset + limit < (count || 0),
    };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { error: "Failed to fetch history. Please try again." };
  }
}

export async function delete_handstand_session(session_id: string) {
  try {
    const user_info = await get_user_info();

    if (!user_info) {
      return { error: "User not authenticated" };
    }

    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", user_info.email)
      .single();

    if (user_error || !user_data) {
      console.error("Error fetching user data:", user_error);
      return { error: "Failed to fetch user data" };
    }

    const { error: delete_error } = await supabase
      .from("handstand_history")
      .delete()
      .eq("id", session_id)
      .eq("user_id", user_data.id);

    if (delete_error) {
      console.error("Error deleting session:", delete_error);
      return { error: "Failed to delete session. Please try again." };
    }

    return { success: "Handstand session deleted successfully" };
  } catch (error) {
    console.error("Unexpected error deleting handstand session:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
