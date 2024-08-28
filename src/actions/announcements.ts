"use server";

import { createClient } from "@supabase/supabase-js";
import { get_user_info } from "./user";

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
  const content = form_data.get("content") as string;

  if (!title || !summary || !content) {
    return { error: "Title, summary, and content are required" };
  }

  try {
    const { error } = await supabase
      .from("announcements")
      .insert({ title, summary, content });

    if (error) throw error;

    return { success: "Announcement created successfully" };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { error: "Failed to create announcement. Please try again." };
  }
}
