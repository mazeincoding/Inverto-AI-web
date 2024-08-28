"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import {
  get_unseen_announcements,
  mark_announcements_as_seen,
  get_user_info,
} from "@/actions/user";
import { Announcement } from "@/types/announcement";
import { AnnouncementsDialog } from "./announcement-dialog";

export const Layout: React.FC<{
  children: React.ReactNode;
  page_title: string;
}> = ({ children, page_title }) => {
  const [unseen_announcements, set_unseen_announcements] = useState<
    Announcement[]
  >([]);
  const [show_dialog, set_show_dialog] = useState(false);
  const [user_email, set_user_email] = useState<string | null>(null);

  useEffect(() => {
    async function fetch_user_and_announcements() {
      const user_info = await get_user_info();
      if (user_info && user_info.email) {
        set_user_email(user_info.email);
        const announcements = await get_unseen_announcements(user_info.email);
        set_unseen_announcements(announcements);
        if (announcements.length > 0) {
          set_show_dialog(true);
        }
      }
    }

    fetch_user_and_announcements();
  }, []);

  const handle_close_dialog = async () => {
    set_show_dialog(false);
    if (user_email) {
      await mark_announcements_as_seen(
        user_email,
        unseen_announcements.map((a) => a.id)
      );
    }
  };

  return (
    <div className="flex h-dvh bg-background">
      <Sidebar className="hidden md:flex w-64 border-r bg-muted/40" />
      <main className="flex-1 overflow-y-auto">
        <Header page_title={page_title} />
        <div className="p-6 flex justify-center">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </main>
      <AnnouncementsDialog
        show_dialog={show_dialog}
        set_show_dialog={set_show_dialog}
        unseen_announcements={unseen_announcements}
        handle_close_dialog={handle_close_dialog}
      />
    </div>
  );
};
