"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { useSearchParams, useRouter } from "next/navigation";
import { verify_code } from "@/actions/auth";
import { Loader2 } from "lucide-react";

function VerifyPageContent() {
  const [code, set_code] = useState("");
  const [message, set_message] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const search_params = useSearchParams();
  const email = search_params.get("email");
  const router = useRouter();
  const [is_loading, set_is_loading] = useState(false);

  const handle_submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    set_is_loading(true);
    if (!email) {
      set_message({ type: "error", content: "Email not provided" });
      set_is_loading(false);
      return;
    }
    const result = await verify_code(email, code);
    if ("error" in result) {
      set_message({
        type: "error",
        content: result.error ?? "An error occurred",
      });
    } else {
      // Store the session token in localStorage
      localStorage.setItem("session_token", result.success);
      router.push("/~");
    }
    set_is_loading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo is_responsive={false} />
          <h2 className="mt-6 text-3xl font-bold text-center">
            Verify your email
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handle_submit}>
          <div className="rounded-md shadow-sm">
            <div>
              <Input
                id="code"
                name="code"
                type="text"
                required
                className="rounded-md"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => set_code(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={is_loading}>
              {is_loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </form>
        {message && (
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
}
