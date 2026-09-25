import { create } from "zustand";
import { voiceApi, type AiLanguage } from "@/lib/endpoints";
import { notify } from "./notify";
import { getErrorMessage } from "@/lib/utils";
import { useInventoryStore } from "./inventory-store";
import { useDebtorsStore } from "./debtors-store";

const AI_CHIPS: Record<AiLanguage, string[]> = {
  en: ["Who is owing me?", "How much profit today?", "Inventory Summary"],
  yo: ["Ta l'o je mi?", "Elo ni ere mi loni?", "Akojopo oja"],
  ha: ["Wane ne yake bina?", "Nawa riba a yau?", "Takaitaccen kaya"],
  pidgin: ["Who dey owe me?", "How much profit I make today?", "Inventory wey remain"],
};

let voiceMsgCounter = 0;

interface AiState {
  chatLogs: string[];
  chatAudioUrls: Record<number, string>;
  aiLang: AiLanguage;
  aiLoading: boolean;
  setAiLang: (v: AiLanguage) => void;
  submitAiQuery: (text: string) => Promise<void>;
  submitAiVoice: (audio: Blob) => Promise<void>;
}

function buildContext(): string {
  const items = useInventoryStore.getState().items;
  const entries = useDebtorsStore.getState().entries;
  const productList = items
    .map((i) => `${i.name} (stock: ${i.qty}, price: ₦${i.selling})`)
    .join("; ");
  const debtorList = entries.map((d) => `${d.name} (owes: ₦${d.amount})`).join("; ");
  const parts: string[] = [];
  if (productList) parts.push(`Products in stock: ${productList}.`);
  if (debtorList) parts.push(`Debtors: ${debtorList}.`);
  return parts.join(" ");
}

/** Traka AI chat state. Reads a live snapshot of stock/debtors for context. */
export const useAiStore = create<AiState>()((set, get) => ({
  chatLogs: [],
  chatAudioUrls: {},
  aiLang: "en",
  aiLoading: false,

  setAiLang: (aiLang) => set({ aiLang }),

  submitAiQuery: async (text) => {
    const q = text.trim();
    if (!q) return;
    const context = buildContext();
    const query = context ? `${context}\n\n${q}` : q;
    set((s) => ({ chatLogs: [...s.chatLogs, `user:${q}`], aiLoading: true }));
    try {
      const res = await voiceApi.askText(query, get().aiLang);
      set((s) => ({ chatLogs: [...s.chatLogs, `bot:${res.reply}`] }));
    } catch (err) {
      notify(
        "Assistant Unavailable",
        getErrorMessage(err, "Could not reach the AI advisor. Please try again."),
        "destructive",
      );
      set((s) => ({
        chatLogs: [
          ...s.chatLogs,
          "bot:Sorry, I could not reach the advisor right now. Please try again.",
        ],
      }));
    } finally {
      set({ aiLoading: false });
    }
  },

  submitAiVoice: async (audio) => {
    if (audio.size === 0) return;
    const audioUrl = URL.createObjectURL(audio);
    set({ aiLoading: true });
    try {
      const context = buildContext();
      const msgIdx = voiceMsgCounter++;
      set((s) => ({
        chatAudioUrls: { ...s.chatAudioUrls, [msgIdx]: audioUrl },
        chatLogs: [...s.chatLogs, "user:🎤"],
      }));
      const res = await voiceApi.askVoice(audio, context);
      set((s) => ({ chatLogs: [...s.chatLogs, `bot:${res.reply}`] }));
      const detected = res.language_detected as AiLanguage;
      if (["en", "yo", "ha", "pidgin"].includes(detected)) {
        set({ aiLang: detected });
      }
    } catch (err) {
      notify(
        "Voice Note Failed",
        getErrorMessage(err, "Could not process the voice note. Please try again."),
        "destructive",
      );
      set((s) => ({
        chatLogs: [
          ...s.chatLogs,
          "bot:Sorry, I could not understand that voice note. Please try again.",
        ],
      }));
    } finally {
      set({ aiLoading: false });
    }
  },
}));

export function useAiChips(): string[] {
  const aiLang = useAiStore((s) => s.aiLang);
  return AI_CHIPS[aiLang] ?? AI_CHIPS.en;
}
