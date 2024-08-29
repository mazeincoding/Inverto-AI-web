"use server";

import { createClient } from "@supabase/supabase-js";
import { get_user_info } from "./user";
import { Announcement } from "@/types/announcement";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function create_announcement(form_data: FormData) {
  const admin_email = process.env.ADMIN_EMAIL;
  const user_info = await get_user_info();

  if (!user_info || user_info.email !== admin_email) {
    return { error: "Unauthorized. Only the admin can create announcements." };
  }

  const title = form_data.get("title") as string;
  const summary = form_data.get("summary") as string;
  const additional_info = form_data.get("additional_info") as string;
  const changes = form_data.get("changes") as string;
  let version = form_data.get("version") as string;

  if (!title) {
    return {
      error: "Title is required",
    };
  }

  if (!summary) {
    return {
      error: "Summary is required",
    };
  }

  if (!changes) {
    return {
      error: "Changes are required",
    };
  }

  const changes_array = changes
    .split("\n")
    .filter((change) => change.trim() !== "");

  // Automatically generate version if not provided
  if (!version) {
    const { data: latest_announcement, error: fetch_error } = await supabase
      .from("announcements")
      .select("version")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetch_error) throw fetch_error;

    if (latest_announcement && latest_announcement.length > 0) {
      const latest_version = latest_announcement[0].version;
      const version_parts = latest_version.split(".");
      version_parts[version_parts.length - 1] = (
        parseInt(version_parts[version_parts.length - 1]) + 1
      ).toString();
      version = version_parts.join(".");
    } else {
      version = "1.0.0";
    }
  }

  try {
    const { error } = await supabase.from("announcements").insert({
      title,
      summary,
      additional_info: additional_info || null,
      changes: changes_array,
      version,
    });

    if (error) throw error;

    return { success: "Announcement created successfully" };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { error: "Failed to create announcement. Please try again." };
  }
}

export async function get_announcements(): Promise<
  { announcements: Announcement[] } | { error: string }
> {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { announcements: data as Announcement[] };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { error: "Failed to fetch announcements. Please try again." };
  }
}

export async function delete_announcement(id: string) {
  const admin_email = process.env.ADMIN_EMAIL;
  const user_info = await get_user_info();

  if (!user_info || user_info.email !== admin_email) {
    return { error: "Unauthorized. Only the admin can delete announcements." };
  }

  try {
    // First, delete related entries in user_seen_announcements
    const { error: delete_seen_error } = await supabase
      .from("user_seen_announcements")
      .delete()
      .eq("announcement_id", id);

    if (delete_seen_error) throw delete_seen_error;

    // Then, delete the announcement
    const { error: delete_announcement_error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (delete_announcement_error) throw delete_announcement_error;

    return { success: "Announcement and related data deleted successfully" };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { error: "Failed to delete announcement. Please try again." };
  }
}
