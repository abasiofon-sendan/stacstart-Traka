import { useState } from "react";
import { X, HandCoins, Copy, Check, Bell, Package, Users } from "@phosphor-icons/react";
import {
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import type { DebtorEntry } from "@/store/types";

interface CollectDebtDrawerProps {
  open: boolean;
  onClose: () => void;
  target: DebtorEntry | null;
  bankName: string;
  accountNumber: string;
  accountName: string;
  onRemind?: (title: string, message: string) => void;
}

export function CollectDebtDrawer({
  open,
  onClose,
  target,
  bankName,
  accountNumber,
  accountName,
  onRemind,
}: CollectDebtDrawerProps) {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  if (!target) return null;

  const itemizedStr =
    target.items.length > 0
      ? target.items.map((i) => `${i.qty}× ${i.product_name}`).join(", ")
      : "recent purchases";

  const reminderTitle = `Collect ₦${target.amount.toLocaleString()} from ${target.name}`;
  const reminderMessage =
    `${target.name} owes ₦${target.amount.toLocaleString()} for ${itemizedStr}. ` +
    `Payment due: ${target.date}. Your account: ${accountNumber} (${accountName}).`;

  const handleCopySummary = async () => {
    const fullSummary =
      `DEBT REMINDER\n` +
      `Customer: ${target.name}\n` +
      `Amount: ₦${target.amount.toLocaleString()}\n` +
      `Items: ${itemizedStr}\n` +
      `Due: ${target.date}\n` +
      `Collect to: ${accountNumber} (${accountName})`;
    try {
      await navigator.clipboard.writeText(fullSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = fullSummary;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleRemind = () => {
    if (onRemind) {
      onRemind(reminderTitle, reminderMessage);
    }
    setReminderSet(true);
    setTimeout(() => {
      setReminderSet(false);
      onClose();
    }, 1500);
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Collect Debt" wide>
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <HandCoins weight="fill" className="h-4 w-4" />
              Collect Debt
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
            {/* Debtor Summary */}
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Collecting from
              </p>
              <p className="mt-1 font-bold text-foreground">{target.name}</p>
              <p className="mt-0.5 text-sm font-black text-destructive">
                ₦{target.amount.toLocaleString()}
              </p>
            </div>

            {/* Itemized Purchase Breakdown */}
            {target.items.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Package weight="fill" className="h-3 w-3" />
                  Items Purchased on Credit
                </p>
                <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                  {target.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-card">
                      <span className="text-[11px] font-semibold text-card-foreground">
                        {item.qty}× {item.product_name}
                      </span>
                      <span className="font-bold text-foreground text-[11px]">
                        ₦{(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner's Bank Account Details */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Collect to This Account
              </p>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                  {bankName}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-lg font-black tracking-widest text-foreground">
                    {accountNumber}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleCopySummary}
                    className="border-primary/20 bg-primary/10 text-[10px] text-primary hover:bg-primary/20 hover:text-primary"
                  >
                    {copiedSummary ? (
                      <>
                        <Check weight="bold" className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy weight="bold" className="h-3 w-3" />
                        Copy Summary
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{accountName}</p>
              </div>
            </div>

            {/* How Collection Works */}
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3.5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Users weight="fill" className="h-3 w-3" />
                When You See {target.name}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Tap "Remind Me" below so you don't forget. When {target.name} comes by,
                collect ₦{target.amount.toLocaleString()} and mark the debt as settled
                from your Debtors page.
              </p>
            </div>

            {/* Reminder Confirmation */}
            {reminderSet && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-emerald-700">
                <Check weight="bold" className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-bold">
                  Reminder saved! You'll be notified to collect from {target.name}.
                </span>
              </div>
            )}
          </div>
        </DrawerBody>

        <div className="border-t border-border px-5 py-4 pb-8 space-y-2">
          <Button
            onClick={handleRemind}
            disabled={reminderSet}
            className="w-full gap-2 bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/90"
          >
            <Bell weight="fill" className="h-4 w-4" />
            {reminderSet ? "Reminder Saved" : "Remind Me When I See Them"}
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
