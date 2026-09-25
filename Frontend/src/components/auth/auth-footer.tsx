import { Link } from "@tanstack/react-router";

interface AuthFooterProps {
  prompt: string;
  linkLabel: string;
  to: "/auth" | "/auth/register";
}

/** Split footer: cross-link left, back-home right (Recivo pattern). */
export function AuthFooter({ prompt, linkLabel, to }: AuthFooterProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground">
        {prompt}{" "}
        <Link
          to={to}
          className="cursor-pointer font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary-deep"
        >
          {linkLabel}
        </Link>
      </p>
      <Link
        to="/"
        className="hidden shrink-0 cursor-pointer font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline"
      >
        Back to home
      </Link>
    </div>
  );
}
