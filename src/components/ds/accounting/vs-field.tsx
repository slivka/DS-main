/**
 * Variabilní symbol · vlastní číslicový vstup a volitelný zámek vazby na číslo daňového
 * dokladu · nesmí zapisovat odvozenou hodnotu (zamčený VS je jen náhled).
 */
import { forwardRef } from "react";
import { Lock, LockOpen } from "lucide-react";

import { Input } from "../../ui/input";
import { FieldToggleButton } from "../form/field-toggle-button";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/** Vlastnosti pole VS. */
export interface VsFieldProps {
  /** Vlastní VS (odemčený stav). */
  value: string;
  /** Změna vlastního VS. */
  onChange: (value: string) => void;
  /** Nejvyšší počet číslic. */
  maxLength?: number;
  /** Zástupný text. */
  placeholder?: string;
  /** Povinné pole. */
  required?: boolean;
  /** Zakázané pole. */
  disabled?: boolean;
  /** Jen ke čtení. */
  readOnly?: boolean;
  /** Id vstupu. */
  id?: string;
  /** Doplňující třídy. */
  className?: string;
  /** Přístupný název. */
  "aria-label"?: string;
  /** Vazba na číslo daňového dokladu; undefined = bez zámku. */
  linked?: boolean;
  /** Změna vazby (DS ukládá jen stav vazby). */
  onLinkedChange?: (linked: boolean) => void;
  /** Odvozený VS zobrazený jako náhled při zamčení. */
  derivedValue?: string | null;
  /** Text v zamčeném poli bez čísla (např. „přidělí se při zařazení“). */
  pendingText?: string;
  /** Varování uvnitř pole. */
  warning?: string;
}

/** Variabilní symbol – pouze číslice, výchozí maximálně 10 znaků; volitelně se zámkem. */
export const VsField = forwardRef<HTMLInputElement, VsFieldProps>(function VsField(
  {
    value,
    onChange,
    maxLength = 10,
    placeholder,
    required,
    disabled,
    readOnly,
    id,
    className,
    linked,
    onLinkedChange,
    derivedValue,
    pendingText,
    warning,
    ...rest
  },
  ref,
) {
  const t = useDsTexts().documentEdit;
  const lockable = linked !== undefined;
  const locked = lockable && linked;
  const input = (
    <Input
      {...rest}
      ref={ref}
      id={id}
      inputMode="numeric"
      autoComplete="off"
      value={locked ? (derivedValue ?? "") : value}
      required={required}
      disabled={disabled}
      readOnly={readOnly || locked}
      warning={warning}
      placeholder={locked && !derivedValue && !warning ? pendingText : placeholder}
      maxLength={locked ? undefined : maxLength}
      data-linked={locked || undefined}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, maxLength))}
      className={cn(
        "h-[var(--control-h)] text-left font-sans tabular-nums",
        lockable &&
          (warning
            ? "pr-[calc(var(--field-toggle-space)+1.75rem)]"
            : "pr-[var(--field-toggle-space)]"),
        className,
      )}
    />
  );
  if (!lockable) return input;
  return (
    // Při varování se ⚠ posune před zámek (vzor daňového čísla).
    <div className="relative min-w-0 [--field-feedback-offset:calc(var(--field-toggle-space)+0.25rem)]">
      {input}
      <FieldToggleButton
        icon={locked ? Lock : LockOpen}
        pressed={Boolean(locked)}
        label={t.vsLink}
        pressedTooltip={t.vsLinked}
        unpressedTooltip={t.vsUnlinked}
        disabled={disabled || readOnly || !onLinkedChange}
        onPressedChange={(pressed) => onLinkedChange?.(pressed)}
      />
    </div>
  );
});
