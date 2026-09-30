import { ArrowClockwise } from "@phosphor-icons/react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  /** Query key to force-refetch, e.g. `queryKeys.debtors.all`. */
  queryKey: readonly unknown[];
  label?: string;
}

/**
 * Icon-only refetch button for list pages. Forces a network refetch of the
 * given query key and spins while any matching query is in flight.
 */
export function RefreshButton({ queryKey, label = "Refresh data" }: RefreshButtonProps) {
  const qc = useQueryClient();
  const refreshing = useIsFetching({ queryKey }) > 0;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={() => qc.refetchQueries({ queryKey })}
      disabled={refreshing}
      aria-label={label}
      title={label}
    >
      <ArrowClockwise weight="bold" className={cn("h-4 w-4", refreshing && "animate-spin")} />
    </Button>
  );
}
