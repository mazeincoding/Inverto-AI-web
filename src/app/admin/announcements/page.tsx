"use client";

import { create_announcement } from "@/actions/announcements";
import { useState, useEffect, FormEvent } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AnnouncementsPage() {
  const [title, set_title] = useState("");
  const [content, set_content] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved_title = localStorage.getItem("announcement_title");
    const saved_content = localStorage.getItem("announcement_content");
    if (saved_title) set_title(saved_title);
    if (saved_content) set_content(saved_content);
  }, []);

  useEffect(() => {
    localStorage.setItem("announcement_title", title);
    localStorage.setItem("announcement_content", content);
  }, [title, content]);

  const handle_create_announcement = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    set_is_loading(true);
    try {
      const form_data = new FormData();
      form_data.append("title", title);
      form_data.append("content", content);
      
      const result = await create_announcement(form_data);
      if ('error' in result) {
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
        set_content("");
        localStorage.removeItem("announcement_title");
        localStorage.removeItem("announcement_content");
      }
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Announcement</h1>
      <form onSubmit={handle_create_announcement}>
        <div className="mb-4">
          <label htmlFor="title" className="block mb-2">Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => set_title(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block mb-2">Content</label>
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => set_content(e.target.value)}
            rows={4}
            required
          />
        </div>
        <Button type="submit" disabled={is_loading}>
          {is_loading ? "Posting..." : "Post Announcement"}
        </Button>
      </form>
    </div>
  );
}
