/**
 * Skupiny DPH editoru řádků a jejich úpravy.
 * Vlastní: náhled skupin kód × sazba (computeVatGroups), přepisy „dle dokladu“, jednorázová
 *   dorovnání řádku s největším základem, pomocníka „Cena s DPH“, Rozdíl patičky a položky skupin.
 * Nesmí: ukládat ani vytvářet řádky daně – přepisy a řádky předává rodiči přes callbacky.
 */
import * as React from "react";

import type { JournalEditorTexts } from "../../../ds-texts";
import { formatAmount } from "../../../lib/format";
import type { JournalLinesEditorProps } from "./journal-editor-types";
import type { JournalLine, VatCodeOption } from "./journal-lines";
import { isRegularLine, roundJournalAmount, toHomeAmount } from "./journal-lines-model";
import {
  applyVatAllocation,
  storedVatAllocation,
  baseFromGrossAmount,
  baseDeltaForDifference,
  computeVatGroups,
  largestBaseLineId,
  vatGroupsFromStored,
  removeVatOverride,
  resolveDifferenceActions,
  taxFromGrossTotal,
  upsertVatOverride,
  type VatGroup,
} from "./journal-vat-groups";

/** Vstup hooku skupin DPH. */
export interface JournalVatGroupsInput {
  /** Props editoru. */
  props: JournalLinesEditorProps;
  /** Texty editoru. */
  t: JournalEditorTexts;
  /** DPH zapnuto. */
  vatOn: boolean;
  /** DPH jen ke čtení. */
  vatReadOnly: boolean;
  /** Kódy DPH podle id. */
  vatCodeMap: Map<string, VatCodeOption>;
  /** Doklad v cizí měně. */
  foreign: boolean;
  /** Kurz dokladu. */
  rate: number;
  /** Jednotky kurzu dokladu. */
  rateAmount: number;
}

/** Otevřený pomocník „Cena s DPH“ (jeden na editor). */
export interface GrossHelperState {
  /** Id řádku. */
  lineId: string;
  /** Cílový sloupec. */
  column: "amount" | "unitPrice";
  /** Zadaná částka s DPH. */
  value: string;
  /** Tlačítko, u kterého se okno otevře. */
  anchor: HTMLElement | null;
}

/** Id pole skupiny pro pruh položek a odkazy. */
export const vatGroupFieldId = (group: Pick<VatGroup, "code" | "rate">) =>
  `journal-vat-group-${group.code}-${group.rate}`;

/** Náhled skupin DPH a jejich akce. */
export function useJournalVatGroups(input: JournalVatGroupsInput) {
  const { props, t, vatOn, vatReadOnly, vatCodeMap, foreign, rate, rateAmount } = input;
  const { lines, onChange, vat } = props;
  const fxRate = props.vatExchangeRate ?? vat?.vatRate ?? rate;
  // Bez platného kurzu (0 / prázdný) null – tolerance se nehodnotí, nepočítá se s 1.
  const exchangeRate: number | null = !foreign
    ? 1
    : fxRate && fxRate > 0
      ? fxRate /
        ((props.vatExchangeRate != null
          ? props.vatExchangeRateAmount
          : vat?.vatRate
            ? vat.vatRateAmount
            : rateAmount) || 1)
      : null;
  const active = vatOn && !vatReadOnly;
  // Otevřený pomocník drží editor: buňka se při aktivaci bubliny stavu přemontuje.
  const [grossHelper, setGrossHelper] = React.useState<GrossHelperState | null>(null);
  const { vatOverrides } = props;
  // Zaúčtovaný doklad: skupiny z uložených řádků (daň z řádků daně DB), bez úprav.
  const result = React.useMemo(
    () =>
      !vatOn
        ? computeVatGroups([], vatOverrides, vatCodeMap)
        : vatReadOnly
          ? vatGroupsFromStored(lines, vatOverrides, vatCodeMap, { foreign, exchangeRate })
          : computeVatGroups(lines, vatOverrides, vatCodeMap, { foreign, exchangeRate }),
    [lines, vatOverrides, vatCodeMap, foreign, exchangeRate, vatOn, vatReadOnly],
  );
  const allocatedLines = React.useMemo(
    () =>
      active
        ? applyVatAllocation(lines, result)
        : vatOn && vatReadOnly
          ? storedVatAllocation(lines, foreign)
          : lines,
    [active, vatOn, vatReadOnly, foreign, lines, result],
  );
  const canOverride = active && Boolean(props.onVatOverridesChange);
  const severity = props.vatOverrideSeverity ?? "warning";
  const groupIssues = React.useMemo(
    () =>
      result.groups
        .filter((group) => !group.withinTolerance || group.zeroBaseOverride)
        .map((group) => ({
          groupKey: group.key,
          fieldId: vatGroupFieldId(group),
          label: `${group.code} ${group.rate} %`,
          severity,
          message: (group.zeroBaseOverride
            ? t.vatGroups.overrideZeroBase
            : t.vatGroups.overTolerance
          )
            .replace("{group}", `${group.code} ${group.rate} %`)
            .replace("{difference}", formatAmount(group.differenceHome, 2)),
        })),
    [result, severity, t.vatGroups],
  );

  const baseOf = (line: JournalLine) => Number(foreign ? line.foreignAmount : line.amount) || 0;
  const withBase = (line: JournalLine, base: number): JournalLine =>
    foreign
      ? { ...line, foreignAmount: base, amount: toHomeAmount(base, rate, rateAmount) }
      : { ...line, amount: base };
  /** Jednorázově přičte rozdíl k řádku s největším základem (ve skupině nebo celkově). */
  const adjustLargestBase = (delta: number, lineIds?: string[]) => {
    const targetId = largestBaseLineId(lines, { foreign, lineIds });
    if (!targetId || delta === 0) return;
    onChange(
      lines.map((line) =>
        line.id === targetId ? withBase(line, roundJournalAmount(baseOf(line) + delta)) : line,
      ),
    );
  };
  const setOverride = (group: VatGroup, tax: number) =>
    props.onVatOverridesChange?.(upsertVatOverride(props.vatOverrides, group, tax));
  const resetOverride = (group: VatGroup) =>
    props.onVatOverridesChange?.(removeVatOverride(props.vatOverrides, group));
  /** b) Celkem s DPH dle dokladu: přepis daně + dorovnání základu. */
  const applyGrossTotal = (group: VatGroup, total: number) => {
    const tax = taxFromGrossTotal(total, group.rate);
    setOverride(group, tax);
    adjustLargestBase(
      roundJournalAmount(total - tax - group.base),
      group.lines.map((share) => share.lineId),
    );
  };
  /** c) Základ dle dokladu: jen dorovnání řádku s největším základem. */
  const applyBaseTotal = (group: VatGroup, base: number) =>
    adjustLargestBase(
      roundJournalAmount(base - group.base),
      group.lines.map((share) => share.lineId),
    );

  /** Sazba pro pomocníka „Cena s DPH“, nebo null, když pomocník nepatří k řádku. */
  const grossHelperRate = (line: JournalLine) => {
    if (!active) return null;
    const code = vatCodeMap.get(line.vatCodeId ?? "");
    if (!code?.hasTax || code.selfAssessment || line.vatManual) return null;
    return code.rate ?? line.vatRate ?? null;
  };
  /** Základ z částky s DPH na přesnost sloupce. */
  const grossToBase = (gross: number, vatRate: number, precision: number) =>
    baseFromGrossAmount(gross, vatRate, precision);

  const regular = lines.filter(isRegularLine);
  /** Skupina řádku s největším základem (cíl Dorovnat základ). */
  const largestGroup = () => {
    const targetId = largestBaseLineId(regular, { foreign });
    return result.groups.find((group) => group.lines.some((share) => share.lineId === targetId));
  };
  // Cizí měna: zaokrouhlení (měna firmy) a Rozdíl (měna dokladu) nelze míchat – volba se nenabízí.
  const roundingLimit = foreign ? undefined : props.roundingLimit;
  const difference = (amount: number, currentRounding = 0) =>
    resolveDifferenceActions({
      difference: amount,
      groups: result.groups.filter((group) => group.rate > 0 && !group.selfAssessment),
      lineCount: regular.length,
      roundingLimit,
      currentRounding,
      baseBalanceable: baseDeltaForDifference(largestGroup(), amount) !== null,
      editable: !vatReadOnly && regular.length > 0,
    });
  /** Dorovnat základ: posun, po kterém Rozdíl klesne na 0. */
  const balanceBase = (amount: number) => {
    const delta = baseDeltaForDifference(largestGroup(), amount);
    if (delta !== null) adjustLargestBase(delta);
  };
  return {
    vatGroups: result,
    allocatedLines,
    canOverride,
    groupIssues,
    exchangeRate,
    setOverride,
    resetOverride,
    applyGrossTotal,
    applyBaseTotal,
    adjustLargestBase,
    grossHelperRate,
    grossToBase,
    grossHelper,
    setGrossHelper,
    difference,
    balanceBase,
  };
}

/** Výsledek `useJournalVatGroups`. */
export type JournalVatGroupsState = ReturnType<typeof useJournalVatGroups>;
