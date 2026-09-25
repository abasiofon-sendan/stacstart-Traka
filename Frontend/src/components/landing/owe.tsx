import { motion, useReducedMotion } from "motion/react";
import { Check, HandCoins } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ease } from "./shared";

const POINTS = [
  "Itemized lists — 2 bread, 1 milk, with prices",
  "One link per person to collect payment",
  "Collect part-payments, mark cash paid, keep the history",
];

export function LandingOwe() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section id="owe" className="border-y border-border/60 bg-cream">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-16 md:px-12 md:py-24 lg:grid-cols-12">
        <motion.div {...fadeUp(0)} className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Owe tracker</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            Know who owes you — by name, by item.
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            No more “somebody owes me something.” Each person carries their own list,
            their due date, and their payment link. When they pay through the link,
            it clears itself — collect cash in person, and you mark that and move on.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {POINTS.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 rounded-full bg-primary/10 p-1"><Check weight="bold" className="h-3.5 w-3.5 text-primary" /></span>
                <span className="font-medium">{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...fadeUp(0.08)} className="lg:col-span-6">
          <div className="space-y-3">
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">Due Friday</span>
                  <h4 className="mt-2 font-bold">Chidi Okafor</h4>
                </div>
                <span className="font-mono font-bold text-red-600">₦12,500</span>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-xs">
                2× Bread — ₦8,000 · 1× Milk — ₦4,500
              </div>
              <CardContent className="mt-3 flex gap-2 p-0">
                <Button className="flex-1">
                  <HandCoins weight="fill" className="h-4 w-4" />
                  Collect
                </Button>
                <Button variant="secondary" className="flex-1">
                  <Check weight="bold" className="h-4 w-4" />
                  Mark paid
                </Button>
              </CardContent>
            </Card>
            <div className="flex items-center justify-between rounded-lg border border-dashed border-primary/30 bg-white/70 px-5 py-4 text-sm">
              <span className="font-semibold text-muted-foreground">Total out with 2 people</span>
              <span className="font-mono text-lg font-bold text-pine">₦16,500</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
