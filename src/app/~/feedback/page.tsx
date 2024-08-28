"use client";

import { Layout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { get_user_info } from "@/actions/user";
import { Skeleton } from "@/components/ui/skeleton";
import { submit_feedback } from "@/actions/feedback";
import { toast } from "@/components/ui/use-toast";

export default function Feedback() {
  const [feedback, set_feedback] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("feedback_text") || "";
    }
    return "";
  });
  const [user_email, set_user_email] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [is_submitting, set_is_submitting] = useState(false);

  useEffect(() => {
    const fetch_data = async () => {
      try {
        // Fetch user info
        const user_info = await get_user_info();
        if (user_info) {
          set_user_email(user_info.email);
        }

        // Get saved feedback from localStorage
        if (typeof window !== 'undefined') {
          const saved_feedback = localStorage.getItem("feedback_text");
          if (saved_feedback) set_feedback(saved_feedback);
        }
      } finally {
        set_is_loading(false);
      }
    };

    fetch_data();
  }, []);

  const handle_feedback_change = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const new_feedback = e.target.value;
    set_feedback(new_feedback);
    localStorage.setItem("feedback_text", new_feedback);
  };

  const handle_submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    set_is_submitting(true);
    try {
      const result = await submit_feedback(feedback);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Feedback submitted successfully",
        });
        localStorage.removeItem("feedback_text");
        set_feedback("");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <Layout page_title="Feedback">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Provide Feedback</h1>
        <form className="space-y-4" onSubmit={handle_submit}>
          {is_loading ? (
            <Skeleton className="h-6 w-3/4" />
          ) : user_email ? (
            <div>
              <p>Submitting feedback as: {user_email}</p>
            </div>
          ) : null}
          <div>
            <label htmlFor="feedback" className="block mb-2">
              Feedback
            </label>
            {is_loading ? (
              <Skeleton className="w-full h-32" />
            ) : (
              <textarea
                id="feedback"
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Your feedback"
                value={feedback}
                onChange={handle_feedback_change}
              ></textarea>
            )}
          </div>
          {is_loading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <Button type="submit" disabled={is_submitting}>
              {is_submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          )}
        </form>
      </div>
    </Layout>
  );
}
