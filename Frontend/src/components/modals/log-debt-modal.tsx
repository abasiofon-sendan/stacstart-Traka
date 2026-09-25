import { useState, useRef } from "react";
import { X, UserPlus, Trash, ShoppingCart, Plus } from "@phosphor-icons/react";
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
import type { CreditBasketItem, DebtorItem } from "@/store/types";

interface LogDebtModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, amount: number, date: string, items: DebtorItem[]) => void;
  inventory: InventoryItem[];
}

export function LogDebtModal({ open, onClose, onConfirm, inventory }: LogDebtModalProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState("1");
  const [creditBasket, setCreditBasket] = useState<CreditBasketItem[]>([]);

  const totalAmount = creditBasket.reduce(
    (sum, item) => sum + item.unit_price * item.qty,
    0,
  );

  const handleAddToBasket = () => {
    if (!selectedProductId) return;
    const product = inventory.find((p) => p.id === selectedProductId);
    if (!product) return;
    const qty = Math.max(1, parseInt(selectedQty) || 1);

    setCreditBasket((prev) => {
      // If already in basket, merge quantities
      const existing = prev.find((b) => b.inventoryId === product.id);
      if (existing) {
        return prev.map((b) =>
          b.inventoryId === product.id ? { ...b, qty: b.qty + qty } : b,
        );
      }
      return [
        ...prev,
        {
          inventoryId: product.id,
          product_name: product.name,
          qty,
          unit_price: product.selling,
        },
      ];
    });
    setSelectedProductId("");
    setSelectedQty("1");
  };

  const handleRemoveFromBasket = (inventoryId: string) => {
    setCreditBasket((prev) => prev.filter((b) => b.inventoryId !== inventoryId));
  };

  const handleSubmit = () => {
    if (creditBasket.length === 0 || totalAmount <= 0) return;

    const items: DebtorItem[] = creditBasket.map((b) => ({
      product_name: b.product_name,
      qty: b.qty,
      price: b.unit_price,
    }));

    onConfirm(
      name.trim() || "Anonymous Customer",
      totalAmount,
      date || new Date().toISOString().split("T")[0]!,
      items,
    );

    handleClose();
  };

  const handleClose = () => {
    setCreditBasket([]);
    setName("");
    setDate("");
    setSelectedProductId("");
    setSelectedQty("1");
    onClose();
  };

  return (
    <ResponsiveDialog open={open} onClose={handleClose} title="Log New Credit Sale" wide>
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
              <UserPlus weight="fill" className="h-4 w-4" />
              Log New Credit Sale
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
            {/* Customer Name */}
            <div>
              <label className="mb-1.5 block font-semibold text-muted-foreground">
                Customer Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mama Amaka"
                className="w-full"
              />
            </div>

            {/* Due Date */}
            <div className="relative pt-1">
              <span className="absolute -top-1 left-3 z-10 rounded-sm border border-border bg-card px-1.5 text-[9px] font-bold uppercase tracking-widest text-destructive">
                payment due date
              </span>
              <Input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-destructive py-2.5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                onPointerDown={(e) => {
                  if (dateInputRef.current?.showPicker) {
                    e.stopPropagation();
                    dateInputRef.current.showPicker();
                  }
                }}
              />
            </div>

            {/* Product + Quantity Selectors */}
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Add Items to Credit
              </p>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-border bg-card text-[11px]">
                  <SelectValue placeholder="Select product…" />
                </SelectTrigger>
                  <SelectContent>
                  {inventory.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — ₦{p.selling.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <form
                onSubmit={(e) => { e.preventDefault(); handleAddToBasket(); }}
                className="mt-2.5 flex items-center gap-2"
              >
                <Input
                  type="number"
                  min={1}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(e.target.value)}
                  className="h-9 w-14 rounded-lg text-center text-[11px]"
                />

                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={!selectedProductId}
                  className="h-9 shrink-0 rounded-lg px-3 text-[11px] font-bold"
                >
                  <Plus weight="bold" className="h-3 w-3" />
                  Add
                </Button>
              </form>
            </div>

            {/* Basket List */}
            {creditBasket.length > 0 && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <ShoppingCart weight="fill" className="h-3 w-3" />
                  Credit Basket ({creditBasket.length}{" "}
                  {creditBasket.length === 1 ? "item" : "items"})
                </p>
                <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                  {creditBasket.map((item) => (
                    <div
                      key={item.inventoryId}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-card-foreground text-[11px]">
                          {item.qty}× {item.product_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ₦{item.unit_price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="font-black text-destructive text-[11px]">
                          ₦{(item.unit_price * item.qty).toLocaleString()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveFromBasket(item.inventoryId)}
                          aria-label={`Remove ${item.product_name}`}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash weight="fill" className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Total */}
                <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                    Total Credit Value
                  </span>
                  <span className="text-sm font-black text-destructive">
                    ₦{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Empty basket placeholder */}
            {creditBasket.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-5 text-center text-[11px] text-muted-foreground">
                <ShoppingCart weight="duotone" className="mx-auto mb-1.5 h-6 w-6 opacity-40" />
                No items added yet. Select products above.
              </div>
            )}
          </div>
        </DrawerBody>

        <div className="border-t border-border px-5 py-4 pb-8">
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={creditBasket.length === 0}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider"
          >
            Log Transaction — ₦{totalAmount.toLocaleString()}
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
