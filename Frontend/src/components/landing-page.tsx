import { LandingNav } from "./landing/nav";
import { LandingHero } from "./landing/hero";
import { LandingProblem } from "./landing/problem";
import { LandingHow } from "./landing/how";
import { LandingCountries } from "./landing/countries";
import { LandingWhyDifferent } from "./landing/why-different";
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
      <LandingCountries />
      <LandingWhyDifferent />
      <LandingNot />
      <LandingFaq />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  );
}
