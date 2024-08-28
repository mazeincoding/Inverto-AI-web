"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Camera, Play, Timer, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaitlistDialog } from "./waitlist-dialog";

export function HowItWorks() {
  const [dialog_open, set_dialog_open] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Set up your device",
      description:
        "Position your device's camera to capture your full body during handstands.",
      icon: Camera,
    },
    {
      number: 2,
      title: "Start a session",
      description:
        "Open StandSync and initiate a new handstand practice session.",
      icon: Smartphone,
    },
    {
      number: 3,
      title: "Perform handstands",
      description:
        "Execute your handstands. The app automatically detects and times each hold.",
      icon: Timer,
    },
    {
      number: 4,
      title: "Review your progress",
      description:
        "After your session, check your results and track your improvement over time.",
      icon: BarChart,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">
        How StandSync Works
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            <div className="bg-background rounded-lg p-6 h-full border border-accent shadow-md hover:shadow-lg transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-foreground font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <step.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-center mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-center">
                  {step.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-center mt-20">
        <Button
          size="lg"
          className="rounded-2xl"
          onClick={() => set_dialog_open(true)}
        >
          Get access
        </Button>
        <WaitlistDialog open={dialog_open} onOpenChange={set_dialog_open} />
      </div>
    </div>
  );
}
