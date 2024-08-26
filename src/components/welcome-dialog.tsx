"use client";

import { useState, ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Timer, MessageSquare, Lightbulb, Construction } from "lucide-react";

export function WelcomeDialog() {
  const [open, set_open] = useState(false);

  useEffect(() => {
    const has_seen_welcome = localStorage.getItem("has_seen_welcome");
    if (!has_seen_welcome) {
      set_open(true);
      localStorage.setItem("has_seen_welcome", "true");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={set_open}>
      <DialogContent className="sm:max-w-[505px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to StandSync Beta! 🎉
          </DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mb-4">
              Early Access
            </Badge>
            <p className="text-base font-semibold mb-2">
              You&apos;re among the first to try our handstand timing app!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Feature
            icon={<Timer className="w-5 h-5" />}
            title="Automatic Handstand Timer"
          >
            Our core feature: AI-powered timing that starts and stops as you
            perform.
          </Feature>
          <Feature
            icon={<Construction className="w-5 h-5" />}
            title="Under Development"
          >
            We&apos;re actively working on improving and expanding
            StandSync&apos;s capabilities.
          </Feature>
          <Feature
            icon={<MessageSquare className="w-5 h-5" />}
            title="Your Feedback Matters"
          >
            We&apos;d love to hear your thoughts and experiences to make
            StandSync better.
          </Feature>
          <Feature
            icon={<Lightbulb className="w-5 h-5" />}
            title="Shape the Future"
          >
            Your input will directly influence the features we develop next.
          </Feature>
        </div>
        <DialogFooter className="flex flex-col sm:flex-col gap-6">
          <Button onClick={() => set_open(false)} className="w-full">
            Start Testing
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Thank you for being part of our journey. Your feedback is
            invaluable!
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FeatureProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

function Feature({ icon, title, children }: FeatureProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
