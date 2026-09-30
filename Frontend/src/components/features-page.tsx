import { LandingNav } from "./landing/nav";
import { LandingDemo } from "./landing/demo";
import { LandingOwe } from "./landing/owe";
import { LandingVoice } from "./landing/voice";
import { LandingDailyClose } from "./landing/daily-close";
import { LandingFinalCta } from "./landing/final-cta";
import { LandingFooter } from "./landing/footer";

export function FeaturesPage() {
  return (
    <main data-shimmer className="min-h-dvh w-full bg-background text-foreground">
      <LandingNav />
      <div className="pt-24 md:pt-28">
        <LandingDemo />
      </div>
      <LandingOwe />
      <LandingVoice />
      <LandingDailyClose />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  );
}
