"use server";

import { createClient } from "@supabase/supabase-js";
import { User } from "@/types/user";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function invite_user(email: string): Promise<{ error: string } | { success: string }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ status: "invited" })
      .eq("email", email)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { error: "User not found" };
      }
      throw error;
    }

    return { success: `User ${email} has been invited` };
  } catch (error: any) {
    console.error("Error inviting user:", error);
    return { error: "Failed to invite user. Please try again." };
  }
}

export async function fetch_users(search: string, page: number): Promise<{ error: string } | { users: User[], has_more: boolean }> {
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
      has_more: count ? count > (page * page_size) : false,
    };
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users. Please try again." };
  }
}