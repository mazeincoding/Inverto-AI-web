"use server";

import { createClient } from "@supabase/supabase-js";
import { User } from "@/types/user";
import { send_invitation_email } from "@/utils/email";
import { randomBytes } from "crypto";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function invite_user(
  email: string,
  action: "invite_user" | "revoke_invitation"
): Promise<{ error: string } | { success: string }> {
  try {
    const new_status = action === "invite_user" ? "invited" : "waitlisted";
    const { data, error } = await supabase
      .from("users")
      .update({ status: new_status })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { error: "User not found" };
      }
      throw error;
    }

    if (action === "invite_user") {
      const magic_token = randomBytes(32).toString("hex");
      const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const { error: magic_link_error } = await supabase
        .from("magic_links")
        .insert({
          user_id: data.id,
          token: magic_token,
          expires_at: expires_at.toISOString(),
        });

      if (magic_link_error) {
        throw magic_link_error;
      }

      const magic_link = `${process.env.NEXT_PUBLIC_APP_URL}/login?token=${magic_token}`;
      await send_invitation_email(email, magic_link);
    }

    const action_text =
      action === "invite_user" ? "invited" : "invitation revoked for";
    return { success: `User ${email} has been ${action_text}` };
  } catch (error: any) {
    return { error: "Failed to update user status. Please try again." };
  }
}

export async function fetch_users(
  search: string,
  page: number
): Promise<{ error: string } | { users: User[]; has_more: boolean }> {
  const page_size = 50;
  const start = (page - 1) * page_size;

  try {
    let query = supabase
      .from("users")
      .select("id, email, status", { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(start, start + page_size - 1);

    if (error) throw error;

    return {
      users: data as User[],
      has_more: count ? count > page * page_size : false,
    };
  } catch (error: any) {
    return { error: "Failed to fetch users. Please try again." };
  }
}

export async function delete_user(
  email: string
): Promise<{ error: string } | { success: string }> {
  try {
    // First, fetch the user's ID
    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (user_error || !user_data) {
      console.error("Error fetching user:", user_error);
      throw new Error("User not found");
    }

    const user_id = user_data.id;

    // Delete related records from user_seen_announcements
    const { error: seen_announcements_error } = await supabase
      .from("user_seen_announcements")
      .delete()
      .eq("user_id", user_id);

    if (seen_announcements_error) {
      console.error("Error deleting user_seen_announcements:", seen_announcements_error);
      throw seen_announcements_error;
    }

    // Now delete the user
    const { error: delete_error } = await supabase
      .from("users")
      .delete()
      .eq("id", user_id);

    if (delete_error) {
      console.error("Error deleting user:", delete_error);
      throw delete_error;
    }

    console.log(`User ${email} deleted successfully`);
    return { success: `User ${email} has been deleted` };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user. Please try again." };
  }
}
