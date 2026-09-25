import { useState } from "react";
import { UserPlus, CheckCircle, HandCoins, Check, CaretRight } from "@phosphor-icons/react";
import type { DebtorEntry } from "@/store/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableFilter } from "@/components/data-table";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { cn } from "@/lib/utils";

interface DebtorsViewProps {
  loading?: boolean;
  debtors: DebtorEntry[];
  onOpenLogDebt: () => void;
  onCollectDebt: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(d: DebtorEntry): boolean {
  return d.date < todayStr();
}

export function DebtorsView({
  loading,
  debtors,
  onOpenLogDebt,
  onCollectDebt,
  onMarkPaid,
}: DebtorsViewProps) {
  const [selected, setSelected] = useState<DebtorEntry | null>(null);

  const columns: DataTableColumn<DebtorEntry>[] = [
    {
      key: "debtor",
      header: "Debtor",
      searchable: (d) =>
        `${d.name} ${d.amount} ${d.items.map((i) => i.product_name).join(" ")}`,
      cell: (d) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{d.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {d.items.length === 0
              ? "No item breakdown"
              : `${d.items.length} item${d.items.length === 1 ? "" : "s"}`}
          </p>
        </div>
      ),
    },
    {
      key: "due",
      header: "Due",
      cell: (d) => {
        const overdue = isOverdue(d);
        return (
          <div className="flex flex-col gap-1">
            <span
              className={cn(
                "w-fit rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                overdue
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {d.date}
            </span>
            {overdue && (
              <span className="text-[11px] font-bold text-destructive">Overdue</span>
            )}
          </div>
        );
      },
      cellClassName: "w-32",
    },
    {
      key: "items",
      header: "Items",
      cell: (d) => (
        <span className="font-mono text-muted-foreground">{d.items.length}</span>
      ),
      cellClassName: "w-20",
    },
    {
      key: "amount",
      header: "Owed",
      cell: (d) => (
        <span className="font-mono font-semibold text-destructive">
          ₦{d.amount.toLocaleString()}
        </span>
      ),
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
    {
      key: "actions",
      header: "",
      headerClassName: "w-44",
      cell: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onCollectDebt(d.id);
            }}
          >
            <HandCoins weight="fill" />
            Collect
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onMarkPaid(d.id);
            }}
          >
            <Check weight="bold" />
            Paid
          </Button>
        </div>
      ),
      cellClassName: "w-44",
    },
  ];

  const filters: DataTableFilter<DebtorEntry>[] = [
    {
      key: "due",
      label: "Due",
      options: [
        { label: "Overdue", value: "overdue" },
        { label: "Upcoming", value: "upcoming" },
      ],
      get: (d) => (isOverdue(d) ? "overdue" : "upcoming"),
    },
  ];

  const openCollect = (d: DebtorEntry) => {
    setSelected(null);
    onCollectDebt(d.id);
  };

  const openPaid = (d: DebtorEntry) => {
    setSelected(null);
    onMarkPaid(d.id);
  };

  return (
    <div>
      <PageHeader
        eyebrow={`Debtors — ${debtors.length} open`}
        title="Debtors"
        description="Customer credit purchases waiting to be cleared."
        actions={
          <Button variant="destructive" size="lg" onClick={onOpenLogDebt}>
            <UserPlus weight="bold" />
            Log Debt
          </Button>
        }
      />

      <DataTable
        rows={debtors}
        columns={columns}
        rowKey={(d) => d.id}
        isLoading={loading}
        searchPlaceholder="Search debtors..."
        filters={filters}
        onRowClick={setSelected}
        isRowSelected={(d) => selected?.id === d.id}
        emptyIcon={<CheckCircle weight="duotone" className="h-7 w-7 text-primary" />}
        emptyTitle="No outstanding debts"
        emptyDescription="All customer tabs are cleared."
        renderMobileCard={(d) => (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{d.name}</p>
                {isOverdue(d) && (
                  <span className="shrink-0 text-[11px] font-bold text-destructive">
                    Overdue
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                Due {d.date}
                {d.items.length > 0 &&
                  ` · ${d.items.length} item${d.items.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm font-bold text-destructive">
              ₦{d.amount.toLocaleString()}
            </p>
            <CaretRight weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        )}
      />

      <ResponsiveDialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Debtor"}
        wide
      >
          <div className="border-b border-border p-4">
            <h2 className="font-heading text-base font-medium text-foreground">
              {selected?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selected && (
                <>
                  Due {selected.date}
                  {isOverdue(selected) && (
                    <span className="font-bold text-destructive"> · Overdue</span>
                  )}
                </>
              )}
            </p>
          </div>
          {selected && (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="rounded-sm border border-border bg-card p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Balance owed
                </p>
                <p className="mt-1 font-mono text-2xl font-black text-destructive">
                  ₦{selected.amount.toLocaleString()}
                </p>
              </div>

              <div className="rounded-sm border border-border bg-card p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Purchased items
                </p>
                {selected.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No item breakdown recorded.</p>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {selected.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-foreground">
                          {item.qty}× {item.product_name}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          ₦{(item.price * item.qty).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-auto flex gap-2 border-t border-border pt-4">
                <Button size="lg" className="flex-1" onClick={() => openCollect(selected)}>
                  <HandCoins weight="fill" />
                  Collect Debt
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => openPaid(selected)}
                >
                  <Check weight="bold" />
                  Mark Paid
                </Button>
              </div>
            </div>
          )}
      </ResponsiveDialog>
    </div>
  );
}
