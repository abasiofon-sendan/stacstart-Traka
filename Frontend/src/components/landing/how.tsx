import { motion, useReducedMotion } from "motion/react";
import { Bank, ChatCircleText, Fingerprint } from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ease } from "./shared";

interface Step {
  n: string;
  icon: React.ElementType;
  title: string;
  body: string;
  visualTitle: string;
  visualBody: string;
  dark?: boolean;
}

const STEPS: Step[] = [
  {
    n: "1",
    icon: Fingerprint,
    title: "Get your store number",
    body: "Sign up once and receive your own Traka store number. Share it with anyone who pays by transfer — every payment finds its way home.",
    visualTitle: "7040 198 119",
    visualBody: "Mama Blessing Stores · always on",
    dark: true,
  },
  {
    n: "2",
    icon: ChatCircleText,
    title: "Sell as usual — we write it",
    body: "Cash? Log it in seconds. Transfer? It matches itself. Owe? Put their name and what they took. Nothing about how you sell has to change.",
    visualTitle: "Cash ₦2,350 · Transfer ₦7,800 · Chidi ₦12,500",
    visualBody: "One record, three ways to pay",
  },
  {
    n: "3",
    icon: Bank,
    title: "Close the day with sense",
    body: "Evening comes, Traka tells you what remains after the day’s movement — then sends your summary where you already chat.",
    visualTitle: "₦48,200",
    visualBody: "Shared on WhatsApp at 8:04pm",
  },
];

function StackStep({ step, index }: { step: Step; index: number }) {
  const reduce = useReducedMotion();

  return (
    <div className="sticky" style={{ top: `${110 + index * 24}px` }}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease }}
      >
        <Card className="overflow-hidden p-0">
          <div className="grid md:grid-cols-12">
            <div className="p-7 md:col-span-7 md:p-10">
              <CardHeader className="p-0">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted font-mono text-sm font-bold text-primary">
                  {step.n}
                </span>
                <CardTitle className="mt-4 font-display text-2xl font-extrabold tracking-tight">
                  {step.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base leading-relaxed">
                  {step.body}
                </CardDescription>
              </CardHeader>
            </div>
            <CardContent
              className={
                "flex items-center p-7 md:col-span-5 md:p-10 " +
                (step.dark ? "bg-pine text-white" : "bg-cream")
              }
            >
              <div className="w-full">
                <step.icon weight="fill" className={"h-7 w-7 " + (step.dark ? "text-emerald-200" : "text-primary")} />
                <p className="mt-3 font-mono text-xl font-bold leading-snug">{step.visualTitle}</p>
                <p className={"mt-1 text-sm " + (step.dark ? "text-white/70" : "text-muted-foreground")}>
                  {step.visualBody}
                </p>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export function LandingHow() {
  const reduce = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: reduce ? {} : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, delay, ease },
  });

  return (
    <section id="how" className="scroll-mt-24 bg-muted/50">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-12 md:py-24">
        <motion.div {...fadeUp(0)} className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight md:text-[44px] md:leading-[1.2]">
            Three small habits. One complete record.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Keep scrolling — each habit stacks onto the last, the way your day does.
          </p>
        </motion.div>
        <div className="relative mx-auto mt-12 max-w-4xl space-y-6 pb-10">
          <div aria-hidden className="absolute bottom-10 left-[27px] top-10 hidden w-px bg-border md:block" />
          {STEPS.map((s, i) => (
            <StackStep key={s.n} step={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
