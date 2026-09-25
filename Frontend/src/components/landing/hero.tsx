import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Bank,
  BookOpen,
  CurrencyNgn,
  Microphone,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ease } from "./shared";

function floatTransition(duration: number, delay = 0) {
  return { duration, delay, repeat: Infinity, ease: "easeInOut" as const };
}

const RING_ITEMS = [
  {
    key: "cash",
    className: "left-[4%] top-[30%]",
    duration: 4.2,
    card: (
      <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-card">
        <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          <CurrencyNgn weight="fill" className="h-3 w-3 text-primary" />
          Cash · logged
        </p>
        <p className="mt-0.5 font-mono text-sm font-bold">₦2,350</p>
      </div>
    ),
  },
  {
    key: "transfer",
    className: "right-[4%] top-[30%]",
    duration: 5,
    delay: 0.6,
    card: (
      <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-card">
        <p className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary">
          <Bank weight="fill" className="h-3 w-3" />
          Transfer · matched
        </p>
        <p className="mt-0.5 font-mono text-sm font-bold">₦7,800</p>
      </div>
    ),
  },
  {
    key: "voice",
    className: "left-[8%] bottom-[10%]",
    duration: 4.6,
    delay: 1.1,
    card: (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-card">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Microphone weight="fill" className="h-3.5 w-3.5 text-primary" />
        </span>
        <span className="text-[11px] font-bold">“How much I don sell?”</span>
      </div>
    ),
  },
  {
    key: "owe",
    className: "right-[8%] bottom-[10%]",
    duration: 3.8,
    delay: 0.3,
    card: (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-card">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
          <BookOpen weight="fill" className="h-3.5 w-3.5 text-red-600" />
        </span>
        <span className="text-[11px] font-bold">Chidi · ₦12,500</span>
      </div>
    ),
  },
  {
    key: "mb",
    className: "left-[19%] top-[13%]",
    duration: 5.2,
    delay: 0.2,
    card: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cceedd] text-xs font-extrabold text-pine shadow-card ring-2 ring-white">
        MB
      </span>
    ),
  },
  {
    key: "co",
    className: "right-[19%] top-[13%]",
    duration: 4.4,
    delay: 0.9,
    card: (
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd9ca] text-xs font-extrabold text-[#8a3b22] shadow-card ring-2 ring-white">
        CO
      </span>
    ),
  },
];

const MOBILE_ITEMS = [
  {
    key: "m-cash",
    className: "right-[5%] top-[13%]",
    duration: 4.2,
    card: (
      <div className="rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-card">
        <p className="font-mono text-xs font-bold">₦2,350</p>
      </div>
    ),
  },
  {
    key: "m-owe",
    className: "left-[5%] bottom-[7%]",
    duration: 3.8,
    delay: 0.5,
    card: (
      <div className="rounded-lg border border-border bg-white px-2.5 py-1.5 shadow-card">
        <p className="text-[10px] font-bold">Chidi · ₦12,500</p>
      </div>
    ),
  },
];

export function LandingHero() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: reduce ? {} : { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-background to-background">
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#cceedd]/50 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-[#ffe9af]/60 blur-3xl" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border-[2rem] border-primary/[0.06]" />
        <div className="absolute -right-24 top-24 h-56 w-56 rounded-full border-[1.75rem] border-primary/[0.07]" />
        <div
          className="absolute inset-x-0 top-0 h-64 opacity-70"
          style={{
            backgroundImage: "radial-gradient(rgba(14,107,74,0.16) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      {!reduce && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            {RING_ITEMS.map((f) => (
              <div key={f.key} className={cn("absolute", f.className)}>
                <motion.div animate={{ y: [0, -12, 0] }} transition={floatTransition(f.duration, f.delay ?? 0)}>
                  {f.card}
                </motion.div>
              </div>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 lg:hidden">
            {MOBILE_ITEMS.map((f) => (
              <div key={f.key} className={cn("absolute", f.className)}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={floatTransition(f.duration, f.delay ?? 0)}>
                  {f.card}
                </motion.div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-32 md:px-12 md:pb-28 md:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            {...fadeUp(0)}
            className="text-balance font-display text-[38px] font-extrabold leading-[1.12] tracking-tight md:text-[64px] md:leading-[1.15]"
          >
            Your market day, <span className="text-primary">written down.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.12)} className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-[23px] md:leading-[1.4]">
            Sell the way you always have. Traka keeps one clean record of it all.
          </motion.p>
          <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="hover:-translate-y-0.5"
            >
              Start writing my day
              <ArrowUpRight
                weight="bold"
                className="h-4 w-4 animate-arrow-bounce motion-reduce:animate-none"
              />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
