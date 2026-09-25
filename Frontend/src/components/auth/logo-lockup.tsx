import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoLockupProps {
  /** White text for dark surfaces (product panel, mobile band). */
  onDark?: boolean;
  className?: string;
}

/** Brand lockup — always links home. */
export function LogoLockup({ onDark = false, className }: LogoLockupProps) {
  return (
    <Link
      to="/"
      aria-label="Traka — go home"
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80",
        className,
      )}
    >
      <img
        src={onDark ? "/favicon.svg" : "/logo.svg"}
        alt=""
        aria-hidden
        className="h-7 w-7"
      />
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          onDark ? "text-white" : "text-foreground",
        )}
      >
        Traka
      </span>
    </Link>
  );
}
