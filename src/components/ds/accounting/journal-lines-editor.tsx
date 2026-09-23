import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { formatAccountCode } from "./account-code";
import { AccountSelect, type AccountOption } from "./account-select";
import { DimensionSelect, type DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { OptionSelect, type SelectOption } from "../form/option-select";
import { DecimalInput } from "../form/decimal-input";
import { ColumnResizeHandle } from "../grid/grid-column-resize";
import { GridAction, GridActions } from "../grid/grid-action";
import { useGridColumns, type GridColumn } from "../grid/grid-columns";
import { GridZoomContext, ZoomControl, ZoomGrid, useGridZoom } from "../grid/grid-zoom";
import { amountClass, formatAmount } from "../../../lib/format";
import { useIsActivePane } from "../panes/pane-context";
import { cn } from "../../../lib/utils";
import type { JournalLine, JournalLineColumn, JournalSharedSide } from "./journal-lines";

export type { JournalDbLine, JournalLine, JournalLineColumn, JournalRow, JournalSharedSide } from "./journal-lines";
export { fromDbLines, fromJournalRow, toDbLines, toJournalRow } from "./journal-lines";

export type JournalLineDefaults = Partial<Omit<JournalLine, "id" | "pairNo">>;
export type JournalLineErrors = Partial<Record<JournalLineColumn, string>>;
export type JournalMainAccount = { accountId: string; side: "MD" | "DAL" };

export interface JournalLinesEditorTexts {
  row: string;
  debitAccount: string;
  creditAccount: string;
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
  rounding: string;
  actions: string;
  addLine: string;
  duplicateLine: string;
  removeLine: string;
  undo: string;
  removed: string;
  total: string;
  balanced: string;
  difference: string;
  errors: string;
  empty: string;
  debitRequired: string;
  creditRequired: string;
  amountRequired: string;
}

export const DEFAULT_JOURNAL_LINES_TEXTS: JournalLinesEditorTexts = {
  row: "Ř.", debitAccount: "MD účet", creditAccount: "DAL účet", amount: "Částka v Kč",
  currency: "Měna", foreignAmount: "Částka v měně", rate: "Kurz", text: "Text",
  dimension: "Zakázka", vs: "VS", partner: "Partner",
  debitDimension: "MD zakázka", creditDimension: "DAL zakázka",
  debitVs: "MD VS", creditVs: "DAL VS",
  debitPartner: "MD partner", creditPartner: "DAL partner",
  nonTax: "Nedaňový", rounding: "Zaokrouhlení", actions: "Akce",
  addLine: "Přidat řádek", duplicateLine: "Duplikovat řádek", removeLine: "Odebrat řádek",
  undo: "Zpět", removed: "Řádek byl odebrán", total: "Celkem", balanced: "Částka odpovídá dokladu",
  difference: "Zbývá", errors: "Počet chyb", empty: "Zatím zde nejsou žádné řádky",
  debitRequired: "Vyberte účet MD", creditRequired: "Vyberte účet DAL", amountRequired: "Částka musí být nenulová",
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
  row: 54, debitAccount: 220, creditAccount: 220, amount: 140, currency: 92,
  foreignAmount: 150, rate: 110, text: 240, dimensionId: 190, vs: 120, partnerId: 220,
  debitDimensionId: 190, creditDimensionId: 190, debitVs: 120, creditVs: 120,
  debitPartnerId: 220, creditPartnerId: 220, nonTax: 110, actions: 72,
};

/** Účet nákladů nebo výnosů (třída 5 a 6) – tam má nedaňový příznak smysl. */
const isResultAccount = (code?: string | null) => !!code && (code.startsWith("5") || code.startsWith("6"));

export interface JournalLinesEditorProps {
  lines: JournalLine[];
  onChange: (lines: JournalLine[]) => void;
  accounts: AccountOption[];
  dimensions?: DimensionOption[];
  partners?: PartnerOption[];
  currencies?: SelectOption[];
  showCurrency?: boolean;
  /** Společné nebo oddělené VS / partner / zakázka pro MD a DAL (výchozí "shared"). */
  sideFields?: "shared" | "split";
  /** Na kterou stranu se ve sdíleném režimu hodnoty ukládají (výchozí "both"). */
  sharedSide?: JournalSharedSide;
  /** Hlavní účet knihy – jeho strana je jen pro čtení, zadává se protiúčet. */
  mainAccount?: JournalMainAccount;
  /** Povolení příznaku Nedaňový pro řádek (výchozí: nákladový nebo výnosový účet). */
  isNonTaxAllowed?: (line: JournalLine) => boolean;
  editableColumns?: JournalLineColumn[];
  /** @deprecated Použijte editableColumns; true znamená, že nelze upravit žádný sloupec. */
  readOnly?: boolean;
  expectedTotal?: number;
  defaults?: JournalLineDefaults;
  validate?: (line: JournalLine) => JournalLineErrors;
  storageKey?: string;
  texts?: Partial<JournalLinesEditorTexts>;
  className?: string;
}

/** Editovatelná mřížka předkontací se zoomem, validací a ovládáním jako v Excelu. */
export const JournalLinesEditor = forwardRef<HTMLDivElement, JournalLinesEditorProps>(
  function JournalLinesEditor(
    {
      lines, onChange, accounts, dimensions = [], partners = [], currencies = [
        { value: "CZK", label: "CZK" }, { value: "EUR", label: "EUR" }, { value: "USD", label: "USD" },
      ], showCurrency = false, sideFields = "shared", sharedSide = "both", mainAccount,
      isNonTaxAllowed, editableColumns, readOnly = false, expectedTotal, defaults,
      validate, storageKey = "journal-lines", texts, className,
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
    const editable = useMemo(() => new Set(readOnly ? [] : (editableColumns ?? ALL_EDITABLE)), [editableColumns, readOnly]);
    const [active, setActive] = useState<{ rowId: string; column: JournalLineColumn } | null>(null);
    const [editing, setEditing] = useState<EditState | null>(null);

    const LABEL_KEYS: Record<JournalLineColumn, keyof JournalLinesEditorTexts> = {
      debitAccount: "debitAccount", creditAccount: "creditAccount", amount: "amount", text: "text",
      dimensionId: "dimension", vs: "vs", partnerId: "partner",
      debitDimensionId: "debitDimension", creditDimensionId: "creditDimension",
      debitVs: "debitVs", creditVs: "creditVs",
      debitPartnerId: "debitPartner", creditPartnerId: "creditPartner",
      nonTax: "nonTax", currency: "currency", foreignAmount: "foreignAmount", rate: "rate",
    };
    const label = (column: JournalLineColumn) => t[LABEL_KEYS[column]];

    /** Sloupec hlavního účtu a jeho společné údaje jsou jen pro čtení. */
    const isMainSideColumn = (column: JournalLineColumn) => {
      if (!mainAccount) return false;
      const debitSide: JournalLineColumn[] = ["debitAccount", "debitVs", "debitPartnerId"];
      const creditSide: JournalLineColumn[] = ["creditAccount", "creditVs", "creditPartnerId"];
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
        { id: "debitAccount", label: t.debitAccount, locked: true },
        { id: "creditAccount", label: t.creditAccount, locked: true },
        ...(showCurrency ? [
          { id: "currency" as const, label: t.currency, locked: true },
          { id: "foreignAmount" as const, label: t.foreignAmount, locked: true, align: "right" as const },
          { id: "rate" as const, label: t.rate, locked: true, align: "right" as const },
        ] : []),
        { id: "amount", label: t.amount, locked: true, align: "right" },
        { id: "text", label: t.text, locked: true },
        ...sideColumns,
        { id: "nonTax", label: t.nonTax, align: "center" },
        { id: "actions", label: t.actions, locked: true, align: "right" },
      ];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showCurrency, sideFields, lines, t.actions, t.amount, t.creditAccount, t.currency, t.debitAccount, t.dimension, t.foreignAmount, t.nonTax, t.partner, t.rate, t.row, t.text, t.vs]);
    const columns = useGridColumns(storageKey, columnDefs);
    const visibleColumns = columns.columns;

    /** Řádek zaokrouhlení je vždy poslední a jen pro čtení. */
    const orderedLines = useMemo(
      () => [...lines].sort((a, b) => Number(Boolean(a.isRounding)) - Number(Boolean(b.isRounding))),
      [lines],
    );

    const validations = useMemo(() => new Map(lines.map((line) => {
      const builtIn: JournalLineErrors = {};
      if (!line.isRounding) {
        if (!line.debitAccount) builtIn.debitAccount = t.debitRequired;
        if (!line.creditAccount) builtIn.creditAccount = t.creditRequired;
        if (!Number(line.amount)) builtIn.amount = t.amountRequired;
      }
      return [line.id, { ...builtIn, ...validate?.(line) }];
    })), [lines, t.amountRequired, t.creditRequired, t.debitRequired, validate]);
    const errorCount = [...validations.values()].reduce((sum, errors) => sum + Object.values(errors).filter(Boolean).length, 0);
    const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
    const difference = expectedTotal === undefined ? 0 : roundMoney(expectedTotal - total);

    const nonTaxAllowed = (line: JournalLine) =>
      isNonTaxAllowed ? isNonTaxAllowed(line) : isResultAccount(line.debitAccount) || isResultAccount(line.creditAccount);

    const patch = (id: string, values: Partial<JournalLine>) =>
      onChange(lines.map((line) => (line.id === id ? { ...line, ...values } : line)));

    const makeLine = (previous?: JournalLine): JournalLine => {
      const remaining = expectedTotal === undefined ? 0 : roundMoney(expectedTotal - total);
      return {
        id: newId(),
        debitAccount: mainAccount?.side === "MD" ? mainAccount.accountId : null,
        creditAccount: mainAccount?.side === "DAL" ? mainAccount.accountId : null,
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
    const addLine = () => onChange([...lines, makeLine(lastEditable())]);
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

    const canEditCell = (line: JournalLine, column: JournalLineColumn) => {
      if (line.isRounding || !editable.has(column) || isMainSideColumn(column)) return false;
      if (column === "nonTax") return nonTaxAllowed(line);
      return true;
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
        const account = accounts.find((item) => item.code === code);
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
        <AccountSelect accounts={accounts} value={line[column as "debitAccount"]} initialSearch={seed} onChange={(value) => commitSelect({ [column]: value, counterAccount: mainAccount ? value : line.counterAccount })} onOpenChange={(open) => { if (!open) setEditing(null); }} className="journal-cell-editor" />
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

    const renderNonTax = (line: JournalLine) => {
      const allowed = nonTaxAllowed(line);
      const canEdit = canEditCell(line, "nonTax");
      if (!allowed) return <span className="text-muted-foreground">—</span>;
      return (
        <Checkbox
          checked={Boolean(line.nonTax)}
          disabled={!canEdit}
          aria-label={t.nonTax}
          data-cell-key={`${line.id}:nonTax`}
          onCheckedChange={(checked) => patch(line.id, { nonTax: checked === true })}
        />
      );
    };

    const renderCell = (line: JournalLine, rowIndex: number, column: JournalLineColumn) => {
      const error = validations.get(line.id)?.[column];
      const canEdit = canEditCell(line, column);
      const isEditing = editing?.rowId === line.id && editing.column === column;
      const content = isEditing ? renderEditor(line, rowIndex, column) : displayValue(line, column);
      const cell = (
        <div
          tabIndex={canEdit ? 0 : -1}
          role="gridcell"
          data-cell-key={`${line.id}:${column}`}
          aria-label={`${label(column)} ${rowIndex + 1}`}
          className={cn("journal-grid-cell min-h-[1.8em] truncate rounded-sm px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50", canEdit && "cursor-cell", error && "ring-1 ring-destructive")}
          onClick={(event) => (event.currentTarget as HTMLElement).focus()}
          onFocus={() => setActive({ rowId: line.id, column })}
          onDoubleClick={() => canEdit && setEditing({ rowId: line.id, column, original: { ...line } })}
          onKeyDown={(event) => {
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

    useEffect(() => {
      if (!editing) return;
      const cell = rootRef.current?.querySelector<HTMLElement>(`[data-cell-key="${editing.rowId}:${editing.column}"]`);
      requestAnimationFrame(() => cell?.querySelector<HTMLElement>("input,button,[role=combobox]")?.focus());
    }, [editing]);

    const onRootKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!paneActive || editing || !active || (!event.ctrlKey && !event.metaKey)) return;
      const line = lines.find((item) => item.id === active.rowId);
      if (!line || line.isRounding) return;
      if (event.key.toLocaleLowerCase("cs") === "d") { event.preventDefault(); event.stopPropagation(); duplicate(line); }
      if (event.key === "Delete") { event.preventDefault(); event.stopPropagation(); remove(line); }
    };

    const actionsVisible = !readOnly;
    const span = visibleColumns.length;

    return (
      <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
        <div ref={setRootRef} className={cn("@container overflow-hidden rounded-lg border bg-card", className)} onKeyDown={onRootKeyDown}>
          <div className="flex items-center justify-end border-b bg-muted/30 p-1.5"><ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} /></div>
          <ZoomGrid zoom={zoom} setZoom={setZoom} density={density} noFit maxHeight="32rem" className="journal-lines-grid">
            <Table role="grid" className="min-w-max table-fixed">
              <colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: `${columns.widths[column.id] ?? COLUMN_WIDTHS[column.id]}px` }} />)}</colgroup>
              <TableHeader className="grid-column-header"><TableRow>{visibleColumns.map((column) => <TableHead key={column.id} data-pin={column.id === "row" ? "" : undefined} data-pin-right={column.id === "actions" ? "" : undefined} className={cn("relative", column.align === "right" && "text-right", column.align === "center" && "text-center", column.id === "actions" && "grid-actions-header")}><span>{column.label}</span>{column.id !== "row" && column.id !== "actions" ? <ColumnResizeHandle onResize={(width) => columns.setWidth(column.id, width)} onReset={() => columns.clearWidth(column.id)} /> : null}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{orderedLines.length === 0 ? <TableRow><TableCell colSpan={span} className="py-8 text-center text-muted-foreground">{t.empty}</TableCell></TableRow> : orderedLines.map((line, rowIndex) => <TableRow key={line.id} data-grid-row data-rounding={line.isRounding ? "" : undefined} tabIndex={-1} className={cn("group/row", line.isRounding && "text-muted-foreground")}>{visibleColumns.map((column) => {
                if (column.id === "row") return <TableCell key={column.id} data-pin className="text-center font-mono text-muted-foreground">{rowIndex + 1}</TableCell>;
                if (column.id === "actions") return <TableCell key={column.id} data-pin-right className="grid-actions-cell text-right">{actionsVisible && !line.isRounding ? <GridActions><Tooltip><TooltipTrigger asChild><GridAction aria-label={t.duplicateLine} onClick={() => duplicate(line)}><Copy /></GridAction></TooltipTrigger><TooltipContent>{t.duplicateLine}</TooltipContent></Tooltip><Tooltip><TooltipTrigger asChild><GridAction tone="destructive" aria-label={t.removeLine} onClick={() => remove(line)}><Trash2 /></GridAction></TooltipTrigger><TooltipContent>{t.removeLine}</TooltipContent></Tooltip></GridActions> : null}</TableCell>;
                const id = column.id as JournalLineColumn;
                if (id === "nonTax") return <TableCell key={id} className="text-center">{renderNonTax(line)}</TableCell>;
                return <TableCell key={id} className={cn(NUMERIC_COLUMNS.has(id) && "text-right font-mono tabular-nums")}>{renderCell(line, rowIndex, id)}</TableCell>;
              })}</TableRow>)}</TableBody>
              <TableFooter><TableRow>{visibleColumns.map((column, index) => {
                let content: ReactNode = null;
                if (column.id === "row") content = t.total;
                if (column.id === "amount") content = <span className="font-mono tabular-nums">{formatAmount(total, 2)}</span>;
                if (column.id === "text") content = expectedTotal === undefined ? null : difference === 0 ? t.balanced : <span className={amountClass(-Math.abs(difference))}>{`${t.difference}: ${formatAmount(difference, 2)}`}</span>;
                if (column.id === "actions" && errorCount > 0) content = <span className="text-destructive">{`${t.errors}: ${errorCount}`}</span>;
                return <TableCell key={`${column.id}-${index}`} data-pin={column.id === "row" ? "" : undefined} data-pin-right={column.id === "actions" ? "" : undefined} className={cn(column.align === "right" && "text-right", column.id === "actions" && "grid-actions-footer whitespace-nowrap")}>{content}</TableCell>;
              })}</TableRow></TableFooter>
            </Table>
          </ZoomGrid>
          {!readOnly ? <div className="border-t p-2"><Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="size-4" />{t.addLine}</Button></div> : null}
        </div>
      </GridZoomContext.Provider>
    );
  },
);
