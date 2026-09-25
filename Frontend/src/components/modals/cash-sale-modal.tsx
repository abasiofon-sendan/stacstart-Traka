import { useState, useEffect, useMemo } from "react";
import { X, CurrencyNgn, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { InventoryItem } from "@/store/types";

interface BasketItem {
  prodId: string;
  qty: number;
}

interface CashSaleModalProps {
  open: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onConfirm: (basket: BasketItem[]) => void;
}

export function CashSaleModal({ open, onClose, inventory, onConfirm }: CashSaleModalProps) {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [prodId, setProdId] = useState(inventory[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const currentProdId = prodId || (inventory[0]?.id ?? "");

  useEffect(() => {
    if (open) {
      setBasket([]);
      setProdId(inventory[0]?.id ?? "");
      setQty(1);
    }
  }, [open, inventory]);

  const basketTotal = useMemo(() => {
    return basket.reduce((sum, b) => {
      const item = inventory.find((i) => i.id === b.prodId);
      return sum + (item ? item.selling * b.qty : 0);
    }, 0);
  }, [basket, inventory]);

  const addToBasket = () => {
    const item = inventory.find((i) => i.id === currentProdId);
    if (!item || qty < 1) return;
    setBasket((prev) => {
      const existing = prev.find((b) => b.prodId === currentProdId);
      if (existing) {
        return prev.map((b) =>
          b.prodId === currentProdId ? { ...b, qty: b.qty + qty } : b,
        );
      }
      return [...prev, { prodId: currentProdId, qty }];
    });
  };

  const removeFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((b) => b.prodId !== id));
  };

  const handleConfirm = () => {
    onConfirm(basket);
    onClose();
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Record Manual Cash Sale" wide>
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <CurrencyNgn weight="fill" className="h-4 w-4" />
              Record Manual Cash Sale
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X weight="bold" className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4 text-xs">
            <div>
              <label className="mb-1.5 block font-semibold text-muted-foreground">Select Sold Product</label>
              <Select value={prodId} onValueChange={setProdId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent noPortal>
                  {inventory.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} (Stock: {i.qty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); addToBasket(); }}
              className="flex items-end gap-2"
            >
              <div className="flex-1">
                <label className="mb-1.5 block font-semibold text-muted-foreground">Quantity</label>
                <Input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                size="icon"
                aria-label="Add to basket"
                className="mb-0.5 h-10 w-10 shrink-0 rounded-full bg-primary shadow-[inset_0_1.5px_0_0_rgba(255,255,255,0.25)] active:translate-y-px"
              >
                <Plus weight="bold" className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {basket.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sale Basket ({basket.length} item{basket.length !== 1 && "s"})
              </p>
              {basket.map((b) => {
                const item = inventory.find((i) => i.id === b.prodId);
                if (!item) return null;
                return (
                  <div key={b.prodId} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                    <div>
                      <p className="text-xs font-bold">{item.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">₦{item.selling.toLocaleString()} × {b.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black">₦{(item.selling * b.qty).toLocaleString()}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeFromBasket(b.prodId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash weight="bold" className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="font-mono text-base font-black">₦{basketTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DrawerBody>
        <div className="border-t border-border px-5 py-4 pb-8">
          <Button
            onClick={handleConfirm}
            disabled={basket.length === 0}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Cash Sale
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
