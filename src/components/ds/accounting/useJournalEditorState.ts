/**
 * Stav editoru řádků dokladu.
 * Vlastní: aktivní a editovanou buňku, rozbalené detaily, hledání, dotčené řádky, DPH náhled,
 *   součty, validaci a všechny úpravy řádků (přidání, duplikace, odebrání, přesun, změny hodnot).
 * Nesmí: vykreslovat; nesmí kopírovat props do stavu – řádky jsou vždy řízené volajícím.
 */
import * as React from "react";
import { type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";

import { useDsTexts } from "../../../ds-texts";
import { useIsActivePane } from "../panes/pane-context";
import type { JournalLinesEditorProps } from "./journal-editor-types";
import {
  journalAccountFor,
  journalColumnDefs,
  journalColumnLabels,
  journalDisplayValue,
} from "./journal-columns";
import {
  sideFieldRules as defaultSideFieldRules,
  type JournalLine,
  type JournalLineColumn,
  type VatCalcMode,
} from "./journal-lines";
import {
  ALL_EDITABLE,
  VAT_COLUMNS,
  appendJournalLine,
  calculateLineAmount,
  createJournalLine,
  dataColumnOf,
  duplicateJournalLine,
  filterJournalLines,
  isRegularLine,
  journalAmountLabels,
  moveJournalLine,
  newJournalLineId,
  nextLineVatCode,
  numberJournalErrors,
  orderJournalLines,
  removeJournalLine,
  reorderJournalLines,
  roundJournalAmount,
  toHomeAmount,
  type ColumnId,
  type EditState,
} from "./journal-lines-model";
import { journalVatIssues, validateJournalLines } from "./journal-lines-validation";
import { useJournalLayout } from "./useJournalLayout";
import { useJournalTotals } from "./useJournalTotals";
import { fillInitialVatCode } from "./journal-vat";
import { useJournalVatGroups } from "./useJournalVatGroups";

/** Celý stav a akce editoru; sdílí jej všechny části přes `JournalEditorContext`. */
export function useJournalEditorState(
  props: JournalLinesEditorProps,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    lines,
    onChange,
    accounts,
    documentCurrency,
    homeCurrency,
    rate = 1,
    rateAmount = 1,
    sideFields = "split",
    mode = "internal",
    mainSide,
    mainAccount: mainAccountId,
    editableFields,
    rounding,
    defaults,
    initialEmptyLine = false,
    showQuantityColumns = false,
    storageKey = "journal-lines",
    texts,
    vat,
  } = props;
  const paneActive = useIsActivePane();
  const dsTexts = useDsTexts();
  const t = React.useMemo(() => ({ ...dsTexts.journalEditor, ...texts }), [dsTexts, texts]);
  const accountFormRequired =
    texts?.accountFormRequired ?? dsTexts.columnPicker.accountFormRequired;
  const editable = React.useMemo(() => new Set(editableFields ?? ALL_EDITABLE), [editableFields]);
  // Aktivní buňka slouží jen zkratkám (Ctrl+D, Ctrl+Delete), ne vykreslení: drží se v ref,
  // aby přesun fokusu (Tab, klik) nepřekresloval celý editor a neblokoval další klávesu.
  const activeRef = React.useRef<{ rowId: string; column: ColumnId } | null>(null);
  const setActive = React.useCallback((cell: { rowId: string; column: ColumnId } | null) => {
    activeRef.current = cell;
  }, []);
  const [editing, setEditing] = React.useState<EditState | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [search, setSearch] = React.useState("");
  const touchedRows = React.useRef(new Set<string>());
  const initializedEmptyLine = React.useRef(false);
  const foreign = documentCurrency !== homeCurrency;
  const canReorder = (props.reorderable ?? editable.size > 0) && !search;
  const accountByCode = React.useMemo(
    () => new Map(accounts.map((account) => [account.code, account])),
    [accounts],
  );
  const mainAccount =
    mode === "mainAccount" && mainAccountId && mainSide
      ? { accountId: mainAccountId, side: mainSide }
      : undefined;
  const mainOption = mainAccount ? accountByCode.get(mainAccount.accountId) : undefined;
  const counterColumn: "debitAccount" | "creditAccount" | null = mainAccount
    ? mainAccount.side === "MD"
      ? "creditAccount"
      : "debitAccount"
    : null;
  const documentMark = props.documentCurrencySymbol ?? documentCurrency;
  const homeMark = props.homeCurrencySymbol ?? homeCurrency;
  const amountLabels = journalAmountLabels(t, documentMark, homeMark);
  const homeAmountLabel = amountLabels.homeAmount;
  const labels = journalColumnLabels(t, documentCurrency, amountLabels.foreignAmount);
  const vatOn = Boolean(vat?.enabled);
  const vatCodes = React.useMemo(() => vat?.codes ?? [], [vat?.codes]);
  const vatCodeMap = React.useMemo(
    () => new Map(vatCodes.map((code) => [code.id, code])),
    [vatCodes],
  );
  // 2.109.0: řádky jsou vždy bez DPH; vat.calcMode je zastaralý a ignoruje se.
  const calcMode: VatCalcMode = "net";
  const counterShortLabel = counterColumn === "creditAccount" ? t.sideCredit : t.sideDebit;
  const counterNameLabel = counterColumn === "creditAccount" ? t.creditAccount : t.debitAccount;
  const columnDefs = React.useMemo(
    () =>
      journalColumnDefs({
        t,
        mode,
        labels,
        counterShortLabel,
        counterNameLabel,
        showQuantityColumns,
        vatOn,
        foreign,
        homeAmountLabel,
        sideFields,
        hasValue: (column: JournalLineColumn) =>
          lines.some(
            (line) => line[column] !== undefined && line[column] !== null && line[column] !== "",
          ),
      }),
    // Text overrides and current values intentionally rebuild the complete column model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      mode,
      foreign,
      homeAmountLabel,
      lines,
      sideFields,
      showQuantityColumns,
      t,
      counterColumn,
      counterShortLabel,
      counterNameLabel,
      vatOn,
    ],
  );
  const layout = useJournalLayout({
    forwardedRef,
    storageKey,
    columnDefs,
    mode,
    sideFields,
    grossProtected: false,
    rowCount: lines.length,
  });
  const { rootRef, visibleColumns, compactAccountIds } = layout;
  const vatReadOnly = vatOn && (Boolean(vat?.readOnly) || editable.size === 0);
  const vatGroups = useJournalVatGroups({
    props,
    t,
    vatOn,
    vatReadOnly,
    vatCodeMap,
    foreign,
    rate: rate ?? 1,
    rateAmount,
  });
  const regularLines = vatGroups.allocatedLines.filter(isRegularLine);
  const vatConfig = {
    codes: vatCodes,
    calcMode,
    rate,
    rateAmount,
    vatRate: vat?.vatRate,
    vatRateAmount: vat?.vatRateAmount,
    foreign,
  };
  const totals = useJournalTotals({
    props,
    t,
    regularLines,
    vatOn,
    vatReadOnly,
    vatConfig,
    vatCodeMap,
    mainAccount,
    foreign,
    allocatedLines: vatGroups.allocatedLines,
  });
  const normalizedLines = React.useMemo(
    () => orderJournalLines(totals.gridSource),
    [totals.gridSource],
  );
  const displayedLines = React.useMemo(
    () => filterJournalLines(normalizedLines, search),
    [normalizedLines, search],
  );
  const patch = (id: string, values: Partial<JournalLine>) => {
    touchedRows.current.add(id);
    onChange(lines.map((line) => (line.id === id ? { ...line, ...values, isBlank: false } : line)));
  };
  const makeLine = () =>
    createJournalLine({
      id: newJournalLineId(),
      mainAccount,
      defaults,
      vatCodeId: vatOn ? nextLineVatCode(regularLines, vat?.defaultCodeId) : undefined,
    });
  // Výchozí kód DPH, který přijde až po prvním vykreslení, doplní jen do neupraveného počátečního řádku bez kódu.
  const defaultCodeApplied = React.useRef(false);
  React.useEffect(() => {
    const codeId = vat?.defaultCodeId;
    if (!vatOn || !initialEmptyLine || !codeId || defaultCodeApplied.current) return;
    if (lines.length && !lines[0]?.isBlank) {
      defaultCodeApplied.current = true;
      return;
    }
    const next = fillInitialVatCode(lines, codeId, vatCodes, touchedRows.current);
    if (!next) return;
    defaultCodeApplied.current = true;
    onChange(next);
  }, [vat?.defaultCodeId, lines]); // eslint-disable-line react-hooks/exhaustive-deps -- reaguje jen na kód a řádky
  React.useEffect(() => {
    if (!initialEmptyLine || initializedEmptyLine.current || lines.length) return;
    initializedEmptyLine.current = true;
    onChange([makeLine()]);
  }, [initialEmptyLine, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps -- jednorázové založení prázdného řádku
  const canEditColumn = (id: ColumnId) =>
    id !== "row" && id !== "homeAmount" && id !== "actions" && editable.has(dataColumnOf(id));
  const addLine = (focus = false) => {
    setSearch("");
    const next = makeLine();
    onChange(appendJournalLine(lines, next));
    if (focus)
      requestAnimationFrame(() => {
        const column = visibleColumns.map((item) => item.id).find(canEditColumn);
        if (column)
          rootRef.current
            ?.querySelector<HTMLElement>(`[data-cell-key="${next.id}:${column}"]`)
            ?.focus();
      });
    return next;
  };
  const duplicate = (line: JournalLine) =>
    onChange(duplicateJournalLine(lines, line, newJournalLineId()));
  const remove = (line: JournalLine) => {
    if (line.isRounding) {
      rounding?.onChange?.(0);
      onChange(lines.filter((item) => item.id !== line.id));
      return;
    }
    const { remaining, restore } = removeJournalLine(lines, line);
    onChange(remaining);
    toast(t.removed, { action: { label: t.undo, onClick: () => onChange(restore()) } });
  };
  const moveRow = (id: string, delta: number) => {
    if (!canReorder) return;
    const next = moveJournalLine(lines, normalizedLines, id, delta);
    if (next) onChange(next);
  };
  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (canReorder && over)
      onChange(reorderJournalLines(lines, String(dragged.id), String(over.id)));
  };
  /** Částka v měně dokladu; u cizí měny dopočítá i domácí částku. */
  const amountValues = (value: number | undefined): Partial<JournalLine> =>
    foreign
      ? {
          foreignAmount: value,
          amount: value == null ? undefined : toHomeAmount(value, rate, rateAmount),
        }
      : { amount: value };
  const updateCalculated = (line: JournalLine, values: Partial<JournalLine>) => {
    const next = { ...line, ...values };
    const calculated = calculateLineAmount(next.quantity, next.unitPrice);
    if (calculated !== undefined) Object.assign(next, amountValues(calculated));
    patch(line.id, next);
  };
  const patchVat = (line: JournalLine, values: Partial<JournalLine>) =>
    patch(line.id, { ...line, ...values });
  const changeVatCode = (line: JournalLine, codeId: string) => {
    const code = vatCodeMap.get(codeId);
    const inbound = code?.direction === "in" || code?.selfAssessment;
    patchVat(line, {
      vatCodeId: codeId || null,
      vatRate: code?.rate ?? null,
      vatManual: false,
      vatAmount: undefined,
      vatDeduction: inbound && code?.hasTax ? (line.vatDeduction ?? "full") : undefined,
      vatDeductionShare: inbound ? line.vatDeductionShare : undefined,
      pdpSubjectCode: code?.requiresPdpSubject ? line.pdpSubjectCode : null,
    });
  };
  /** @deprecated 2.109.0 – přepínač zrušen; nic nedělá. Odstraní se ve 3.0.0. */
  const changeCalcMode = (next: VatCalcMode) => void next;
  const canEditCell = (line: JournalLine, column: ColumnId) => {
    const dataColumn = dataColumnOf(column);
    if (line.isFxRounding) return false;
    if (line.isRounding)
      return column === "amount" && Boolean(rounding?.onChange) && rounding?.readOnly !== true;
    if (VAT_COLUMNS.has(dataColumn)) {
      if (!vatOn || vatReadOnly || column === "vatRate") return false;
      // 2.109.0: daň ani celkem s DPH se na řádku nezadávají (daň počítá DB po skupinách).
      if (column === "grossAmount" || column === "vatAmount") return false;
      return true;
    }
    if (!editable.has(dataColumn)) return false;
    return !(
      dataColumn === "amount" && calculateLineAmount(line.quantity, line.unitPrice) !== undefined
    );
  };
  const validationContext = {
    texts: t,
    accountByCode,
    sideFields,
    sharedSide: props.sharedSide ?? "both",
    sideFieldRules: props.sideFieldRules ?? defaultSideFieldRules,
    dimensionRequired: props.dimensionRequired ?? false,
    vatActive: vatOn && !vatReadOnly,
    vatCodeMap,
    calcMode,
    foreign,
    documentMark,
    isCodeRequired: vat?.isCodeRequired,
    missingVatAccounts: totals.missingVatAccounts,
  };
  const validations = validateJournalLines(lines, validationContext, {
    showAllErrors: props.showAllErrors ?? false,
    touched: touchedRows.current,
    validate: props.validate,
  });
  const vatWarnings = new Map(
    lines
      .filter(isRegularLine)
      .map((line) => [line.id, journalVatIssues(line, validationContext).warnings]),
  );
  // Externí stavy buněk z pruhu položek (aplikace / server) se sloučí s vlastní validací.
  for (const issue of props.cellIssues ?? []) {
    const column = issue.columnId as JournalLineColumn;
    if (issue.severity === "warning") {
      const row = vatWarnings.get(issue.rowId) ?? {};
      if (!row[column]) row[column] = issue.message;
      vatWarnings.set(issue.rowId, row);
    } else {
      const row = validations.get(issue.rowId) ?? {};
      if (!row[column]) row[column] = issue.message;
      validations.set(issue.rowId, row);
    }
  }
  const validationErrors: Parameters<
    NonNullable<JournalLinesEditorProps["onValidationChange"]>
  >[1] = [
    ...numberJournalErrors(lines, validations),
    // Položky skupin (chyba i varování) patří ke skupině, ne k řádku – bez `line`.
    ...vatGroups.groupIssues.map((issue) => ({
      field: "vatGroup",
      label: issue.label,
      message: issue.message,
      fieldId: issue.fieldId,
      severity: issue.severity,
    })),
  ];
  const errorCount = validationErrors.filter((item) => item.severity !== "warning").length;
  const validationSignature = JSON.stringify(validationErrors);
  const validationChangeRef = React.useRef(props.onValidationChange);
  React.useEffect(() => {
    validationChangeRef.current = props.onValidationChange;
  }, [props.onValidationChange]);
  React.useEffect(() => {
    validationChangeRef.current?.(errorCount, validationErrors);
  }, [validationSignature]); // eslint-disable-line react-hooks/exhaustive-deps -- hlásí jen skutečnou změnu chyb
  const allocatedById = React.useMemo(
    () => new Map(vatGroups.allocatedLines.map((line) => [line.id, line])),
    [vatGroups.allocatedLines],
  );
  const displayValue = (line: JournalLine, column: ColumnId) =>
    journalDisplayValue(
      VAT_COLUMNS.has(dataColumnOf(column)) ? (allocatedById.get(line.id) ?? line) : line,
      column,
      {
        accountByCode,
        dimensions: props.dimensions ?? [],
        partners: props.partners ?? [],
        units: props.units ?? [],
        vatCodeMap,
        calcMode,
        foreign,
        rate,
        rateAmount,
        counterColumn,
        compactAccountIds,
      },
    );
  const accountFor = (line: JournalLine, column: Parameters<typeof journalAccountFor>[1]) =>
    journalAccountFor(line, column, counterColumn);
  const finish = () => setEditing(null);
  const cancel = () => {
    if (editing)
      onChange(lines.map((line) => (line.id === editing.rowId ? editing.original : line)));
    setEditing(null);
  };
  const startEditing = (line: JournalLine, column: ColumnId, seed?: string) =>
    setEditing({
      rowId: line.id,
      column,
      ...(seed !== undefined ? { seed } : {}),
      original: { ...line },
    });
  return {
    props,
    t,
    dsTexts,
    paneActive,
    accountFormRequired,
    editable,
    /** Aktivní buňka pro zkratky; čte se v obsluze klávesy, nevykresluje se. */
    get active() {
      return activeRef.current;
    },
    setActive,
    editing,
    setEditing,
    startEditing,
    expanded,
    setExpanded,
    search,
    setSearch,
    foreign,
    canReorder,
    accountByCode,
    mainAccount,
    mainOption,
    counterColumn,
    documentMark,
    homeMark,
    homeAmountLabel,
    labels,
    vatOn,
    vatCodes,
    vatCodeMap,
    calcMode,
    counterShortLabel,
    counterNameLabel,
    layout,
    regularLines,
    vatConfig,
    vatReadOnly,
    vatGroups,
    totals,
    normalizedLines,
    displayedLines,
    rate,
    rateAmount,
    mode,
    sideFields,
    patch,
    addLine,
    duplicate,
    remove,
    moveRow,
    onDragEnd,
    amountValues,
    updateCalculated,
    patchVat,
    changeVatCode,
    changeCalcMode,
    canEditCell,
    validations,
    vatWarnings,
    displayValue,
    accountFor,
    finish,
    cancel,
  };
}

/** Výsledek `useJournalEditorState`. */
export type JournalEditorState = ReturnType<typeof useJournalEditorState>;
