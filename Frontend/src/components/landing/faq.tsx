import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ease, FAQS } from "./shared";

export function LandingFaq() {
  const reduce = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section id="faq" className="mx-auto max-w-[900px] scroll-mt-24 px-6 pb-16 md:pb-24">
      <motion.div {...fadeUp(0)} className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Questions</p>
        <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
          You might be wondering…
        </h2>
      </motion.div>
      <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-white px-5 shadow-card md:px-8">
        {FAQS.map((f, i) => {
          const open = openFaq === i;
          return (
            <div key={f.q}>
              <Button
                variant="ghost"
                onClick={() => setOpenFaq(open ? null : i)}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 whitespace-normal rounded-none px-0 py-5 text-left text-base font-semibold hover:bg-transparent"
                aria-expanded={open}
              >
                <span>{f.q}</span>
                <span className={cn("shrink-0 rounded-full border border-border px-2.5 py-1 text-sm transition-transform", open && "rotate-45")}>+</span>
              </Button>
              {open && <p className="pb-5 text-base leading-relaxed text-muted-foreground">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
