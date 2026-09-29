import { Input } from "@/components/ui/input";
import type { CountryConfig } from "@/lib/countries";

interface PhoneInputProps {
  id?: string;
  /** Local number without the leading zero (prefix shown decoratively). */
  value: string;
  onValueChange: (digits: string) => void;
  country: CountryConfig;
  autoComplete?: string;
}

/** Phone field with the active country's flag and dial code. */
export function PhoneInput({
  id,
  value,
  onValueChange,
  country,
  autoComplete,
}: PhoneInputProps) {
  return (
    <div className="flex h-11 w-full items-center rounded-md border border-input bg-card px-3 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <span
        aria-hidden
        className="mr-2.5 shrink-0 select-none border-r border-border pr-2.5 font-mono text-sm text-muted-foreground"
      >
        <span className="mr-1.5">{country.flag}</span>
        {country.phone.dial}
      </span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder={country.phone.example}
        maxLength={country.phone.localDigits}
        value={value}
        onChange={(e) =>
          onValueChange(
            e.target.value.replace(/\D/g, "").slice(0, country.phone.localDigits),
          )
        }
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 aria-invalid:ring-0"
      />
    </div>
  );
}
