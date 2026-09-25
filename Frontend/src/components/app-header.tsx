import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { IconProps } from "@phosphor-icons/react";
import {
  Bell,
  MagnifyingGlass,
  MagicWand,
  House,
  Package,
  ArrowsLeftRight,
  BookOpen,
  ChartLineUp,
  GearSix,
  SignOut,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAccount } from "@/store/session-store";
import { useInventoryStore } from "@/store/inventory-store";
import { useDebtorsStore } from "@/store/debtors-store";
import { useAuthStore } from "@/store/auth-store";
import { useTransactions } from "@/lib/query-hooks";

interface AppHeaderProps {
  activityCount: number;
  onOpenMenu: () => void;
  onOpenChat: () => void;
}

interface PageLink {
  label: string;
  to:
    | "/dashboard"
    | "/inventory"
    | "/transactions"
    | "/debtors"
    | "/insights"
    | "/notifications"
    | "/settings";
  icon: ComponentType<IconProps>;
}

const PAGE_LINKS: PageLink[] = [
  { label: "Dashboard", to: "/dashboard", icon: House },
  { label: "Inventory", to: "/inventory", icon: Package },
  { label: "History", to: "/transactions", icon: ArrowsLeftRight },
  { label: "Debtors", to: "/debtors", icon: BookOpen },
  { label: "Insights", to: "/insights", icon: ChartLineUp },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Settings", to: "/settings", icon: GearSix },
];

/**
 * App chrome header: mobile hamburger + brand, desktop ⌘K search pill,
 * activity bell, "Ask Traka" button and the account dropdown.
 */
export function AppHeader({ activityCount, onOpenMenu, onOpenChat }: AppHeaderProps) {
  const navigate = useNavigate();
  const { accountName, accountNumber } = useAccount();
  const inventory = useInventoryStore((s) => s.items);
  const debtors = useDebtorsStore((s) => s.entries);
  const logout = useAuthStore((s) => s.logout);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // History is only fetched while the palette actually needs it.
  const { data: transactions } = useTransactions(paletteOpen);

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

  const goTo = (to: PageLink["to"]) => {
    navigate({ to });
    setPaletteOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:h-16 lg:gap-4 lg:px-8">
      {/* Mobile: avatar opens the drawer, brand mark centered (native bar) */}
      <Button
        variant="ghost"
        size="icon"
        className="size-10 rounded-full p-0 hover:bg-transparent lg:hidden"
        onClick={onOpenMenu}
        aria-label="Open menu"
      >
        <Avatar className="size-8">
          <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Button>
      <Link
        to="/"
        className="absolute left-1/2 flex -translate-x-1/2 items-center lg:hidden"
        aria-label="Traka — go home"
      >
        <img src="/logo.svg" alt="" className="h-6 w-6" />
      </Link>

      {/* Desktop: search pill */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-9 w-full max-w-sm justify-start gap-2 px-3 text-sm font-normal text-muted-foreground hover:text-foreground lg:flex"
      >
        <MagnifyingGlass className="h-4 w-4" />
        <span className="flex-1 text-left">Search stock, debtors, history...</span>
        <kbd className="rounded-[5px] border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1.5 lg:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setPaletteOpen(true)}
          aria-label="Search"
        >
          <MagnifyingGlass weight="bold" className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/notifications" })}
          className="relative"
          aria-label="Notifications"
        >
          <Bell weight="fill" className="h-5 w-5 text-muted-foreground" />
          {activityCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {activityCount}
            </span>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden gap-1.5 lg:flex"
          onClick={onOpenChat}
        >
          <MagicWand weight="bold" className="h-4 w-4" />
          Ask Traka
        </Button>

        {/* Desktop avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Account menu"
              className="hidden size-9 rounded-full p-0 hover:bg-transparent lg:flex"
            >              <Avatar className="size-9">
                <AvatarFallback className="rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-sm font-semibold">
                {accountName || "Merchant"}
              </span>
              <span className="block truncate font-mono text-xs font-normal text-muted-foreground">
                {accountNumber}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
              <GearSix />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/notifications" })}>
              <Bell />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={logout}>
              <SignOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ⌘K command palette */}
      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title="Search Traka"
        description="Jump to a page or find stock, debtors and history."
      >
        <CommandInput placeholder="Search pages, stock, debtors..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {PAGE_LINKS.map((p) => {
              const Icon = p.icon;
              return (
                <CommandItem
                  key={p.to}
                  value={`go to ${p.label.toLowerCase()}`}
                  onSelect={() => goTo(p.to)}
                >
                  <Icon />
                  <span>{p.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {inventory.length > 0 && (
            <CommandGroup heading="Stock">
              {inventory.slice(0, 6).map((item, i) => (
                <CommandItem
                  key={`${item.name}-${i}`}
                  value={`${item.name} stock item inventory`}
                  onSelect={() => goTo("/inventory")}
                >
                  <Package />
                  <span className="truncate">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {debtors.length > 0 && (
            <CommandGroup heading="Debtors">
              {debtors.slice(0, 6).map((d) => (
                <CommandItem
                  key={d.id}
                  value={`${d.name} debtor owed`}
                  onSelect={() => goTo("/debtors")}
                >
                  <BookOpen />
                  <span className="truncate">{d.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {transactions && transactions.length > 0 && (
            <CommandGroup heading="History">
              {transactions.slice(0, 6).map((tx) => {
                const label = tx.title || tx.sender_name || tx.reference || "Transaction";
                return (
                  <CommandItem
                    key={tx.id}
                    value={`${label} transaction history`}
                    onSelect={() => goTo("/transactions")}
                  >
                    <ArrowsLeftRight />
                    <span className="truncate">{label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
