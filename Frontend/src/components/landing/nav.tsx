import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, focusRing } from "./shared";

export function LandingNav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  useEffect(() => {
    const m = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const sections = NAV_LINKS.map((l) =>
      document.getElementById(l.href.slice(1)),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const goAuth = () => navigate({ to: "/auth" });

  return (
    <motion.header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-1 transition-all duration-200",
          scrolled
            ? "mt-3 max-w-4xl rounded-full border border-border bg-white/85 py-2.5 pl-5 pr-7 shadow-soft-lift backdrop-blur"
            : "mt-4 max-w-6xl border border-transparent bg-transparent px-8 py-3 md:px-12",
        )}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={cn(
            "flex min-h-[44px] cursor-pointer items-center gap-2",
            focusRing(),
          )}
          aria-label="Back to top"
        >
          <img src="/logo.svg" alt="Traka logo" className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight">
            Traka
          </span>
        </button>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Sections"
        >
          {NAV_LINKS.map((l) => {
            const active = activeId === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-primary/[0.06] hover:text-foreground",
                )}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            className="hidden sm:inline-flex h-12"
            onClick={goAuth}
          >
            Sign in
          </Button>
          <Button
            onClick={goAuth}
            className="h-12 max-sm:h-10 max-sm:px-4 max-sm:py-2.5 max-sm:text-sm"
          >
            Get started
          </Button>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="hover:bg-transparent active:bg-transparent"
            >
              {open ? (
                <X weight="bold" className="h-7 w-7" />
              ) : (
                <List weight="bold" className="h-7 w-7" />
              )}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-4 mt-2 max-w-3xl rounded-2xl border border-border bg-white/95 p-2 shadow-soft-lift backdrop-blur sm:mx-auto lg:hidden"
            aria-label="Mobile sections"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold transition-colors hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 h-11 w-full sm:hidden"
              onClick={goAuth}
            >
              Sign in
            </Button>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
