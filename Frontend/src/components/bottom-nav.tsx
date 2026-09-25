import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { House, Package, ArrowsLeftRight, BookOpen } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", to: "/dashboard", icon: House },
  { label: "Stock", to: "/inventory", icon: Package },
  { label: "History", to: "/transactions", icon: ArrowsLeftRight },
  { label: "Owing", to: "/debtors", icon: BookOpen },
] as const;

interface TabProps {
  to: (typeof TABS)[number]["to"];
  label: string;
  icon: ComponentType<IconProps>;
  active: boolean;
}

function Tab({ to, label, icon: Icon, active }: TabProps) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-sm px-1 py-1.5 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon weight={active ? "fill" : "regular"} className="h-5 w-5" />
      <span className="text-[10px] font-semibold leading-none">{label}</span>
    </Link>
  );
}

/**
 * Floating white tab bar for mobile app routes — four equal tabs. Hidden on
 * desktop where the sidebar/header take over; the AI entry on mobile is the
 * floating action button in the root shell.
 */
export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 shadow-soft-lift lg:hidden"
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.to}
          to={tab.to}
          label={tab.label}
          icon={tab.icon}
          active={location.pathname === tab.to}
        />
      ))}
    </nav>
  );
}
