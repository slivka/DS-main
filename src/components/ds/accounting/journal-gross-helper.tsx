/**
 * Pomocník „Cena s DPH“ v buňce Částka / Jedn. cena a v detailu řádku.
 * Vlastní: lehké tlačítko v buňce a jedno sdílené okno na editor (otevřené u aktivního tlačítka)
 *   se zadáním částky s DPH; zapíše základ round(s DPH × 100 / (100 + sazba)) na přesnost sloupce.
 * Nesmí: vkládat okno do každé buňky (výkon) ani nic ukládat či měnit daň.
 */
import { Calculator } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover";
import { DecimalInput } from "../form/decimal-input";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine } from "./journal-lines";

/** Props tlačítka pomocníka ceny s DPH. */
export interface JournalGrossHelperProps {
  /** Řádek dokladu. */
  line: JournalLine;
  /** Cílový sloupec – Částka (2 desetinná místa) nebo Jedn. cena (4). */
  column: "amount" | "unitPrice";
  /** Další třídy ikony. */
  className?: string;
  /** V pořadí Tab (detail řádku). V buňce mřížky `false`, aby Tab vedl na další sloupec. @default false */
  tabbable?: boolean;
}

const stop = (event: React.SyntheticEvent) => event.stopPropagation();

/** Tlačítko „Cena s DPH“; bez sazby (kód bez daně, samovyměření, mimo DPH) se nevykreslí. */
export function JournalGrossHelper({
  line,
  column,
  className,
  tabbable = false,
}: JournalGrossHelperProps) {
  const { editor } = useJournalEditor();
  const rate = editor.vatGroups.grossHelperRate(line);
  if (rate === null) return null;
  const state = editor.vatGroups.grossHelper;
  const open = state?.lineId === line.id && state.column === column;
  return (
    <button
      type="button"
      data-slot="journal-gross-helper"
      aria-label={editor.t.vatGroups.grossHelper}
      aria-haspopup="dialog"
      aria-expanded={open}
      // Mimo pořadí Tab: Tab z Částky vede na Kód DPH. Z klávesnice jde pomocník otevřít
      // v detailu řádku, kde je plně dosažitelný.
      tabIndex={tabbable ? undefined : -1}
      onPointerDown={stop}
      onFocus={stop}
      onMouseDown={(event) => {
        // Bez přesunu fokusu: aktivace buňky by tlačítko mezi stiskem a puštěním přemontovala.
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        editor.vatGroups.setGrossHelper(
          open ? null : { lineId: line.id, column, value: "", anchor: event.currentTarget },
        );
      }}
      onKeyDown={stop}
      className={cn(
        "ml-1 inline-flex size-[1.2em] shrink-0 items-center justify-center rounded-sm",
        "text-muted-foreground hover:text-foreground focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Calculator className="size-[0.85em]" />
    </button>
  );
}

/** Jediné okno pomocníka v editoru; otevře se u tlačítka aktivní buňky. */
export function JournalGrossHelperPopover() {
  const { editor } = useJournalEditor();
  const texts = editor.t.vatGroups;
  const state = editor.vatGroups.grossHelper;
  const line = state ? editor.props.lines.find((item) => item.id === state.lineId) : undefined;
  const rate = line ? editor.vatGroups.grossHelperRate(line) : null;
  const anchorRef = React.useMemo(() => ({ current: state?.anchor ?? null }), [state?.anchor]);
  if (!state || !line || rate === null) return null;
  const close = () => editor.vatGroups.setGrossHelper(null);
  const precision = state.column === "amount" ? 2 : 4;
  const inputId = `journal-gross-helper-${line.id}-${state.column}`;
  const apply = () => {
    if (state.value === "") return;
    const base = editor.vatGroups.grossToBase(Number(state.value), rate, precision);
    if (state.column === "amount") editor.patch(line.id, editor.amountValues(base));
    else editor.updateCalculated(line, { unitPrice: base });
    close();
  };
  return (
    <Popover open onOpenChange={(next) => (next ? undefined : close())}>
      {anchorRef.current ? (
        <PopoverAnchor virtualRef={anchorRef as React.RefObject<HTMLElement>} />
      ) : null}
      <PopoverContent
        data-slot="journal-gross-helper-content"
        className="w-64 space-y-2"
        onClick={stop}
        onFocus={stop}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") apply();
        }}
      >
        <Label htmlFor={inputId}>{texts.grossHelperField.replace("{rate}", String(rate))}</Label>
        <DecimalInput
          id={inputId}
          autoFocus
          value={state.value === "" ? undefined : Number(state.value)}
          decimals={precision}
          onChange={(next) =>
            editor.vatGroups.setGrossHelper({ ...state, value: next === "" ? "" : String(next) })
          }
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={close}>
            {texts.cancel}
          </Button>
          <Button type="button" size="sm" onClick={apply} disabled={state.value === ""}>
            {texts.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
