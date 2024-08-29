"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { get_handstand_history } from "@/actions/history";
import { HandstandHistoryEntry } from "@/types/history";
import { format_relative_time } from "@/utils/date-formatter";

export default function History() {
  const [history, set_history] = useState<HandstandHistoryEntry[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [page, set_page] = useState(0);
  const [has_more, set_has_more] = useState(true);

  const fetch_history = async () => {
    set_loading(true);
    const result = await get_handstand_history(10, page * 10);
    set_loading(false);

    if ("error" in result) {
      set_error(
        result.error || "Failed to fetch handstand history. Please try again."
      );
    } else {
      set_history((prev) => [...prev, ...result.data]);
      set_has_more(result.hasMore);
    }
  };

  useEffect(() => {
    fetch_history();
  }, [page]);

  const load_more = () => {
    set_page((prev) => prev + 1);
  };

  return (
    <Layout page_title="History">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : loading ? (
            <p className="text-center mt-4">Loading...</p>
          ) : history.length === 0 ? (
            <div className="text-center mt-4">
              <p className="text-lg mb-2">No handstand sessions yet!</p>
              <p className="text-sm text-muted-foreground">
                Your handstand journey starts with your first session. Head to the playground to get started!
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format_relative_time(entry.date)}</TableCell>
                      <TableCell>{entry.duration} seconds</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {has_more && (
                <div className="text-center mt-4">
                  <Button onClick={load_more}>Load More</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
