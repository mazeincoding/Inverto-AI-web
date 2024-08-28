"use client";

import {
  create_announcement,
  get_announcements,
  delete_announcement,
} from "@/actions/announcements";
import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Calendar } from "lucide-react";
import { Announcement } from "@/types/announcement";

export default function AnnouncementsPage() {
  const [title, set_title] = useState("");
  const [summary, set_summary] = useState("");
  const [additional_info, set_additional_info] = useState("");
  const [changes, set_changes] = useState("");
  const [version, set_version] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const { toast } = useToast();
  const [announcements, set_announcements] = useState<Announcement[]>([]);

  useEffect(() => {
    const saved_title = localStorage.getItem("announcement_title");
    const saved_summary = localStorage.getItem("announcement_summary");
    const saved_additional_info = localStorage.getItem(
      "announcement_additional_info"
    );
    const saved_changes = localStorage.getItem("announcement_changes");
    const saved_version = localStorage.getItem("announcement_version");
    if (saved_title) set_title(saved_title);
    if (saved_summary) set_summary(saved_summary);
    if (saved_additional_info) set_additional_info(saved_additional_info);
    if (saved_changes) set_changes(saved_changes);
    if (saved_version) set_version(saved_version);
    fetch_announcements();
  }, []);

  useEffect(() => {
    localStorage.setItem("announcement_title", title);
    localStorage.setItem("announcement_summary", summary);
    localStorage.setItem("announcement_additional_info", additional_info);
    localStorage.setItem("announcement_changes", changes);
    localStorage.setItem("announcement_version", version);
  }, [title, summary, additional_info, changes, version]);

  const fetch_announcements = async () => {
    const result = await get_announcements();
    if ("announcements" in result) {
      set_announcements(result.announcements);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handle_create_announcement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    set_is_loading(true);
    try {
      const form_data = new FormData();
      form_data.append("title", title);
      form_data.append("summary", summary);
      form_data.append("additional_info", additional_info);
      form_data.append("changes", changes);
      form_data.append("version", version);

      const result = await create_announcement(form_data);
      if ("error" in result) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: result.success,
        });
        set_title("");
        set_summary("");
        set_additional_info("");
        set_changes("");
        set_version("");
        localStorage.removeItem("announcement_title");
        localStorage.removeItem("announcement_summary");
        localStorage.removeItem("announcement_additional_info");
        localStorage.removeItem("announcement_changes");
        localStorage.removeItem("announcement_version");
        await fetch_announcements();
      }
    } finally {
      set_is_loading(false);
    }
  };

  const handle_delete_announcement = async (id: string) => {
    const result = await delete_announcement(id);
    if ("error" in result) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: result.success,
      });
      await fetch_announcements();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary">
            Manage Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handle_create_announcement} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Title
              </label>
              <Input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => set_title(e.target.value)}
                required
                className="w-full border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Summary
              </label>
              <Input
                type="text"
                id="summary"
                name="summary"
                value={summary}
                onChange={(e) => set_summary(e.target.value)}
                required
                className="w-full border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="changes"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Changes (one per line)
              </label>
              <Textarea
                id="changes"
                name="changes"
                value={changes}
                onChange={(e) => set_changes(e.target.value)}
                rows={4}
                required
                className="w-full border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="additional_info"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Additional Info
              </label>
              <Textarea
                id="additional_info"
                name="additional_info"
                value={additional_info}
                onChange={(e) => set_additional_info(e.target.value)}
                rows={6}
                className="w-full border-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label
                htmlFor="version"
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Version
              </label>
              <Input
                type="text"
                id="version"
                name="version"
                value={version}
                onChange={(e) => set_version(e.target.value)}
                placeholder="Leave empty to auto-generate"
                className="w-full border-primary/20 focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              disabled={is_loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {is_loading ? (
                "Posting..."
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="bg-secondary/10">
          <CardTitle className="text-2xl font-bold text-secondary-foreground">
            Existing Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="mb-4 border-l-4 border-l-primary hover:shadow-md transition-shadow duration-200">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold mb-2 text-primary">
                      {announcement.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {announcement.summary}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Version: {announcement.version}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        onClick={() =>
                          handle_delete_announcement(announcement.id)
                        }
                        variant="destructive"
                        size="sm"
                        className="hover:bg-destructive/90"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
