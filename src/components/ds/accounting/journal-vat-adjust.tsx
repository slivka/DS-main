/**
 * Úprava skupiny DPH „dle dokladu“ (popover: DPH / Celkem s DPH / Základ dle dokladu).
 * Vlastní: okno úprav a spoušť (tužka, u `vat.overrideInMenu` akce ⋯).
 * Nesmí: počítat daň – volá akce useJournalVatGroups.
 */
import * as React from "react";
import { MoreHorizontal, Pencil } from "lucide-react";

import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { DecimalInput } from "../form/decimal-input";
import { useJournalEditor } from "./journal-editor-context";
import type { VatGroup } from "./journal-vat-groups";

type AdjustMode = "vat" | "gross" | "base";

/** Jedno pole úpravy skupiny s tlačítkem Použít. */
function AdjustField({
  id,
  label,
  initial,
  onApply,
  applyLabel,
}: {
  id: string;
  label: string;
  initial: number;
  onApply: (value: number) => void;
  applyLabel: string;
}) {
  const [value, setValue] = React.useState(String(initial));
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <DecimalInput id={id} value={value} decimals={2} onChange={setValue} />
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-slot={`journal-vat-apply-${id.split("-").pop()}`}
          className="h-[var(--control-h)]"
          disabled={value === ""}
          onClick={() => onApply(Number(value))}
        >
          {applyLabel}
        </Button>
      </div>
    </div>
  );
}

/** Okno úprav skupiny „dle dokladu“. */
export function GroupAdjust({ group }: { group: VatGroup }) {
  const { editor } = useJournalEditor();
  const { vatGroups, t } = editor;
  const texts = t.vatGroups;
  const [open, setOpen] = React.useState(false);
  const baseId = React.useId();
  const run = (mode: AdjustMode, value: number) => {
    if (mode === "vat") vatGroups.setOverride(group, value);
    if (mode === "gross") vatGroups.applyGrossTotal(group, value);
    if (mode === "base") vatGroups.applyBaseTotal(group, value);
    setOpen(false);
  };
  const name = `${group.code} ${group.rate} %`;
  // Vydané doklady (overrideInMenu): oprava jen jako akce ⋯ řádku, ne viditelná tužka.
  const inMenu = Boolean(editor.props.vat?.overrideInMenu);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-slot="journal-vat-adjust"
          data-menu={inMenu || undefined}
          aria-label={`${inMenu ? editor.dsTexts.vatFive.rowActions : texts.adjust} – ${name}`}
          className="size-[var(--control-h)]"
        >
          {inMenu ? (
            <MoreHorizontal className="size-[0.9em]" />
          ) : (
            <Pencil className="size-[0.9em]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3" data-slot="journal-vat-adjust-content">
        {/* Nulový základ: DB přepis ≠ 0 odmítne (vat_override_zero_base) – a/b se nenabízí. */}
        {group.base !== 0 ? (
          <>
            <AdjustField
              id={`${baseId}-vat`}
              label={texts.vatByDocument}
              initial={group.tax}
              applyLabel={texts.apply}
              onApply={(value) => run("vat", value)}
            />
            <AdjustField
              id={`${baseId}-gross`}
              label={texts.grossByDocument}
              initial={group.gross}
              applyLabel={texts.apply}
              onApply={(value) => run("gross", value)}
            />
          </>
        ) : null}
        <AdjustField
          id={`${baseId}-base`}
          label={texts.baseByDocument}
          initial={group.base}
          applyLabel={texts.apply}
          onApply={(value) => run("base", value)}
        />
      </PopoverContent>
    </Popover>
  );
}
