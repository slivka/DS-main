/**
 * Čistý model editoru řádků dokladu.
 * Vlastní: identifikátory sloupců, zaokrouhlení, pořadí a přečíslování řádků,
 *   úpravy seznamu řádků (přidání, duplikace, odebrání), hledání a součty k doplatku.
 * Nesmí: používat React, DOM ani texty – vše je vstup → výstup a testuje se samostatně.
 */
import { arrayMove } from "@dnd-kit/sortable";

import { formatAccountCode } from "./account-code";
import { formatCodeName } from "../../../lib/code-format";
import type { JournalLine, JournalLineColumn } from "./journal-lines";
import type { JournalEditorTexts } from "../../../ds-texts";

/** Sdílené sloupce stran (režim `sideFields="shared"`). */
export const SHARED_COLUMNS: JournalLineColumn[] = ["dimensionId", "vs", "partnerId"];
/** Sloupce stran MD / DAL zvlášť (režim `sideFields="split"`). */
export const SPLIT_COLUMNS: JournalLineColumn[] = [
  "debitVs",
  "creditVs",
  "debitPartnerId",
  "creditPartnerId",
  "debitDimensionId",
  "creditDimensionId",
];
/** Výchozí editovatelné sloupce, když volající nepředá `editableFields`. */
export const ALL_EDITABLE: JournalLineColumn[] = [
  "counterAccount",
  "debitAccount",
  "creditAccount",
  "amount",
  "foreignAmount",
  "text",
  "quantity",
  "unitId",
  "unitPrice",
  "nonTax",
  ...SHARED_COLUMNS,
  ...SPLIT_COLUMNS,
];
/** Sloupce účtu v krátké (číslo) a rozšířené (číslo + název) formě. */
export type JournalAccountColumnId =
  | "counterAccount"
  | "counterAccountName"
  | "debitAccount"
  | "debitAccountName"
  | "creditAccount"
  | "creditAccountName";
/** Všechny sloupce mřížky editoru včetně systémových. */
export type ColumnId =
  | JournalLineColumn
  | JournalAccountColumnId
  | "row"
  | "homeAmount"
  | "actions";
/** Rozpracovaná editace buňky; `original` slouží k vrácení přes Esc. */
export type EditState = { rowId: string; column: ColumnId; seed?: string; original: JournalLine };

const ACCOUNT_COLUMN_IDS: readonly JournalAccountColumnId[] = [
  "counterAccount",
  "counterAccountName",
  "debitAccount",
  "debitAccountName",
  "creditAccount",
  "creditAccountName",
];
/** Množina sloupců účtu. */
export const ACCOUNT_COLUMNS = new Set<string>(ACCOUNT_COLUMN_IDS);
/** Typová stráž sloupce účtu. */
export const isAccountColumn = (column: string): column is JournalAccountColumnId =>
  ACCOUNT_COLUMNS.has(column);
/** Datový sloupec řádku, do kterého se ukládá účet zobrazený v daném sloupci. */
export const accountDataColumn = (
  column: JournalAccountColumnId,
): "counterAccount" | "debitAccount" | "creditAccount" =>
  column === "counterAccountName" || column === "counterAccount"
    ? "counterAccount"
    : column === "debitAccountName" || column === "debitAccount"
      ? "debitAccount"
      : "creditAccount";
/** Rozšířená forma účtu (číslo + název). */
export const isAccountNameColumn = (column: string) => column.endsWith("AccountName");
/** Datový sloupec pro validaci a editovatelnost (sloupce účtu → účet řádku). */
export const dataColumnOf = (column: ColumnId): JournalLineColumn =>
  isAccountColumn(column)
    ? accountDataColumn(column)
    : // Systémové sloupce (row, homeAmount, actions) v datech nejsou; vyhledání v mapách vrátí undefined.
      (column as JournalLineColumn);
/** Sloupce zakázky. */
export const DIMENSION_COLUMNS = new Set<string>([
  "dimensionId",
  "debitDimensionId",
  "creditDimensionId",
]);
/** Sloupce partnera. */
export const PARTNER_COLUMNS = new Set<string>(["partnerId", "debitPartnerId", "creditPartnerId"]);
/** Sloupce variabilního symbolu. */
export const VS_COLUMNS = new Set<string>(["vs", "debitVs", "creditVs"]);
/** Sloupce DPH. */
export const VAT_COLUMNS = new Set<string>([
  "vatCodeId",
  "vatRate",
  "vatAmount",
  "grossAmount",
  "vatDeduction",
  "vatDeductionShare",
  "pdpSubjectCode",
]);
/** Číselné sloupce DPH editované jako částka. */
export const VAT_NUMERIC = new Set<string>(["vatAmount", "grossAmount"]);
/** Číselné sloupce řádku. */
export const NUMERIC_COLUMNS = new Set<string>(["amount", "quantity", "unitPrice"]);
/** Řádek patří do mřížky (není řádek daně ani náhled daně). */
export const isGridLine = (line: JournalLine) => !line.isVatLine && !line.isVatPreview;
/** Řádek je připnutý na konec (zaokrouhlení, kurzové zaokrouhlení). */
export const isPinnedLine = (line: JournalLine) => Boolean(line.isRounding || line.isFxRounding);
/** Běžný řádek základu (ne připnutý, ne daň). */
export const isRegularLine = (line: JournalLine) => isGridLine(line) && !isPinnedLine(line);
/** Nové id řádku. */
export const newJournalLineId = () => `line-${Math.random().toString(36).slice(2, 10)}`;

/** Zaokrouhlí částku na haléře. */
export const roundJournalAmount = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
/** Účet ve tvaru 221.001, rozšířená forma i s názvem. */
export const formatJournalAccountDisplay = (code: string, name?: string, extended = false) =>
  formatCodeName(formatAccountCode(code), extended ? name : undefined);
/** Částka řádku z množství a ceny za MJ; bez obou hodnot `undefined`. */
export const calculateLineAmount = (quantity?: number, unitPrice?: number) =>
  quantity != null && unitPrice != null ? roundJournalAmount(quantity * unitPrice) : undefined;
/** Částka v domácí měně z částky v měně dokladu. */
export const toHomeAmount = (value: number, rate: number | null | undefined, rateAmount: number) =>
  roundJournalAmount((value * (rate || 0)) / rateAmount);
/** Popisky částek se značkou měny z dat. */
export const journalAmountLabels = (
  texts: Pick<JournalEditorTexts, "amount" | "homeAmount" | "foreignAmount">,
  documentSymbol: string,
  homeSymbol: string,
) => ({
  amount: texts.amount,
  homeAmount: texts.homeAmount.replace("{symbol}", homeSymbol),
  foreignAmount: texts.foreignAmount.replace("{symbol}", documentSymbol),
});
/** Návrh zaokrouhlení: u zadaného celku rozdíl v limitu, u počítaného na celé jednotky. */
export const roundingSuggestion = ({
  totalMode,
  expectedAmount,
  linesTotal,
  currentRounding = 0,
  limit = 0.5,
}: {
  totalMode: "entered" | "computed";
  expectedAmount?: number;
  linesTotal: number;
  currentRounding?: number;
  limit?: number;
}) => {
  if (totalMode === "computed") return roundJournalAmount(Math.round(linesTotal) - linesTotal);
  if (expectedAmount === undefined) return 0;
  const difference = roundJournalAmount(expectedAmount - linesTotal - currentRounding);
  return Math.abs(difference) <= limit ? difference : 0;
};
/** Pořadí řádků gridu: řádky základu, Kurzové zaokrouhlení, Zaokrouhlení. Řádky daně (isVatLine) se do gridu nezařazují. */
export const orderJournalLines = (lines: JournalLine[]) => {
  const grid = lines.filter(isGridLine);
  return [
    ...grid.filter((line) => !isPinnedLine(line)),
    ...grid.filter((line) => line.isFxRounding),
    ...grid.filter((line) => line.isRounding),
  ];
};
/** Přesun řádku `activeId` na místo `overId`; připnuté řádky zůstanou na konci. */
export const reorderJournalLines = (lines: JournalLine[], activeId: string, overId: string) => {
  const movable = lines.filter(isRegularLine);
  const from = movable.findIndex((line) => line.id === activeId);
  const to = movable.findIndex((line) => line.id === overId);
  if (from < 0 || to < 0 || from === to) return orderJournalLines(lines);
  return [
    ...arrayMove(movable, from, to),
    ...lines.filter((line) => isGridLine(line) && line.isFxRounding),
    ...lines.filter((line) => isGridLine(line) && line.isRounding),
  ];
};
/** Posun řádku o `delta` mezi zobrazenými běžnými řádky; `null` = není kam. */
export const moveJournalLine = (
  lines: JournalLine[],
  displayed: JournalLine[],
  id: string,
  delta: number,
) => {
  const movable = displayed.filter((line) => !isPinnedLine(line));
  const index = movable.findIndex((line) => line.id === id);
  const target = movable[index + delta];
  return target ? reorderJournalLines(lines, id, target.id) : null;
};

const tail = (lines: JournalLine[]) =>
  lines.filter((line) => line.isFxRounding || line.isRounding || line.isVatLine);
/** Přidá řádek za běžné řádky (před připnuté a řádky daně). */
export const appendJournalLine = (lines: JournalLine[], line: JournalLine) => [
  ...lines.filter(isRegularLine),
  line,
  ...tail(lines),
];
/** Duplikuje řádek hned pod originál; ruční daň a vazby na DB se nekopírují. */
export const duplicateJournalLine = (lines: JournalLine[], line: JournalLine, id: string) => {
  const next = lines.filter(isRegularLine);
  const index = next.findIndex((item) => item.id === line.id);
  next.splice(index + 1, 0, {
    ...line,
    id,
    vatManual: false,
    vatAmount: undefined,
    vatAmountHome: undefined,
    vatBaseHome: undefined,
    vatParentLineId: undefined,
  });
  return [...next, ...tail(lines)];
};
/** Odebere řádek; vrací i podklad pro vrácení zpět na původní místo. */
export const removeJournalLine = (lines: JournalLine[], line: JournalLine) => {
  const index = lines.findIndex((item) => item.id === line.id);
  const remaining = lines.filter((item) => item.id !== line.id);
  return {
    remaining,
    restore: () => [...remaining.slice(0, index), line, ...remaining.slice(index)],
  };
};
/** Vstup pro nový prázdný řádek. */
export interface NewJournalLineInput {
  /** Id nového řádku. */
  id: string;
  /** Hlavní účet knihy, pokud editor pracuje v režimu jen protiúčtu. */
  mainAccount?: { accountId: string; side: "MD" | "D" };
  /** Výchozí hodnoty řádku od volajícího. */
  defaults?: Partial<Omit<JournalLine, "id">>;
  /** Kód DPH: předchozí řádek → výchozí kód knihy; `undefined` = DPH vypnuto. */
  vatCodeId?: string | null;
}
/** Nový prázdný řádek (`isBlank`) s hlavním účtem a výchozími hodnotami. */
export const createJournalLine = ({
  id,
  mainAccount,
  defaults,
  vatCodeId,
}: NewJournalLineInput): JournalLine => ({
  ...(vatCodeId !== undefined ? { vatCodeId } : {}),
  id,
  debitAccount: mainAccount?.side === "MD" ? mainAccount.accountId : null,
  creditAccount: mainAccount?.side === "D" ? mainAccount.accountId : null,
  counterAccount: null,
  amount: undefined,
  nonTax: defaults?.nonTax ?? false,
  text: defaults?.text,
  dimensionId: defaults?.dimensionId,
  vs: defaults?.vs,
  partnerId: defaults?.partnerId,
  debitDimensionId: defaults?.debitDimensionId,
  creditDimensionId: defaults?.creditDimensionId,
  isBlank: true,
});
/** Kód DPH nového řádku: předchozí řádek má přednost před výchozím kódem knihy. */
export const nextLineVatCode = (regular: JournalLine[], defaultCodeId?: string | null) =>
  regular[regular.length - 1]?.vatCodeId ?? defaultCodeId ?? null;
/** Filtr řádků podle hledaného textu (bez rozlišení velikosti písmen). */
export const filterJournalLines = (lines: JournalLine[], search: string) => {
  const query = search.trim().toLocaleLowerCase("cs");
  if (!query) return lines;
  return lines.filter((line) =>
    [
      line.text,
      line.debitAccount,
      line.creditAccount,
      line.counterAccount,
      line.vs,
      line.partnerId,
      line.dimensionId,
      line.amount,
      line.foreignAmount,
      line.quantity,
      line.unitPrice,
    ].some((value) =>
      String(value ?? "")
        .toLocaleLowerCase("cs")
        .includes(query),
    ),
  );
};
/** Chyby řádků očíslované podle pořadí řádku (1 = první). */
export const numberJournalErrors = (
  lines: JournalLine[],
  errors: Map<string, Partial<Record<string, string>>>,
) =>
  lines.flatMap((line, lineIndex) =>
    Object.entries(errors.get(line.id) ?? {}).flatMap(([field, message]) =>
      message ? [{ line: lineIndex + 1, field, message }] : [],
    ),
  );
