import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";

export function SocialIcons({ className }: { className?: string }) {
  const social_links = [
    { href: "https://x.com/standsync", Icon: FaTwitter },
    { href: "https://github.com/mazeincoding/standsync", Icon: FaGithub },
  ];

  return (
    <div className={cn("flex", className)}>
      {social_links.map(({ href, Icon }) => (
        <Button
          key={href}
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full hover:text-primary text-muted-foreground transition-colors"
          )}
          asChild
        >
          <Link href={href} target="_blank" rel="noopener noreferrer">
            <Icon className="text-xl" />
          </Link>
        </Button>
      ))}
    </div>
  );
}
