import { useState, useMemo, useEffect } from "react";
import {
  X,
  Bank,
  Plus,
  Trash,
  Warning,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
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

interface IncomingTransferModalProps {
  open: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  incomingAmount: number;
  sender?: string;
  bank?: string;
  onConfirm: (basket: BasketItem[]) => void;
}

export function IncomingTransferModal({
  open,
  onClose,
  inventory,
  incomingAmount,
  sender,
  bank,
  onConfirm,
}: IncomingTransferModalProps) {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [prodId, setProdId] = useState(inventory[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [allowOvershoot, setAllowOvershoot] = useState(false);

  useEffect(() => {
    if (open) {
      setBasket([]);
      setProdId(inventory[0]?.id ?? "");
      setQty(1);
      setAllowOvershoot(false);
    }
  }, [open, inventory]);

  const basketTotal = useMemo(() => {
    return basket.reduce((sum, b) => {
      const item = inventory.find((i) => i.id === b.prodId);
      return sum + (item ? item.selling * b.qty : 0);
    }, 0);
  }, [basket, inventory]);

  const diff = incomingAmount - basketTotal;
  const isUnder = diff > 0 && basket.length > 0;
  const isOver = diff < 0 && basket.length > 0;
  const isPerfect = diff === 0 && basket.length > 0;
  const absDiff = Math.abs(diff);

  const addToBasket = () => {
    const item = inventory.find((i) => i.id === prodId);
    if (!item) return;
    setBasket((prev) => {
      const existing = prev.find((b) => b.prodId === prodId);
      if (existing) {
        return prev.map((b) =>
          b.prodId === prodId ? { ...b, qty: b.qty + qty } : b,
        );
      }
      return [...prev, { prodId, qty }];
    });
  };

  const removeFromBasket = (id: string) => {
    setBasket((prev) => prev.filter((b) => b.prodId !== id));
  };

  const updateBasketQty = (id: string, newQty: number) => {
    if (newQty < 1) {
      removeFromBasket(id);
      return;
    }
    setBasket((prev) =>
      prev.map((b) => (b.prodId === id ? { ...b, qty: newQty } : b)),
    );
  };

  const handleConfirm = () => {
    if (basket.length === 0) return;
    if (isUnder || (isOver && !allowOvershoot)) return;
    onConfirm(basket);
    onClose();
  };

  const canConfirm =
    basket.length > 0 && (isPerfect || (isOver && allowOvershoot));

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Incoming Transfer" wide>
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Bank weight="fill" className="h-4 w-4" />
              Incoming Transfer
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
          <div className="mb-5 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-card p-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Verified Incoming Transfer
            </p>
            <p className="mt-1.5 font-mono text-3xl font-black tracking-tight text-foreground">
              ₦{incomingAmount.toLocaleString()}
            </p>
            {sender && (
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {sender}
                {bank && <span className="text-muted-foreground/70"> · {bank}</span>}
              </p>
            )}
          </div>

          <div className="mb-4 space-y-3 rounded-2xl border border-border bg-card p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Add Products to Sale Basket
            </h4>
            <div className="min-w-0 flex-1">
              <Select
                value={prodId}
                onValueChange={setProdId}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent noPortal>
                  {inventory.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} — ₦{i.selling.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); addToBasket(); }}
              className="flex items-end gap-2"
            >
              <div className="w-20">
                <Input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 text-center font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="default"
                size="icon"
                className="h-10 w-10 shrink-0 cursor-pointer"
              >
                <Plus weight="bold" className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {basket.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Sale Basket
                </h4>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {basket.length} item{basket.length !== 1 && "s"}
                </span>
              </div>

              <div className="space-y-1.5">
                {basket.map((b) => {
                  const item = inventory.find((i) => i.id === b.prodId);
                  if (!item) return null;
                  const lineTotal = item.selling * b.qty;
                  return (
                    <div
                      key={b.prodId}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">
                          {item.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              updateBasketQty(b.prodId, b.qty - 1)
                            }
                            aria-label="Decrease quantity"
                            className="text-[10px] font-bold text-muted-foreground"
                          >
                            −
                          </Button>
                          <span className="w-5 text-center font-mono text-xs font-bold text-foreground">
                            {b.qty}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() =>
                              updateBasketQty(b.prodId, b.qty + 1)
                            }
                            aria-label="Increase quantity"
                            className="text-[10px] font-bold text-muted-foreground"
                          >
                            +
                          </Button>
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            × ₦{item.selling.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-foreground">
                          ₦{lineTotal.toLocaleString()}
                        </span>
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
              </div>

              <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Basket Total
                </span>
                <span className="font-mono text-base font-black text-foreground">
                  ₦{basketTotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                {isUnder && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                    <Warning
                      weight="fill"
                      className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        Basket total (₦{basketTotal.toLocaleString()}) is less
                        than transfer
                      </p>
                      <p className="mt-0.5 text-[11px] text-amber-700">
                        Add ₦{absDiff.toLocaleString()} more in products to
                        match.
                      </p>
                    </div>
                  </div>
                )}

                {isPerfect && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                    <CheckCircle
                      weight="fill"
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    />
                    <p className="text-xs font-bold text-emerald-900">
                      Matches transfer exactly! (₦
                      {basketTotal.toLocaleString()})
                    </p>
                  </div>
                )}

                {isOver && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <WarningCircle
                        weight="fill"
                        className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          Basket total (₦
                          {basketTotal.toLocaleString()}) exceeds transfer by ₦
                          {absDiff.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <label className="ml-6.5 mt-2.5 flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allowOvershoot}
                        onChange={(e) => setAllowOvershoot(e.target.checked)}
                        className="h-3.5 w-3.5 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-rose-700">
                        Leave excess as customer balance/tip
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </DrawerBody>

        <div className="border-t border-border px-5 py-4 pb-8">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full cursor-pointer py-3 text-xs font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Transaction
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
