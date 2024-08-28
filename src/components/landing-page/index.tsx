"use client";

import { Header } from "./header";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { Footer } from "./footer";
import { FAQSection } from "./faq-section";
import { HowItWorks } from "./how-it-works";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-dvh bg-background relative">
      <Header />
      <main className="flex-grow flex justify-center p-8 mt-16 relative z-10">
        <div className="flex flex-col max-w-3xl gap-40">
          <HeroSection />
          <FeaturesSection />
          <HowItWorks />
          <FAQSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
