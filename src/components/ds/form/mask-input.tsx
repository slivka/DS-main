/**
 * Vstup masky čísla dokladu s nabídkou tokenů a náhledem výsledku.
 * Vlastní: vložení tokenu na kurzor, otevření nabídky při fokusu a režim jen ke čtení.
 * Nesmí: generovat čísla dokladů ani znát pravidla konkrétní knihy.
 */
import { forwardRef, useRef, useState, type ComponentPropsWithoutRef } from "react";

import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover";
import { FieldValue } from "./field-value";

/** Token dostupný v masce čísla dokladu. */
export interface MaskInputToken {
  /** Text vložený do masky, například `{RRRR}`. */
  token: string;
  /** Srozumitelný popis významu tokenu. */
  label: string;
}

/** Vlastnosti vstupu masky čísla dokladu. */
export interface MaskInputProps extends Omit<
  ComponentPropsWithoutRef<typeof Input>,
  "value" | "onChange" | "readOnly"
> {
  /** Aktuální maska. */
  value: string;
  /** Změna masky po psaní nebo vložení tokenu. */
  onChange: (value: string) => void;
  /** Dostupné tokeny; bez hodnoty se použije společná česká/slovenská sada. */
  tokens?: MaskInputToken[];
  /** Náhled příštího čísla zobrazený dole v nabídce. */
  preview?: string;
  /** Pole se zobrazí jako neměnná hodnota. */
  readOnly?: boolean;
  /** Důvod, proč masku nelze změnit; zobrazí zámek a nápovědu. */
  lockedReason?: string;
}

/** Vstup masky s tokeny v plovoucí nabídce, která nemění výšku řádku formuláře. */
export const MaskInput = forwardRef<HTMLInputElement, MaskInputProps>(function MaskInput(
  { value, onChange, tokens, preview, readOnly, lockedReason, className, onFocus, ...props },
  forwardedRef,
) {
  const texts = useDsTexts().maskInput;
  const localRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const items = tokens ?? texts.tokens;

  if (readOnly || lockedReason) {
    return <FieldValue lockedReason={lockedReason}>{value}</FieldValue>;
  }

  const setRefs = (node: HTMLInputElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  const insertToken = (token: string) => {
    const input = localRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? start;
    const next = `${value.slice(0, start)}${token}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          {...props}
          ref={setRefs}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={(event) => {
            onFocus?.(event);
            setOpen(true);
          }}
          className={cn("w-full font-mono tabular-nums", className)}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-[--radix-popover-trigger-width] min-w-80 space-y-3 p-3"
      >
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Button
              key={item.token}
              type="button"
              variant="outline"
              size="sm"
              title={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insertToken(item.token)}
              className="font-mono"
            >
              {item.token}
            </Button>
          ))}
        </div>
        {preview ? (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            {texts.preview}: <span className="font-mono text-foreground">{preview}</span>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
});