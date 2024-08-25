import { Logo } from "@/components/logo";
import { SocialIcons } from "@/components/social-icons";

export function Footer() {
  return (
    <footer className="bg-accent/25 md:rounded-2xl md:border py-8 px-6 md:m-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Your AI-powered handstand timer.
          </p>
          <a
            href="mailto:hello@invertoai.app"
            className="text-sm text-primary hover:underline"
          >
            Contact: hello@invertoai.app
          </a>
        </div>
        <div className="flex flex-col items-center md:items-end space-y-2">
          <SocialIcons />
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} Inverto AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}