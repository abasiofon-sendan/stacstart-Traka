import {
  Bank,
  Check,
  Clock,
  CurrencyNgn,
  Microphone,
  SpeakerHigh,
} from "@phosphor-icons/react";
import { LogoLockup } from "./logo-lockup";
import type { AuthVariant } from "./auth-shell";
import { money } from "@/lib/money";
import { activeCountry } from "@/store/country-store";

interface ProductPanelProps {
  variant: AuthVariant;
}

const PANEL_META: Record<AuthVariant, string> = {
  signin: "DAILY CLOSE",
  signup: "VOICE HELPER",
  whatsapp: "CHAT TO LEDGER",
};

/**
 * Desktop-only left panel for the auth split. Each screen gets its own
 * product feature card: sign-in shows the day-close ledger, register
 * shows the voice helper.
 */
export function ProductPanel({ variant }: ProductPanelProps) {
  return (
    <aside className="relative hidden w-[46%] max-w-[680px] flex-col justify-between overflow-hidden rounded-r-lg bg-pine p-8 text-white lg:flex xl:p-10">
      {/* dot-grid texture, same motif as the landing hero */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative flex items-start justify-between">
        <LogoLockup onDark />
        <span className="font-mono text-xs tracking-widest text-white/60">
          {PANEL_META[variant]}
        </span>
      </div>

      <div className="relative mx-auto my-8 w-full max-w-[400px]">
        {variant === "signin" ? <DayCloseCard /> : <VoiceCard />}
      </div>

      <div className="relative flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-white/50">
          Market day, written down.
        </span>
        <span className="font-mono text-xs tracking-widest text-white/50">
          TRAKA · V1.0
        </span>
      </div>
    </aside>
  );
}

/** Sign-in feature card: today's close with ledger bars and chips. */
function DayCloseCard() {
  const country = activeCountry();
  return (
    <>
      <div className="absolute -top-5 -left-4 z-10 flex -rotate-3 items-center gap-2 rounded-sm bg-accent-moss px-4 py-3 text-sm font-semibold text-on-accent-moss shadow-soft-lift animate-float">
        <Clock weight="bold" className="h-4 w-4" />
        {country.copy.customerA} owes you {money(country.copy.demo.debtorOne)}
      </div>

      <div className="rotate-[-2deg] rounded-lg bg-card p-6 text-foreground shadow-modal">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Today&rsquo;s close
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <Check weight="bold" className="h-3 w-3" />
            Day closed
          </span>
        </div>

        <p className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          {money(country.copy.demo.dayTotal)}
        </p>

        <div className="mt-4 flex h-20 items-end gap-2">
          {[40, 65, 50, 80, 100].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={
                "flex-1 rounded-sm " + (i === 4 ? "bg-primary" : "bg-primary/20")
              }
            />
          ))}
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <CurrencyNgn weight="bold" className="h-4 w-4" />
              Cash
            </span>
            <span className="font-semibold">{money(country.copy.demo.dayCash)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Bank weight="bold" className="h-4 w-4" />
              {country.payment.short}
            </span>
            <span className="font-semibold">{money(country.copy.demo.dayTransfer)}</span>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-6 z-10 flex rotate-2 items-center gap-2.5 rounded-sm bg-card px-4 py-3 text-sm text-foreground shadow-soft-lift animate-float [animation-delay:1.2s]">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Microphone weight="fill" className="h-4 w-4" />
        </span>
        <span>
          <span className="block font-semibold">“Who dey owe me?”</span>
          <span className="block text-xs text-muted-foreground">
            {money(country.copy.demo.debtorTotal)} out — {country.copy.customerA}, {country.copy.customerB}
          </span>
        </span>
      </div>
    </>
  );
}

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  pidgin: "Pidgin",
  yo: "Yoruba",
  ha: "Hausa",
  sw: "Swahili",
};

/** Register feature card: voice helper chat in the trader's language. */
function VoiceCard() {
  const country = activeCountry();
  return (
    <>
      <div className="absolute -top-5 -left-4 z-10 flex -rotate-3 items-center gap-2 rounded-sm bg-accent-lavender px-4 py-3 text-sm font-semibold text-foreground shadow-soft-lift animate-float">
        <SpeakerHigh weight="bold" className="h-4 w-4" />
        Ask in your language
      </div>

      <div className="rotate-[-2deg] rounded-lg bg-card p-6 text-foreground shadow-modal">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Voice helper
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Live
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="ml-auto w-fit max-w-[85%] rounded-md rounded-br-sm bg-primary px-4 py-2.5 text-sm font-medium text-white">
            How much I don sell today?
          </div>
          <div className="w-fit max-w-[90%] rounded-md rounded-bl-sm bg-muted px-4 py-2.5 text-sm">
            {country.copy.demo.dayTotal} so far — {country.copy.demo.dayCash} cash,{" "}
            {country.copy.demo.dayTransfer} by {country.payment.label.toLowerCase()}. Best
            hour na 12pm.
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          {country.languages.map((l) => (
            <span
              key={LANG_LABELS[l] ?? l}
              className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"
            >
              {LANG_LABELS[l] ?? l}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute -right-3 -bottom-6 z-10 flex rotate-2 items-center gap-2.5 rounded-sm bg-accent-mint px-4 py-3 text-sm font-semibold text-foreground shadow-soft-lift animate-float [animation-delay:1.2s]">
        <Microphone weight="fill" className="h-4 w-4" />
        Reply out loud, no spelling
      </div>
    </>
  );
}
