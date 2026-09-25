import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  House,
  Package,
  ArrowsLeftRight,
  BookOpen,
  ChartLineUp,
  Notebook,
  GearSix,
  SignOut,
  X,
  CaretRight,
} from "@phosphor-icons/react";
import { useAccount } from "@/store/session-store";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onOpenReports: () => void;
}

interface NavItem {
  label: string;
  to: "/dashboard" | "/inventory" | "/transactions" | "/debtors" | "/insights";
  icon: ComponentType<IconProps>;
}

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: House },
  { label: "Inventory", to: "/inventory", icon: Package },
  { label: "History", to: "/transactions", icon: ArrowsLeftRight },
  { label: "Debtors", to: "/debtors", icon: BookOpen },
  { label: "Insights", to: "/insights", icon: ChartLineUp },
];

/** Tabs mirrored in the mobile bottom bar — hidden from the mobile drawer. */
const MOBILE_TAB_ROUTES = new Set<string>([
  "/dashboard",
  "/inventory",
  "/transactions",
  "/debtors",
]);

interface SidebarBodyProps {
  /** Closes the mobile drawer after any navigation. */
  onNavigate?: () => void;
  /** Renders the drawer's close button (mobile only). */
  onClose?: () => void;
  onOpenReports: () => void;
  /** Weekly Reports lives in the mobile drawer + Insights page — never the
   *  desktop sidebar. */
  showReports?: boolean;
  /** Hide bottom-bar tabs (mobile drawer only — those screens live in the tab bar). */
  hidePrimaryTabs?: boolean;
}

function SidebarBody({ onNavigate, onClose, onOpenReports, showReports, hidePrimaryTabs }: SidebarBodyProps) {
  const location = useLocation();
  const { accountName, accountNumber } = useAccount();
  const logout = useAuthStore((s) => s.logout);

  const initials =
    accountName.trim().length > 0
      ? accountName
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "T";

  const rowClass = (active: boolean) =>
    cn(
      "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium",
      active
        ? "bg-primary text-primary-foreground shadow-soft-lift hover:bg-primary hover:text-primary-foreground"
        : "text-muted-foreground",
    );

  return (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Traka — go home">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
            Traka
          </span>
        </Link>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X weight="bold" className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Primary nav (mobile drawer skips bottom-bar tabs) */}
      <nav className="mt-7 space-y-1" aria-label="Main">
        {NAV.filter((item) => !hidePrimaryTabs || !MOBILE_TAB_ROUTES.has(item.to)).map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Button
              key={item.to}
              asChild
              variant="ghost"
              className={rowClass(active)}
            >
              <Link to={item.to} onClick={onNavigate}>
                <Icon weight={active ? "fill" : "regular"} className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Mobile profile row */}
      <Link
        to="/settings"
        onClick={onNavigate}
        className="mt-6 flex items-center gap-3 rounded-sm border border-border bg-card p-3 lg:hidden"
      >
        <Avatar>
          <AvatarFallback className="rounded-sm bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {accountName || "Merchant"}
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">
            {accountNumber}
          </span>
        </span>
        <CaretRight weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>

      <div className="flex-1" />

      {/* Utility group */}
      <div className="mt-6 space-y-1 border-t border-border pt-4">
        {showReports && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onOpenReports();
              onNavigate?.();
            }}
            className={rowClass(false)}
          >
            <Notebook className="h-5 w-5 shrink-0" />
            <span>Weekly Reports</span>
          </Button>
        )}
        <Button
          asChild
          variant="ghost"
          className={rowClass(location.pathname === "/settings")}
        >
          <Link to="/settings" onClick={onNavigate}>
            <GearSix className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={logout}
          className={cn(rowClass(false), "text-destructive hover:bg-destructive/10 hover:text-destructive")}
        >
          <SignOut className="h-5 w-5 shrink-0" />
          <span>Sign out</span>
        </Button>
      </div>
    </>
  );
}

export function Sidebar({ open, onClose, onOpenReports }: SidebarProps) {
  return (
    <>
      {/* Desktop: persistent nav column */}
      <aside
        className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-background px-4 py-5 no-scrollbar lg:flex"
        aria-label="Sidebar"
      >
        <SidebarBody onOpenReports={onOpenReports} />
      </aside>

      {/* Mobile: drawer + backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        aria-label="Menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-y-auto border-r border-border bg-card px-4 py-5 transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBody
          onNavigate={onClose}
          onClose={onClose}
          onOpenReports={onOpenReports}
          showReports
          hidePrimaryTabs
        />
      </div>
    </>
  );
}
