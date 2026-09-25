import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { accountsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/utils";
import { Field } from "./field";
import { PhoneInput } from "./phone-input";
import { isValidLocalPhone, toStoredPhone } from "@/lib/phone";
import { PinInput } from "./pin-input";
import { AuthFooter } from "./auth-footer";
import { Card } from "@/components/ui/card";

interface SignInFormProps {
  onAuthenticate: () => void;
}

/* Placeholder demo accounts (Guild-style one-tap login rows).
   TODO: replace with real backend demo credentials before launch. */
const DEMO_PIN = "123456";
const DEMO_ACCOUNTS = [
  { phone: "08100000001", name: "Mama Blessing", role: "Foodstuff" },
  { phone: "08100000002", name: "Adaeze", role: "Fashion" },
  { phone: "08100000003", name: "Tunde", role: "Provisions" },
] as const;

export function SignInForm({ onAuthenticate }: SignInFormProps) {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canLogin = isValidLocalPhone(phone) && pin.length === 6;

  const fillDemo = (demoPhone: string) => {
    setPhone(demoPhone.replace(/^0/, ""));
    setPin(DEMO_PIN);
    setError("");
  };

  const handleLogin = async () => {
    if (!canLogin) {
      if (phone && !isValidLocalPhone(phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Enter a valid Nigerian number starting with 070, 080, or 090.",
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
      localStorage.setItem(
        "traka_user",
        JSON.stringify({
          token: res.access_token,
          refreshToken: res.refresh_token,
          virtualAccountNumber: res.virtual_account_number,
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
          label="Phone number"
          htmlFor="signin-phone"
          helper="We'll use this number to sign you in."
        >
          <PhoneInput
            id="signin-phone"
            value={phone}
            onValueChange={setPhone}
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
          <p className="text-sm font-semibold">Demo accounts</p>
          <p className="font-mono text-xs text-muted-foreground">
            PIN {DEMO_PIN}
          </p>
        </div>
        <div className="mt-3 divide-y divide-border border-t border-border">
          {DEMO_ACCOUNTS.map((a) => (
            <Button
              key={a.phone}
              type="button"
              variant="ghost"
              onClick={() => fillDemo(a.phone)}
              className="h-auto w-full justify-between px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold">{a.phone}</span>
                <span className="block text-xs text-muted-foreground">
                  {a.name}
                </span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
