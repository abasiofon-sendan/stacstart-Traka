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

export const LANGS = ["EN", "Pidgin", "Yoruba", "Hausa", "Igbo"] as const;
export type Lang = (typeof LANGS)[number];

export const VOICE_QUESTIONS: Record<Lang, string[]> = {
  EN: ["Who owes me?", "How much did I sell today?", "Who paid last?"],
  Pidgin: ["Who dey owe me?", "How much I don sell today?", "Who pay last?"],
  Yoruba: ["Tani o jẹ mi ni gbese?", "Elo ni mo ti ta loni?", "Tani o san gbẹhin?"],
  Hausa: ["Waye ke bin ni?", "Nawa na sayar yau?", "Waye ya biya a karshe?"],
  Igbo: ["Onye ji m ụgwọ?", "Ego ole ka m ree taa?", "Onye kwụrụ ụgwọ ikpeazụ?"],
};

export const VOICE_ANSWERS: Record<Lang, Record<string, string>> = {
  EN: {
    "Who owes me?": "Chidi — ₦12,500 (2 bread, 1 milk). Aisha — ₦4,000. Total ₦16,500 out.",
    "How much did I sell today?": "₦48,200 so far — ₦21,400 cash, ₦26,800 by transfer. Best hour was 12pm.",
    "Who paid last?": "Aisha cleared ₦6,000 by transfer at 4:12pm. It matched itself.",
  },
  Pidgin: {
    "Who dey owe me?": "Chidi — ₦12,500 (2 bread, 1 milk). Aisha — ₦4,000. Total ₦16,500 out.",
    "How much I don sell today?": "₦48,200 so far — ₦21,400 cash, ₦26,800 by transfer. Best hour na 12pm.",
    "Who pay last?": "Aisha clear ₦6,000 by transfer for 4:12pm. E match itself.",
  },
  Yoruba: {
    "Tani o jẹ mi ni gbese?": "Chidi — ₦12,500 (búrẹ́dì 2, wàrà 1). Aisha — ₦4,000. Lapapọ ₦16,500.",
    "Elo ni mo ti ta loni?": "₦48,200 titi di bayi — ₦21,400 owó ọwọ́, ₦26,800 ìfowópamọ́. Wákàtí tó dára jùlọ ni 12pm.",
    "Tani o san gbẹhin?": "Aisha san ₦6,000 ní 4:12pm nípasẹ̀ ìfowópamọ́. Ó bá ara rẹ̀ mu.",
  },
  Hausa: {
    "Waye ke bin ni?": "Chidi — ₦12,500 (burodi 2, madara 1). Aisha — ₦4,000. Jimilla ₦16,500.",
    "Nawa na sayar yau?": "₦48,200 ya zuwa yanzu — ₦21,400 tsabar kudi, ₦26,800 ta canja wuri. Mafi kyawun lokaci 12pm.",
    "Waye ya biya a karshe?": "Aisha ta biya ₦6,000 da 4:12pm ta canja wuri. Ya daidaita da kansa.",
  },
  Igbo: {
    "Onye ji m ụgwọ?": "Chidi — ₦12,500 (achịcha 2, mmiri ara ehi 1). Aisha — ₦4,000. Ngụkọta ₦16,500.",
    "Ego ole ka m ree taa?": "₦48,200 ruo ugbu a — ₦21,400 ego nkịtị, ₦26,800 nnyefe. Oge kacha mma bụ 12pm.",
    "Onye kwụrụ ụgwọ ikpeazụ?": "Aisha kwụrụ ₦6,000 na 4:12pm site na nnyefe. O dakọtara onwe ya.",
  },
};

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
    a: "English, Pidgin, Yoruba, Hausa and Igbo. Type or hold the mic and ask about sales, debts or today’s close — it replies in your language, out loud.",
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
