import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribe_to_waitlist } from "@/actions/send-email";
import { MailIcon, X } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const [email, set_email] = useState("");
  const [honeypot, set_honeypot] = useState("");
  const [submit_time, set_submit_time] = useState(0);
  const [token, set_token] = useState("");
  const [message, set_message] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const generate_token = async () => {
      const response = await fetch("/api/generate-token");
      const data = await response.json();
      set_token(data.token);
      set_submit_time(data.submit_time);
    };
    generate_token();
  }, []);

  const handle_submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Bot checks
    if (honeypot) {
      console.log("Bot detected: honeypot filled");
      return;
    }

    if (Date.now() - submit_time < 3000) {
      console.log("Bot detected: form submitted too quickly");
      return;
    }

    const form_data = new FormData(event.currentTarget);
    form_data.append("token", token);

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
          honeypot={honeypot}
          set_honeypot={set_honeypot}
          token={token}
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
  honeypot: string;
  set_honeypot: (value: string) => void;
  token: string;
}

function EmailForm({
  email,
  set_email,
  handle_submit,
  message,
  clear_message,
  honeypot,
  set_honeypot,
  token,
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
          <input
            type="text"
            name="name"
            value={honeypot}
            onChange={(e) => set_honeypot(e.target.value)}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input type="hidden" name="token" value={token} />
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
