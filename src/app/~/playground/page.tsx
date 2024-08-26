"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/dashboard/layout";
import { WelcomeDialog } from "@/components/welcome-dialog";

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

export default function Playground() {
  return (
    <>
      <WelcomeDialog />
      <Layout>
        <PlaygroundContent />
      </Layout>
    </>
  );
}
