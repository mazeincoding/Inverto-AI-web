"use server";

import { z } from "zod";
import mailchimp from "@mailchimp/mailchimp_marketing";

const email_schema = z.object({
  email: z.string().email("Invalid email address"),
});

const mailchimp_list_id = process.env.MAILCHIMP_LIST_ID;
if (!mailchimp_list_id) throw new Error("MAILCHIMP_LIST_ID is not defined");

// Add this type assertion
const validated_mailchimp_list_id: string = mailchimp_list_id;

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

export async function subscribe_to_waitlist(form_data: FormData) {
  const validated_fields = email_schema.safeParse({
    email: form_data.get("email"),
  });

  if (!validated_fields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validated_fields.data;

  try {
    const response = await mailchimp.lists.addListMember(
      validated_mailchimp_list_id,
      {
        email_address: email,
        status: "subscribed",
      }
    );

    if ("id" in response) {
      return {
        success:
          "You're on the list! We'll ping you when it's your turn to join.",
      };
    } else {
      throw new Error("Failed to add subscriber");
    }
  } catch (error: any) {
    console.error("Failed to store email:", error);
    if (
      error.response &&
      error.response.body &&
      error.response.body.title === "Member Exists"
    ) {
      return { error: "Email already registered" };
    }
    return { error: "Subscription failed. Please try again" };
  }
}
