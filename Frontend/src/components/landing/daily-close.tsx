import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { TrendUp, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ease } from "./shared";

interface BarDatum {
  d: string;
  h: number;
}

const BARS: BarDatum[] = [
  { d: "M", h: 40 }, { d: "T", h: 56 }, { d: "W", h: 32 },
  { d: "T", h: 80 }, { d: "F", h: 48 }, { d: "S", h: 64 }, { d: "S", h: 24 },
];

function Bar({
  bar,
  index,
  total,
  progress,
  reduce,
}: {
  bar: BarDatum;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean | null;
}) {
  const start = index / total;
  const end = (index + 1.5) / total;
  const scaleY = useTransform(progress, [start, Math.min(1, end)], [0.12, 1]);
  const peak = bar.h === 80;

  return (
    <div className="flex w-9 flex-col items-center gap-2">
      <div className="flex h-28 items-end">
        <motion.div
          className={cn("w-3.5 rounded-full", peak ? "bg-primary" : "bg-border")}
          style={reduce ? undefined : { scaleY, height: `${bar.h}px`, transformOrigin: "bottom" }}
        />
      </div>
      <span className={cn("text-[10px] font-bold", peak ? "text-primary" : "text-muted-foreground")}>
        {bar.d}
      </span>
    </div>
  );
}

export function LandingDailyClose() {
  const reduce = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: chartRef,
    offset: ["start 0.9", "end 0.45"],
  });

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-16 md:px-12 md:pb-24">
      <div className="grid items-start gap-10 lg:grid-cols-12">
        <motion.div {...fadeUp(0)} className="lg:col-span-6">
          <div ref={chartRef}>
          <Card className="p-5 md:p-7">
            <CardHeader className="p-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Daily sales pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="mt-5 flex items-start justify-between">
                {BARS.map((b, i) => (
                  <Bar key={`${b.d}-${b.h}`} bar={b} index={i} total={BARS.length} progress={scrollYProgress} reduce={reduce} />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Scroll on — Thursday grows tallest. You’ll see it before Friday restock.
              </p>
            </CardContent>
          </Card>
          </div>
        </motion.div>
        <motion.div {...fadeUp(0.08)} className="lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Daily close</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            Know what is left to keep.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Revenue, movement and debt in one evening view — then a weekly pattern
            that tells you when to restock and when to hold.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Card className="p-5">
              <p className="text-xs font-medium text-muted-foreground">Today’s revenue</p>
              <p className="mt-1 font-mono text-xl font-bold">₦48,200</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-primary">
                <TrendUp weight="bold" className="h-3.5 w-3.5" />
                +14% vs yesterday
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-medium text-muted-foreground">Out with debtors</p>
              <p className="mt-1 font-mono text-xl font-bold">₦16,500</p>
              <p className="mt-1 text-[11px] font-bold text-muted-foreground">2 people · due this week</p>
            </Card>
          </div>
          <div className="mt-3 animate-float rounded-2xl border border-border bg-white p-6 shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Tonight’s close · Mama Blessing
            </p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-pine">₦48,200</p>
            <div className="mt-4 space-y-2 text-sm text-foreground">
              <div className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5">
                <span>Cash · 14 sales</span>
                <span className="font-mono font-bold">₦21,400</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5">
                <span>Transfer · 9 matched</span>
                <span className="font-mono font-bold">₦26,800</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3.5 py-2.5 font-semibold text-primary">
                <span className="inline-flex items-center gap-1.5">
                  <Check weight="bold" className="h-4 w-4" />
                  Sent on WhatsApp
                </span>
                <span>8:04pm</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
