import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin_email = process.env.ADMIN_EMAIL!;

const supabase = createClient(supabase_url, supabase_service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function middleware(request: NextRequest) {
  const session_token = request.cookies.get("session_token")?.value;

  if (request.nextUrl.pathname === "/") {
    if (session_token) {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("user_id")
        .eq("token", session_token)
        .single();

      if (data && !error) {
        return NextResponse.redirect(new URL("/~", request.url));
      }
    }
    return NextResponse.next();
  }

  if (
    request.nextUrl.pathname === "/~" ||
    request.nextUrl.pathname.startsWith("/admin")
  ) {
    if (!session_token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: session_data, error: session_error } = await supabase
      .from("user_sessions")
      .select("user_id")
      .eq("token", session_token)
      .single();

    if (!session_data || session_error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/admin")) {
      const { data: user_data, error: user_error } = await supabase
        .from("users")
        .select("email")
        .eq("id", session_data.user_id)
        .single();

      if (user_error || user_data.email !== admin_email) {
        return NextResponse.redirect(new URL("/~", request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/~", "/admin/:path*"],
};
