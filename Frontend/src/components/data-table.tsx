import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CaretLeft, CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

/** Numbered pagination page size used on desktop tables (mobile uses Show more). */
const PAGE_SIZE = 25;

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Participates in the toolbar search when provided. */
  searchable?: (row: T) => string;
  headerClassName?: string;
  cellClassName?: string | ((row: T) => string);
}

export interface DataTableFilter<T> {
  /** Stable state key, e.g. "type" or "status". */
  key: string;
  /** Small mono group label rendered before the chips. */
  label: string;
  /** Options besides the implicit "All". */
  options: { label: string; value: string }[];
  /** Extracts the row's value for this filter. */
  get: (row: T) => string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  filters?: DataTableFilter<T>[];
  /** Buttons rendered at the right end of the toolbar (e.g. "Add item"). */
  toolbarActions?: ReactNode;
  onRowClick?: (row: T) => void;
  isRowSelected?: (row: T) => boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * Native mobile card for a row. Rendered as a stacked tappable list under
   * lg; the table (with numbered pagination) is desktop-only.
   */
  renderMobileCard: (row: T) => ReactNode;
}

/** 1 … 4 5 6 … 12 style window of numbered page buttons (desktop). */
function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: Array<number | "gap"> = [];
  let prev = 0;
  for (const p of pages) {
    if (prev && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "default" : "outline"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

/**
 * Shared list: toolbar (debounced search + filter chips + actions), then a
 * native stacked card list with Show more on mobile, or a dense table with
 * numbered pagination (25/page) on desktop. Filtering is client-side.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  isLoading,
  searchPlaceholder = "Search...",
  filters,
  toolbarActions,
  onRowClick,
  isRowSelected,
  emptyIcon,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  renderMobileCard,
}: DataTableProps<T>) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Debounced search input.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  // Jump back to page 1 / reset the mobile list whenever the query or a
  // filter chip changes.
  useEffect(() => {
    setPage(1);
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, activeFilters]);

  const filteredRows = useMemo(() => {
    let out = rows;
    for (const f of filters ?? []) {
      const selected = activeFilters[f.key];
      if (selected) out = out.filter((r) => f.get(r) === selected);
    }
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      const searchables = columns.filter((c) => c.searchable);
      out = out.filter((r) =>
        searchables.some((c) => (c.searchable?.(r) ?? "").toLowerCase().includes(q)),
      );
    }
    return out;
  }, [rows, filters, activeFilters, debouncedQuery, columns]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filteredRows.slice(start, start + PAGE_SIZE);
  const rangeFrom = filteredRows.length === 0 ? 0 : start + 1;
  const rangeTo = Math.min(start + PAGE_SIZE, filteredRows.length);
  const pageItems = pageWindow(currentPage, pageCount);
  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasQueryOrFilter =
    debouncedQuery.trim().length > 0 || Object.keys(activeFilters).length > 0;

  const toggleFilter = (key: string, value: string) =>
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (!value || next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });

  const toolbar = (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative w-full lg:w-64">
          <MagnifyingGlass className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 rounded-sm pl-8 text-sm lg:h-9"
          />
        </div>
        {(filters ?? []).length > 0 && (
          <div className="no-scrollbar -mx-4 flex items-center gap-3 overflow-x-auto px-4 pb-0.5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
            {(filters ?? []).map((f) => (
              <div key={f.key} className="flex shrink-0 items-center gap-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </span>
                <div className="flex items-center gap-1">
                  <Chip active={!activeFilters[f.key]} onClick={() => toggleFilter(f.key, "")}>
                    All
                  </Chip>
                  {f.options.map((o) => (
                    <Chip
                      key={o.value}
                      active={activeFilters[f.key] === o.value}
                      onClick={() => toggleFilter(f.key, o.value)}
                    >
                      {o.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {toolbarActions && (
        <div className="flex shrink-0 items-center gap-2">{toolbarActions}</div>
      )}
    </div>
  );

  const emptyState = (
    <div className="px-4 py-10 text-center">
      {emptyIcon && <div className="mb-2 flex justify-center">{emptyIcon}</div>}
      <p className="text-sm font-semibold text-foreground">
        {hasQueryOrFilter ? "No matches found" : emptyTitle}
      </p>
      {emptyDescription && !hasQueryOrFilter && (
        <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
      )}
      {hasQueryOrFilter && (
        <p className="mt-1 text-xs text-muted-foreground">
          Try a different search or filter.
        </p>
      )}
    </div>
  );

  // ── Mobile: native stacked cards + Show more ──────────────────────────
  if (!isDesktop) {
    return (
      <div>
        {toolbar}
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="rounded-sm border border-border bg-card p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="rounded-sm border border-border bg-card">{emptyState}</div>
        ) : (
          <>
            <div className="space-y-2.5">
              {visibleRows.map((row) => (
                <div
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "rounded-sm border border-border bg-card p-4 active:scale-[0.99]",
                    onRowClick && "cursor-pointer",
                    isRowSelected?.(row) && "border-primary",
                  )}
                >
                  {renderMobileCard(row)}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center font-mono text-xs text-muted-foreground">
              Showing {visibleRows.length} of {filteredRows.length}
            </p>
            {visibleCount < filteredRows.length && (
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Show more ({filteredRows.length - visibleCount} remaining)
              </Button>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Desktop: dense dashboard table + numbered pagination ──────────────
  return (
    <div>
      {toolbar}

      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "px-4 py-2.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                      c.headerClassName,
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-border/60 last:border-0">
                    {columns.map((c, ci) => (
                      <td key={c.key} className="px-4 py-3">
                        <Skeleton className={cn("h-4", ci === 0 ? "w-40" : "w-20")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>{emptyState}</td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-border/60 transition-colors last:border-0",
                      onRowClick && "cursor-pointer hover:bg-secondary/60",
                      isRowSelected?.(row) && "bg-primary/5",
                    )}
                  >
                    {columns.map((c) => {
                      const cls =
                        typeof c.cellClassName === "function" ? c.cellClassName(row) : c.cellClassName;
                      return (
                        <td
                          key={c.key}
                          className={cn("px-4 py-3 align-middle text-sm text-foreground", cls)}
                        >
                          {c.cell(row)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Showing {rangeFrom}–{rangeTo} of {filteredRows.length}
          </p>
          {pageCount > 1 && (
            <nav className="flex items-center gap-1" aria-label="Pagination">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                <CaretLeft className="h-4 w-4" />
              </Button>
              {pageItems.map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    type="button"
                    size="xs"
                    variant={p === currentPage ? "default" : "ghost"}
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    aria-label={`Page ${p}`}
                    className={cn(
                      "font-mono",
                      p !== currentPage && "text-muted-foreground",
                    )}
                  >
                    {p}
                  </Button>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
                aria-label="Next page"
              >
                <CaretRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
