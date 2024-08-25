import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe_to_waitlist } from "@/actions/send-email";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Joining waitlist..." : "Join Waitlist"}
    </Button>
  );
}

export function WaitlistDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [message, set_message] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const form_ref = useRef<HTMLFormElement>(null);

  const handle_submit = async (form_data: FormData) => {
    const result = await subscribe_to_waitlist(form_data);
    if ("error" in result) {
      set_message({ type: "error", content: result.error ?? "Unknown error" });
    } else if ("success" in result) {
      set_message({ type: "success", content: result.success });
      form_ref.current?.reset(); // Clear the form
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Our Waitlist</DialogTitle>
          <DialogDescription>
            Be the first to know when we launch!
          </DialogDescription>
        </DialogHeader>
        <form
          ref={form_ref}
          action={handle_submit}
          className="space-y-4"
          noValidate
        >
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
          />
          <SubmitButton />
          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.content}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
