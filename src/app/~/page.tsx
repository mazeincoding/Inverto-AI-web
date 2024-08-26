"use client";

import { WelcomeDialog } from "@/components/welcome-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Timer,
  History,
  Settings,
  LogOut,
  AlertCircle,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Tab = "playground" | "history" | "analytics";

const Sidebar: React.FC<{
  active_tab: Tab;
  set_active_tab: (tab: Tab) => void;
  className?: string;
}> = ({ active_tab, set_active_tab, className }) => (
  <div className={cn("flex h-full flex-col", className)}>
    <div className="flex items-center h-auto px-4 pt-5">
      <Logo />
    </div>
    <nav className="flex-1 p-4">
      {(["playground", "history", "analytics"] as const).map((tab) => (
        <Button
          key={tab}
          variant="ghost"
          className={cn(
            "bg-transparent w-full justify-start hover:bg-accent/50",
            active_tab === tab && "bg-accent hover:bg-accent"
          )}
          onClick={() => set_active_tab(tab)}
        >
          {tab === "playground" && <Timer className="mr-2 h-4 w-4" />}
          {tab === "history" && <History className="mr-2 h-4 w-4" />}
          {tab === "analytics" && <BarChart className="mr-2 h-4 w-4" />}
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Button>
      ))}
    </nav>
    <div className="border-t p-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium">user@example.com</p>
        </div>
      </div>
    </div>
  </div>
);

const Header: React.FC<{
  active_tab: Tab;
  set_active_tab: (tab: Tab) => void;
}> = ({ active_tab, set_active_tab }) => (
  <header className="flex items-center justify-between h-16 px-6 border-b">
    <div className="flex items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar active_tab={active_tab} set_active_tab={set_active_tab} />
        </SheetContent>
      </Sheet>
      <h2 className="text-lg font-semibold space-x-4">
        <span>{active_tab.charAt(0).toUpperCase() + active_tab.slice(1)}</span>
        <Badge className="border-primary/35 text-primary" variant="outline">
          Beta
        </Badge>
      </h2>
    </div>
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Settings</span>
      </Button>
      <Button variant="ghost" size="icon">
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Log out</span>
      </Button>
    </div>
  </header>
);

const PlaygroundContent: React.FC = () => {
  const [is_timer_running, set_is_timer_running] = useState(false);
  const [elapsed_time, set_elapsed_time] = useState(0);

  const format_time = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handle_start_stop = (): void => {
    if (is_timer_running) {
      set_is_timer_running(false);
      // Here you would typically save the session data
    } else {
      set_is_timer_running(true);
      set_elapsed_time(0);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Handstand Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">
              {format_time(elapsed_time)}
            </div>
            <Button onClick={handle_start_stop} size="lg">
              {is_timer_running ? "Stop Session" : "Start Session"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            The timer will automatically start when you enter a handstand and
            stop when you exit.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent sessions yet. Start your first session!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ComingSoonContent: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-6">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </div>
);

export default function Dashboard() {
  const [active_tab, set_active_tab] = useState<Tab>("playground");

  return (
    <>
      <WelcomeDialog />
      <div className="flex h-screen bg-background">
        <Sidebar
          active_tab={active_tab}
          set_active_tab={set_active_tab}
          className="hidden md:flex w-64 border-r bg-muted/40"
        />
        <main className="flex-1 overflow-y-auto">
          <Header active_tab={active_tab} set_active_tab={set_active_tab} />
          <div className="p-6">
            {active_tab === "playground" && <PlaygroundContent />}
            {active_tab === "history" && (
              <ComingSoonContent
                title="Session History"
                description="We're working hard to bring you a comprehensive session history feature. Stay tuned for updates!"
              />
            )}
            {active_tab === "analytics" && (
              <ComingSoonContent
                title="Performance Analytics"
                description="Exciting analytics features are on the way! We're developing tools to help you visualize and improve your handstand performance."
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
