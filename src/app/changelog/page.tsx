"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChangelogEntry } from "@/types/changelog-entry";

const changelog_data: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "2023-12-15",
    summary: "New dashboard features, performance improvements, and bug fixes",
    changes: [
      "Added new dashboard features",
      "Improved performance of data loading",
      "Fixed bug in user authentication",
    ],
  },
];

export default function ChangelogPage() {
  const [expanded_version, set_expanded_version] = useState<string | null>(
    null
  );
  const click_start_ref = useRef<{ x: number; y: number } | null>(null);

  const handle_mouse_down = (event: React.MouseEvent) => {
    click_start_ref.current = { x: event.clientX, y: event.clientY };
  };

  const handle_mouse_up = (event: React.MouseEvent, version: string) => {
    if (click_start_ref.current) {
      const dx = Math.abs(event.clientX - click_start_ref.current.x);
      const dy = Math.abs(event.clientY - click_start_ref.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 5) {
        toggle_expansion(version);
      }
    }
    click_start_ref.current = null;
  };

  const toggle_expansion = (version: string) => {
    set_expanded_version(expanded_version === version ? null : version);
  };

  return (
    <div className="container mx-auto p-8 space-y-6 bg-background">
      <h1 className="text-4xl font-bold mb-6 text-primary">Changelog</h1>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {changelog_data.map((entry) => (
          <motion.div
            key={entry.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="mb-4 border-l-4 border-l-primary hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onMouseDown={handle_mouse_down}
              onMouseUp={(event) => handle_mouse_up(event, entry.version)}
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-2xl font-semibold">
                    v{entry.version}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className="bg-secondary text-secondary-foreground"
                    >
                      {entry.date}
                    </Badge>
                    {expanded_version === entry.version ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{entry.summary}</p>
              </CardContent>
              <AnimatePresence>
                {expanded_version === entry.version && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent>
                      <ul className="space-y-2 mt-4">
                        {entry.changes.map((change, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1 }}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-primary mt-1">•</span>
                            <span>{change}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </ScrollArea>
    </div>
  );
}
