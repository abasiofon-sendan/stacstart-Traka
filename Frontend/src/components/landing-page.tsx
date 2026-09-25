import { LandingNav } from "./landing/nav";
import { LandingHero } from "./landing/hero";
import { LandingProblem } from "./landing/problem";
import { LandingHow } from "./landing/how";
import { LandingDemo } from "./landing/demo";
import { LandingOwe } from "./landing/owe";
import { LandingVoice } from "./landing/voice";
import { LandingDailyClose } from "./landing/daily-close";
import { LandingStories } from "./landing/stories";
import { LandingNot } from "./landing/not";
import { LandingFaq } from "./landing/faq";
import { LandingFinalCta } from "./landing/final-cta";
import { LandingFooter } from "./landing/footer";

export function LandingPage() {
  return (
    <main data-shimmer className="min-h-dvh w-full bg-background text-foreground">
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingHow />
      <LandingDemo />
      <LandingOwe />
      <LandingVoice />
      <LandingDailyClose />
      <LandingStories />
      <LandingNot />
      <LandingFaq />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  );
}
