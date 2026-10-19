/**
 * Rekapitulace DPH pod mřížkou editoru řádků (2.109.0).
 * Vlastní: řádky skupin kód × sazba a pevných daní (Kód DPH · Sazba · Základ · DPH · Celkem),
 *   sbalitelné částky v měně firmy u cizí měny a úpravy skupiny „dle dokladu“.
 * Nesmí: počítat daň – výsledek dodává useJournalVatGroups (stejný výpočet jako databáze).
 */
import * as React from "react";
import { AlertTriangle, ChevronRight, Info, Pencil } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { DecimalInput } from "../form/decimal-input";
import { useJournalEditor } from "./journal-editor-context";
import type { VatGroup } from "./journal-vat-groups";
import { vatGroupFieldId } from "./useJournalVatGroups";

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
function GroupAdjust({ group }: { group: VatGroup }) {
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
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-slot="journal-vat-adjust"
          aria-label={`${texts.adjust} – ${name}`}
          className="size-[var(--control-h)]"
        >
          <Pencil className="size-[0.9em]" />
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

const amount = (value: number) => formatAmount(value, 2);
const CELL = "px-2 py-1 text-right font-mono tabular-nums whitespace-nowrap";

/** Řádek skupiny DPH. */
function GroupRow({ group, showHome }: { group: VatGroup; showHome: boolean }) {
  const { editor } = useJournalEditor();
  const { vatGroups, t } = editor;
  const texts = t.vatGroups;
  const issue = vatGroups.groupIssues.find((item) => item.groupKey === group.key);
  return (
    <tr
      data-slot="journal-vat-group"
      data-group={group.key}
      className="h-[var(--control-h)] border-t"
    >
      <td className="px-2 py-1">{group.code}</td>
      <td className={CELL}>{group.rate} %</td>
      <td className={CELL}>{amount(group.base)}</td>
      <td
        id={vatGroupFieldId(group)}
        tabIndex={issue ? 0 : undefined}
        aria-invalid={issue?.severity === "error" || undefined}
        data-warning={issue?.severity === "warning" || undefined}
        className={cn(
          CELL,
          // Rámeček uvnitř buňky – stav nemění výšku řádku (pravidlo 2.107).
          issue?.severity === "error" && "text-destructive ring-1 ring-inset ring-destructive",
          issue?.severity === "warning" && "text-warning ring-1 ring-inset ring-warning",
        )}
      >
        <span className="inline-flex items-center justify-end gap-1">
          {issue ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle role="img" aria-label={issue.message} className="size-[0.9em]" />
              </TooltipTrigger>
              <TooltipContent>{issue.message}</TooltipContent>
            </Tooltip>
          ) : null}
          {group.overridden ? (
            // Vypočtená daň a rozdíl v bublině – pod částkou nic, výška řádku stálá.
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  data-slot="journal-vat-calculated"
                  aria-label={`${texts.calculatedInfo}: ${texts.calculated} ${amount(group.calculatedTax)} · ${texts.difference} ${amount(group.difference)}`}
                  className="inline-flex text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Info className="size-[0.9em]" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {texts.calculated} {amount(group.calculatedTax)} · {texts.difference}{" "}
                {amount(group.difference)}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {amount(group.tax)}
        </span>
      </td>
      <td className={CELL}>{amount(group.gross)}</td>
      {showHome ? (
        <>
          <td className={CELL}>{amount(group.baseHome)}</td>
          <td className={CELL}>{amount(group.taxHome)}</td>
        </>
      ) : null}
      <td className="px-1 py-1 text-right whitespace-nowrap">
        {vatGroups.canOverride ? (
          <>
            {group.overridden ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-slot="journal-vat-reset"
                className="h-[var(--control-h)]"
                onClick={() => vatGroups.resetOverride(group)}
              >
                {texts.resetVat}
              </Button>
            ) : null}
            <GroupAdjust group={group} />
          </>
        ) : null}
      </td>
    </tr>
  );
}

/** Rekapitulace DPH; vykreslí se jen u dokladu, který vstupuje do DPH. */
export function JournalVatRecap() {
  const { editor } = useJournalEditor();
  const { vatGroups, t, foreign, vatOn } = editor;
  const texts = t.vatGroups;
  // Sbalitelné sloupce v měně firmy řídí aplikace přes `recap` (žádný vnitřní stav).
  const recap = editor.props.recap;
  const showHome = Boolean(recap?.vatHomeOpen);
  const onHomeChange = recap?.onVatHomeOpenChange;
  const { groups, fixed } = vatGroups.vatGroups;
  // Zaúčtovaný doklad rekapitulaci ukáže jen ke čtení (úpravy skrývá canOverride).
  if (!vatOn || (groups.length === 0 && fixed.length === 0)) return null;
  const home = editor.homeMark;
  const homeOn = foreign && showHome;
  return (
    <section data-slot="journal-vat-recap" aria-label={texts.title} className="border-t text-sm">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="font-medium">{texts.title}</span>
        {foreign && onHomeChange ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showHome}
            data-slot="journal-vat-home-toggle"
            onClick={() => onHomeChange(!showHome)}
            className="h-[var(--control-h)]"
          >
            {texts.toggleHome}
            <ChevronRight
              className={cn("size-[1em] transition-transform", showHome && "rotate-90")}
            />
          </Button>
        ) : null}
      </div>
      <table className="w-full">
        <thead className="text-muted-foreground">
          <tr>
            <th className="px-2 py-1 text-left font-normal">{texts.code}</th>
            <th className="px-2 py-1 text-right font-normal">{texts.rate}</th>
            <th className="px-2 py-1 text-right font-normal">{texts.base}</th>
            <th className="px-2 py-1 text-right font-normal">{texts.vat}</th>
            <th className="px-2 py-1 text-right font-normal">{texts.gross}</th>
            {homeOn ? (
              <>
                <th className="px-2 py-1 text-right font-normal">
                  {texts.baseHome.replace("{currency}", home)}
                </th>
                <th className="px-2 py-1 text-right font-normal">
                  {texts.vatHome.replace("{currency}", home)}
                </th>
              </>
            ) : null}
            <th className="w-px" />
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <GroupRow key={group.key} group={group} showHome={homeOn} />
          ))}
          {fixed.map((item) => {
            const code = editor.vatCodeMap.get(item.vatCodeId);
            return (
              <tr
                key={item.lineId}
                data-slot="journal-vat-fixed"
                className="h-[var(--control-h)] border-t"
              >
                <td className="px-2 py-1">{code?.code ?? item.vatCodeId}</td>
                <td className={CELL}>{code?.rate ?? ""} %</td>
                <td className={CELL}>{amount(item.base)}</td>
                <td className={CELL}>
                  <span className="sr-only">{texts.fixedTax}</span>
                  {amount(item.tax)}
                </td>
                <td className={CELL}>{amount(item.base + item.tax)}</td>
                {homeOn ? (
                  <>
                    <td className={CELL}>{amount(item.base * vatGroups.exchangeRate)}</td>
                    <td className={CELL}>{amount(item.tax * vatGroups.exchangeRate)}</td>
                  </>
                ) : null}
                <td />
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
