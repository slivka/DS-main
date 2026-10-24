/**
 * Jedna buňka řádku dokladu.
 * Vlastní: zobrazení hodnoty nebo editoru, stav chyby a varování, přepínač nedaňový,
 *   tooltip s názvem účtu a zahájení editace klikem, dvojklikem a klávesnicí.
 * Nesmí: počítat hodnoty – text buňky dává journalDisplayValue, zápis JournalCellEditor.
 */
import { useId } from "react";
import { AlertTriangle, Lock, ReceiptText, Percent } from "lucide-react";
import { journalSuggestionKey } from "./journal-suggestions";

import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { formatAmount } from "../../../lib/format";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useCellStatusTooltip } from "../grid/cell-status-tooltip";
import { FieldValue } from "../form/field-value";
import { CATEGORY_COLUMNS } from "./journal-lines-model";
import { categoryLabel, type CategoryColumn } from "./journal-category-model";
import { JournalCellEditor } from "./JournalCellEditor";
import { JournalGrossHelper } from "./journal-gross-helper";
import { journalAccountColumnLabel } from "./journal-columns";
import { useJournalEditor } from "./journal-editor-context";
import { isResultAccountType, type JournalLine } from "./journal-lines";
import {
  calculateLineAmount,
  dataColumnOf,
  isAccountColumn,
  isAccountNameColumn,
  type ColumnId,
} from "./journal-lines-model";

/** Props buňky. */
export interface JournalCellProps {
  /** Řádek. */
  line: JournalLine;
  /** Pořadí řádku v zobrazení (od 0). */
  rowIndex: number;
  /** Sloupec. */
  column: ColumnId;
}

/** Přepínač nedaňového řádku v buňce částky; není v pořadí Tab. */
function NonTaxToggle({ line, onToggle }: { line: JournalLine; onToggle: () => void }) {
  const { editor } = useJournalEditor();
  const { t } = editor;
  const texts = useDsTexts().fieldToggle;
  const locked = !editor.canEditCell(line, "nonTax");
  const reasonId = useId();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          data-slot="non-tax-toggle"
          type="button"
          tabIndex={-1}
          aria-disabled={locked || undefined}
          aria-pressed={!!line.nonTax}
          aria-label={texts.nonTax}
          aria-describedby={locked ? reasonId : undefined}
          onClick={(event) => {
            event.stopPropagation();
            if (!locked) onToggle();
          }}
          className={cn(
            "ds-disabled-control order-first mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[0.65rem] font-bold",
            line.nonTax
              ? "bg-warning-soft text-warning-strong"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {line.nonTax ? t.nonTaxShort : <ReceiptText className="size-3.5" />}
        </button>
      </TooltipTrigger>
      {locked ? (
        <span id={reasonId} className="sr-only">
          {texts.nonTaxLocked}
        </span>
      ) : null}
      <TooltipContent>
        {locked ? texts.nonTaxLocked : line.nonTax ? texts.nonTaxPressed : texts.nonTaxUnpressed}
      </TooltipContent>
    </Tooltip>
  );
}

/** Buňka řádku dokladu. */
export function JournalCell({ line, rowIndex, column }: JournalCellProps) {
  const { editor, keyboard } = useJournalEditor();
  const { t, editing, accountByCode, layout } = editor;
  const validationColumn = dataColumnOf(column);
  const columnLabel = isAccountColumn(column)
    ? journalAccountColumnLabel(column, t, {
        short: editor.counterShortLabel,
        name: editor.counterNameLabel,
      })
    : editor.labels[validationColumn];
  const category = CATEGORY_COLUMNS.has(column) ? editor.categoryState(line, column as CategoryColumn) : undefined;
  const canEdit = editor.canEditCell(line, column);
  const isEditing = editing?.rowId === line.id && editing.column === column;
  const calculated =
    column === "amount" && calculateLineAmount(line.quantity, line.unitPrice) !== undefined;
  const taxAccount =
    editor.mode === "mainAccount"
      ? accountByCode.get(editor.accountFor(line, "counterAccount") ?? "")
      : [line.debitAccount, line.creditAccount]
          .map((code) => accountByCode.get(code ?? ""))
          .find((account) => isResultAccountType(account));
  const nonTaxAllowed = editor.props.isNonTaxAllowed?.(line) ?? isResultAccountType(taxAccount);
  const toggleNonTax = () =>
    editor.patch(line.id, { nonTax: nonTaxAllowed ? !line.nonTax : false });
  const accountCode = isAccountColumn(column) ? editor.accountFor(line, column) : null;
  const accountTitle =
    accountCode && (!isAccountNameColumn(column) || layout.compactAccountIds.has(column))
      ? accountByCode.get(accountCode)?.name
      : undefined;
  const errorMessage = editor.validations.get(line.id)?.[validationColumn];
  const warningMessage = editor.vatWarnings.get(line.id)?.[validationColumn];
  const suggestionKey = journalSuggestionKey(column);
  const suggestion =
    !errorMessage && !warningMessage && suggestionKey
      ? editor.props.rowSuggestions?.[line.id]?.[suggestionKey]
      : undefined;
  const suggestionMessage = suggestion?.uncertain
    ? (suggestion.message ?? editor.dsTexts.extraction.suggestionUncertain(suggestion.source))
    : undefined;
  const rowEditing = editing?.rowId === line.id;
  const hint = category && !category.enabled ? editor.dsTexts.economicCategory.disabledAccount : accountTitle ?? (calculated ? t.quantityPriceHint : undefined);
  // Bublina chyby vzniká líně až při hover/focus; původní informace jde do téže bubliny.
  const status = useCellStatusTooltip({
    error: errorMessage,
    warning: warningMessage ?? suggestionMessage,
    extraInfo: hint,
  });
  const deductionCode = line.vatCodeId ? editor.vatCodeMap.get(line.vatCodeId) : undefined;
  const deductionHint =
    column === "vatCodeId" &&
    !editor.props.withoutAccounts &&
    deductionCode?.hasTax &&
    (deductionCode.direction === "in" || deductionCode.selfAssessment)
      ? line.vatDeduction === "none"
        ? t.deductionNoneHint
        : line.vatDeduction === "partial"
          ? t.deductionPartialHint.replace(
              "{share}",
              line.vatDeductionShare == null ? "—" : formatAmount(line.vatDeductionShare, 0),
            )
          : undefined
      : undefined;
  const node = (
    <div
      tabIndex={canEdit ? 0 : -1}
      role="gridcell"
      data-cell-key={`${line.id}:${column}`}
      aria-label={`${columnLabel} ${rowIndex + 1}`}
      aria-disabled={category && !category.enabled || undefined}
      data-invalid={errorMessage ? true : undefined}
      data-warning={warningMessage ? true : undefined}
      data-suggestion={suggestion ? (suggestion.uncertain ? "uncertain" : "suggested") : undefined}
      data-inherited={editor.pins.isInherited(line.id, column) || undefined}
      {...status.triggerProps}
      className={cn(
        "journal-grid-cell flex min-h-[1.8em] items-center truncate rounded-sm px-1 outline-none",
        canEdit && "cursor-cell",
        suggestion && "bg-suggestion-soft text-muted-foreground",
        suggestion?.uncertain && "ring-1 ring-inset ring-warning-strong",
        // Převzatá hodnota zakotveného sloupce je světlejší, dokud do ní uživatel nesáhne.
        editor.pins.isInherited(line.id, column) && "text-muted-foreground",
      )}
      onFocus={(event) => {
        status.triggerProps.onFocus?.(event);
        editor.setActive({ rowId: line.id, column });
      }}
      onClick={() => canEdit && !editing && editor.startEditing(line, column)}
      onDoubleClick={() => canEdit && editor.startEditing(line, column)}
      onKeyDown={(event) =>
        keyboard.onCellKeyDown(event, line, column, { canEdit, nonTaxAllowed, toggleNonTax })
      }
    >
      {column === "vatAmount" && line.vatManual && !rowEditing ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Lock
              role="img"
              data-slot="journal-fixed-tax"
              aria-label={t.vatGroups.fixedTax}
              className="mr-1 size-[0.85em] shrink-0 text-muted-foreground"
            />
          </TooltipTrigger>
          <TooltipContent>{t.vatGroups.fixedTax}</TooltipContent>
        </Tooltip>
      ) : null}
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          (column === "vs" || column === "debitVs" || column === "creditVs") &&
            "text-left font-mono tabular-nums",
        )}
      >
        {category?.single && !category.invalid ? (
          <FieldValue variant="plain" className="h-auto text-muted-foreground" lockedReason={editor.dsTexts.economicCategory.singleAllowed}>{categoryLabel(editor.props.categories ?? [], category.single.id)}</FieldValue>
        ) : category && !category.enabled ? "" : isEditing ? (
          <JournalCellEditor line={line} column={column} />
        ) : (
          editor.displayValue(line, column)
        )}
      </span>
      {suggestion?.uncertain ? (
        <AlertTriangle
          aria-hidden="true"
          data-slot="journal-suggestion"
          className="ml-1 size-4 shrink-0 text-warning-strong"
        />
      ) : null}
      {deductionHint ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              role="img"
              aria-label={deductionHint}
              data-slot="journal-deduction-indicator"
              className="ml-1 inline-flex size-4 shrink-0 items-center text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(event) => event.stopPropagation()}
            >
              <Percent aria-hidden="true" className="size-3.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent>{deductionHint}</TooltipContent>
        </Tooltip>
      ) : null}
      {column === "text" && line.autoKind && !isEditing ? (
        <span
          data-slot="journal-auto-kind"
          className="ds-badge inline-flex min-w-0 max-w-full items-center rounded-sm border bg-muted px-2 text-xs text-muted-foreground"
          title={
            line.autoKind === "advance"
              ? editor.dsTexts.vatFive.autoAdvance
              : editor.dsTexts.vatFive.autoAdvanceFx
          }
        >
          <span className="truncate">
            {line.autoKind === "advance"
              ? editor.dsTexts.vatFive.autoAdvance
              : editor.dsTexts.vatFive.autoAdvanceFx}
          </span>
        </span>
      ) : null}
      {(column === "amount" || column === "unitPrice") && !rowEditing && canEdit ? (
        <JournalGrossHelper line={line} column={column} />
      ) : null}
      {column === "amount" && nonTaxAllowed && !rowEditing ? (
        <NonTaxToggle line={line} onToggle={toggleNonTax} />
      ) : null}
    </div>
  );
  if (status.active)
    return (
      <>
        {node}
        {status.tooltip}
      </>
    );
  if (!hint) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
