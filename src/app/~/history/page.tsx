"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [has_more, set_has_more] = useState(true);
  const [deleting_session, set_deleting_session] = useState<string | null>(
    null
  );

  const offset_ref = useRef(0);

  const fetch_history = useCallback(async (is_initial_load = false) => {
    console.log("Fetching history...");
    set_loading(true);
    set_error(null);

    try {
      const result = await get_handstand_history(10, offset_ref.current);
      console.log("Fetch result:", result);

      if ("error" in result) {
        set_error(result.error || "An error occurred");
      } else if (result.success) {
        set_history((prev) =>
          is_initial_load ? result.data : [...prev, ...result.data]
        );
        set_has_more(result.hasMore);
        offset_ref.current += result.data.length;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      set_error("An unexpected error occurred");
    } finally {
      set_loading(false);
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted, fetching initial history");
    fetch_history(true);
  }, [fetch_history]);

  const handle_delete = useCallback(async (id: string) => {
    set_deleting_session(id);
    try {
      const result = await delete_handstand_session(id);
      if ("success" in result) {
        set_history((prev) => prev.filter((session) => session.id !== id));
      } else {
        set_error(result.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      set_error("Failed to delete session");
    } finally {
      set_deleting_session(null);
    }
  }, []);

  console.log("Render state:", {
    loading,
    historyLength: history.length,
    error,
  });

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
                <TableRow className="h-10">
                  <TableHead>Date</TableHead>
                  <TableHead>Duration (seconds)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && history.length === 0
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="h-10">
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-6 float-right" />
                        </TableCell>
                      </TableRow>
                    ))
                  : history.map((session) => (
                      <TableRow key={session.id} className="h-10">
                        <TableCell className="py-2">
                          {format(new Date(session.date), "PPP")}
                        </TableCell>
                        <TableCell className="py-2">
                          {session.duration}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handle_delete(session.id)}
                            disabled={deleting_session === session.id}
                          >
                            {deleting_session === session.id ? (
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
