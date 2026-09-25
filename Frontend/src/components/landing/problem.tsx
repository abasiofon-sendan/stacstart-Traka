import { motion, useReducedMotion } from "motion/react";
import { BookOpen, ChartLineUp, Wallet } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ease } from "./shared";

const ROWS = [
  {
    icon: Wallet,
    tint: "bg-[#ffe9af]",
    panel: "bg-[#fff9e8]",
    title: "Cash disappears by evening",
    body: "You sold all day but can’t say what entered. Small leaks eat the profit before you reach home.",
    proof: "₦48,200 in · ₦? kept",
  },
  {
    icon: BookOpen,
    tint: "bg-[#ffd9ca]",
    panel: "bg-[#fff3ec]",
    title: "“I go pay tomorrow” vanishes",
    body: "Names in your head, figures on paper scraps. When tomorrow comes, the story changes.",
    proof: "Chidi · ₦12,500 · Friday?",
  },
  {
    icon: ChartLineUp,
    tint: "bg-[#cceedd]",
    panel: "bg-[#eef7f1]",
    title: "No proof when it matters",
    body: "Family support, restock loans, bigger supply — everyone asks for records you don’t have.",
    proof: "No record found",
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
          The notebook fails. So does memory.
        </h2>
      </motion.div>
      <div className="mt-12 space-y-6">
        {ROWS.map((r, i) => {
          const fromLeft = i % 2 === 0;
          return (
            <motion.div
              key={r.title}
              initial={
                reduce
                  ? false
                  : { opacity: 0, x: fromLeft ? -32 : 32, rotate: fromLeft ? -0.6 : 0.6 }
              }
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.28 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              className={cn(
                "grid items-center gap-6 rounded-2xl border border-border p-7 shadow-card md:grid-cols-12 md:p-10",
                r.panel,
              )}
            >
              <div className={cn("md:col-span-7", i % 2 === 1 && "md:order-2")}>
                <span className={cn("inline-flex rounded-xl p-3", r.tint)}>
                  <r.icon weight="fill" className="h-6 w-6 text-pine" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">{r.title}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
              <div className={cn("md:col-span-5", i % 2 === 1 && "md:order-1")}>
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: 0.18 + i * 0.08, ease }}
                  className="rounded-xl border border-border bg-white px-5 py-4 shadow-card"
                >
                  <p className="text-xs font-medium text-muted-foreground">Today, without Traka</p>
                  <p className="mt-1 font-mono text-xl font-bold text-muted-foreground">{r.proof}</p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
