import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Quotes } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { STORIES, pad } from "@/lib/stories";
import { ease } from "./shared";

export function LandingStories() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const story = STORIES[index] ?? STORIES[0]!;

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + STORIES.length) % STORIES.length);
  };

  return (
    <section id="stories" className="scroll-mt-24 border-y border-border/60 bg-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
        <motion.div {...fadeUp(0)} className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Three traders, three markets</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            Real days, real records.
          </h2>
        </motion.div>

        <motion.div {...fadeUp(0.08)} className="mt-10 overflow-hidden rounded-[2rem] bg-pine text-white">
          <div className="grid min-h-[380px] p-6 md:p-12 lg:grid-cols-12">
            <div className="col-span-12 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/60">
              <span>Field notes · Lagos</span>
              <span>{pad(index + 1)} / {pad(STORIES.length)}</span>
            </div>
            <div className="flex flex-col lg:col-span-8">
              <div className="relative mt-6 flex-1">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.figure
                    key={story.n}
                    custom={direction}
                    initial={reduce ? false : { opacity: 0, x: 48 * direction }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -48 * direction }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <Quotes weight="fill" className="h-8 w-8 text-emerald-200" />
                    <blockquote className="mt-4 max-w-2xl text-balance font-display text-xl font-bold leading-snug md:text-[32px]">
                      “{story.q}”
                    </blockquote>
                    <figcaption className="mt-6">
                      <p className="font-bold">{story.n}</p>
                      <p className="text-sm text-white/70">{story.r}</p>
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex items-center gap-2">
                {STORIES.map((s, i) => (
                  <span
                    key={s.n}
                    className={
                      "h-1 rounded-full transition-all " +
                      (i === index ? "w-10 bg-white" : "w-4 bg-white/25")
                    }
                  />
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col items-start gap-4 lg:col-span-4 lg:mt-0 lg:items-end lg:justify-end">
              <div className="flex items-end gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => go(-1)}
                aria-label="Previous story"
                className="rounded-full border border-white/25 text-white hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft weight="bold" className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => go(1)}
                aria-label="Next story"
                className="rounded-full bg-white text-pine hover:bg-white/90 hover:text-pine"
              >
                <ArrowRight weight="bold" className="h-5 w-5" />
              </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
