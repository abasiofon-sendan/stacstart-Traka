import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Star } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ease } from "./shared";

export function LandingFinalCta() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section className="relative overflow-hidden bg-pine text-white">
      {/* ── Background patterns ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -bottom-48 -right-24 h-[30rem] w-[30rem] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-40 -top-56 h-[36rem] w-[36rem] rounded-full border-[3rem] border-white/[0.06]" />
        <div className="absolute -right-24 -top-40 h-[24rem] w-[24rem] rounded-full border-[2.5rem] border-white/[0.07]" />
        <div
          className="absolute inset-y-0 left-0 w-1/3 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to right, black, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black, transparent)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/3 opacity-60"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to left, black, transparent)",
            WebkitMaskImage: "linear-gradient(to left, black, transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-6 py-14 md:gap-12 md:px-12 md:py-24 lg:grid-cols-12">
        <motion.div {...fadeUp(0)} className="lg:col-span-7">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
            Free to start
          </p>
          <h2 className="mt-3 text-balance font-display text-[34px] font-extrabold leading-[1.15] tracking-tight md:text-[64px] md:leading-[1.15]">
            Bring your market day into writing.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">
            Join the traders turning busy days into clean records — cash, transfers,
            debts and daily close in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="bg-white text-pine hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-white hover:to-secondary hover:shadow-soft-lift"
            >
              Get started free
              <ArrowUpRight
                weight="bold"
                className="h-4 w-4 animate-arrow-bounce motion-reduce:animate-none"
              />
            </Button>
          </div>
          <p className="mt-6 text-xs text-white/60">Prepared by Team Blueprint · University of Uyo</p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-white p-6 text-foreground shadow-card md:p-8">
            <div className="flex gap-1" aria-label="Rated 5 out of 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} weight="fill" className="h-4 w-4 text-amber-500" />
              ))}
            </div>
            <p className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight">
              “Before, I used to argue with my book. Now my book argues for me.”
            </p>
            <p className="mt-5 text-sm font-semibold">
              Mama Blessing{" "}
              <span className="font-normal text-muted-foreground">· Provisions, Uyo</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
