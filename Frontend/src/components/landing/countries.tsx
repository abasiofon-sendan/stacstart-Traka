import { motion, useReducedMotion } from "motion/react";
import { ease } from "./shared";

const COUNTRIES = [
  {
    flag: "🇳🇬",
    name: "Nigeria",
    methods: "Bank transfer, WhatsApp",
    langs: "English, Pidgin, Hausa",
  },
  {
    flag: "🇬🇭",
    name: "Ghana",
    methods: "Bank transfer & mobile money",
    langs: "English",
  },
  {
    flag: "🇰🇪",
    name: "Kenya",
    methods: "Mobile money",
    langs: "Swahili, English",
  },
  {
    flag: "🇺🇬",
    name: "Uganda",
    methods: "Mobile money",
    langs: "English",
  },
];

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
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {COUNTRIES.map((c, i) => (
            <motion.div
              key={c.name}
              {...fadeUp(i * 0.06)}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-card"
            >
              <span className="text-3xl" aria-hidden>
                {c.flag}
              </span>
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.methods}</p>
                <p className="text-sm text-muted-foreground">{c.langs}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
