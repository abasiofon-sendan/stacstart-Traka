import { motion, useReducedMotion } from "motion/react";
import { MapPin } from "@phosphor-icons/react";
import { ease } from "./shared";

export function LandingCountries() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="border-y border-border/60 bg-muted/50">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-20">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-[28px] font-extrabold leading-[1.15] tracking-tight md:text-[40px] md:leading-[1.2]">
            Built for how small traders sell across Africa.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Cash, transfer, credit, or mobile money, wherever you trade.
          </p>
        </motion.div>
        <motion.div {...fadeUp(0.08)} className="mx-auto mt-8 max-w-xl">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-card">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin weight="fill" className="h-5 w-5 text-primary" />
            </span>
            <div>
              <p className="font-bold">
                Nigeria <span className="ml-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">live now</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Bank transfer, WhatsApp, English, Pidgin, Hausa
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
