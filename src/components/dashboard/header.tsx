"use client";

import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";

export const Header = ({ page_title }: { page_title: string }) => {
  const router = useRouter();

  const handle_logout = async () => {
    const result = await logout();
    if (result.success) {
      router.push("/login");
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold space-x-4">
          <span>{page_title}</span>
          <Badge className="border-primary/35 text-primary" variant="outline">
            Beta
          </Badge>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handle_logout}>
              <LogOutIcon className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Logout</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
