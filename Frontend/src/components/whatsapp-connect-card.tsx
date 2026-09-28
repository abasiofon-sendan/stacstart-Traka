import { useState } from "react";
import { CheckCircle, Copy, WhatsappLogo, ArrowSquareOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useWhatsAppSetup, useWhatsAppStatus } from "@/lib/query-hooks";
import { cn, getErrorMessage } from "@/lib/utils";

const POLL_HINT = "Waiting for your first message…";

interface WhatsAppConnectCardProps {
  /** Show a Skip affordance. Used on the post-signup step, not in Settings. */
  onSkip?: () => void;
  /** Poll /whatsapp-status while the card is on screen. */
  poll?: boolean;
  className?: string;
}

/**
 * Post-signup onboarding for the Twilio WhatsApp line: merchant chats a debt
 * in plain language ("Mama Ngozi 5k rice Friday") and the backend files it.
 * Joining is skippable — Settings shows the same card for later.
 */
export function WhatsAppConnectCard({
  onSkip,
  poll = true,
  className,
}: WhatsAppConnectCardProps) {
  const { data: setup, isLoading: setupLoading, error: setupError } =
    useWhatsAppSetup();
  const { data: status } = useWhatsAppStatus(true, poll);
  const [copied, setCopied] = useState(false);

  const linked = status?.linked === true;
  const sender = status?.sender ?? null;
  const notConfigured = setupError != null || setup?.join_code === "";

  async function copyJoinMessage() {
    if (!setup?.join_message) return;
    try {
      await navigator.clipboard.writeText(setup.join_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked (insecure origin, permissions) — the join
      // message is on screen anyway, so leave the button quietly inert.
    }
  }

  return (
    <section
      className={cn(
        "rounded-sm border border-border bg-card p-6 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-primary/10 text-primary">
          <WhatsappLogo weight="fill" className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            Log debts from WhatsApp
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Message Traka like you&rsquo;d talk to a customer. No forms, no app
            switching.
          </p>
        </div>
      </div>

      {linked ? (
        <div className="mt-5 flex items-start gap-3 rounded-sm border border-primary/25 bg-primary/5 p-4">
          <CheckCircle weight="fill" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              WhatsApp connected
            </p>
            <p className="mt-0.5 break-words text-xs text-muted-foreground">
              {sender ? (
                <>
                  Linked to <span className="font-mono">{sender}</span>.
                  Send a message to log your first debt.
                </>
              ) : (
                "Send a message to log your first debt."
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-5 text-sm text-muted-foreground">
            Try:{" "}
            <span className="font-mono text-foreground">
              &ldquo;Mama Ngozi dey owe me 5k for rice, she go pay Friday&rdquo;
            </span>
          </p>

          <ol className="mt-5 space-y-3">
            <Step n={1}>
              Tap the button below — it opens WhatsApp on the Traka line.
            </Step>
            <Step n={2}>
              Send the join message once so WhatsApp lets Traka reply.
            </Step>
            <Step n={3}>
              Then just chat. Traka asks for anything it&rsquo;s missing.
            </Step>
          </ol>

          {notConfigured ? (
            <p className="mt-5 rounded-sm border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
              {setupError
                ? `WhatsApp setup is unavailable right now (${getErrorMessage(setupError)}).`
                : "WhatsApp is not configured on the server yet."}
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {setupLoading ? (
                  <Button className="flex-1" disabled>
                    Preparing WhatsApp…
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (setup?.wa_link) window.open(setup.wa_link, "_blank");
                    }}
                  >
                    <WhatsappLogo weight="bold" />
                    Continue on WhatsApp
                    <ArrowSquareOut className="size-4" />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={copyJoinMessage}
                  disabled={!setup?.join_message}
                >
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy join message"}
                </Button>
              </div>

              {setup?.trial_note ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {setup.trial_note}
                </p>
              ) : null}

              {poll ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                  {POLL_HINT}
                </p>
              ) : null}
            </>
          )}
        </>
      )}

      {onSkip ? (
        <Button
          variant="ghost"
          className="mt-5 w-full"
          onClick={onSkip}
        >
          {linked ? "Continue to Traka" : "Skip for now"}
        </Button>
      ) : null}
    </section>
  );
}

interface StepProps {
  n: number;
  children: React.ReactNode;
}

function Step({ n, children }: StepProps) {
  return (
    <li className="flex items-start gap-3 text-sm text-muted-foreground">
      <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
        {n}
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}
