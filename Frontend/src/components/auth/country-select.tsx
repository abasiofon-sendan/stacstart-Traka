import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_LIST, getCountry, type CountryCode } from "@/lib/countries";

interface CountrySelectProps {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  id?: string;
  /** Hides the currency suffix when space is tight. */
  compact?: boolean;
}

/** Flag + name + currency picker. Drives every country setting downstream. */
export function CountrySelect({
  value,
  onChange,
  id,
  compact = false,
}: CountrySelectProps) {
  const active = getCountry(value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as CountryCode)}>
      <SelectTrigger
        id={id}
        className="w-full justify-between rounded-sm font-medium data-[size=default]:rounded-sm"
      >
        <SelectValue>
          <span className="flex items-center gap-2">
            <span aria-hidden>{active.flag}</span>
            <span>{active.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {compact ? active.currency.code : active.currency.name}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-sm">
        {COUNTRY_LIST.map((c) => (
          <SelectItem key={c.code} value={c.code} className="rounded-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden>{c.flag}</span>
              <span>{c.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {compact ? c.currency.code : c.currency.name}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
