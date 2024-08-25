import { FlameIcon, Sparkles, TextIcon } from "lucide-react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { WaitlistDialog } from "./waitlist-dialog";

export function FeaturesSection() {
  const [dialog_open, set_dialog_open] = useState(false);

  const section_ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: section_ref,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={section_ref} className="w-full flex gap-32 flex-col">
      <FeatureItem>
        <FeatureHeader>
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
            <Sparkles className="text-white h-8 w-8" />
          </div>
          <div className="space-y-2">
            <FeatureTitle>Automatic timer</FeatureTitle>
            <FeatureDescription>
              Let AI automatically start the timer as you enter a handstand, and
              stop the timer whenever you exit out of your handstand.
            </FeatureDescription>
          </div>
        </FeatureHeader>
        <FeatureContent>
          <div className="bg-accent h-[400px] rounded-2xl"></div>
        </FeatureContent>
      </FeatureItem>

      <FeatureItem scrollYProgress={scrollYProgress} index={1}>
        <FeatureHeader>
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
            <TextIcon className="text-white h-8 w-8" />
          </div>
          <div className="space-y-2">
            <FeatureTitle>Your history</FeatureTitle>
            <FeatureDescription>
              For every handstand you do, Inverto AI saves it to your history,
              so you can look back on your progress.
            </FeatureDescription>
          </div>
        </FeatureHeader>
        <FeatureContent>
          <HistoryShowcase />
        </FeatureContent>
      </FeatureItem>

      <FeatureItem scrollYProgress={scrollYProgress} index={2}>
        <FeatureHeader>
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
            <TextIcon className="text-white h-8 w-8" />
          </div>
          <div className="space-y-2">
            <FeatureTitle>Analytics for you</FeatureTitle>
            <FeatureDescription>
              See your progress visually. Tweak your handstands, get it just
              right.
            </FeatureDescription>
          </div>
        </FeatureHeader>
        <FeatureContent>
          <AnalyticsShowcase />
        </FeatureContent>
      </FeatureItem>

      <div>
        <FeatureHeader>
          <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center">
            <FlameIcon className="text-white h-8 w-8" />
          </div>
          <div className="space-y-2">
            <FeatureTitle>More coming soon...</FeatureTitle>
            <FeatureDescription>
              This is just the beginning - there&apos;s way more to come in the
              near future.
            </FeatureDescription>
          </div>
        </FeatureHeader>
        <div className="flex items-center justify-center mt-8">
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
    </div>
  );
}

function FeatureItem({
  children,
  scrollYProgress,
  index,
}: {
  children: React.ReactNode;
  scrollYProgress?: MotionValue<number>;
  index?: number;
}) {
  const opacity = useTransform(
    scrollYProgress || new MotionValue(),
    [(index ?? 0) * 0.25, (index ?? 0) * 0.25 + 0.125, (index ?? 0) * 0.25 + 0.25],
    [0.25, 1, 1]
  );

  if (!scrollYProgress || index === undefined) {
    return <div className="flex flex-col gap-6">{children}</div>;
  }

  return (
    <motion.div style={{ opacity }} className="flex flex-col gap-6">
      {children}
    </motion.div>
  );
}

export function FeatureHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-6">{children}</div>;
}

export function FeatureTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-bold text-4xl">{children}</h2>;
}

export function FeatureDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-muted-foreground text-lg">{children}</p>;
}

export function FeatureContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function HistoryShowcase() {
  const history_items = [
    { time: "4 seconds", date: "February 19, 2024" },
    { time: "5 seconds", date: "February 16, 2024" },
    { time: "8 seconds", date: "February 14, 2024" },
    { time: "6 seconds", date: "February 14, 2024" },
    { time: "7 seconds", date: "February 14, 2024" },
  ];

  const max_seconds = Math.max(
    ...history_items.map((item) => parseInt(item.time))
  );

  return (
    <div className="shadow-md border border-accent p-6 flex flex-col gap-2 rounded-2xl relative overflow-hidden">
      {history_items.map((item, index) => {
        const seconds = parseInt(item.time);
        const width = `${5 + 80 * (seconds / max_seconds)}%`;
        const is_max = seconds === max_seconds;

        return (
          <div
            key={index}
            style={{ width }}
            className={`border ${
              is_max ? "border-primary" : ""
            } rounded-2xl px-4 py-2 flex flex-col`}
          >
            <h3
              className={`font-bold text-base sm:text-lg ${
                is_max ? "text-primary" : ""
              }`}
            >
              {item.time}
            </h3>
            <p className="text-muted-foreground text-sm">{item.date}</p>
          </div>
        );
      })}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t pointer-events-none from-background to-transparent" />
    </div>
  );
}

function Bar({
  height,
  scroll_progress,
}: {
  height: number;
  scroll_progress: MotionValue<number>;
}) {
  const animated_height = useTransform(scroll_progress, [0, 1], [0, height]);
  return (
    <motion.div
      style={{ height: animated_height }}
      className="bg-primary w-full"
    />
  );
}

export function AnalyticsShowcase() {
  const [visible_bars, set_visible_bars] = useState(30);

  const analytics_data = useMemo(() => {
    const seed = 42; // Consistent seed for reproducibility
    const data = [];
    let trend = 5; // Start lower
    let previous_value = trend;

    for (let i = 0; i < 30; i++) {
      const random = Math.sin(seed * i) * 2; // Slightly reduced randomness
      trend += 0.3 + random / 10; // Slightly faster trend increase

      // Ensure new value is within 20% of the previous value
      const max_change = previous_value * 0.2;
      const raw_value = Math.max(1, Math.min(30, trend + random));
      const value = Math.max(
        previous_value - max_change,
        Math.min(previous_value + max_change, raw_value)
      );

      previous_value = value;
      data.push({ value: Math.floor(value) });
    }

    return data;
  }, []);

  const max_value = Math.max(...analytics_data.map((item) => item.value));
  const container_ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container_ref,
    offset: ["start end", "end start"],
  });

  const bar_heights = analytics_data.map(
    (item) => (item.value / max_value) * 500
  );

  useEffect(() => {
    const update_visible_bars = () => {
      const width = window.innerWidth;
      if (width > 1200) set_visible_bars(30);
      else if (width > 992) set_visible_bars(24);
      else if (width > 768) set_visible_bars(18);
      else if (width > 576) set_visible_bars(12);
      else set_visible_bars(8);
    };

    update_visible_bars();
    window.addEventListener("resize", update_visible_bars);
    return () => window.removeEventListener("resize", update_visible_bars);
  }, []);

  return (
    <div
      ref={container_ref}
      className="shadow-md border border-accent p-6 rounded-2xl overflow-hidden"
    >
      <div className="flex items-end h-[350px] gap-2">
        {bar_heights.slice(0, visible_bars).map((height, index) => (
          <div key={index} className="flex-1">
            <Bar height={height} scroll_progress={scrollYProgress} />
          </div>
        ))}
      </div>
    </div>
  );
}
