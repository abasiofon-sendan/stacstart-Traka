import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { accountsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/utils";
import { Field } from "./field";
import { PhoneInput } from "./phone-input";
import { CountrySelect } from "./country-select";
import { isValidLocalPhone, toStoredPhone, formatPhone } from "@/lib/phone";
import { useCountryStore } from "@/store/country-store";
import { allDemoAccounts, getCountry, type CountryCode } from "@/lib/countries";
import { PinInput } from "./pin-input";
import { AuthFooter } from "./auth-footer";
import { Card } from "@/components/ui/card";

interface SignInFormProps {
  onAuthenticate: () => void;
}

/* Demo rows are one-tap logins. Tapping one also switches the app to that
   store's country, so the ledger renders in the right currency immediately. */
const DEMO_PIN = "123456";
const DEMO_ACCOUNTS = allDemoAccounts();

export function SignInForm({ onAuthenticate }: SignInFormProps) {
  const { toast } = useToast();
  const countryCode = useCountryStore((s) => s.code);
  const setCountry = useCountryStore((s) => s.setCountry);
  const country = getCountry(countryCode);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = isValidLocalPhone(phone, country) && pin.length === 6;

  const fillDemo = (demoPhone: string, demoCountry: CountryCode) => {
    setCountry(demoCountry);
    setPhone(demoPhone.replace(/^0/, ""));
    setPin(DEMO_PIN);
    setError("");
  };

  const handleLogin = async () => {
    if (!canLogin) {
      if (phone && !isValidLocalPhone(phone, country)) {
        toast({
          title: "Invalid Phone Number",
          description: `Enter a valid ${country.name} number. ${country.phone.helper}`,
          variant: "destructive",
        });
      }
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await accountsApi.login({
        phone_number: toStoredPhone(phone),
        pin,
      });
      setCountry(country.code);
      localStorage.setItem(
        "traka_user",
        JSON.stringify({
          token: res.access_token,
          refreshToken: res.refresh_token,
          virtualAccountNumber: res.virtual_account_number,
          country: country.code,
          createdAt: new Date().toISOString(),
        }),
      );
      toast({ title: "Welcome Back", description: "Logging into your ledger...", variant: "success" });
      onAuthenticate();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Login failed. Please try again.");
      setError(msg);
      toast({ title: "Login Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
        Sign in or join
      </p>
      <h1 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight lg:text-[44px] lg:leading-[1.2]">
        Sign into your account
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your record keeps growing, pick up where you left off.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleLogin();
        }}
      >
        <Field
          label="Country"
          htmlFor="signin-country"
          helper="Your currency and payment method follow this. Or tap a demo store below to switch."
        >
          <CountrySelect
            id="signin-country"
            value={countryCode}
            onChange={(c) => {
              setCountry(c);
              setPhone("");
            }}
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="signin-phone"
          helper={`${country.phone.helper} We'll use this number to sign you in.`}
        >
          <PhoneInput
            id="signin-phone"
            value={phone}
            onValueChange={setPhone}
            country={country}
            autoComplete="tel"
          />
        </Field>

        <Field label="PIN" htmlFor="signin-pin">
          <PinInput
            id="signin-pin"
            value={pin}
            onValueChange={setPin}
            autoComplete="current-password"
          />
        </Field>

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={!canLogin || loading}
          className="h-12 w-full justify-between px-5"
        >
          {loading ? "Logging in..." : "Sign in"}
          <ArrowRight weight="bold" className="h-4 w-4" />
        </Button>
      </form>

      <Card className="mt-6">
        <div className="flex items-center justify-between px-4">
          <p className="text-sm font-semibold">Demo stores</p>
          <p className="font-mono text-xs text-muted-foreground">
            PIN {DEMO_PIN}
          </p>
        </div>
        <div className="mt-3 divide-y divide-border border-t border-border">
          {DEMO_ACCOUNTS.map((a) => (
            <Button
              key={`${a.country.code}-${a.phone}`}
              type="button"
              variant="ghost"
              onClick={() => fillDemo(a.phone, a.country.code)}
              className="h-auto w-full justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span aria-hidden>{a.country.flag}</span>
                  <span className="truncate text-sm font-semibold">{a.store}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {a.country.name}
                  </span>
                </span>
                <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                  {formatPhone(a.phone, a.country)}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {a.role}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      <AuthFooter
        prompt="New to Traka?"
        linkLabel="Create an account"
        to="/auth/register"
      />
    </div>
  );
}
