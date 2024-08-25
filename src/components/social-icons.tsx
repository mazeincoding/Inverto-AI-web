import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaTwitter, FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SocialIcons({ className }: { className?: string }) {
  const social_links = [
    { href: "https://x.com/standsync", Icon: FaTwitter },
    {
      Icon: FaGithub,
      dropdownItems: [
        {
          label: "Web Repo",
          href: "https://github.com/mazeincoding/standsync-web",
        },
        {
          label: "Backend Repo",
          href: "https://github.com/mazeincoding/standsync-backend",
        },
      ],
    },
  ];

  return (
    <div className={cn("flex", className)}>
      {social_links.map((link, index) =>
        "dropdownItems" in link && link.dropdownItems ? (
          <DropdownMenu key={index}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full hover:text-primary text-muted-foreground transition-colors"
                )}
              >
                <link.Icon className="text-xl" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {link.dropdownItems.map((item, itemIndex) => (
                <DropdownMenuItem key={itemIndex} asChild>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full hover:text-primary text-muted-foreground transition-colors"
            )}
            asChild
          >
            <Link href={link.href} target="_blank" rel="noopener noreferrer">
              <link.Icon className="text-xl" />
            </Link>
          </Button>
        )
      )}
    </div>
  );
}
