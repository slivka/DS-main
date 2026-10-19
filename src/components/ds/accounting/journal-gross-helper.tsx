/**
 * Pomocník „Cena s DPH“ v buňce Částka / Jedn. cena a v detailu řádku.
 * Vlastní: ikonu uvnitř pole, malé okno se zadáním částky s DPH a zápis základu
 *   round(s DPH × 100 / (100 + sazba)) na přesnost sloupce.
 * Nesmí: nic ukládat ani měnit daň – jen vyplní pole základu přes akce editoru.
 */
import { Calculator } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { DecimalInput } from "../form/decimal-input";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine } from "./journal-lines";

/** Props pomocníka ceny s DPH. */
export interface JournalGrossHelperProps {
  /** Řádek dokladu. */
  line: JournalLine;
  /** Cílový sloupec – Částka (2 desetinná místa) nebo Jedn. cena (4). */
  column: "amount" | "unitPrice";
  /** Další třídy ikony. */
  className?: string;
}

/** Ikona a okno „Cena s DPH“; bez sazby (kód bez daně, samovyměření, mimo DPH) se nevykreslí. */
export function JournalGrossHelper({ line, column, className }: JournalGrossHelperProps) {
  const { editor } = useJournalEditor();
  const texts = editor.t.vatGroups;
  const rate = editor.vatGroups.grossHelperRate(line);
  const helperKey = `${line.id}:${column}`;
  const state = editor.vatGroups.grossHelper;
  const open = state?.key === helperKey;
  const value = open ? state.value : "";
  const setOpen = (next: boolean) =>
    editor.vatGroups.setGrossHelper(next ? { key: helperKey, value: "" } : null);
  const setValue = (next: string) => editor.vatGroups.setGrossHelper({ key: helperKey, value: next });
  const inputId = `journal-gross-helper-${line.id}-${column}`;
  if (rate === null) return null;
  const precision = column === "amount" ? 2 : 4;
  const apply = () => {
    if (value === "") return;
    const base = editor.vatGroups.grossToBase(Number(value), rate, precision);
    if (column === "amount") editor.patch(line.id, editor.amountValues(base));
    else editor.updateCalculated(line, { unitPrice: base });
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="journal-gross-helper"
          aria-label={texts.grossHelper}
          onPointerDown={(event) => event.stopPropagation()}
          onFocus={(event) => event.stopPropagation()}
          onMouseDown={(event) => {
            // Bez přesunu fokusu: aktivace buňky by ikonu mezi stiskem a puštěním přemontovala.
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className={cn(
            "ml-1 inline-flex size-[1.2em] shrink-0 items-center justify-center rounded-sm",
            "text-muted-foreground hover:text-foreground focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Calculator className="size-[0.85em]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        data-slot="journal-gross-helper-content"
        className="w-64 space-y-2"
        onClick={(event) => event.stopPropagation()}
        onFocus={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") apply();
        }}
      >
        <Label htmlFor={inputId}>{texts.grossHelperField.replace("{rate}", String(rate))}</Label>
        <DecimalInput
          id={inputId}
          autoFocus
          value={value === "" ? undefined : Number(value)}
          decimals={2}
          onChange={(next) => setValue(next === "" ? "" : String(next))}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            {texts.cancel}
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={value === ""}>
            {texts.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
