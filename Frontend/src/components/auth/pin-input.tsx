import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PinInputProps {
  id?: string;
  value: string;
  onValueChange: (digits: string) => void;
  autoComplete?: string;
  placeholder?: string;
}

/** 6-digit PIN field with a show/hide toggle (shadcn Input + phosphor icons). */
export function PinInput({
  id,
  value,
  onValueChange,
  autoComplete = "one-time-code",
  placeholder = "6-digit PIN",
}: PinInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        inputMode="numeric"
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={6}
        value={value}
        onChange={(e) =>
          onValueChange(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        className="h-11 pr-11"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide PIN" : "Show PIN"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      >
        {show ? (
          <EyeSlash weight="bold" className="h-4.5 w-4.5" />
        ) : (
          <Eye weight="bold" className="h-4.5 w-4.5" />
        )}
      </Button>
    </div>
  );
}
