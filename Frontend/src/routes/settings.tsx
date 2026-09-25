import { useState } from "react";
import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { Bank, EnvelopeSimple, SignOut, User } from "@phosphor-icons/react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccount } from "@/store/session-store";
import { useAiStore } from "@/store/ai-store";
import { useAuthStore } from "@/store/auth-store";
import type { AiLanguage } from "@/lib/endpoints";
import { useMe } from "@/lib/query-hooks";

const LANG_LABELS: Record<AiLanguage, string> = {
  en: "English",
  yo: "Yoruba",
  ha: "Hausa",
  pidgin: "Pidgin",
};

function SettingsPage() {
  const { accountName, accountNumber, bankName } = useAccount();
  const aiLang = useAiStore((s) => s.aiLang);
  const logout = useAuthStore((s) => s.logout);
  const { data: me } = useMe();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [voiceReplies, setVoiceReplies] = useState(false);

  const initials =
    accountName.trim().length > 0
      ? accountName
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "T";

  const langLabel = LANG_LABELS[aiLang];

  return (
    <div>
      <PageHeader
        eyebrow="Settings — merchant profile"
        title="Settings"
        description="Manage your merchant profile, assistant preferences and account details."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile */}
        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <User weight="bold" className="h-4 w-4 text-primary" />
            Merchant profile
          </h2>
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="rounded-sm bg-primary/10 text-base text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-extrabold text-foreground">
                {accountName || "Merchant"}
              </p>
              <p className="truncate font-mono text-sm text-muted-foreground">{accountNumber}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <EnvelopeSimple className="h-4 w-4" />
                Phone
              </dt>
              <dd className="truncate font-medium text-foreground">{me?.phone_number ?? "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Bank className="h-4 w-4" />
                Receiving bank
              </dt>
              <dd className="truncate font-medium text-foreground">{bankName}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Currency</dt>
              <dd className="font-medium text-foreground">Nigerian Naira (₦)</dd>
            </div>
          </dl>
        </section>

        {/* Preferences */}
        <section className="rounded-sm border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Preferences</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Checkbox
                id="pref-push"
                checked={pushEnabled}
                onCheckedChange={(v) => setPushEnabled(v === true)}
              />
              <span className="min-w-0">
                <label
                  htmlFor="pref-push"
                  className="text-sm font-medium text-foreground"
                >
                  Transfer &amp; payment alerts
                </label>
                <p className="text-xs text-muted-foreground">
                  Get notified the moment an incoming transfer clears.
                </p>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Checkbox
                id="pref-voice"
                checked={voiceReplies}
                onCheckedChange={(v) => setVoiceReplies(v === true)}
              />
              <span className="min-w-0">
                <label
                  htmlFor="pref-voice"
                  className="text-sm font-medium text-foreground"
                >
                  Voice replies from Traka AI
                </label>
                <p className="text-xs text-muted-foreground">
                  Hear spoken answers instead of chat text only.
                </p>
              </span>
            </li>
          </ul>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Assistant language</span>
            <span className="font-medium text-foreground">{langLabel}</span>
          </div>
        </section>

        {/* About + sign out */}
        <section className="rounded-sm border border-border bg-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-foreground">About Traka</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd className="font-medium text-foreground">0.1.0</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ledger sync</dt>
              <dd className="font-medium text-foreground">Auto · real-time</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Support</dt>
              <dd className="font-medium text-foreground">support@traka.app</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-border pt-4">
            <Button variant="destructive" onClick={logout}>
              <SignOut weight="bold" />
              Sign out
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

const settingsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/settings",
  component: SettingsPage,
});

export const Route = settingsRoute;
