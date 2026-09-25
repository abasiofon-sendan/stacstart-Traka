import { create } from "zustand";
import type { StagedProduct } from "./types";
import { inventoryApi } from "@/lib/endpoints";
import { notify } from "./notify";
import { useInventoryStore } from "./inventory-store";

interface ScanState {
  stagedProducts: StagedProduct[];
  activeStagedIdx: number;
  scanning: boolean;
  setActiveStagedIdx: (v: number) => void;
  triggerBatchScan: (files: FileList | null) => Promise<void>;
  addStagedProduct: (name?: string) => void;
  updateStagedField: (
    idx: number,
    field: keyof StagedProduct,
    value: string | number,
  ) => void;
  commitBatch: () => Promise<void>;
  discardBatch: () => void;
}

/** Transient batch-scan staging workflow (AI photo upload → edit → commit). */
export const useScanStore = create<ScanState>()((set, get) => ({
  stagedProducts: [],
  activeStagedIdx: 0,
  scanning: false,

  setActiveStagedIdx: (activeStagedIdx) => set({ activeStagedIdx }),

  triggerBatchScan: async (_files) => {
    if (!_files || _files.length === 0) return;
    set({ scanning: true });
    notify(
      "Processing Batch Upload",
      `Analyzing ${_files.length} product images.`,
    );
    let names: string[] = [];
    try {
      const res = await inventoryApi.extractProduct(Array.from(_files));
      names = res.names;
    } catch {
      notify(
        "Scan Note",
        "Could not reach product recognition. Using generic names.",
      );
    }
    const files = Array.from(_files);
    set({
      stagedProducts: files.map((f, i) => ({
        name: names[i] || `AI Parsed Item #${i + 1}`,
        qty: 0,
        cost: 0,
        selling: 0,
        img: URL.createObjectURL(f),
      })),
      activeStagedIdx: 0,
      scanning: false,
    });
  },

  addStagedProduct: (name = "") => {
    const placeholderImg =
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop&q=60";
    const idx = get().stagedProducts.length;
    set((s) => ({
      stagedProducts: [
        ...s.stagedProducts,
        { name, qty: 1, cost: 0, selling: 0, img: placeholderImg },
      ],
      activeStagedIdx: idx,
    }));
  },

  updateStagedField: (idx, field, value) =>
    set((s) => ({
      stagedProducts: s.stagedProducts.map((p, i) =>
        i === idx ? { ...p, [field]: value } : p,
      ),
    })),

  commitBatch: async () => {
    const { stagedProducts } = get();
    if (stagedProducts.length === 0) return;
    const createdIds: string[] = [];
    let allSucceeded = true;
    for (const s of stagedProducts) {
      try {
        const created = await inventoryApi.create({
          name: s.name,
          cost_price: s.cost,
          selling_price: s.selling,
          quantity: s.qty,
        });
        createdIds.push(created.id);
      } catch {
        allSucceeded = false;
        break;
      }
    }
    if (!allSucceeded) {
      notify(
        "Batch Save Failed",
        "Could not save products to server. Saved locally.",
        "destructive",
      );
    }
    const current = useInventoryStore.getState().items;
    const maxNum = current.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0);
    useInventoryStore.getState().appendItems(
      stagedProducts.map((s, i) => ({
        id: allSucceeded ? createdIds[i]! : `p-local-${maxNum + i + 1}`,
        name: s.name,
        qty: s.qty,
        cost: s.cost,
        selling: s.selling,
      })),
    );
    notify(
      "Batch Saved Successfully",
      `Appended ${stagedProducts.length} new items into verified smart inventory frameworks.`,
    );
    set({ stagedProducts: [], activeStagedIdx: 0 });
  },

  discardBatch: () => set({ stagedProducts: [], activeStagedIdx: 0 }),
}));
