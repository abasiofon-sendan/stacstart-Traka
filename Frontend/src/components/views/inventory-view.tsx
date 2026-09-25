import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Camera,
  Checks,
  Sparkle,
  Trash,
  CircleNotch,
  PencilSimple,
  Plus,
  Package,
  CaretRight,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { InventoryItem, StagedProduct } from "@/store/types";
import type { ProductCreate, ProductUpdate } from "@/lib/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn } from "@/components/data-table";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/lib/query-hooks";
import { useInventoryStore } from "@/store/inventory-store";
import { useToast } from "@/components/ui/toast";

interface InventoryViewProps {
  loading?: boolean;
  inventory: InventoryItem[];
  stagedProducts: StagedProduct[];
  activeStagedIdx: number;
  scanning: boolean;
  onBatchScan: (files: FileList | null) => void;
  onSelectStaged: (idx: number) => void;
  onUpdateStagedField: (idx: number, field: keyof StagedProduct, value: string | number) => void;
  onCommitBatch: () => void;
  onDiscardBatch: () => void;
}

interface SheetForm {
  name: string;
  cost: string;
  selling: string;
  qty: string;
  threshold: string;
}

const EMPTY_FORM: SheetForm = { name: "", cost: "", selling: "", qty: "", threshold: "" };

const parseMoney = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const parseCount = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

export function InventoryView({
  loading,
  inventory,
  stagedProducts,
  activeStagedIdx,
  scanning,
  onBatchScan,
  onSelectStaged,
  onUpdateStagedField,
  onCommitBatch,
  onDiscardBatch,
}: InventoryViewProps) {
  const staged = stagedProducts[activeStagedIdx];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Right-side add/edit sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SheetForm>(EMPTY_FORM);
  // Delete confirmation (alert dialog), shared by row action + sheet
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(editId ?? "");
  const deleteMutation = useDeleteProduct();
  const saving = createMutation.isPending || updateMutation.isPending;
  const items = useInventoryStore((s) => s.items);
  const appendItems = useInventoryStore((s) => s.appendItems);
  const patchItem = useInventoryStore((s) => s.patchItem);
  const removeItem = useInventoryStore((s) => s.removeItem);
  const restoreItem = useInventoryStore((s) => s.restoreItem);

  const editingItem = editId ? inventory.find((i) => i.id === editId) ?? null : null;

  const setField = (field: keyof SheetForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setSheetOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setForm({
      name: item.name,
      cost: String(item.cost),
      selling: String(item.selling),
      qty: String(item.qty),
      threshold: "",
    });
    setEditId(item.id);
    setSheetOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name || saving) return;
    const cost = parseMoney(form.cost);
    const selling = parseMoney(form.selling);
    const qty = parseCount(form.qty);
    const threshold =
      form.threshold.trim() === "" ? undefined : parseCount(form.threshold);
    const common = {
      name,
      cost_price: cost,
      selling_price: selling,
      quantity: qty,
      ...(threshold !== undefined ? { low_stock_threshold: threshold } : {}),
    };

    if (editId) {
      // Optimistic: patch the row and close now, revert on failure.
      const prev = items.find((i) => i.id === editId);
      patchItem(editId, { name, cost, selling, qty });
      setSheetOpen(false);
      const payload: ProductUpdate = common;
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Product updated", description: `${name} saved.`, variant: "default" });
        },
        onError: () => {
          if (prev) restoreItem(prev);
          toast({
            title: "Update failed",
            description: "Could not save the product. Changes were reverted.",
            variant: "destructive",
          });
        },
      });
    } else {
      // Optimistic: append with a temp id and close now, drop it on failure.
      const tempId = `p-local-${Date.now()}`;
      appendItems([{ id: tempId, name, qty, cost, selling }]);
      setSheetOpen(false);
      const payload: ProductCreate = common;
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Product added", description: `${name} added to inventory.`, variant: "default" });
        },
        onError: () => {
          removeItem(tempId);
          toast({
            title: "Could not add product",
            description: "The product was not saved. Please try again.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    // Optimistic: remove the row and close now, restore on failure.
    removeItem(target.id);
    setDeleteTarget(null);
    setSheetOpen(false);
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        toast({ title: "Product deleted", description: `${target.name} was removed.`, variant: "default" });
      },
      onError: () => {
        restoreItem(target);
        toast({
          title: "Delete failed",
          description: "Could not delete the product. It was restored.",
          variant: "destructive",
        });
      },
    });
  };

  const columns: DataTableColumn<InventoryItem>[] = [
    {
      key: "name",
      header: "Product",
      searchable: (r) => `${r.name} ${r.qty} ${r.cost} ${r.selling}`,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-semibold">{r.name}</span>
          {r.name.startsWith("AI Parsed") && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
              AI
            </span>
          )}
        </div>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      cell: (r) => (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
          {r.qty}
        </span>
      ),
      cellClassName: "w-24",
    },
    {
      key: "cost",
      header: "Cost",
      cell: (r) => <span className="font-mono">₦{r.cost.toLocaleString()}</span>,
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
    {
      key: "selling",
      header: "Retail",
      cell: (r) => <span className="font-mono">₦{r.selling.toLocaleString()}</span>,
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
    {
      key: "margin",
      header: "Margin",
      cell: (r) => {
        const margin = r.selling - r.cost;
        return (
          <span className={cn("font-mono font-semibold", margin > 0 ? "text-primary" : "text-muted-foreground")}>
            ₦{margin.toLocaleString()}
          </span>
        );
      },
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-24",
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${r.name}`}
            onClick={(e) => {
              e.stopPropagation();
              openEdit(r);
            }}
          >
            <PencilSimple weight="bold" className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${r.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(r);
            }}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash weight="bold" className="h-4 w-4" />
          </Button>
        </div>
      ),
      cellClassName: "w-24",
    },
  ];

  return (
    <div className="space-y-6">
      <input
        id="scan-file-input"
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => onBatchScan(e.target.files)}
        className="hidden"
      />

      <PageHeader
        eyebrow={`Inventory — ${inventory.length} items`}
        title="Inventory"
        description="Stock levels, costs and margins at a glance."
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              disabled={scanning}
              onClick={() => fileInputRef.current?.click()}
            >
              {scanning ? <CircleNotch className="animate-spin" /> : <Camera weight="fill" />}
              {scanning ? "Scanning..." : "Scan"}
            </Button>
            <Button size="lg" onClick={openAdd}>
              <Plus weight="bold" />
              Add item
            </Button>
          </>
        }
      />

      {/* Batch AI photo upload */}
      <div className="relative overflow-hidden rounded-sm border border-border bg-gradient-to-br from-card to-background p-5">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-foreground">Batch AI Photo Upload</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Upload multiple product items together to stage &amp; edit them before committing
                to inventory.
              </p>
            </div>
          </div>
          <label
            htmlFor={scanning ? undefined : "scan-file-input"}
            className={cn(
              "mt-4 inline-flex cursor-pointer items-center gap-2 rounded-sm px-5 py-3 text-xs font-bold transition-all",
              scanning
                ? "cursor-not-allowed bg-foreground/60 text-background/70"
                : "bg-foreground text-background hover:opacity-90 active:scale-[0.97]",
            )}
          >
            {scanning ? (
              <CircleNotch className="h-4 w-4 animate-spin" />
            ) : (
              <Camera weight="fill" className="h-4 w-4" />
            )}
            <span>{scanning ? "Scanning..." : "Scan Products"}</span>
          </label>
        </div>
      </div>

      {/* Staging row */}
      {stagedProducts.length > 0 && (
        <div className="space-y-4 rounded-sm border border-border bg-card p-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="flex items-center text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkle weight="fill" className="mr-1.5 h-3.5 w-3.5" />
              Scanned Items Staging Row
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {stagedProducts.length} Items Loaded
            </span>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
            {stagedProducts.map((p, i) => {
              const isActive = i === activeStagedIdx;
              return (
                <Button
                  key={i}
                  type="button"
                  variant="outline"
                  onClick={() => onSelectStaged(i)}
                  className={cn(
                    "h-auto w-36 shrink-0 snap-start flex-col items-start justify-start gap-0 border-2 bg-background p-2.5 text-left font-normal select-none",
                    isActive ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    className="mb-2 h-16 w-full rounded-sm border border-border object-cover"
                  />
                  <h5 className="truncate text-[11px] font-bold text-foreground">{p.name}</h5>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                    <span>
                      Qty: <b>{p.qty}</b>
                    </span>
                    <span className="font-bold text-primary">₦{p.selling}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {staged && (
            <div className="space-y-3 rounded-sm border border-border bg-background/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">
                  Selected Staged Item Editor
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Editing Card #{activeStagedIdx + 1}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Product Name
                  </label>
                  <Input
                    type="text"
                    value={staged.name}
                    onChange={(e) => onUpdateStagedField(activeStagedIdx, "name", e.target.value)}
                    className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="Qty"
                    value={staged.qty}
                    onChange={(v) => onUpdateStagedField(activeStagedIdx, "qty", v)}
                  />
                  <Field
                    label="Cost (₦)"
                    value={staged.cost}
                    onChange={(v) => onUpdateStagedField(activeStagedIdx, "cost", v)}
                  />
                  <Field
                    label="Sell (₦)"
                    value={staged.selling}
                    onChange={(v) => onUpdateStagedField(activeStagedIdx, "selling", v)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onCommitBatch}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm py-3 text-xs font-bold"
            >
              <Checks weight="bold" className="h-4 w-4" />
              <span>Save All to Inventory</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDiscardBatch}
              className="flex cursor-pointer items-center gap-1.5 rounded-sm border-destructive/40 px-4 py-3 text-xs font-bold text-destructive transition-all active:scale-[0.98]"
            >
              <Trash weight="bold" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <DataTable
        rows={inventory}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={loading}
        searchPlaceholder="Search products..."
        onRowClick={openEdit}
        isRowSelected={(r) => sheetOpen && r.id === editId}
        emptyIcon={<Package weight="duotone" className="h-7 w-7 text-muted-foreground" />}
        emptyTitle="No products yet"
        emptyDescription="Scan receipts or add your first item to start tracking stock."
        renderMobileCard={(r) => {
          const margin = r.selling - r.cost;
          return (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  {r.name.startsWith("AI Parsed") && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                      AI
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  ₦{r.cost.toLocaleString()} · ₦{r.selling.toLocaleString()} ·{" "}
                  <span className={margin > 0 ? "font-semibold text-primary" : undefined}>
                    +₦{margin.toLocaleString()}
                  </span>
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {r.qty}
              </span>
              <CaretRight weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          );
        }}
      />

      {/* Add / edit right-side sheet */}
      <ResponsiveDialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editId ? "Edit product" : "Add product"}
        wide
      >
          <div className="border-b border-border p-4">
            <h2 className="font-heading text-base font-medium text-foreground">
              {editId ? "Edit product" : "Add product"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editId
                ? "Update pricing, quantity or stock threshold."
                : "Add a new product to your inventory."}
            </p>
          </div>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="space-y-1.5">
              <label htmlFor="sheet-p-name" className="text-xs font-semibold text-foreground">
                Product name
              </label>
              <Input
                id="sheet-p-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Golden Malt 33cl"
                className="rounded-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="sheet-p-cost" className="text-xs font-semibold text-foreground">
                  Cost (₦)
                </label>
                <Input
                  id="sheet-p-cost"
                  type="number"
                  min={0}
                  step="any"
                  value={form.cost}
                  onChange={(e) => setField("cost", e.target.value)}
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sheet-p-selling" className="text-xs font-semibold text-foreground">
                  Retail (₦)
                </label>
                <Input
                  id="sheet-p-selling"
                  type="number"
                  min={0}
                  step="any"
                  value={form.selling}
                  onChange={(e) => setField("selling", e.target.value)}
                  className="rounded-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="sheet-p-qty" className="text-xs font-semibold text-foreground">
                  Quantity
                </label>
                <Input
                  id="sheet-p-qty"
                  type="number"
                  min={0}
                  step={1}
                  value={form.qty}
                  onChange={(e) => setField("qty", e.target.value)}
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sheet-p-threshold" className="text-xs font-semibold text-foreground">
                  Low-stock alert
                </label>
                <Input
                  id="sheet-p-threshold"
                  type="number"
                  min={0}
                  step={1}
                  value={form.threshold}
                  onChange={(e) => setField("threshold", e.target.value)}
                  placeholder="e.g. 5"
                  className="rounded-sm"
                />
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
              {editingItem && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteTarget(editingItem)}
                  aria-label="Delete product"
                  className="size-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash weight="bold" className="h-4 w-4" />
                </Button>
              )}
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => setSheetOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={saving || !form.name.trim()}>
                  {saving && <CircleNotch className="h-4 w-4 animate-spin" />}
                  {editId ? "Save changes" : "Add item"}
                </Button>
              </div>
            </div>
          </form>
      </ResponsiveDialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <CircleNotch className="h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase text-muted-foreground">{label}</label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
      />
    </div>
  );
}
