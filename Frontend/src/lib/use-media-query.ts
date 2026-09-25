import { useEffect, useState } from "react";

/**
 * Subscribes to a CSS media query and re-render on change. Used to pick the
 * right desktop vs mobile shell at runtime (right-docked sheets on desktop,
 * bottom drawers on mobile).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
