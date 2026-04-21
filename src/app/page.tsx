"use client";

import { HeroSun } from "@/components/hero";
import { SplitSection, Struggles, HowItWorks, AppCTA } from "@/components/sections";

export default function HomePage() {
  return (
    <>
      <HeroSun
        headline="Find your pause."
        sub="A yoga practice that meets you in the middle of your Tuesday — not at a retreat you'll never book."
        cta="Download the app"
      />
      <SplitSection />
      <Struggles />
      <HowItWorks />
      <AppCTA />
    </>
  );
}
