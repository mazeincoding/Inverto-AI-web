"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invite_user, fetch_users, delete_user } from "@/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types/user";

export default function AdminPage() {
  const [users, set_users] = useState<User[]>([]);
  const [search_query, set_search_query] = useState("");
  const [page, set_page] = useState(1);
  const [has_more, set_has_more] = useState(true);
  const [message, set_message] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);

  const load_users = useCallback(
    async (reset = false) => {
      const new_page = reset ? 1 : page;
      const result = await fetch_users(search_query, new_page);
      if ("error" in result) {
        set_message({ type: "error", content: result.error });
      } else {
        set_users((prev_users) =>
          reset ? result.users : [...prev_users, ...result.users]
        );
        set_has_more(result.has_more);
        set_page((prev_page) => (reset ? 2 : prev_page + 1));
      }
    },
    [search_query, page]
  );

  useEffect(() => {
    load_users(true);
  }, [load_users]);

  const handle_invite_toggle = async (
    email: string,
    current_status: string
  ) => {
    const action =
      current_status === "invited" ? "revoke_invitation" : "invite_user";
    const result = await invite_user(email, action);
    if ("error" in result) {
      set_message({
        type: "error",
        content: result.error ?? "An error occurred",
      });
    } else {
      set_message({ type: "success", content: result.success });
      load_users(true);
      4;
    }
  };

  const handle_delete_user = async (email: string) => {
    if (confirm(`Are you sure you want to delete user ${email}?`)) {
      const result = await delete_user(email);
      if ("error" in result) {
        set_message({
          type: "error",
          content: result.error ?? "An error occurred",
        });
      } else {
        set_message({ type: "success", content: result.success });
        load_users(true);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Admin: Manage Users</h1>

      <div className="flex space-x-4">
        <Input
          type="text"
          value={search_query}
          onChange={(e) => set_search_query(e.target.value)}
          placeholder="Search users..."
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.status}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  {user.status !== "active" && (
                    <Button
                      onClick={() =>
                        handle_invite_toggle(user.email, user.status)
                      }
                      variant={
                        user.status === "invited" ? "destructive" : "default"
                      }
                    >
                      {user.status === "invited"
                        ? "Revoke Invitation"
                        : "Invite"}
                    </Button>
                  )}
                  <Button
                    onClick={() => handle_delete_user(user.email)}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {has_more && (
        <Button onClick={() => load_users()} className="mt-4">
          Load More
        </Button>
      )}

      {message && (
        <p
          className={`mt-4 ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.content}
        </p>
      )}
    </div>
  );
}
