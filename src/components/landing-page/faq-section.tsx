import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does StandSync ensure user privacy?",
    answer:
      "StandSync prioritizes user privacy by performing all handstand detection processes locally on the user's device. No images or videos are transmitted to or stored on our servers, ensuring complete data confidentiality.",
  },
  {
    question: "Does StandSync store any user-generated content?",
    answer:
      "No, StandSync does not store any user-generated content such as photos or videos. All processing occurs in real-time on the user's device, maintaining data integrity and privacy.",
  },
  {
    question: "What user information does StandSync collect?",
    answer:
      "StandSync only collects essential account information, such as email addresses, for user authentication purposes. We employ industry-standard security measures to protect all collected data.",
  },
  {
    question: "Is an internet connection required to use StandSync?",
    answer:
      "Yes, StandSync requires an internet connection to function, as it operates as a web-based application. However, all handstand detection processing occurs locally on the user's device.",
  },
  {
    question: "What is the accuracy level of StandSync's handstand detection?",
    answer:
      "StandSync utilizes advanced algorithms to provide highly accurate handstand detection. Our team continuously works on refining and improving the detection accuracy through ongoing research and development.",
  },
  {
    question: "Does StandSync support detection for other yoga poses?",
    answer:
      "Currently, StandSync specializes in handstand detection. We are evaluating the possibility of expanding to other yoga poses based on user demand and technical feasibility.",
  },
  {
    question: "What are the device compatibility requirements for StandSync?",
    answer:
      "StandSync is compatible with most modern smartphones and computers that support web browsing and have camera functionality. Specific device requirements may vary based on the latest updates.",
  },
  {
    question: "Is StandSync a free service?",
    answer:
      "Yes, StandSync is offered as a free service. There are no subscription fees, hidden charges, or paywalls. The platform is sustained through optional user donations.",
  },
  {
    question: "How does StandSync improve its functionality without user data?",
    answer:
      "StandSync enhances its handstand detection capabilities through internal research, controlled testing environments, and algorithmic improvements, without utilizing any user-specific data or images.",
  },
  {
    question: "Is StandSync open source?",
    answer: (
      <>
        Yes! StandSync is open source. You can find the source code on our{" "}
        <Link
          href="https://github.com/mazeincoding/standsync-web"
          className="text-primary hover:underline"
        >
          GitHub
        </Link>
        .
      </>
    ),
  },
];

export function FAQSection() {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
