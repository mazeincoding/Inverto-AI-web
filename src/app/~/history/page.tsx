"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  get_handstand_history,
  delete_handstand_session,
} from "@/actions/history";
import { Layout } from "@/components/dashboard/layout";

interface HandstandSession {
  id: string;
  duration: number;
  date: string;
}

export default function HistoryPage() {
  const [history, set_history] = useState<HandstandSession[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [offset, set_offset] = useState(0);
  const [has_more, set_has_more] = useState(true);
  const [deleting_sessions, set_deleting_sessions] = useState<Set<string>>(
    new Set()
  );

  const fetch_history = useCallback(
    async (reset = false) => {
      set_loading(true);
      set_error(null);
      const new_offset = reset ? 0 : offset;
      const result = await get_handstand_history(10, new_offset);
      set_loading(false);

      if ("error" in result) {
        set_error(result.error || "An error occurred");
      } else if (result.success) {
        set_history(reset ? result.data : [...history, ...result.data]);
        set_has_more(result.hasMore);
        set_offset(new_offset + 10);
      }
    },
    [history, offset]
  );

  useEffect(() => {
    fetch_history();
  }, [fetch_history]);

  const handle_delete = async (id: string) => {
    set_deleting_sessions((prev) => new Set(prev).add(id));
    const result = await delete_handstand_session(id);
    if ("success" in result) {
      set_history(history.filter((session) => session.id !== id));
    } else {
      set_error(result.error);
    }
    set_deleting_sessions((prev) => {
      const new_set = new Set(prev);
      new_set.delete(id);
      return new_set;
    });
  };

  return (
    <Layout page_title="History">
      <Card>
        <CardHeader>
          <CardTitle>Your Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && history.length === 0 ? (
            <div className="text-center mt-4 py-6">
              <p className="text-lg text-muted-foreground">
                Your history will show up here when you start practicing!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration (seconds)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && history.length === 0
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 float-right" />
                        </TableCell>
                      </TableRow>
                    ))
                  : history.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(new Date(session.date), "PPP")}
                        </TableCell>
                        <TableCell>{session.duration}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handle_delete(session.id)}
                            disabled={deleting_sessions.has(session.id)}
                          >
                            {deleting_sessions.has(session.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          )}
          {has_more && history.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => fetch_history()} disabled={loading}>
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
