import { money } from "@/lib/money";
import { activeCountry } from "@/store/country-store";

export const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function focusRing() {
  return "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
}

export const NAV_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Live demo", href: "#demo" },
  { label: "Traders", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

export const LANGS = ["EN", "Pidgin", "Yoruba", "Hausa", "Swahili"] as const;
export type Lang = (typeof LANGS)[number];

export const VOICE_QUESTIONS: Record<Lang, string[]> = {
  EN: ["Who owes me?", "How much did I sell today?", "Who paid last?"],
  Pidgin: ["Who dey owe me?", "How much I don sell today?", "Who pay last?"],
  Yoruba: ["Tani o jẹ mi ni gbese?", "Elo ni mo ti ta loni?", "Tani o san gbẹhin?"],
  Hausa: ["Waye ke bin ni?", "Nawa na sayar yau?", "Waye ya biya a karshe?"],
  Swahili: ["Nani ananidai?", "Nimeuza kiasi gani leo?", "Nani alilipa mwisho?"],
};

/**
 * Spoken answers in the demo. Built from the active country's config so the
 * numbers, the currency and the customer names all match what a merchant in
 * that market would actually see.
 */
export function voiceAnswers(): Record<Lang, Record<string, string>> {
  const c = activeCountry();
  const { copy, payment } = c;
  const a = copy.customerA;
  const b = copy.customerB;
  const m = (v: number) => money(v);
  const d = copy.demo;
  return {
    EN: {
      "Who owes me?": `${a} — ${m(d.debtorOne)} (2 bread, 1 milk). ${b} — ${m(d.debtorTwo)}. Total ${m(d.debtorTotal)} out.`,
      "How much did I sell today?": `${m(d.dayTotal)} so far — ${m(d.dayCash)} cash, ${m(d.dayTransfer)} by ${payment.label.toLowerCase()}. Best hour was 12pm.`,
      "Who paid last?": `${b} cleared ${m(d.lastPayment)} by ${payment.label.toLowerCase()} at 4:12pm. It matched itself.`,
    },
    Pidgin: {
      "Who dey owe me?": `${a} — ${m(d.debtorOne)} (2 bread, 1 milk). ${b} — ${m(d.debtorTwo)}. Total ${m(d.debtorTotal)} out.`,
      "How much I don sell today?": `${m(d.dayTotal)} so far — ${m(d.dayCash)} cash, ${m(d.dayTransfer)} by ${payment.label.toLowerCase()}. Best hour na 12pm.`,
      "Who pay last?": `${b} clear ${m(d.lastPayment)} by ${payment.label.toLowerCase()} for 4:12pm. E match itself.`,
    },
    Yoruba: {
      "Tani o jẹ mi ni gbese?": `${a} — ${m(d.debtorOne)} (búrẹ́dì 2, wàrà 1). ${b} — ${m(d.debtorTwo)}. Lapapọ ${m(d.debtorTotal)}.`,
      "Elo ni mo ti ta loni?": `${m(d.dayTotal)} titi di bayi — ${m(d.dayCash)} owó ọwọ́, ${m(d.dayTransfer)} ${payment.label.toLowerCase()}. Wákàtí tó dára jùlọ ni 12pm.`,
      "Tani o san gbẹhin?": `${b} san ${m(d.lastPayment)} ní 4:12pm nípasẹ̀ ${payment.label.toLowerCase()}. Ó bá ara rẹ̀ mu.`,
    },
    Hausa: {
      "Waye ke bin ni?": `${a} — ${m(d.debtorOne)} (burodi 2, madara 1). ${b} — ${m(d.debtorTwo)}. Jimilla ${m(d.debtorTotal)}.`,
      "Nawa na sayar yau?": `${m(d.dayTotal)} ya zuwa yanzu — ${m(d.dayCash)} tsabar kudi, ${m(d.dayTransfer)} ta ${payment.label.toLowerCase()}. Mafi kyawun lokaci 12pm.`,
      "Waye ya biya a karshe?": `${b} ta biya ${m(d.lastPayment)} da 4:12pm ta ${payment.label.toLowerCase()}. Ya daidaita da kansa.`,
    },
    Swahili: {
      "Nani ananidai?": `${a} — ${m(d.debtorOne)} (mkate 2, maziwa 1). ${b} — ${m(d.debtorTwo)}. Jumla ${m(d.debtorTotal)} nje.`,
      "Nimeuza kiasi gani leo?": `${m(d.dayTotal)} hadi sasa — ${m(d.dayCash)} pesa taslimu, ${m(d.dayTransfer)} kwa ${payment.label.toLowerCase()}. Saa nzuri zaidi ilikuwa 12pm.`,
      "Nani alilipa mwisho?": `${b} alilipa ${m(d.lastPayment)} kwa ${payment.label.toLowerCase()} saa 4:12pm. Imelingana yenyewe.`,
    },
  };
}

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Do I need to stop collecting cash?",
    a: "No. Keep selling exactly as you do today. Log each cash sale in seconds — it joins the same daily record as transfers.",
  },
  {
    q: "What happens when a customer sends a transfer?",
    a: "They pay to your Traka store number. The payment matches itself to your record — no manual sorting, no screenshots to chase.",
  },
  {
    q: "How do I handle customers who buy now and pay later?",
    a: "Log the sale under their name with what they took. Send them their payment link when ready — the moment they pay through it, Traka matches the payment and clears the debt itself. No marking, no chasing.",
  },
  {
    q: "Which languages does the voice helper speak?",
    a: "English, Pidgin, Yoruba, Hausa and Swahili. Type or hold the mic and ask about sales, debts or today’s close — it replies in your language, out loud.",
  },
  {
    q: "Do I need a smartphone or POS?",
    a: "Any phone that runs the app works. No POS, no spreadsheet, no new machine to learn.",
  },
  {
    q: "Is Traka holding my money?",
    a: "No. Money goes to your own store account. Traka only writes the record — sales, debts, daily close and weekly pattern.",
  },
];
