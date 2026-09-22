import { useEffect, useRef, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

type IcoFieldProps = {
  /** Aktuálna hodnota IČO. */
  value: string;
  /** Zmena hodnoty IČO. */
  onChange: (value: string) => void;
  /**
   * Vyhľadanie v registri. Vráťte `true`, ak sa údaje podarilo doplniť –
   * ikona sa potom prepne na „Aktualizovat z rejstříku“.
   */
  onLookup: () => Promise<boolean | void> | boolean | void;
  /** Prebieha vyhľadávanie. */
  busy?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Zmena tejto hodnoty (napr. id záznamu) znovu vyhodnotí počiatočný stav. */
  resetKey?: string | number;
  lookupLabel?: string;
  refreshLabel?: string;
};

/**
 * Zdieľané pole pre IČO s tlačidlom registra priamo v poli.
 * Ikona lupy = ešte sme nevyhľadávali, ikona obnovenia = IČO bolo pri vstupe
 * do formulára už vyplnené alebo sme ho z registra doplnili.
 */
export function IcoField({
  value,
  onChange,
  onLookup,
  busy = false,
  disabled = false,
  placeholder = "Zadejte IČO nebo název firmy",
  className,
  resetKey,
  lookupLabel = "Vyhledat v rejstříku",
  refreshLabel = "Aktualizovat z rejstříku",
}: IcoFieldProps) {
  const initial = useRef(value.trim().length > 0);
  const [resolved, setResolved] = useState(initial.current);

  useEffect(() => {
    const has = value.trim().length > 0;
    initial.current = has;
    setResolved(has);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (!value.trim()) setResolved(false);
  }, [value]);

  const label = resolved ? refreshLabel : lookupLabel;
  const Icon = resolved ? RefreshCw : Search;

  return (
    <div className={cn("relative", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-9"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
        onClick={async () => {
          const ok = await onLookup();
          if (ok !== false) setResolved(true);
        }}
        disabled={disabled || busy}
        title={label}
        aria-label={label}
      >
        <Icon className={cn("size-4", busy && "animate-spin")} />
      </Button>
    </div>
  );
}
