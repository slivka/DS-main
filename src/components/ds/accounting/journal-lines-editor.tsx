import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronRight, Copy, Percent, Plus, RotateCcw, Trash2, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { formatAccountCode } from "./account-code";
import { AccountSelect, type AccountOption } from "./account-select";
import { DimensionSelect, type DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { OptionSelect, type SelectOption } from "../form/option-select";
import { DecimalInput } from "../form/decimal-input";
import { ColumnResizeHandle } from "../grid/grid-column-resize";
import { ColumnPicker } from "../grid/column-picker";
import { GridAction, GridActions } from "../grid/grid-action";
import { useGridColumns, type GridColumn } from "../grid/grid-columns";
import { GridSearch } from "../grid/grid-search";
import { GridToolbar, GridToolbarSeparator } from "../grid/grid-toolbar";
import { GridZoomContext, ZoomControl, ZoomGrid, useGridZoom } from "../grid/grid-zoom";
import { JournalLinesRecap, type JournalRecapTab } from "./journal-lines-recap";
import { amountClass, formatAmount } from "../../../lib/format";
import { useIsActivePane } from "../panes/pane-context";
import { cn } from "../../../lib/utils";
import type { SideFieldRulesFn } from "./journal-lines";
import {
  isResultAccountType,
  sideFieldRules as defaultSideFieldRules,
  type JournalLine,
  type JournalLineColumn,
  type JournalSharedSide,
} from "./journal-lines";

export type { JournalLine, JournalLineColumn, JournalRow, JournalSharedSide, SideFieldRules, SideFieldRulesFn } from "./journal-lines";
export { fromJournalRow, toJournalRow, sideFieldRules } from "./journal-lines";

export type JournalLineDefaults = Partial<Omit<JournalLine, "id">>;
/** Režim editoru: interní doklad (obě strany) nebo doklad s hlavním účtem knihy. */
export type JournalLinesMode = "internal" | "mainAccount";
/** Strana hlavního účtu – odpovídá `documents.main_account_side`. */
export type JournalMainSide = "MD" | "D";
export type JournalLineErrors = Partial<Record<JournalLineColumn, string>>;
export interface JournalLinesRounding {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  label?: string;
}

export interface JournalLinesEditorTexts {
  row: string;
  debitAccount: string;
  creditAccount: string;
  counterAccount: string;
  amount: string;
  currency: string;
  foreignAmount: string;
  rate: string;
  text: string;
  dimension: string;
  vs: string;
  partner: string;
  debitDimension: string;
  creditDimension: string;
  debitVs: string;
  creditVs: string;
  debitPartner: string;
  creditPartner: string;
  nonTax: string;
  nonTaxOn: string;
  nonTaxOff: string;
  rounding: string;
  roundingHint: string;
  detail: string;
  showDetail: string;
  hideDetail: string;
  sideDebit: string;
  sideCredit: string;
  actions: string;
  addLine: string;
  duplicateLine: string;
  removeLine: string;
  undo: string;
  removed: string;
  total: string;
  balanced: string;
  difference: string;
  remaining: string;
  fillRounding: string;
  errors: string;
  empty: string;
  debitRequired: string;
  creditRequired: string;
  amountRequired: string;
  missingVs: string;
  missingDimension: string;
}

export const DEFAULT_JOURNAL_LINES_TEXTS: JournalLinesEditorTexts = {
  row: "Ř.", debitAccount: "MD účet", creditAccount: "DAL účet", counterAccount: "Protiúčet",
  amount: "Částka v Kč",
  currency: "Měna", foreignAmount: "Částka v měně", rate: "Kurz", text: "Text",
  dimension: "Zakázka", vs: "VS", partner: "Partner",
  debitDimension: "MD zakázka", creditDimension: "DAL zakázka",
  debitVs: "MD VS", creditVs: "DAL VS",
  debitPartner: "MD partner", creditPartner: "DAL partner",
  nonTax: "Nedaňový", nonTaxOn: "Nedaňový", nonTaxOff: "Daňový – klikněte pro nedaňový",
  rounding: "Zaokrouhlení", roundingHint: "Zaokrouhlení měňte v hlavičce dokladu",
  detail: "Detail řádku", showDetail: "Zobrazit detail řádku (Alt+↓)", hideDetail: "Skrýt detail řádku (Alt+↓)",
  sideDebit: "MD", sideCredit: "DAL",
  actions: "Akce",
  addLine: "Přidat řádek", duplicateLine: "Duplikovat řádek", removeLine: "Odebrat řádek",
  undo: "Zpět", removed: "Řádek byl odebrán", total: "Celkem", balanced: "Částka odpovídá dokladu",
  difference: "Zbývá", remaining: "Zbývá rozepsat", fillRounding: "Dorovnat zaokrouhlením",
  errors: "Počet chyb", empty: "Zatím zde nejsou žádné řádky",
  debitRequired: "Vyberte účet MD", creditRequired: "Vyberte účet DAL", amountRequired: "Částka musí být nenulová",
  missingVs: "Chybí VS na straně {side}", missingDimension: "Chybí zakázka na straně {side}",
};

const SHARED_COLUMNS: JournalLineColumn[] = ["dimensionId", "vs", "partnerId"];
const SPLIT_COLUMNS: JournalLineColumn[] = [
  "debitVs", "creditVs", "debitPartnerId", "creditPartnerId", "debitDimensionId", "creditDimensionId",
];

const ALL_EDITABLE: JournalLineColumn[] = [
  "debitAccount", "creditAccount", "amount", "currency", "foreignAmount", "rate",
  "text", "nonTax", ...SHARED_COLUMNS, ...SPLIT_COLUMNS,
];

const ACCOUNT_COLUMNS = new Set<JournalLineColumn>(["debitAccount", "creditAccount"]);
const DIMENSION_COLUMNS = new Set<JournalLineColumn>(["dimensionId", "debitDimensionId", "creditDimensionId"]);
const PARTNER_COLUMNS = new Set<JournalLineColumn>(["partnerId", "debitPartnerId", "creditPartnerId"]);
const VS_COLUMNS = new Set<JournalLineColumn>(["vs", "debitVs", "creditVs"]);
const NUMERIC_COLUMNS = new Set<JournalLineColumn>(["amount", "foreignAmount", "rate"]);

type ColumnId = JournalLineColumn | "row" | "actions";
type EditState = { rowId: string; column: JournalLineColumn; seed?: string; original: JournalLine };

const newId = () => `line-${Math.random().toString(36).slice(2, 10)}`;
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const COLUMN_WIDTHS: Record<ColumnId, number> = {
  row: 70, debitAccount: 220, creditAccount: 220, amount: 170, currency: 92,
  foreignAmount: 150, rate: 110, text: 240, dimensionId: 190, vs: 120, partnerId: 220,
  debitDimensionId: 190, creditDimensionId: 190, debitVs: 120, creditVs: 120,
  debitPartnerId: 220, creditPartnerId: 220, nonTax: 110, actions: 72,
};

export interface JournalLinesEditorProps {
  lines: JournalLine[];
  onChange: (lines: JournalLine[]) => void;
  accounts: AccountOption[];
  dimensions?: DimensionOption[];
  partners?: PartnerOption[];
  currencies?: SelectOption[];
  showCurrency?: boolean;
  /** Společné nebo oddělené VS / partner / zakázka pro MD a DAL (výchozí "split"). */
  sideFields?: "shared" | "split";
  /** Na kterou stranu se ve sdíleném režimu hodnoty ukládají (výchozí "both"). */
  sharedSide?: JournalSharedSide;
  /** Režim: "internal" = MD i DAL na řádku, "mainAccount" = hlavní strana jen ke čtení, zadává se protiúčet (výchozí "internal"). */
  mode?: JournalLinesMode;
  /** Strana hlavního účtu knihy (režim "mainAccount"). */
  mainSide?: JournalMainSide;
  /** Číslo hlavního účtu knihy (režim "mainAccount"). */
  mainAccount?: string | null;
  /** Pravidla stranových polí podle účtu (výchozí sideFieldRules z design systému). */
  sideFieldRules?: SideFieldRulesFn;
  /** Zakázka je povinná u bilančních účtů. */
  dimensionRequired?: boolean;
  /** Povolení příznaku Nedaňový pro řádek (výchozí: nákladový nebo výnosový účet). */
  isNonTaxAllowed?: (line: JournalLine) => boolean;
  /** Pole, která lze upravit (výchozí všechna). Zaúčtovaný doklad předá jen povolená. */
  editableFields?: JournalLineColumn[];
  /** Celá částka dokladu, proti které se hlídá „Zbývá rozepsat“. */
  totalAmount?: number;
  /** "entered" = částka dokladu je zadaná v hlavičce, kontroluje se rozepsání. */
  totalMode?: "entered" | "computed";
  /** Limit pro dorovnání haléřovým vyrovnáním (výchozí 0,50). */
  roundingLimit?: number;
  onRoundingFill?: (amount: number) => void;
  /** Haléřové vyrovnání z hlavičky dokladu zobrazené v liště pod řádky. */
  rounding?: JournalLinesRounding;
  /** @deprecated Použijte totalAmount. */
  expectedTotal?: number;
  defaults?: JournalLineDefaults;
  validate?: (line: JournalLine) => JournalLineErrors;
  storageKey?: string;
  /** Doplňkové záložky rekapitulace; vestavěné Účtování a Zakázky zůstávají vždy. */
  recapTabs?: JournalRecapTab[];
  texts?: Partial<JournalLinesEditorTexts>;
  className?: string;
}

/** Editovatelná mřížka předkontací se zoomem, validací a ovládáním jako v Excelu. */
export const JournalLinesEditor = forwardRef<HTMLDivElement, JournalLinesEditorProps>(
  function JournalLinesEditor(
    {
      lines, onChange, accounts, dimensions = [], partners = [], currencies = [
        { value: "CZK", label: "CZK" }, { value: "EUR", label: "EUR" }, { value: "USD", label: "USD" },
      ], showCurrency = false, sideFields = "split", sharedSide = "both",
      mode = "internal", mainSide, mainAccount: mainAccountId, sideFieldRules = defaultSideFieldRules,
      dimensionRequired = false, isNonTaxAllowed, editableFields, totalAmount, totalMode = "computed",
      roundingLimit = 0.5, onRoundingFill, rounding, expectedTotal, defaults,
       validate, storageKey = "journal-lines", recapTabs = [], texts, className,
    },
    forwardedRef,
  ) {
    const paneActive = useIsActivePane();
    const t = { ...DEFAULT_JOURNAL_LINES_TEXTS, ...texts };
    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const { zoom, setZoom, density, setDensity } = useGridZoom(storageKey);
    const editable = useMemo(() => new Set(editableFields ?? ALL_EDITABLE), [editableFields]);
    const [active, setActive] = useState<{ rowId: string; column: JournalLineColumn } | null>(null);
    const [editing, setEditing] = useState<EditState | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [search, setSearch] = useState("");
    const expectedAmount = totalAmount ?? expectedTotal;

    const LABEL_KEYS: Record<JournalLineColumn, keyof JournalLinesEditorTexts> = {
      debitAccount: "debitAccount", creditAccount: "creditAccount", amount: "amount", text: "text",
      dimensionId: "dimension", vs: "vs", partnerId: "partner",
      debitDimensionId: "debitDimension", creditDimensionId: "creditDimension",
      debitVs: "debitVs", creditVs: "creditVs",
      debitPartnerId: "debitPartner", creditPartnerId: "creditPartner",
      nonTax: "nonTax", currency: "currency", foreignAmount: "foreignAmount", rate: "rate",
    };
    const label = (column: JournalLineColumn) => t[LABEL_KEYS[column]];

    const accountByCode = useMemo(
      () => new Map(accounts.map((account) => [account.code, account])),
      [accounts],
    );
    const mainAccount = mode === "mainAccount" && mainAccountId && mainSide
      ? { accountId: mainAccountId, side: mainSide } : undefined;
    const mainOption = mainAccount ? accountByCode.get(mainAccount.accountId) : undefined;
    const mainColumn: JournalLineColumn | null = mainAccount
      ? mainAccount.side === "MD" ? "debitAccount" : "creditAccount"
      : null;
    const counterColumn: JournalLineColumn | null = mainAccount
      ? mainAccount.side === "MD" ? "creditAccount" : "debitAccount"
      : null;

    /** Sloupce hlavní strany jsou jen ke čtení – doplní je hlavička dokladu. */
    const isMainSideColumn = (column: JournalLineColumn) => {
      if (!mainAccount) return false;
      const debitSide: JournalLineColumn[] = ["debitAccount", "debitVs", "debitPartnerId", "debitDimensionId"];
      const creditSide: JournalLineColumn[] = ["creditAccount", "creditVs", "creditPartnerId", "creditDimensionId"];
      return (mainAccount.side === "MD" ? debitSide : creditSide).includes(column);
    };

    const hasValue = (column: JournalLineColumn) =>
      lines.some((line) => {
        const value = line[column];
        return value !== undefined && value !== null && value !== "";
      });

    const columnDefs = useMemo<GridColumn<ColumnId>[]>(() => {
      const sideColumns: GridColumn<ColumnId>[] = sideFields === "split"
        ? SPLIT_COLUMNS.map((id) => ({ id, label: label(id), defaultVisible: hasValue(id) }))
        : SHARED_COLUMNS.map((id) => ({ id, label: label(id), locked: true }));
      return [
        { id: "row", label: t.row, locked: true },
        {
          id: "debitAccount",
          label: mainAccount ? (mainColumn === "debitAccount" ? t.debitAccount : t.counterAccount) : t.debitAccount,
          locked: true,
        },
        {
          id: "creditAccount",
          label: mainAccount ? (mainColumn === "creditAccount" ? t.creditAccount : t.counterAccount) : t.creditAccount,
          locked: true,
        },
        ...(showCurrency ? [
          { id: "currency" as const, label: t.currency, locked: true },
          { id: "foreignAmount" as const, label: t.foreignAmount, locked: true, align: "right" as const },
          { id: "rate" as const, label: t.rate, locked: true, align: "right" as const },
        ] : []),
        { id: "amount", label: t.amount, locked: true, align: "right" },
        { id: "text", label: t.text, locked: true },
        ...sideColumns,
        { id: "actions", label: t.actions, locked: true, align: "right" },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCurrency, sideFields, lines, mainAccount?.side, t.actions, t.amount, t.counterAccount, t.creditAccount, t.currency, t.debitAccount, t.dimension, t.foreignAmount, t.partner, t.rate, t.row, t.text, t.vs]);
    const columns = useGridColumns(storageKey, columnDefs);
    const visibleColumns = columns.columns.filter((column) => columns.visible[column.id]);

    /** Řádek haléřového vyrovnání je vždy poslední a jen pro čtení. */
    const orderedLines = useMemo(
      () => [...lines].sort((a, b) => Number(Boolean(a.isRounding)) - Number(Boolean(b.isRounding))),
      [lines],
    );
    const displayedLines = useMemo(() => {
      const query = search.trim().toLocaleLowerCase("cs");
      if (!query) return orderedLines;
      return orderedLines.filter((line) => {
        const values = [line.text, line.debitAccount, line.creditAccount, line.vs, line.debitVs, line.creditVs, line.amount,
          line.partnerId, line.debitPartnerId, line.creditPartnerId, line.dimensionId, line.debitDimensionId, line.creditDimensionId];
        return values.some((value) => String(value ?? "").toLocaleLowerCase("cs").includes(query))
          || [line.partnerId, line.debitPartnerId, line.creditPartnerId].some((id) => partners.find((item) => item.id === id)?.name.toLocaleLowerCase("cs").includes(query))
          || [line.dimensionId, line.debitDimensionId, line.creditDimensionId].some((id) => dimensions.find((item) => item.id === id)?.name.toLocaleLowerCase("cs").includes(query));
      });
    }, [dimensions, orderedLines, partners, search]);

    /** Chybějící povinná stranová pole – jen nápověda, rozhoduje databáze. */
    const sideIssues = (line: JournalLine): { column: JournalLineColumn; message: string }[] => {
      if (line.isRounding) return [];
      const issues: { column: JournalLineColumn; message: string }[] = [];
      (["debit", "credit"] as const).forEach((side) => {
        const code = side === "debit" ? line.debitAccount : line.creditAccount;
        const account = code ? accountByCode.get(code) : undefined;
        if (!account) return;
        const rules = sideFieldRules(account, { dimensionRequired });
        const sideLabel = side === "debit" ? t.sideDebit : t.sideCredit;
        const vsValue = (side === "debit" ? line.debitVs : line.creditVs) ?? (sideFields === "shared" ? line.vs : undefined);
        const dimensionValue = (side === "debit" ? line.debitDimensionId : line.creditDimensionId)
          ?? (sideFields === "shared" ? line.dimensionId : undefined);
        if (rules.vsRequired && !vsValue) {
          issues.push({
            column: sideFields === "shared" ? "vs" : side === "debit" ? "debitVs" : "creditVs",
            message: t.missingVs.replace("{side}", sideLabel),
          });
        }
        if (rules.dimensionRequired && !dimensionValue) {
          issues.push({
            column: sideFields === "shared" ? "dimensionId" : side === "debit" ? "debitDimensionId" : "creditDimensionId",
            message: t.missingDimension.replace("{side}", sideLabel),
          });
        }
      });
      return issues;
    };

    const validations = useMemo(() => new Map(lines.map((line) => {
      const builtIn: JournalLineErrors = {};
      if (!line.isRounding) {
        if (!line.debitAccount) builtIn.debitAccount = t.debitRequired;
        if (!line.creditAccount) builtIn.creditAccount = t.creditRequired;
        if (!Number(line.amount)) builtIn.amount = t.amountRequired;
        sideIssues(line).forEach((issue) => { builtIn[issue.column] = issue.message; });
      }
      return [line.id, { ...builtIn, ...validate?.(line) }];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })), [lines, dimensionRequired, sideFields, t.amountRequired, t.creditRequired, t.debitRequired, validate]);
    const errorCount = [...validations.values()].reduce((sum, errors) => sum + Object.values(errors).filter(Boolean).length, 0);
    const linesTotal = lines.filter((line) => !line.isRounding).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const roundingValue = rounding?.value ?? lines.filter((line) => line.isRounding).reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const total = roundMoney(linesTotal + roundingValue);
    const difference = expectedAmount === undefined ? 0 : roundMoney(expectedAmount - total);
    const showRemaining = Boolean(mainAccount) && totalMode === "entered" && expectedAmount !== undefined;
    const canFillRounding = showRemaining && difference !== 0 && Math.abs(difference) <= roundingLimit && Boolean(onRoundingFill);

    const nonTaxAllowed = (line: JournalLine) => {
      if (isNonTaxAllowed) return isNonTaxAllowed(line);
      return [line.debitAccount, line.creditAccount].some((code) =>
        isResultAccountType(code ? accountByCode.get(code) : undefined, code));
    };

    const patch = (id: string, values: Partial<JournalLine>) =>
      onChange(lines.map((line) => (line.id === id ? { ...line, ...values } : line)));

    const makeLine = (previous?: JournalLine): JournalLine => {
      const remaining = expectedAmount === undefined ? 0 : roundMoney(expectedAmount - total);
      return {
        id: newId(),
        debitAccount: mainAccount?.side === "MD" ? mainAccount.accountId : null,
        creditAccount: mainAccount?.side === "D" ? mainAccount.accountId : null,
        amount: remaining > 0 ? remaining : 0,
        text: previous?.text ?? defaults?.text,
        dimensionId: previous?.dimensionId ?? defaults?.dimensionId,
        vs: previous?.vs ?? defaults?.vs,
        partnerId: previous?.partnerId ?? defaults?.partnerId,
        debitVs: previous?.debitVs ?? defaults?.debitVs,
        creditVs: previous?.creditVs ?? defaults?.creditVs,
        debitPartnerId: previous?.debitPartnerId ?? defaults?.debitPartnerId,
        creditPartnerId: previous?.creditPartnerId ?? defaults?.creditPartnerId,
        debitDimensionId: previous?.debitDimensionId ?? defaults?.debitDimensionId,
        creditDimensionId: previous?.creditDimensionId ?? defaults?.creditDimensionId,
        currency: previous?.currency ?? defaults?.currency ?? (showCurrency ? "EUR" : "CZK"),
        foreignAmount: previous?.foreignAmount ?? defaults?.foreignAmount,
        rate: previous?.rate ?? defaults?.rate,
      };
    };
    const lastEditable = () => orderedLines.filter((line) => !line.isRounding).at(-1);
    const addLine = () => { setSearch(""); onChange([...lines, makeLine(lastEditable())]); };
    const duplicate = (line: JournalLine) => {
      const index = lines.findIndex((item) => item.id === line.id);
      onChange([...lines.slice(0, index + 1), { ...line, id: newId() }, ...lines.slice(index + 1)]);
    };
    const remove = (line: JournalLine) => {
      const index = lines.findIndex((item) => item.id === line.id);
      const remaining = lines.filter((item) => item.id !== line.id);
      onChange(remaining);
      toast(t.removed, { action: { label: t.undo, onClick: () => onChange([...remaining.slice(0, index), line, ...remaining.slice(index)]) } });
    };
    const toggleNonTax = (line: JournalLine) => {
      if (!nonTaxAllowed(line) || !editable.has("nonTax") || line.isRounding) return;
      patch(line.id, { nonTax: !line.nonTax });
    };
    const toggleDetail = (line: JournalLine) =>
      setExpanded((state) => ({ ...state, [line.id]: !state[line.id] }));

    const canEditCell = (line: JournalLine, column: JournalLineColumn) => {
      if (line.isRounding || !editable.has(column) || isMainSideColumn(column)) return false;
      if (column === "nonTax") return nonTaxAllowed(line);
      return true;
    };

    /** Protiúčet nesmí mít stejnou kategorii jako hlavní účet knihy. */
    const accountsFor = (column: JournalLineColumn) => {
      if (!mainAccount || column !== counterColumn || !mainOption?.category) return accounts;
      return accounts.filter((account) => account.category !== mainOption.category);
    };

    const focusCell = (rowIndex: number, column: JournalLineColumn, backwards = false) => {
      const order = visibleColumns
        .map((item) => item.id)
        .filter((id): id is JournalLineColumn => editable.has(id as JournalLineColumn) && !isMainSideColumn(id as JournalLineColumn));
      const current = order.indexOf(column);
      let nextRow = rowIndex;
      let nextIndex = current + (backwards ? -1 : 1);
      if (nextIndex >= order.length) { nextIndex = 0; nextRow += 1; }
      if (nextIndex < 0) { nextIndex = order.length - 1; nextRow -= 1; }
      if (nextRow >= orderedLines.length) {
        const created = makeLine(lastEditable());
        onChange([...lines, created]);
        requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-cell-key="${created.id}:${order[0]}"]`)?.focus());
        return;
      }
      const nextLine = orderedLines[nextRow];
      const nextColumn = order[nextIndex];
      if (nextLine && nextColumn) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>(`[data-cell-key="${nextLine.id}:${nextColumn}"]`)?.focus());
    };

    const finish = (rowIndex: number, column: JournalLineColumn, backwards = false) => {
      setEditing(null);
      focusCell(rowIndex, column, backwards);
    };
    const cancel = () => {
      if (editing) onChange(lines.map((line) => line.id === editing.rowId ? editing.original : line));
      setEditing(null);
    };

    const displayValue = (line: JournalLine, column: JournalLineColumn) => {
      if (ACCOUNT_COLUMNS.has(column)) {
        const code = line[column as "debitAccount" | "creditAccount"];
        const account = code ? accountByCode.get(code) : undefined;
        return code ? `${formatAccountCode(code)}${account ? ` – ${account.name}` : ""}` : "";
      }
      if (DIMENSION_COLUMNS.has(column)) {
        const id = line[column as "dimensionId"];
        return dimensions.find((item) => item.id === id)?.name ?? "";
      }
      if (PARTNER_COLUMNS.has(column)) {
        const id = line[column as "partnerId"];
        return partners.find((item) => item.id === id)?.name ?? "";
      }
      if (column === "amount" || column === "foreignAmount") return formatAmount(Number(line[column]) || 0, 2);
      if (column === "rate") return formatAmount(Number(line.rate) || 0, 6);
      return String(line[column] ?? "");
    };

    const inputKey = (event: KeyboardEvent, rowIndex: number, column: JournalLineColumn) => {
      if (event.key === "Escape") { event.preventDefault(); cancel(); return; }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        finish(rowIndex, column, event.shiftKey);
      }
    };

    const renderEditor = (line: JournalLine, rowIndex: number, column: JournalLineColumn) => {
      const seed = editing?.seed;
      const commitSelect = (values: Partial<JournalLine>) => { patch(line.id, values); finish(rowIndex, column); };
      if (ACCOUNT_COLUMNS.has(column)) return (
        <AccountSelect accounts={accountsFor(column)} value={line[column as "debitAccount"]} initialSearch={seed} onChange={(value) => commitSelect({ [column]: value, counterAccount: mainAccount ? value : line.counterAccount })} onOpenChange={(open) => { if (!open) setEditing(null); }} className="journal-cell-editor" />
      );
      if (DIMENSION_COLUMNS.has(column)) return <DimensionSelect options={dimensions} value={line[column as "dimensionId"]} onChange={(value) => commitSelect({ [column]: value })} className="journal-cell-editor" />;
      if (PARTNER_COLUMNS.has(column)) return <PartnerSelect partners={partners} value={line[column as "partnerId"]} onChange={(value) => commitSelect({ [column]: value })} className="journal-cell-editor" />;
      if (column === "currency") return <OptionSelect value={line.currency} options={currencies} onChange={(value) => commitSelect({ currency: value })} triggerClassName="journal-cell-editor" />;
      if (NUMERIC_COLUMNS.has(column)) {
        const initial = seed === undefined ? Number(line[column as "amount"]) || 0 : Number(seed.replace(",", ".")) || 0;
        return <DecimalInput autoFocus aria-label={label(column)} value={initial} decimals={column === "rate" ? 6 : 2} className="journal-cell-editor" onKeyDown={(event) => inputKey(event, rowIndex, column)} onChange={(value) => {
          const numeric = Number(value) || 0;
          if (column === "foreignAmount") patch(line.id, { foreignAmount: numeric, amount: roundMoney(numeric * (line.rate || 0)) });
          else if (column === "rate") patch(line.id, { rate: numeric, amount: roundMoney((line.foreignAmount || 0) * numeric) });
          else patch(line.id, { amount: numeric });
        }} />;
      }
      return <Input autoFocus aria-label={label(column)} value={seed ?? String(line[column] ?? "")} className="journal-cell-editor" onKeyDown={(event) => inputKey(event, rowIndex, column)} onChange={(event) => patch(line.id, { [column]: VS_COLUMNS.has(column) ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value })} />;
    };

    /** Přepínací značka Nedaňový u částky. */
    const renderNonTaxMark = (line: JournalLine) => {
      if (line.isRounding || !nonTaxAllowed(line)) return null;
      const on = Boolean(line.nonTax);
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-cell-key={`${line.id}:nonTax`}
              aria-label={t.nonTax}
              aria-pressed={on}
              disabled={!canEditCell(line, "nonTax")}
              onClick={() => toggleNonTax(line)}
              className={cn(
                "inline-flex size-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                on
                  ? "border-amber-500 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                  : "border-transparent text-muted-foreground/50 hover:border-border",
              )}
            >
              <Percent className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{on ? t.nonTaxOn : t.nonTaxOff}</TooltipContent>
        </Tooltip>
      );
    };

    const renderCell = (line: JournalLine, rowIndex: number, column: JournalLineColumn) => {
      const error = validations.get(line.id)?.[column];
      const canEdit = canEditCell(line, column);
      const isEditing = editing?.rowId === line.id && editing.column === column;
      const content = isEditing ? renderEditor(line, rowIndex, column) : displayValue(line, column);
      const readOnlyMain = isMainSideColumn(column) && !line.isRounding;
      const cell = (
        <div
          tabIndex={canEdit ? 0 : -1}
          role="gridcell"
          data-cell-key={`${line.id}:${column}`}
          aria-label={`${label(column)} ${rowIndex + 1}`}
          className={cn(
            "journal-grid-cell min-h-[1.8em] truncate rounded-sm px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            canEdit && "cursor-cell",
            readOnlyMain && "bg-muted/50 text-muted-foreground",
            error && "ring-1 ring-destructive",
          )}
          onClick={(event) => (event.currentTarget as HTMLElement).focus()}
          onFocus={() => setActive({ rowId: line.id, column })}
          onDoubleClick={() => canEdit && setEditing({ rowId: line.id, column, original: { ...line } })}
          onKeyDown={(event) => {
            if (event.altKey && event.key === "ArrowDown") { event.preventDefault(); toggleDetail(line); return; }
            if (!canEdit || isEditing) return;
            if (event.key === "F2" || event.key === "Enter") { event.preventDefault(); event.stopPropagation(); setEditing({ rowId: line.id, column, original: { ...line } }); return; }
            if (event.key === "Tab") { event.preventDefault(); focusCell(rowIndex, column, event.shiftKey); return; }
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
              event.preventDefault(); event.stopPropagation();
              const original = { ...line };
              if (ACCOUNT_COLUMNS.has(column)) {
                setEditing({ rowId: line.id, column, seed: event.key, original });
              } else {
                const value = NUMERIC_COLUMNS.has(column)
                  ? Number(event.key.replace(",", ".")) || 0
                  : event.key;
                patch(line.id, { [column]: value });
                setEditing({ rowId: line.id, column, original });
              }
            }
          }}
        >{content || <span className="text-muted-foreground">—</span>}</div>
      );
      return error ? <Tooltip><TooltipTrigger asChild>{cell}</TooltipTrigger><TooltipContent>{error}</TooltipContent></Tooltip> : cell;
    };

    /** Rozbalený detail řádku – stranová pole a příznak Nedaňový. */
    const renderDetail = (line: JournalLine) => {
      const fieldIds: JournalLineColumn[] = sideFields === "split" ? SPLIT_COLUMNS : SHARED_COLUMNS;
      return (
        <div className="grid gap-3 bg-muted/30 p-3 @min-[48rem]:grid-cols-3">
          {fieldIds.map((id) => {
            const disabled = !canEditCell(line, id);
            const control = DIMENSION_COLUMNS.has(id) ? (
              <DimensionSelect options={dimensions} value={line[id as "dimensionId"]} disabled={disabled} onChange={(value) => patch(line.id, { [id]: value })} />
            ) : PARTNER_COLUMNS.has(id) ? (
              <PartnerSelect partners={partners} value={line[id as "partnerId"]} disabled={disabled} onChange={(value) => patch(line.id, { [id]: value })} />
            ) : (
              <Input
                inputMode="numeric"
                value={String(line[id] ?? "")}
                disabled={disabled}
                onChange={(event) => patch(line.id, { [id]: event.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="h-9 text-right font-mono tabular-nums"
              />
            );
            return (
              <div key={id} className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">{label(id)}</Label>
                {control}
              </div>
            );
          })}
          {nonTaxAllowed(line) ? (
            <div className="flex items-center gap-2 pt-5">
              <Checkbox
                id={`${line.id}-nontax`}
                checked={Boolean(line.nonTax)}
                disabled={!canEditCell(line, "nonTax")}
                onCheckedChange={(checked) => patch(line.id, { nonTax: checked === true })}
              />
              <Label htmlFor={`${line.id}-nontax`}>{t.nonTax}</Label>
            </div>
          ) : null}
        </div>
      );
    };

    useEffect(() => {
      if (!editing) return;
      const cell = rootRef.current?.querySelector<HTMLElement>(`[data-cell-key="${editing.rowId}:${editing.column}"]`);
      requestAnimationFrame(() => cell?.querySelector<HTMLElement>("input,button,[role=combobox]")?.focus());
    }, [editing]);

    const onRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!paneActive || editing || (!event.ctrlKey && !event.metaKey)) return;
      if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); addLine(); return; }
      if (!active) return;
      const line = lines.find((item) => item.id === active.rowId);
      if (!line || line.isRounding) return;
      const key = event.key.toLocaleLowerCase("cs");
      if (key === "d") { event.preventDefault(); event.stopPropagation(); duplicate(line); }
      if (key === "n") { event.preventDefault(); event.stopPropagation(); toggleNonTax(line); }
      if (event.key === "Delete") { event.preventDefault(); event.stopPropagation(); remove(line); }
    };

    const actionsVisible = editable.size > 0;
    const span = visibleColumns.length;

    return (
      <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
        <div ref={setRootRef} className={cn("@container overflow-hidden rounded-lg border bg-card", className)} onKeyDown={onRootKeyDown}>
          <GridToolbar zoom={zoom} density={density} left={<>
            {editable.size > 0 ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon" aria-label={`${t.addLine} (Ctrl+Enter)`} onClick={addLine} className="grid-toolbar-control grid-toolbar-icon-control"><Plus /></Button></TooltipTrigger><TooltipContent>{`${t.addLine} (Ctrl+Enter)`}</TooltipContent></Tooltip> : null}
            {(editable.size > 0 && rounding) ? <GridToolbarSeparator density={density} /> : null}
            {rounding ? <div data-slot="journal-lines-rounding" className="grid-toolbar-group flex items-center gap-2"><Label htmlFor="journal-lines-rounding" className="whitespace-nowrap text-xs">{rounding.label ?? "Haléřové vyrovnání"}</Label><div className="relative">{rounding.readOnly || !rounding.onChange ? <span id="journal-lines-rounding" aria-readonly="true" className="grid-toolbar-control inline-flex w-32 items-center justify-end border border-border bg-card px-2 font-mono tabular-nums">{formatAmount(rounding.value, 2)}</span> : <DecimalInput id="journal-lines-rounding" value={rounding.value} onChange={(value) => rounding.onChange?.(value === "" ? 0 : Number(value))} className="grid-toolbar-control w-32 pr-8 font-mono tabular-nums" />}{canFillRounding ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label={t.fillRounding} onClick={() => onRoundingFill?.(difference)} className="absolute right-0 top-0 grid-toolbar-icon-control"><WandSparkles /></Button></TooltipTrigger><TooltipContent>{t.fillRounding}</TooltipContent></Tooltip> : null}</div></div> : null}
          </>} right={<>
            <GridSearch value={search} onChange={setSearch} zoom={zoom} placeholder="Hledat v řádcích…" />
            <GridToolbarSeparator density={density} />
            <ColumnPicker columns={columns.columns.map((column) => ({ id: column.id, label: column.label, locked: column.locked }))} visible={columns.columnVisible} onToggle={columns.toggle} onReset={columns.reset} onReorder={columns.reorder} zoom={zoom} />
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="outline" size="icon" aria-label="Obnovit rozložení" onClick={() => { columns.reset(); setZoom(1); setDensity("normal"); }} className="grid-toolbar-control grid-toolbar-icon-control"><RotateCcw /></Button></TooltipTrigger><TooltipContent>Obnovit rozložení</TooltipContent></Tooltip>
            <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} />
          </>} />
          {search ? <div className="flex items-center justify-between border-b bg-filter-active/10 px-3 py-1 text-xs text-filter-active"><span>{`Zobrazeno ${displayedLines.length} z ${orderedLines.length} řádků`}</span><Button type="button" variant="ghost" size="icon" aria-label="Zrušit hledání" onClick={() => setSearch("")} className="size-7 text-filter-active"><X /></Button></div> : null}
          <ZoomGrid zoom={zoom} setZoom={setZoom} density={density} noFit maxHeight="32rem" className="journal-lines-grid">
            <Table role="grid" className="min-w-max table-fixed">
              <colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: `${columns.widths[column.id] ?? COLUMN_WIDTHS[column.id]}px` }} />)}</colgroup>
              <TableHeader className="grid-column-header"><TableRow>{visibleColumns.map((column) => <TableHead key={column.id} data-pin={column.id === "row" ? "" : undefined} data-pin-right={column.id === "actions" ? "" : undefined} className={cn("relative", column.align === "right" && "text-right", column.align === "center" && "text-center", column.id === "actions" && "grid-actions-header")}><span>{column.label}</span>{column.id !== "row" && column.id !== "actions" ? <ColumnResizeHandle onResize={(width) => columns.setWidth(column.id, width)} onReset={() => columns.clearWidth(column.id)} /> : null}</TableHead>)}</TableRow></TableHeader>
               <TableBody>{displayedLines.length === 0 ? <TableRow><TableCell colSpan={span} className="py-8 text-center text-muted-foreground">{search ? "Žádný řádek neodpovídá hledání" : t.empty}</TableCell></TableRow> : displayedLines.flatMap((line, rowIndex) => {
                const issues = sideIssues(line);
                const rowNode = (
                  <TableRow key={line.id} data-grid-row data-rounding={line.isRounding ? "" : undefined} tabIndex={-1} className={cn("group/row", line.isRounding && "bg-muted/40 text-muted-foreground")}>
                    {visibleColumns.map((column) => {
                      if (column.id === "row") return (
                        <TableCell key={column.id} data-pin className="text-center font-mono text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            {line.isRounding ? null : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button type="button" aria-label={expanded[line.id] ? t.hideDetail : t.showDetail} onClick={() => toggleDetail(line)} className="text-muted-foreground hover:text-foreground">
                                    {expanded[line.id] ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>{expanded[line.id] ? t.hideDetail : t.showDetail}</TooltipContent>
                              </Tooltip>
                            )}
                            <span>{rowIndex + 1}</span>
                          </div>
                        </TableCell>
                      );
                      if (column.id === "actions") return (
                        <TableCell key={column.id} data-pin-right className="grid-actions-cell text-right">
                          {line.isRounding ? (
                            <Tooltip><TooltipTrigger asChild><span className="text-xs">{t.rounding}</span></TooltipTrigger><TooltipContent>{t.roundingHint}</TooltipContent></Tooltip>
                          ) : actionsVisible ? (
                            <GridActions>
                              <Tooltip><TooltipTrigger asChild><GridAction aria-label={t.duplicateLine} onClick={() => duplicate(line)}><Copy /></GridAction></TooltipTrigger><TooltipContent>{t.duplicateLine}</TooltipContent></Tooltip>
                              <Tooltip><TooltipTrigger asChild><GridAction tone="destructive" aria-label={t.removeLine} onClick={() => remove(line)}><Trash2 /></GridAction></TooltipTrigger><TooltipContent>{t.removeLine}</TooltipContent></Tooltip>
                            </GridActions>
                          ) : null}
                        </TableCell>
                      );
                      const id = column.id as JournalLineColumn;
                      if (id === "amount") return (
                        <TableCell key={id} className="amount-cell text-right tabular-nums">
                          <div className="flex items-center justify-end gap-1">
                            {renderNonTaxMark(line)}
                            <div className="min-w-0 flex-1">{renderCell(line, rowIndex, id)}</div>
                          </div>
                        </TableCell>
                      );
                      if (id === "text") return (
                        <TableCell key={id}>
                          {renderCell(line, rowIndex, id)}
                          {issues.length ? (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {issues.map((issue) => (
                                <span key={issue.column} className="rounded-[4px] bg-destructive/10 px-1 text-[0.7em] text-destructive">{issue.message}</span>
                              ))}
                            </div>
                          ) : null}
                        </TableCell>
                      );
                       return <TableCell key={id} className={cn(NUMERIC_COLUMNS.has(id) && "amount-cell text-right tabular-nums")}>{renderCell(line, rowIndex, id)}</TableCell>;
                    })}
                  </TableRow>
                );
                if (!expanded[line.id] || line.isRounding) return [rowNode];
                return [rowNode, (
                  <TableRow key={`${line.id}-detail`} data-grid-row-detail>
                    <TableCell colSpan={span} className="p-0">{renderDetail(line)}</TableCell>
                  </TableRow>
                )];
              })}</TableBody>
              <TableFooter><TableRow>{visibleColumns.map((column, index) => {
                let content: ReactNode = null;
                if (column.id === "row") content = t.total;
                 if (column.id === "amount") content = <span className="font-sans tabular-nums">{formatAmount(total, 2)}</span>;
                if (column.id === "actions" && errorCount > 0) content = <span className="text-destructive">{`${t.errors}: ${errorCount}`}</span>;
                return <TableCell key={`${column.id}-${index}`} data-pin={column.id === "row" ? "" : undefined} data-pin-right={column.id === "actions" ? "" : undefined} className={cn(column.align === "right" && "text-right", column.id === "actions" && "grid-actions-footer whitespace-nowrap")}>{content}</TableCell>;
              })}</TableRow></TableFooter>
            </Table>
          </ZoomGrid>
          <div data-slot="journal-lines-summary" className="flex flex-wrap justify-end gap-x-5 gap-y-1 border-t bg-muted/40 px-3 py-2 text-sm tabular-nums"><span>{`Rozpis ${formatAmount(linesTotal, 2)}`}</span><span>{`Haléřové vyrovnání ${formatAmount(roundingValue, 2)}`}</span><span className="font-semibold">{`Celkem ${formatAmount(total, 2)}`}</span>{totalMode === "entered" && expectedAmount !== undefined ? <><span>{`Zadáno ${formatAmount(expectedAmount, 2)}`}</span><span data-slot="journal-lines-remaining" className={cn("font-semibold", difference === 0 ? "text-success-strong" : "text-destructive")}>{`Rozdíl ${formatAmount(difference, 2)}`}</span></> : null}</div>
          <JournalLinesRecap lines={lines} accounts={accounts} dimensions={dimensions} rounding={roundingValue} foreign={showCurrency} currency={currencies[0]?.value} storageKey={storageKey} recapTabs={recapTabs} zoom={zoom} />
        </div>
      </GridZoomContext.Provider>
    );
  },
);
