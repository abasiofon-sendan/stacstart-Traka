import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { accountsApi } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/utils";
import { Field } from "./field";
import { PhoneInput } from "./phone-input";
import { isValidLocalPhone, toStoredPhone } from "@/lib/phone";
import { PinInput } from "./pin-input";
import { AuthFooter } from "./auth-footer";

interface RegisterFormProps {
  onAuthenticate: () => void;
}

export function RegisterForm({ onAuthenticate }: RegisterFormProps) {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [nin, setNin] = useState("");
  const [pin, setPin] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSignup =
    businessName.trim() &&
    isValidLocalPhone(phone) &&
    nin.length === 11 &&
    pin.length === 6 &&
    terms;

  const handleSignup = async () => {
    if (!canSignup) {
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
      const res = await accountsApi.signup({
        business_name: businessName.trim(),
        phone_number: toStoredPhone(phone),
        nin: nin.trim(),
        pin,
      });
      localStorage.setItem(
        "traka_user",
        JSON.stringify({
          token: res.access_token,
          refreshToken: res.refresh_token,
          virtualAccountNumber: res.virtual_account_number,
          businessName: businessName.trim(),
          phone: toStoredPhone(phone),
          createdAt: new Date().toISOString(),
        }),
      );
      toast({ title: "Account Created", description: "Welcome to Traka! Setting up your ledger...", variant: "success" });
      onAuthenticate();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Signup failed. Please try again.");
      setError(msg);
      toast({ title: "Signup Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
        Create your Traka
      </p>
      <h1 className="mt-3 text-balance font-display text-[32px] font-extrabold leading-[1.15] tracking-tight lg:text-[44px] lg:leading-[1.2]">
        Let&rsquo;s set up your ledger.
      </h1>
      <p className="mt-3 text-muted-foreground">One secure PIN. No passwords.</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSignup();
        }}
      >
        <Field label="Business name" htmlFor="register-name" required>
          <Input
            id="register-name"
            type="text"
            placeholder="e.g. Mama Nkechi Stores"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            autoComplete="organization"
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="register-phone"
          required
          helper="We'll use this number to sign you in."
        >
          <PhoneInput
            id="register-phone"
            value={phone}
            onValueChange={setPhone}
            autoComplete="tel"
          />
        </Field>

        <Field
          label="NIN"
          htmlFor="register-nin"
          required
          helper="NIN required after signup — have your 11-digit number ready."
        >
          <Input
            id="register-nin"
            type="text"
            inputMode="numeric"
            placeholder="11-digit NIN"
            maxLength={11}
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
            autoComplete="off"
          />
        </Field>

        <Field label="Create PIN" htmlFor="register-pin" required>
          <PinInput
            id="register-pin"
            value={pin}
            onValueChange={setPin}
            autoComplete="new-password"
          />
        </Field>

        <div className="flex items-start gap-2.5">
          <Checkbox
            id="register-terms"
            checked={terms}
            onCheckedChange={(v) => setTerms(v === true)}
            className="mt-0.5"
          />
          <Label htmlFor="register-terms" className="cursor-pointer leading-relaxed font-normal">
            I agree to the Traka Terms and Privacy Notice.
          </Label>
        </div>

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={!canSignup || loading}
          className="h-12 w-full justify-between px-5"
        >
          {loading ? "Creating account..." : "Create my account"}
          <ArrowRight weight="bold" className="h-4 w-4" />
        </Button>
      </form>

      <AuthFooter
        prompt="Already on Traka?"
        linkLabel="Sign in"
        to="/auth"
      />
    </div>
  );
}
