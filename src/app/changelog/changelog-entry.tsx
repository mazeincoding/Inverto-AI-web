"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Announcement } from "@/types/announcement";
import { Skeleton } from "@/components/ui/skeleton";

type ChangelogEntryProps = {
  entry: Announcement & { formatted_date: string };
};

const animation_variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const list_variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  },
};

const item_variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function ChangelogEntryComponent({
  entry,
}: ChangelogEntryProps) {
  const [is_expanded, set_is_expanded] = useState(false);
  const click_start_ref = useRef<{ x: number; y: number } | null>(null);

  const handle_mouse_down = (event: React.MouseEvent) => {
    click_start_ref.current = { x: event.clientX, y: event.clientY };
  };

  const handle_mouse_up = (event: React.MouseEvent) => {
    if (click_start_ref.current) {
      const dx = Math.abs(event.clientX - click_start_ref.current.x);
      const dy = Math.abs(event.clientY - click_start_ref.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 5) {
        set_is_expanded(!is_expanded);
      }
    }
    click_start_ref.current = null;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animation_variants}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="mb-4 border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onMouseDown={handle_mouse_down}
        onMouseUp={handle_mouse_up}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-2xl font-semibold">{entry.version}</span>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-secondary text-secondary-foreground"
              >
                {entry.formatted_date}
              </Badge>
              <motion.div
                initial={false}
                animate={{ rotate: is_expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{entry.summary}</p>
        </CardContent>
        <AnimatePresence initial={false}>
          {is_expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CardContent className="overflow-hidden">
                {entry.changes && entry.changes.length > 0 ? (
                  <motion.ul
                    className="space-y-2 mt-4"
                    variants={list_variants}
                    initial="hidden"
                    animate="visible"
                  >
                    {entry.changes.map((change: string, index: number) => (
                      <motion.li
                        key={index}
                        variants={item_variants}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-primary">•</span>
                        <span>{change}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <p>No specific changes listed for this update.</p>
                )}
                {entry.additional_info && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <h4 className="text-lg font-semibold mb-2">Additional Information</h4>
                    <p className="text-muted-foreground">{entry.additional_info}</p>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function ChangelogEntrySkeleton() {
  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
