import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, X } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ease } from "./shared";

const ITEMS = [
  { t: "A bank or a POS", b: "We don’t hold your money or force new hardware. Your money stays yours." },
  { t: "A spreadsheet", b: "No rows, no formulas, no night-time calculating. The close is ready when you are." },
  { t: "A complex dashboard", b: "If it doesn’t help you this week — clean sales, clear debts, calm close — we don’t ship it." },
];

export function LandingNot() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
      <motion.div {...fadeUp(0)} className="overflow-hidden rounded-[2rem] bg-foreground text-background">
        <div className="grid items-stretch lg:grid-cols-2">
          <div className="p-6 md:p-12">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Plain words</p>
            <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
              What Traka is not.
            </h2>
            <p className="mt-3 max-w-md leading-relaxed text-background/70">
              Three things we will never make you do — so the record never feels like stress.
            </p>
            <ul className="mt-7 space-y-4">
              {ITEMS.map((c) => (
                <li key={c.t} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex shrink-0 rounded-full bg-red-500/15 p-1.5">
                    <X weight="bold" className="h-4 w-4 text-red-300" />
                  </span>
                  <span>
                    <span className="font-bold">{c.t}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-background/70">{c.b}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button className="mt-8" onClick={() => navigate({ to: "/auth" })}>
              Start writing my day
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center bg-white/[0.06] p-6 md:p-12">
            <div className="w-full rounded-2xl border border-border bg-white p-6 text-foreground shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                What stays out
              </p>
              <div className="mt-4 space-y-2.5">
                {[
                  { t: "POS machine", s: "not required" },
                  { t: "Spreadsheet formulas", s: "not needed" },
                  { t: "Complex dashboard", s: "not here" },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted px-4 py-3"
                  >
                    <span>
                      <span className="font-semibold line-through decoration-red-400 decoration-2">{r.t}</span>
                      <span className="ml-2 text-xs font-medium text-muted-foreground">— {r.s}</span>
                    </span>
                    <span className="inline-flex shrink-0 rounded-full bg-red-100 p-1.5">
                      <X weight="bold" className="h-3.5 w-3.5 text-red-600" />
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                Only what helps this week: sales, debts, close.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
