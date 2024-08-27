"use client";

import { confirm_waitlist_subscription } from "@/actions/send-email";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ConfirmWaitlistPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const [status, set_status] = useState<"loading" | "success" | "error">("loading");
  const [message, set_message] = useState("");

  useEffect(() => {
    const confirm_subscription = async () => {
      const { token } = searchParams;
      const result = await confirm_waitlist_subscription(token);

      if ("success" in result) {
        set_status("success");
        set_message(result.success ?? "");
      } else {
        set_status("error");
        set_message(result.error ?? "");
      }
    };

    confirm_subscription();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Waitlist Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-center">
                Please wait while we confirm your subscription...
              </p>
            </div>
          )}

          {status === "success" && (
            <>
              <p className="text-primary text-center mb-4">{message}</p>
              <p className="text-muted-foreground text-center mb-4">
                We&apos;re excited to have you on board! We&apos;ll notify you as soon
                as your spot is ready.
              </p>
            </>
          )}

          {status === "error" && (
            <p className="text-destructive text-center mb-4">{message}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
