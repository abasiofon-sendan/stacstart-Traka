import { Package, ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const QUICK_ITEMS = ["Peak Milk Tin", "Spaghetti Packet", "Loaf of Bread"];

interface OnboardingEmptyStateProps {
  onAddProduct: (name?: string) => void;
}

export function OnboardingEmptyState({ onAddProduct }: OnboardingEmptyStateProps) {
  const navigate = useNavigate();

  const goAdd = (name?: string) => {
    onAddProduct(name);
    navigate({ to: "/inventory" });
  };

  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
        <Package weight="fill" className="h-6 w-6" />
      </div>

      <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Welcome to Traka! Let's stock your shop
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Before you can record cash or transfer sales, you need to add at least one
        product to your inventory so the app knows what you are selling.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" onClick={() => goAdd()}>
          Add Your First Product
          <ArrowRight weight="bold" className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick start
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ITEMS.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              variant="outline"
              onClick={() => goAdd(item)}
              className="h-auto bg-background px-4 py-2 font-medium hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
