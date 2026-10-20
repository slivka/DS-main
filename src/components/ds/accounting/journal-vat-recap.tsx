/**
 * Rekapitulace DPH pod mřížkou editoru řádků (2.109.0; oddíly a tužka opravy 2.118.0).
 * Vlastní: oddíl „V režimu DPH“ (Kód · Základ · DPH · Celkem, „z toho bez nároku“, štítek KH)
 *   a „Mimo DPH“ (jen základ), sbalitelné částky v měně firmy, ruční opravu skupiny
 *   (tužka = zrušit, bublina = vypočteno a rozdíl) a informativní text pod rekapitulací.
 * Nesmí: počítat daň – výsledek dodává useJournalVatGroups (stejný výpočet jako databáze).
 */
import * as React from "react";
import { AlertTriangle, ChevronRight, Pencil } from "lucide-react";
import { GroupAdjust } from "./journal-vat-adjust";

import { mulDivRound } from "../../../lib/decimal-round";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useJournalEditor } from "./journal-editor-context";
import type { VatCodeOption } from "./journal-lines";
import type { VatGroup } from "./journal-vat-groups";
import { vatCodeMenuLabel } from "./vat-code-labels";
import { vatGroupFieldId } from "./useJournalVatGroups";

const amount = (value: number) => formatAmount(value, 2);
/** Pevná daň v měně firmy jako DB round(x × kurz, 2); bez platného kurzu prázdné. */
const fixedHome = (value: number, rate: number | null, unit: number) =>
  rate === null ? "" : amount(mulDivRound(value, rate, unit, 2));
const CELL = "px-2 py-1 text-right font-mono tabular-nums whitespace-nowrap";

/** Název kódu v rekapitulaci: „Z – Tuzemsko základní (21 %)“ + štítek oddílu KH. */
function CodeCell({ code, fallback }: { code: VatCodeOption | undefined; fallback: string }) {
  const { editor } = useJournalEditor();
  const kh = editor.props.vat?.showKhSection !== false ? code?.khSection : undefined;
  const label = code ? vatCodeMenuLabel(code) : fallback;
  return (
    <td className="max-w-0 px-2 py-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate" title={label}>
          {label}
        </span>
        {kh ? (
          <span
            data-slot="journal-vat-kh"
            className="ds-badge inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-1.5 text-xs leading-none text-muted-foreground"
          >
            {editor.dsTexts.vatFive.khSection.replace("{section}", kh)}
          </span>
        ) : null}
      </span>
    </td>
  );
}

/** Opravená daň: tužka; bublina ukáže vypočtenou daň a rozdíl, klik opravu zruší. */
function OverrideMark({ group }: { group: VatGroup }) {
  const { editor } = useJournalEditor();
  const { vatGroups, t } = editor;
  const texts = t.vatGroups;
  const info = `${texts.calculated} ${amount(group.calculatedTax)} · ${texts.difference} ${amount(group.difference)}`;
  const canReset = vatGroups.canOverride && !group.selfAssessment;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot={canReset ? "journal-vat-reset" : "journal-vat-calculated"}
          aria-label={`${texts.calculatedInfo}: ${info}${canReset ? ` – ${editor.dsTexts.vatFive.cancelOverride}` : ""}`}
          disabled={!canReset && undefined}
          onClick={canReset ? () => vatGroups.resetOverride(group) : undefined}
          className="inline-flex text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Pencil className="size-[0.9em]" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {info}
        {canReset ? <div>{editor.dsTexts.vatFive.cancelOverride}</div> : null}
      </TooltipContent>
    </Tooltip>
  );
}

/** Řádek skupiny DPH. */
function GroupRow({ group, showHome }: { group: VatGroup; showHome: boolean }) {
  const { editor } = useJournalEditor();
  const { vatGroups } = editor;
  const issue = vatGroups.groupIssues.find((item) => item.groupKey === group.key);
  const code = editor.vatCodeMap.get(group.vatCodeId);
  const nonDeductible = editor.props.vat?.nonDeductibleByCode?.[group.vatCodeId] ?? 0;
  const span = showHome ? 6 : 4;
  return (
    <>
      <tr
        data-slot="journal-vat-group"
        data-group={group.key}
        className="h-[var(--control-h)] border-t"
      >
        <CodeCell code={code} fallback={`${group.code} ${group.rate} %`} />
        <td className={CELL}>{amount(group.base)}</td>
        <td
          id={vatGroupFieldId(group)}
          tabIndex={issue ? 0 : undefined}
          aria-invalid={issue?.severity === "error" || undefined}
          data-warning={issue?.severity === "warning" || undefined}
          data-overridden={group.overridden || undefined}
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
            {group.overridden ? <OverrideMark group={group} /> : null}
            {amount(group.tax)}
          </span>
        </td>
        <td className={CELL}>{amount(group.gross)}</td>
        {showHome ? (
          <>
            <td className={CELL}>
              {vatGroups.exchangeRate === null ? "" : amount(group.baseHome)}
            </td>
            <td className={CELL}>{vatGroups.exchangeRate === null ? "" : amount(group.taxHome)}</td>
          </>
        ) : null}
        <td className="px-1 py-1 text-right whitespace-nowrap">
          {vatGroups.canOverride &&
          !group.selfAssessment &&
          (!group.overridden || editor.props.vat?.overrideInMenu) ? (
            <GroupAdjust group={group} />
          ) : null}
        </td>
      </tr>
      {nonDeductible !== 0 ? (
        <tr data-slot="journal-vat-non-deductible" className="text-muted-foreground">
          <td className="py-0.5 pl-6 pr-2 text-xs">{editor.dsTexts.vatFive.nonDeductible}</td>
          <td />
          <td className={cn(CELL, "py-0.5 text-xs")}>{amount(nonDeductible)}</td>
          <td colSpan={span - 2} />
        </tr>
      ) : null}
    </>
  );
}

/** Nadpis oddílu rekapitulace. */
function SectionRow({ label, slot, span }: { label: string; slot: string; span: number }) {
  return (
    <tr data-slot={slot} className="border-t">
      <th
        colSpan={span}
        scope="colgroup"
        className="px-2 pt-1.5 pb-0.5 text-left text-xs font-medium text-muted-foreground"
      >
        {label}
      </th>
    </tr>
  );
}

/** Rekapitulace DPH; vykreslí se jen u dokladu, který vstupuje do DPH. */
export function JournalVatRecap() {
  const { editor } = useJournalEditor();
  const { vatGroups, t, foreign, vatOn } = editor;
  const texts = t.vatGroups;
  const vatFive = editor.dsTexts.vatFive;
  // Sbalitelné sloupce v měně firmy řídí aplikace přes `recap` (žádný vnitřní stav).
  const recap = editor.props.recap;
  const showHome = Boolean(recap?.vatHomeOpen);
  const onHomeChange = recap?.onVatHomeOpenChange;
  const { groups, fixed } = vatGroups.vatGroups;
  const note = editor.props.vat?.recapNote;
  // Zaúčtovaný doklad rekapitulaci ukáže jen ke čtení (úpravy skrývá canOverride).
  if (!vatOn || (groups.length === 0 && fixed.length === 0)) return null;
  const home = editor.homeMark;
  const homeOn = foreign && showHome;
  const span = homeOn ? 7 : 5;
  const outside = (group: VatGroup) =>
    editor.vatCodeMap.get(group.vatCodeId)?.menuGroup === "outside";
  const inVat = groups.filter((group) => !outside(group));
  const outsideGroups = groups.filter(outside);
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
      <table className="w-full table-fixed">
        <thead className="text-muted-foreground">
          <tr>
            <th className="w-[40%] px-2 py-1 text-left font-normal">{texts.code}</th>
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
            <th className="w-[calc(var(--control-h)+0.5rem)]" />
          </tr>
        </thead>
        <tbody data-slot="journal-vat-section-in">
          {inVat.length + fixed.length > 0 ? (
            <SectionRow
              label={vatFive.sectionInVat}
              slot="journal-vat-section-in-title"
              span={span}
            />
          ) : null}
          {inVat.map((group) => (
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
                <CodeCell code={code} fallback={item.vatCodeId} />
                <td className={CELL}>{amount(item.base)}</td>
                <td className={CELL}>
                  <span className="sr-only">{texts.fixedTax}</span>
                  {amount(item.tax)}
                </td>
                <td className={CELL}>{amount(item.base + item.tax)}</td>
                {homeOn ? (
                  <>
                    <td className={CELL}>
                      {fixedHome(item.base, vatGroups.exchangeRate, vatGroups.exchangeRateAmount)}
                    </td>
                    <td className={CELL}>
                      {fixedHome(item.tax, vatGroups.exchangeRate, vatGroups.exchangeRateAmount)}
                    </td>
                  </>
                ) : null}
                <td />
              </tr>
            );
          })}
        </tbody>
        {outsideGroups.length > 0 ? (
          <tbody
            data-slot="journal-vat-section-outside"
            className="border-t-2 text-muted-foreground"
          >
            <SectionRow
              label={vatFive.sectionOutsideVat}
              slot="journal-vat-section-outside-title"
              span={span}
            />
            {outsideGroups.map((group) => (
              <tr
                key={group.key}
                data-slot="journal-vat-outside"
                className="h-[var(--control-h)] border-t"
              >
                <CodeCell code={editor.vatCodeMap.get(group.vatCodeId)} fallback={group.code} />
                <td className={CELL}>{amount(group.base)}</td>
                <td colSpan={span - 2} />
              </tr>
            ))}
          </tbody>
        ) : null}
      </table>
      {note ? (
        <p data-slot="journal-vat-recap-note" className="px-3 py-1 text-xs text-muted-foreground">
          {note}
        </p>
      ) : null}
    </section>
  );
}
