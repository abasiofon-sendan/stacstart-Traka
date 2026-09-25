interface PreloaderProps {
  visible: boolean;
}

/**
 * Full-screen shimmer preloader for non-static (data-fetching) app routes.
 * Glyph only: the favicon's Ledger T mark drawn with rounded stroke caps and
 * no tile — the light band sweeps left → right via `.preloader-glyph`.
 */
export function Preloader({ visible }: PreloaderProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-label="Loading Traka"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-in fade-in-0 duration-200"
    >
      <div className="preloader-glyph h-16 w-16" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
