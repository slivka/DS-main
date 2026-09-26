import { forwardRef, useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export type LookupFieldMode = "search" | "refresh" | "auto";

/** Událost, která mění stav ikony v režimu `auto`. */
export type LookupFieldEvent =
  | { type: "reset"; value: string }
  | { type: "change"; value: string }
  | { type: "action"; ok: boolean | void };

/**
 * Čistý výpočet stavu „vyhledáno“ pro režim `auto`:
 * hodnota při otevření / změně `resetKey` nebo úspěšná akce → ⟳, smazání hodnoty → lupa,
 * neúspěšná akce (`false`) stav nemění.
 */
export function nextLookupResolved(resolved: boolean, event: LookupFieldEvent): boolean {
  if (event.type === "reset") return event.value.trim().length > 0;
  if (event.type === "change") return event.value.trim().length > 0 ? resolved : false;
  return event.ok === false ? resolved : true;
}

/** Ikona, kterou pole zobrazí pro daný režim a stav. */
export function resolveLookupIcon(mode: LookupFieldMode, resolved: boolean): "search" | "refresh" {
  if (mode === "auto") return resolved ? "refresh" : "search";
  return mode;
}

export interface LookupFieldProps extends Omit<ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** `search` = lupa, `refresh` = ⟳, `auto` (výchozí) podle hodnoty a výsledku akce. */
  mode?: LookupFieldMode;
  /** Akce ikony; vrácené `false` = neúspěch, ikona se nemění. */
  onAction?: () => Promise<boolean | void> | boolean | void;
  /** Probíhá akce – ikona se točí a je neaktivní. */
  busy?: boolean;
  /** Skryje ikonovou akci (např. pro jen čtení). */
  hideAction?: boolean;
  /** Změna hodnoty znovu vyhodnotí počáteční stav (např. id záznamu). */
  resetKey?: string | number;
  searchLabel?: string;
  refreshLabel?: string;
}

/** Vstup s ikonovou akcí v pravé části pole (vyhledání / obnovení z registru). */
export const LookupField = forwardRef<HTMLInputElement, LookupFieldProps>(function LookupField(
  {
    value,
    onChange,
    mode = "auto",
    onAction,
    busy = false,
    disabled = false,
    hideAction = false,
    resetKey,
    searchLabel = "Vyhledat",
    refreshLabel = "Aktualizovat",
    className,
    ...inputProps
  },
  ref,
) {
  const [resolved, setResolved] = useState(() => nextLookupResolved(false, { type: "reset", value }));

  useEffect(() => {
    setResolved(nextLookupResolved(false, { type: "reset", value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    setResolved((current) => nextLookupResolved(current, { type: "change", value }));
  }, [value]);

  const icon = resolveLookupIcon(mode, resolved);
  const label = icon === "refresh" ? refreshLabel : searchLabel;
  const Icon = icon === "refresh" ? RefreshCw : Search;
  const showAction = !hideAction && Boolean(onAction);

  return (
    <div className={cn("relative", className)} data-slot="lookup-field" data-lookup-icon={showAction ? icon : undefined}>
      <Input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(showAction && "pr-9")}
        {...inputProps}
      />
      {showAction ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:text-foreground"
          onClick={async () => {
            const ok = await onAction?.();
            setResolved((current) => nextLookupResolved(current, { type: "action", ok }));
          }}
          disabled={disabled || busy}
          title={label}
          aria-label={label}
        >
          <Icon className={cn("size-4", busy && "animate-spin")} />
        </Button>
      ) : null}
    </div>
  );
});
