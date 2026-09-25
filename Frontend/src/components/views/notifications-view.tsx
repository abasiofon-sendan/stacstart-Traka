import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Info,
  CashRegister,
  ClockUser,
  ShoppingCart,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  read: boolean;
  time: string;
}

interface NotificationsViewProps {
  loading?: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
}

const iconMap: Record<string, { bg: string; text: string; icon: typeof Info }> = {
  sale: { bg: "bg-primary/10", text: "text-primary", icon: CashRegister },
  payment: { bg: "bg-primary/10", text: "text-primary", icon: CashRegister },
  transfer: { bg: "bg-primary/10", text: "text-primary", icon: CashRegister },
  credit: { bg: "bg-destructive/10", text: "text-destructive", icon: ClockUser },
  debt: { bg: "bg-destructive/10", text: "text-destructive", icon: ClockUser },
  stock: { bg: "bg-primary/10", text: "text-primary", icon: ShoppingCart },
};

/** Notification payloads carry no category — infer the glyph from keywords. */
function getIcon(title: string) {
  const t = title.toLowerCase();
  for (const key of Object.keys(iconMap)) {
    if (t.includes(key)) return iconMap[key]!;
  }
  return { bg: "bg-primary/10", text: "text-primary", icon: Info };
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(s) || s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function NotificationsView({ loading, notifications, onClose }: NotificationsViewProps) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = tab === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div>
      <div className="flex items-start gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Go back"
          className="mt-1 shrink-0 text-muted-foreground"
        >
          <ArrowLeft weight="bold" className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <PageHeader
            eyebrow={
              unreadCount > 0
                ? `Notifications — ${unreadCount} unread`
                : "Notifications"
            }
            title="Notifications"
            description="Transfers, debts, stock and system alerts."
          />
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "all" | "unread")}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="rounded-sm border border-border bg-card p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))
        ) : visible.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card p-8 text-center">
            <Bell weight="fill" className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">
              {tab === "unread" ? "All caught up" : "No notifications yet"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {tab === "unread"
                ? "Every alert has been read."
                : "Transfers, debts and stock alerts will land here."}
            </p>
          </div>
        ) : (
          visible.map((n) => {
            const { bg, text, icon: Icon } = getIcon(n.title);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-sm border border-border bg-card p-3.5",
                  !n.read && "border-primary/30",
                )}
              >
                <div className={cn("shrink-0 rounded-sm p-2 text-xs", bg, text)}>
                  <Icon weight="fill" className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="min-w-0 flex-1 truncate text-xs font-bold text-card-foreground">
                      {n.title}
                    </h4>
                    <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      {timeAgo(n.time)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {n.desc}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
