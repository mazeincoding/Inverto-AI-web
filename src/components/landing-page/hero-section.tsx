import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe_to_waitlist } from "@/actions/send-email";
import { MailIcon, X } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const [email, set_email] = useState("");
  const [message, set_message] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handle_submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form_data = new FormData(event.currentTarget);
    const result = await subscribe_to_waitlist(form_data);

    if ("error" in result) {
      set_message({ type: "error", text: result.error ?? "An error occurred" });
    } else if ("success" in result) {
      set_email("");
      set_message({
        type: "success",
        text: result.success ?? "Subscription successful",
      });
    }
  };

  const clear_message = () => {
    set_message(null);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="space-y-6 flex flex-col items-center">
        <MainContent />
        <EmailForm
          email={email}
          set_email={set_email}
          handle_submit={handle_submit}
          message={message}
          clear_message={clear_message}
        />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="space-y-6 flex flex-col items-center">
      <h1 className="text-5xl lg:text-6xl font-bold text-foreground text-center">
        The only <em className="text-primary not-italic">automated</em>{" "}
        handstand timer
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg text-center">
        Simply set up your camera and let AI handle the timing. It starts and
        stops the timer automatically as you perform.
      </p>
    </div>
  );
}

interface EmailFormProps {
  email: string;
  set_email: (email: string) => void;
  handle_submit: (event: React.FormEvent<HTMLFormElement>) => void;
  message: { type: "success" | "error"; text: string } | null;
  clear_message: () => void;
}

function EmailForm({
  email,
  set_email,
  handle_submit,
  message,
  clear_message,
}: EmailFormProps) {
  return (
    <div className="w-full max-w-xl space-y-6">
      <form
        onSubmit={handle_submit}
        className="flex flex-col sm:flex-row gap-4 w-full relative"
        noValidate
      >
        <div className="relative flex items-center w-full">
          <MailIcon className="absolute left-4 text-muted-foreground w-4 h-4" />
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => set_email(e.target.value)}
            placeholder="Enter your email"
            className="h-[50px] w-full rounded-2xl pl-11 pr-32"
            required
          />
          <Button
            type="submit"
            variant="default"
            className="h-9 px-4 whitespace-nowrap absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg"
            disabled={!email}
          >
            Join waitlist
          </Button>
        </div>
      </form>
      <p className="text-center">
        Already invited? <Link href="/login">Login</Link>
      </p>
      {message && (
        <p
          className={`text-center flex items-center gap-2 justify-center ${
            message.type === "success" ? "text-green-500" : "text-red-500"
          }`}
        >
          {message.text}
          <Button
            variant="ghost"
            size="icon"
            className={`p-1 h-auto w-auto ${
              message.type === "success"
                ? "hover:bg-green-500/10 hover:text-green-500"
                : "hover:bg-red-500/10 hover:text-red-500"
            }`}
            onClick={clear_message}
          >
            <X className="w-4 h-4" />
          </Button>
        </p>
      )}
    </div>
  );
}
