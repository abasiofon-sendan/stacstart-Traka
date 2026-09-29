import { motion, useReducedMotion } from "motion/react";
import { Bank, BookOpen, ChartLineUp, Package } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ease } from "./shared";

const POINTS = [
  {
    icon: ChartLineUp,
    tint: "bg-[#cceedd]",
    title: "No idea of profit",
    body: "Cash, credit, transfer — nothing written down.",
  },
  {
    icon: Package,
    tint: "bg-[#ffe9af]",
    title: "Stock surprises",
    body: "You find out you're out of stock when a customer asks.",
  },
  {
    icon: BookOpen,
    tint: "bg-[#ffd9ca]",
    title: "Debts unclear",
    body: "You can't say who owes you, or how much.",
  },
  {
    icon: Bank,
    tint: "bg-[#e4e0ff]",
    title: "No proof for loans",
    body: "No record to show a bank your business works.",
  },
];

export function LandingProblem() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
      <motion.div {...fadeUp(0)} className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">The problem</p>
        <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
          You&apos;re running a business you can&apos;t see.
        </h2>
      </motion.div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            {...fadeUp(i * 0.06)}
            className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5 shadow-card"
          >
            <span className={cn("inline-flex shrink-0 rounded-xl p-2.5", p.tint)}>
              <p.icon weight="fill" className="h-5 w-5 text-pine" />
            </span>
            <span>
              <span className="font-display text-lg font-extrabold tracking-tight">{p.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{p.body}</span>
            </span>
          </motion.div>
        ))}
      </div>
      <motion.div
        {...fadeUp(0.1)}
        className="mt-6 rounded-2xl border border-border bg-muted/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground md:px-7 md:py-5 md:text-base"
      >
        <span className="font-semibold text-foreground">Nearly 40 million businesses like yours exist in Nigeria alone.</span>{" "}
        Most, across Africa, run the same way: informal, and invisible on paper.
      </motion.div>
    </section>
  );
}
