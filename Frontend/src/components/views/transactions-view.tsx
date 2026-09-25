import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowsLeftRight, CaretRight } from "@phosphor-icons/react";
import type { UnallocatedTransactionResponse } from "@/lib/endpoints";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn, DataTableFilter } from "@/components/data-table";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { cn } from "@/lib/utils";

type Tx = UnallocatedTransactionResponse;

interface TransactionsViewProps {
  loading?: boolean;
  transactions: Tx[];
}

/** Cash sales post with sender "Cash" / payment method CASH; everything else
 *  is a bank transfer that needs matching. */
function txKind(tx: Tx): "cash" | "transfer" {
  if ((tx.payment_method ?? "").toUpperCase() === "CASH") return "cash";
  if ((tx.sender_name ?? "").trim().toLowerCase() === "cash") return "cash";
  return "transfer";
}

function statusLabel(status: string): string {
  switch (status) {
    case "unallocated":
      return "Pending";
    case "reconciled":
      return "Reconciled";
    default:
      return status;
  }
}

function statusClass(status: string): string {
  switch (status) {
    case "unallocated":
      return "border-amber-200 bg-amber-100 text-amber-700";
    case "reconciled":
      return "border-emerald-200 bg-emerald-100 text-emerald-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TransactionsView({ loading, transactions }: TransactionsViewProps) {
  const [selected, setSelected] = useState<Tx | null>(null);

  const columns: DataTableColumn<Tx>[] = [
    {
      key: "txn",
      header: "Transaction",
      searchable: (t) =>
        `${t.title ?? ""} ${t.sender_name ?? ""} ${t.reference ?? ""} ${t.amount}`,
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {t.title || t.sender_name || "Transaction"}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[t.sender_name && t.title ? t.sender_name : null, formatDateTime(t.created_at)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (t) =>
        txKind(t) === "cash" ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            Cash
          </span>
        ) : (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
            Transfer
          </span>
        ),
      cellClassName: "w-28",
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => (
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
            statusClass(t.status),
          )}
        >
          {statusLabel(t.status)}
        </span>
      ),
      cellClassName: "w-32",
    },
    {
      key: "channel",
      header: "Channel",
      cell: (t) => (
        <span className="font-mono text-xs uppercase text-muted-foreground">
          {t.channel || "—"}
        </span>
      ),
      cellClassName: "w-28",
    },
    {
      key: "amount",
      header: "Amount",
      cell: (t) => (
        <div>
          <p className="font-mono font-semibold">₦{t.amount.toLocaleString()}</p>
          {t.profit != null && t.profit > 0 && (
            <p className="mt-0.5 font-mono text-[11px] font-semibold text-emerald-600">
              +₦{t.profit.toLocaleString()}
            </p>
          )}
        </div>
      ),
      headerClassName: "text-right",
      cellClassName: "text-right",
    },
  ];

  const filters: DataTableFilter<Tx>[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Cash", value: "cash" },
        { label: "Transfer", value: "transfer" },
      ],
      get: (t) => txKind(t),
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "unallocated" },
        { label: "Reconciled", value: "reconciled" },
      ],
      get: (t) => t.status,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={`History — ${transactions.length} transactions`}
        title="History"
        description="All sales, transfers and reconciliations."
      />

      <DataTable
        rows={transactions}
        columns={columns}
        rowKey={(t) => String(t.id)}
        isLoading={loading}
        searchPlaceholder="Search history..."
        filters={filters}
        onRowClick={setSelected}
        isRowSelected={(t) => selected?.id === t.id}
        emptyIcon={<ArrowsLeftRight weight="duotone" className="h-7 w-7 text-muted-foreground" />}
        emptyTitle="No transactions yet"
        emptyDescription="Sales and transfers will appear here."
        renderMobileCard={(t) => (
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">
                  {t.title || t.sender_name || "Transaction"}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-1.5 py-px text-[9px] font-bold uppercase tracking-wider",
                    statusClass(t.status),
                  )}
                >
                  {statusLabel(t.status)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {txKind(t) === "cash" ? "Cash" : "Transfer"} · {formatDateTime(t.created_at)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-mono text-sm font-bold">₦{t.amount.toLocaleString()}</p>
              {t.profit != null && t.profit > 0 && (
                <p className="mt-0.5 font-mono text-[10px] font-semibold text-emerald-600">
                  +₦{t.profit.toLocaleString()}
                </p>
              )}
            </div>
            <CaretRight weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        )}
      />

      <ResponsiveDialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.title || selected?.sender_name || "Transaction"}
        wide
      >
          <div className="border-b border-border p-4">
            <h2 className="font-heading text-base font-medium text-foreground">
              {selected?.title || selected?.sender_name || "Transaction"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selected && formatDateTime(selected.created_at)}
            </p>
          </div>
          {selected && (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <div className="rounded-sm border border-border bg-card p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Amount
                </p>
                <p className="mt-1 font-mono text-2xl font-black text-foreground">
                  ₦{selected.amount.toLocaleString()}
                </p>
                {selected.profit != null && selected.profit > 0 && (
                  <p className="mt-1 font-mono text-xs font-semibold text-emerald-600">
                    +₦{selected.profit.toLocaleString()} profit
                  </p>
                )}
                <div className="mt-3 flex gap-1.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-bold",
                      txKind(selected) === "cash"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    {txKind(selected) === "cash" ? "Cash" : "Transfer"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                      statusClass(selected.status),
                    )}
                  >
                    {statusLabel(selected.status)}
                  </span>
                </div>
              </div>

              <dl className="rounded-sm border border-border bg-card p-4 text-sm">
                <DetailRow label="Sender">{selected.sender_name || "—"}</DetailRow>
                <DetailRow label="Channel">{selected.channel || "—"}</DetailRow>
                <DetailRow label="Payment method">{selected.payment_method || "—"}</DetailRow>
                <DetailRow label="Reference">
                  <span className="font-mono text-xs">{selected.reference || "—"}</span>
                </DetailRow>
                {selected.details && <DetailRow label="Details">{selected.details}</DetailRow>}
              </dl>
            </div>
          )}
      </ResponsiveDialog>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 py-2.5 last:border-0 last:pb-0 first:pt-0">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}
