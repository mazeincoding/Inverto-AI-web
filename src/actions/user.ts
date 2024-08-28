"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Announcement } from "@/types/announcement";

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

export async function get_unseen_announcements(
  user_email: string
): Promise<Announcement[]> {
  if (!user_email) {
    console.error(
      "Error fetching unseen announcements: user_email is undefined"
    );
    return [];
  }

  try {
    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", user_email)
      .single();

    if (user_error || !user_data) {
      console.error("Error fetching user data:", user_error);
      return [];
    }

    const user_id = user_data.id;

    const { data: seen_announcements, error: seen_error } = await supabase
      .from("user_seen_announcements")
      .select("announcement_id")
      .eq("user_id", user_id);

    if (seen_error) throw seen_error;

    const seen_ids = seen_announcements.map((a) => a.announcement_id);

    const { data, error } = await supabase
      .from("announcements")
      .select(
        "id, title, summary, version, created_at, additional_info, changes, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) throw error;

    // Filter out seen announcements on the client side
    const unseen_announcements =
      data?.filter((announcement) => !seen_ids.includes(announcement.id)) || [];

    return unseen_announcements;
  } catch (error) {
    console.error("Error fetching unseen announcements:", error);
    return [];
  }
}

export async function mark_announcements_as_seen(
  user_email: string,
  announcement_ids: string[]
) {
  try {
    const { data: user_data, error: user_error } = await supabase
      .from("users")
      .select("id")
      .eq("email", user_email)
      .single();

    if (user_error || !user_data) {
      console.error("Error fetching user data:", user_error);
      return;
    }

    const user_id = user_data.id;

    const { error } = await supabase.from("user_seen_announcements").insert(
      announcement_ids.map((id) => ({
        user_id,
        announcement_id: id,
        seen_at: new Date().toISOString(),
      }))
    );

    if (error) {
      console.error("Error inserting seen announcements:", error);
    } else {
      console.log(
        `Successfully marked ${announcement_ids.length} announcements as seen for user ${user_email}`
      );
    }
  } catch (error) {
    console.error("Error marking announcements as seen:", error);
  }
}
