import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { SocialIcons } from "@/components/social-icons";
import { WaitlistDialog } from "./waitlist-dialog";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [dialog_open, set_dialog_open] = useState(false);

  return (
    <header className="flex items-center justify-between py-4 px-6 sticky top-0 backdrop-blur-md z-20 border-b">
      <Logo is_responsive={true} />
      <div className="flex items-center gap-4">
        <SocialIcons className="hidden sm:block" />
        <Separator orientation="vertical" className="h-6 hidden sm:block" />
        <ThemeToggle />
        <Button className="rounded-full" onClick={() => set_dialog_open(true)}>
          Join Waitlist
        </Button>
      </div>
      <WaitlistDialog open={dialog_open} onOpenChange={set_dialog_open} />
    </header>
  );
}
