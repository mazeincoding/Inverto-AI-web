"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart, Timer, History, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  const nav_items = [
    { href: "/~/playground", icon: Timer, label: "Playground" },
    { href: "/~/history", icon: History, label: "History" },
    { href: "/~/analytics", icon: BarChart, label: "Analytics" },
    { href: "/~/feedback", icon: MessageSquareIcon, label: "Feedback" },
  ];

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center h-auto px-4 pt-5">
        <Logo />
      </div>
      <nav className="flex-1 p-4">
        {nav_items.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "bg-transparent w-full justify-start hover:bg-accent/50",
              pathname === item.href && "bg-accent hover:bg-accent"
            )}
            asChild
          >
            <Link
              href={item.href}
              className="hover:no-underline text-foreground"
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
};
