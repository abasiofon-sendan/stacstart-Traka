import {
  Wallet,
  Bank,
  CurrencyNgn,
  TrendUp,
  Copy,
  Check,
  HandCoins,
  Package,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingEmptyState } from "@/components/views/onboarding-empty-state";
import type { InventoryItem } from "@/store/types";
import { useState } from "react";

interface DashboardViewProps {
  loading?: boolean;
  revenue: number;
  profit: number;
  totalDebt: number;
  unpaidDebtorCount: number;
  lowStockCount: number;
  inventory: InventoryItem[];
  accountName: string;
  accountNumber: string;
  onSimulateTransfer: () => void;
  onOpenCashModal: () => void;
  onNavigateInventory: () => void;
  onAddProduct: (name?: string) => void;
}

export function DashboardView({
  loading,
  revenue,
  profit,
  totalDebt,
  unpaidDebtorCount,
  lowStockCount,
  inventory,
  accountName,
  accountNumber,
  onSimulateTransfer,
  onOpenCashModal,
  onNavigateInventory,
  onAddProduct,
}: DashboardViewProps) {
  const topTwo = inventory.slice(0, 2);
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText(accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-primary text-primary-foreground rounded-sm p-5 relative overflow-hidden">
        <div className="absolute -right-4 -top-8 text-primary-foreground/10">
          <Bank weight="fill" className="text-[120px]" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] text-primary-foreground/80 font-bold uppercase tracking-wider mb-0.5">
                Store Receiving Account
              </p>
              <h4 className="text-xs font-extrabold text-primary-foreground">{accountName}</h4>
            </div>
            <span className="text-[9px] bg-white/20 text-primary-foreground font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Wema ALAT
            </span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <h2 className="font-mono text-2xl font-bold tracking-widest">{accountNumber}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyNumber}
              className="bg-white/20 hover:bg-white/30 text-primary-foreground rounded-sm"
            >
              {copied ? <Check weight="bold" className="h-4 w-4" /> : <Copy weight="bold" className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <div className="rounded-sm border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-sm border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <div className="rounded-sm border border-border bg-card p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
          <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
            <Skeleton className="h-3 w-44" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-sm" />
              <Skeleton className="h-24 rounded-sm" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
            </div>
          </div>
        </div>
      ) : inventory.length === 0 ? (
        <OnboardingEmptyState onAddProduct={onAddProduct} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Today's Revenue"
              value={`₦${revenue.toLocaleString()}`}
              icon={Wallet}
              color="text-primary"
            />
            <MetricCard
              label="Estimated Profit"
              value={`₦${profit.toLocaleString()}`}
              icon={TrendUp}
              color="text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Outstanding Debt"
              value={`₦${totalDebt.toLocaleString()}`}
              subtitle={unpaidDebtorCount > 0 ? `${unpaidDebtorCount} debtor${unpaidDebtorCount !== 1 ? "s" : ""}` : undefined}
              icon={HandCoins}
              color="text-rose-500"
            />
            <MetricCard
              label="Low Stock Items"
              value={String(lowStockCount)}
              icon={Package}
              color="text-amber-500"
            />
          </div>

          <div className="space-y-3 rounded-sm border border-border bg-card/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Record Sales Transactions
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                icon={Bank}
                label="Incoming Transfer"
                desc="Log a bank transfer sale"
                iconBg="bg-primary/10"
                iconColor="text-primary"
                hoverBorder="hover:border-primary/30"
                onClick={onSimulateTransfer}
              />
              <ActionCard
                icon={CurrencyNgn}
                label="Record Cash Sale"
                desc="Manually input hard cash collected"
                iconBg="bg-primary/10"
                iconColor="text-primary"
                hoverBorder="hover:border-primary/30"
                onClick={onOpenCashModal}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Live Inventory Highlight
              </h4>
              <Button
                variant="link"
                size="sm"
                onClick={onNavigateInventory}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {topTwo.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-sm border border-border bg-card p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-card-foreground">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Stock Left: {item.qty} units
                    </p>
                  </div>
                  <span className="rounded-md bg-background px-2 py-1 font-semibold text-muted-foreground">
                    ₦{item.selling}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, subtitle, icon: Icon, color }: { label: string; value: string; subtitle?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-gradient-to-br from-card to-background p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <h3 className="mt-1 text-xl font-black text-foreground">{value}</h3>
      {subtitle && <p className="text-[10px] font-medium text-muted-foreground">{subtitle}</p>}
      <Icon weight="fill" className={`absolute -bottom-2 -right-2 text-4xl opacity-5 ${color}`} />
    </div>
  );
}

function ActionCard({ icon: Icon, label, desc, iconBg, iconColor, hoverBorder, onClick }: {
  icon: React.ElementType;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "group h-auto cursor-pointer flex-col items-start justify-start gap-0 bg-card p-3 text-left active:scale-95",
        hoverBorder,
      )}
    >
      <span className={cn("mb-2 rounded-sm p-2 text-sm transition-colors", iconBg, iconColor, "group-hover:bg-primary group-hover:text-primary-foreground")}>
        <Icon weight="fill" className="h-4 w-4" />
      </span>
      <span className="text-xs font-bold text-card-foreground">{label}</span>
      <span className="mt-0.5 text-[10px] text-muted-foreground">{desc}</span>
    </Button>
  );
}
