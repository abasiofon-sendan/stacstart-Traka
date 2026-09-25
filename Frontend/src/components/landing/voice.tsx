import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Microphone } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ease, LANGS, VOICE_ANSWERS, VOICE_QUESTIONS, type Lang } from "./shared";

const BARS = [10, 22, 16, 30, 24, 34, 18, 26, 14, 28, 20, 32, 16, 24, 12];

export function LandingVoice() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.45"],
  });
  const [lang, setLang] = useState<Lang>("Pidgin");
  const [active, setActive] = useState(0);
  const questions = VOICE_QUESTIONS[lang];
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(questions.length - 1, Math.max(0, Math.floor(v * questions.length))));
  });

  const q = questions[active] ?? questions[0]!;
  const reply = VOICE_ANSWERS[lang][q] ?? "";

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section ref={sectionRef} id="voice" className="mx-auto max-w-[1400px] scroll-mt-24 px-6 py-16 md:px-12 md:py-24">
      <motion.div {...fadeUp(0)} className="overflow-hidden rounded-[2rem] bg-pine text-white">
        <div className="grid lg:grid-cols-12">
          <div className="p-6 md:p-12 lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Voice helper</p>
            <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
              Or just place a call. Ask it like you talk.
            </h2>
            <p className="mt-3 max-w-lg text-white/75">
              Scroll on — tap any question and hear the answer, the way you would ask it at your counter.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant="ghost"
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-full text-white hover:text-white",
                    lang === l ? "bg-white text-pine hover:bg-white hover:text-pine" : "border border-white/25 hover:bg-white/10",
                  )}
                >
                  {l}
                </Button>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {questions.map((q, i) => (
                <Button
                  key={q}
                  variant="ghost"
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-auto min-h-[44px] w-full justify-start gap-3 rounded-sm border px-4 py-3 text-left text-sm font-semibold",
                    active === i
                      ? "border-white bg-white text-pine hover:bg-white hover:text-pine"
                      : "border-white/25 text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                      active === i ? "bg-pine text-white" : "bg-white/15 text-white",
                    )}
                  >
                    {i + 1}
                  </span>
                  {q}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center bg-black/20 p-6 md:p-12 lg:col-span-5">
            <div className="w-full rounded-2xl border border-border bg-white p-6 text-foreground shadow-card lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now answering · {lang}</p>
                <Microphone weight="fill" className="h-5 w-5 animate-pulse text-primary" />
              </div>
              <div className="mt-4 flex h-10 items-end gap-1.5" aria-hidden>
                {BARS.map((h, i) => (
                  <span
                    key={i}
                    className="w-2 animate-pulse rounded-full bg-primary"
                    style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
              <p className="mt-4 min-h-[76px] rounded-lg bg-muted p-4 text-sm leading-relaxed">{reply}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
