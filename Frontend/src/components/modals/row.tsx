import { cn } from "@/lib/utils";

export function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-background p-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-[11px] font-bold text-foreground", valueColor)}>{value}</span>
    </div>
  );
}
