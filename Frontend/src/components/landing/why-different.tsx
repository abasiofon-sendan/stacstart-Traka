import { motion, useReducedMotion } from "motion/react";
import { ease } from "./shared";

export function LandingWhyDifferent() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
      <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
          Built for traders, not accountants.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Other tools ask you to type every sale. Traka listens to how you already
          talk about your business, and turns it into records, automatically.
        </p>
      </motion.div>
    </section>
  );
}
