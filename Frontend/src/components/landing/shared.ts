import { money } from "@/lib/money";
import { activeCountry } from "@/store/country-store";

export const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function focusRing() {
  return "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
}

export const NAV_LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Features", href: "/features" },
  { label: "FAQ", href: "/#faq" },
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
    q: "Who is Traka for?",
    a: "Owners of small shops and provision stores in Nigeria, Kenya, Uganda and Ghana. Many trade in local languages rather than formal English, and already use WhatsApp daily with cash, bank transfer or mobile money.",
  },
  {
    q: "What problem does Traka solve?",
    a: "Most small shops run on cash, credit and transfers nobody writes down. At day's end you can't say if you made a profit, you learn you're out of stock only when a customer asks, and you can't say exactly who owes you or how much.",
  },
  {
    q: "How do I record a sale?",
    a: "Send a WhatsApp message like \"sold 2 bread, 1 milk\" and it becomes a sales record with updated stock and profit. Transfers into your store's virtual account are recorded the moment they arrive.",
  },
  {
    q: "How do credit sales and debts work?",
    a: "Log a debt against a customer's name and it's repaid through a payment link, so you always know who owes what.",
  },
  {
    q: "How does restock work?",
    a: "Photograph your products and Traka builds the inventory from the photo.",
  },
  {
    q: "Which languages can I use?",
    a: "Ask by voice and hear a spoken answer in English, Pidgin, Hausa or Swahili, depending on your country. Pick your country at signup and the app sets the right currency, payment method and languages.",
  },
  {
    q: "Will Traka get me a loan?",
    a: "Not today. Over time these records can give you a history to show lenders — that's the roadmap, not a feature today.",
  },
];
