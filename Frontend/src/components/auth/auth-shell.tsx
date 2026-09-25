import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "@phosphor-icons/react";
import { ProductPanel } from "./product-panel";
import { LogoLockup } from "./logo-lockup";

export type AuthVariant = "signin" | "signup";

interface AuthShellProps {
  variant: AuthVariant;
  children: ReactNode;
}

const ALT_LINK: Record<
  AuthVariant,
  { prompt: string; label: string; to: "/auth" | "/auth/register" }
> = {
  signin: { prompt: "New to Traka?", label: "Create an account", to: "/auth/register" },
  signup: { prompt: "Already on Traka?", label: "Sign in", to: "/auth" },
};

const BAND_HEADLINE: Record<AuthVariant, string> = {
  signin: "Market day, written down.",
  signup: "Cash and transfer, one book.",
};

/**
 * Full-bleed split layout for auth screens: product-mock panel on the
 * left (desktop), centered form column on the right. On mobile the
 * panel becomes a compact brand band above the form (Drocsid pattern).
 */
export function AuthShell({ variant, children }: AuthShellProps) {
  const alt = ALT_LINK[variant];

  return (
    <div data-shimmer className="flex min-h-screen w-full bg-background">
      <ProductPanel variant={variant} />

      <div className="relative flex min-h-screen flex-1 flex-col">
        {/* mobile brand band */}
        <div className="bg-pine px-6 pt-7 pb-8 lg:hidden">
          <LogoLockup onDark />
          <p className="mt-4 font-display text-2xl font-extrabold leading-snug text-balance text-white">
            {BAND_HEADLINE[variant]}
          </p>
        </div>

        {/* mobile: back-home + cross-link · desktop: back top-right */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 lg:px-12 lg:pt-8">
          <Link
            to="/"
            className="group inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft
              weight="bold"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            Back to home
          </Link>
          <Link
            to={alt.to}
            className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            {alt.prompt}{" "}
            <span className="font-semibold text-primary underline underline-offset-4">
              {alt.label}
            </span>
          </Link>
          <Link
            to="/"
            className="group ml-auto hidden min-h-[44px] cursor-pointer items-center gap-1.5 px-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft
              weight="bold"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-4 lg:px-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
