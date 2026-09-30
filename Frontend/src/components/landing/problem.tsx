import { motion, useReducedMotion } from "motion/react";
import { Bank, BookOpen, ChartLineUp, Package, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ease } from "./shared";

const chip =
  "rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted-foreground";

const CARDS = [
  {
    icon: ChartLineUp,
    pin: "bg-red-500",
    pinPos: "left-10",
    rotate: -2,
    duration: 4.6,
    title: "No idea of profit",
    body: "Cash, credit, transfer — nothing written down.",
    visual: (
      <div className="rounded-xl bg-muted/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={chip}>Cash</span>
          <span className={chip}>Credit</span>
          <span className={chip}>Transfer</span>
          <span className="rounded-full bg-pine px-2.5 py-1 font-mono text-[11px] font-bold text-white">
            ? kept
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: Package,
    pin: "bg-violet-600",
    pinPos: "right-10",
    rotate: 1.6,
    duration: 5.2,
    delay: 0.4,
    title: "Stock surprises",
    body: "You find out you're out of stock when a customer asks.",
    visual: (
      <div className="rounded-xl bg-muted/70 px-4 py-3">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-muted-foreground">Stock bar</span>
          <span className="text-red-600">18%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full w-[18%] rounded-full bg-red-500" />
        </div>
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
            Low
          </span>
          <span className={chip}>Restock?</span>
        </div>
      </div>
    ),
  },
  {
    icon: BookOpen,
    pin: "bg-green-500",
    pinPos: "left-1/2 -translate-x-1/2",
    rotate: 1.2,
    duration: 4.9,
    delay: 0.8,
    title: "Debts unclear",
    body: "You can't say who owes you, or how much.",
    visual: (
      <div className="rounded-xl bg-muted/70 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-dashed border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            Who owes me?
          </span>
          <span className="rounded-full border border-dashed border-border bg-white px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            How much?
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: Bank,
    pin: "bg-amber-400",
    pinPos: "right-12",
    rotate: -1.6,
    duration: 5.5,
    delay: 0.2,
    title: "No proof for loans",
    body: "No record to show a bank your business works.",
    visual: (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/70 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-[11px] font-bold text-muted-foreground shadow-sm">
          <X weight="bold" className="h-3 w-3 text-red-500" />
          No record found
        </span>
      </div>
    ),
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
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(rgba(14,107,74,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">The problem</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            You&apos;re running a business you can&apos;t see.
          </h2>
        </motion.div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={reduce ? false : { opacity: 0, y: 32, rotate: c.rotate }}
              whileInView={{ opacity: 1, y: 0, rotate: c.rotate }}
              whileHover={reduce ? undefined : { rotate: 0, scale: 1.02 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease }}
              className="relative rounded-3xl border border-border bg-white p-6 shadow-card"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute -top-2.5 z-10 h-5 w-5 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.35)] ring-1 ring-black/10",
                  c.pinPos,
                  c.pin,
                )}
              >
                <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-white/70" />
              </span>
              <motion.div
                animate={reduce ? {} : { y: [0, -7, 0] }}
                transition={{
                  duration: c.duration,
                  delay: c.delay ?? 0,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                }}
              >
                {c.visual}
                <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
                  <c.icon weight="fill" className="h-5 w-5 text-primary" />
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                  {c.body}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div
          {...fadeUp(0.1)}
          className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border bg-white px-5 py-4 text-sm leading-relaxed text-muted-foreground shadow-card md:px-7 md:py-5 md:text-base"
        >
          <span className="font-semibold text-foreground">Nearly 40 million businesses like yours exist in Nigeria alone.</span>{" "}
          Most, across Africa, run the same way: informal, and invisible on paper.
        </motion.div>
      </div>
    </section>
  );
}
