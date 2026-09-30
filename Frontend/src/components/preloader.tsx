interface PreloaderProps {
  visible: boolean;
}

/**
 * Full-screen preloader for non-static (data-fetching) app routes.
 * Wordmark only — no logo mark on pages.
 */
export function Preloader({ visible }: PreloaderProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      aria-label="Loading Traka"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-in fade-in-0 duration-200"
    >
      <div className="font-display text-3xl font-extrabold tracking-tight text-primary animate-pulse" aria-hidden="true">Traka</div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
