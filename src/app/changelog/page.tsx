"use client";

import { useEffect, useState } from "react";
import { get_announcements } from "@/actions/announcements";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Announcement } from "@/types/announcement";
import ChangelogEntryComponent, {
  ChangelogEntrySkeleton,
} from "./changelog-entry";
import { format_relative_time } from "@/utils/date-formatter";

export default function ChangelogPage() {
  const [changelog_data, set_changelog_data] = useState<Announcement[]>([]);
  const [error, set_error] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState(true);

  useEffect(() => {
    async function fetch_announcements() {
      set_is_loading(true);
      const result = await get_announcements();

      if ("error" in result) {
        // Handle error case
        console.error(result.error);
        set_error(result.error);
      } else {
        // Handle success case
        const { announcements } = result;
        set_changelog_data(announcements);
      }
      set_is_loading(false);
    }

    fetch_announcements();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-6 bg-background">
      <h1 className="text-4xl font-bold mb-6 text-primary">Changelog</h1>
      <ScrollArea className="h-[calc(100vh-200px)]">
        {is_loading ? (
          <>
            <ChangelogEntrySkeleton />
            <ChangelogEntrySkeleton />
            <ChangelogEntrySkeleton />
          </>
        ) : (
          changelog_data.map((entry) => (
            <ChangelogEntryComponent
              key={entry.id}
              entry={{
                ...entry,
                formatted_date: format_relative_time(entry.created_at),
              }}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
