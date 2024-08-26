"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Timer, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { get_user_info } from "@/actions/user";

export const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();
  const [user_email, set_user_email] = useState<string | null>(null);

  useEffect(() => {
    const fetch_user_info = async () => {
      try {
        const user_info = await get_user_info();
        if (user_info) {
          set_user_email(user_info.email);
        } else {
          console.log("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetch_user_info();
  }, []);

  const nav_items = [
    { href: "/~/playground", icon: Timer, label: "Playground" },
    { href: "/~/history", icon: History, label: "History" },
    { href: "/~/analytics", icon: BarChart, label: "Analytics" },
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
      <div className="border-t p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              {user_email ? user_email[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{user_email || "Loading..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};