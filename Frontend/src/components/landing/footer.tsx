import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const PRODUCT_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Live demo", href: "#demo" },
  { label: "Traders", href: "#stories" },
  { label: "Voice helper", href: "#voice" },
];

const COMPANY_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "FAQ", href: "#faq" },
];

export function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 md:px-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link to="/" className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80" aria-label="Traka — go home">
            <img src="/logo.svg" alt="Traka logo" className="h-8 w-8" />
            <span className="font-display text-xl font-bold">Traka</span>
          </Link>
          <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
            One clean record for Nigerian traders and small businesses.
            Cash-friendly records without changing how you work.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-7 lg:grid-cols-3">
          <div>
            <p className="font-bold">Product</p>
            <ul className="mt-3 space-y-2.5 text-muted-foreground">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold">Company</p>
            <ul className="mt-3 space-y-2.5 text-muted-foreground">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold">Get started</p>
            <ul className="mt-3 space-y-2.5 text-muted-foreground">
              <li>
                <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate({ to: "/auth" })}>
                  Create account
                </Button>
              </li>
              <li>
                <Button variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground" onClick={() => navigate({ to: "/auth" })}>
                  Sign in
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground md:px-12">
          <span>© 2026 Traka · Team Blueprint, University of Uyo</span>
          <span>Cash-friendly · Ledger-first</span>
        </div>
      </div>
    </footer>
  );
}
