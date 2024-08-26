"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SunIcon, MoonIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { Sidebar } from "./sidebar";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const page_title =
    pathname
      .split("/")
      .pop()
      ?.replace(/^\w/, (c) => c.toUpperCase()) || "Dashboard";

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <Button variant="ghost" size="icon">
          <LogOutIcon className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </header>
  );
};
