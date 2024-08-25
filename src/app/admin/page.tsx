"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invite_user, fetch_users } from "@/actions/admin";
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

  const load_users = async (reset = false) => {
    const new_page = reset ? 1 : page;
    const result = await fetch_users(search_query, new_page);
    if ("error" in result) {
      set_message({ type: "error", content: result.error });
    } else {
      set_users(reset ? result.users : [...users, ...result.users]);
      set_has_more(result.has_more);
      set_page(new_page + 1);
    }
  };

  useEffect(() => {
    load_users(true);
  }, [search_query]);

  const handle_invite = async (email: string) => {
    const result = await invite_user(email);
    if ("error" in result) {
      set_message({
        type: "error",
        content: result.error ?? "An error occurred",
      });
    } else {
      set_message({ type: "success", content: result.success });
      load_users(true);
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
                {user.status !== "invited" && user.status !== "active" && (
                  <Button onClick={() => handle_invite(user.email)}>
                    Invite
                  </Button>
                )}
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
