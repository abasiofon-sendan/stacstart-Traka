import { useState, useEffect } from "react";
import { X, Check, Trash, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { inventoryApi } from "@/lib/endpoints";
import { queryClient } from "@/lib/query-client";
import type { InventoryItem } from "@/store/types";

interface EditProductDrawerProps {
  open: boolean;
  onClose: () => void;
  target: InventoryItem | null;
}

export function EditProductDrawer({ open, onClose, target }: EditProductDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(0);
  const [cost, setCost] = useState(0);
  const [selling, setSelling] = useState(0);

  useEffect(() => {
    if (!target) return;
    setName(target.name);
    setQty(target.qty);
    setCost(target.cost);
    setSelling(target.selling);
    setConfirmDelete(false);
  }, [target, open]);

  if (!target) return null;

  const margin = selling - cost;
  const marginPercent = cost > 0 ? Math.round((margin / cost) * 100) : 0;

  const hasChanges = name !== target.name || qty !== target.qty || cost !== target.cost || selling !== target.selling;

  const handleSave = async () => {
    setSaving(true);
    try {
      await inventoryApi.update(target.id, {
        name,
        quantity: qty,
        cost_price: cost,
        selling_price: selling,
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await inventoryApi.delete(target.id);
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Edit Product" wide>
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              Edit Product
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
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-foreground">Product Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Qty</label>
                <Input
                  type="number"
                  value={qty || ""}
                  onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Cost (₦)</label>
                <Input
                  type="number"
                  value={cost || ""}
                  onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-muted-foreground">Sell (₦)</label>
                <Input
                  type="number"
                  value={selling || ""}
                  onChange={(e) => setSelling(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Margin</span>
                <span className="font-extrabold text-foreground">₦{margin}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(marginPercent, 100)}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{marginPercent}% markup</p>
            </div>
          </div>
        </DrawerBody>
        <div className="flex flex-col gap-2 px-5 py-4 pb-8">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="w-full cursor-pointer gap-1.5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Check weight="bold" className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            disabled={deleting}
            className={`w-full cursor-pointer gap-1.5 py-3 text-xs font-bold uppercase tracking-wider ${
              confirmDelete
                ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "border-destructive/30 text-destructive hover:bg-destructive/5"
            }`}
          >
            {deleting ? (
              <CircleNotch className="h-4 w-4 animate-spin" />
            ) : (
              <Trash weight="bold" className="h-4 w-4" />
            )}
            {deleting ? "Deleting..." : confirmDelete ? "Tap again to confirm delete" : "Delete Product"}
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
