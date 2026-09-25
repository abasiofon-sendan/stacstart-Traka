import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Uppercase mono eyebrow, e.g. "INVENTORY — 137 ITEMS". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned action buttons / controls. */
  actions?: ReactNode;
}

/**
 * Recivo-style page heading: mono eyebrow, display title, optional
 * description and a right-aligned actions cluster.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
