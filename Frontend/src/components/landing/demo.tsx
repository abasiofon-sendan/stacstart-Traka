import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Bank, Check, CurrencyNgn, SpeakerHigh } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ease, VOICE_ANSWERS, VOICE_QUESTIONS } from "./shared";

export function LandingDemo() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.4"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const [demoTotal, setDemoTotal] = useState(32400);
  const [demoEntries, setDemoEntries] = useState<string[]>([
    "Cash — ₦2,350 — 9:04am",
    "Transfer — ₦7,800 — matched 1:22pm",
  ]);
  const [voiceReply, setVoiceReply] = useState(
    "Ask me anything about today — sales, debts, who paid last.",
  );

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section ref={sectionRef} id="demo" className="mx-auto max-w-[1400px] scroll-mt-24 px-6 py-16 md:px-12 md:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-12">
        <motion.div {...fadeUp(0)} className="lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Live demo · no login needed</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            Press the buttons. This is the whole job.
          </h2>
          <p className="mt-3 text-muted-foreground">
            No signup, no setup. Tap cash, tap transfer, ask a question — watch one record grow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                setDemoTotal((t) => t + 2350);
                setDemoEntries((e) => [`Cash — ₦2,350 — just now`, ...e].slice(0, 5));
              }}
            >
              <CurrencyNgn weight="bold" className="h-4 w-4" />
              Log ₦2,350 cash
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDemoTotal((t) => t + 7800);
                setDemoEntries((e) => [`Transfer — ₦7,800 — matched`, ...e].slice(0, 5));
              }}
            >
              <Bank weight="bold" className="h-4 w-4" />
              Simulate ₦7,800 transfer
            </Button>
          </div>
        </motion.div>
        <motion.div {...fadeUp(0.08)} className="lg:col-span-7">
          <Card className="p-6 md:p-8">
            {!reduce && (
              <motion.div
                className="mb-5 h-1 origin-left rounded-full bg-primary"
                style={{ scaleX: progress }}
              />
            )}
            <CardHeader className="flex-row items-center justify-between p-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Today’s record
              </CardTitle>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Live
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <p className="mt-2 font-mono text-4xl font-bold tracking-tight text-pine md:text-5xl">
                ₦{demoTotal.toLocaleString()}
              </p>
              <div className="mt-5 space-y-2">
                <AnimatePresence initial={false}>
                  {demoEntries.map((e) => (
                    <motion.div
                      key={e}
                      layout
                      initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease }}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
                    >
                      <span>{e}</span>
                      <Check weight="bold" className="h-4 w-4 text-primary" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {VOICE_QUESTIONS.Pidgin.map((q) => (
                  <Button key={q} variant="secondary" size="sm" onClick={() => setVoiceReply(VOICE_ANSWERS.Pidgin[q] ?? "")}>
                    {q}
                  </Button>
                ))}
              </div>
              <p className="mt-3 rounded-lg rounded-tl-none bg-muted p-4 text-sm leading-relaxed">
                <SpeakerHigh weight="fill" className="mr-2 inline h-4 w-4 text-primary" />
                {voiceReply}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
