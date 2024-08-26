"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { initiate_login, verify_magic_link } from "@/actions/auth";
import { Loader2 } from "lucide-react";

function LoginContent() {
  const [email, set_email] = useState("");
  const [message, set_message] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const router = useRouter();
  const search_params = useSearchParams();
  const [is_loading, set_is_loading] = useState(false);

  const handle_magic_link = useCallback(
    async (token: string) => {
      set_is_loading(true);
      const result = await verify_magic_link(token);
      if ("error" in result) {
        set_message({ type: "error", content: result.error });
      } else {
        document.cookie = `session_token=${
          result.session_token
        }; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict; ${
          process.env.NODE_ENV === "production" ? "Secure" : ""
        }`;
        set_message({ type: "success", content: "Login successful" });
        router.push("/~");
      }
      set_is_loading(false);
    },
    [router]
  );

  useEffect(() => {
    const token = search_params.get("token");
    if (token) {
      handle_magic_link(token);
    } else {
      const session_token = document.cookie.replace(
        /(?:(?:^|.*;\s*)session_token\s*\=\s*([^;]*).*$)|^.*$/,
        "$1"
      );
      if (session_token) {
        router.push("/~");
      }
    }
  }, [search_params, handle_magic_link, router]);

  const handle_submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set_is_loading(true);
    const form_data = new FormData(event.currentTarget);
    const result = await initiate_login(form_data);

    if ("error" in result) {
      set_message({ type: "error", content: result.error });
    } else if ("success" in result) {
      set_message({ type: "success", content: result.success });
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    }
    set_is_loading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background mx-8">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center">
          <Logo is_responsive={false} />
          <h2 className="mt-6 text-3xl font-bold text-center">
            Log in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handle_submit}>
          <div className="rounded-md shadow-sm">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-md"
                placeholder="Email address"
                value={email}
                onChange={(e) => set_email(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={is_loading}>
              {is_loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </div>
        </form>
        {message && message.type !== "success" && (
          <p className={`text-sm text-red-600`}>{message.content}</p>
        )}
        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
