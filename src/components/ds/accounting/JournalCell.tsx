/**
 * Jedna buňka řádku dokladu.
 * Vlastní: zobrazení hodnoty nebo editoru, stav chyby a varování, přepínač nedaňový,
 *   tooltip s názvem účtu a zahájení editace klikem, dvojklikem a klávesnicí.
 * Nesmí: počítat hodnoty – text buňky dává journalDisplayValue, zápis JournalCellEditor.
 */
import { Pencil, ReceiptText } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { JournalCellEditor } from "./JournalCellEditor";
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
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          aria-pressed={!!line.nonTax}
          aria-label={line.nonTax ? t.nonTaxOn : t.nonTaxOff}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className={cn(
            "order-first mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[0.65rem] font-bold",
            line.nonTax ? "bg-warning-soft text-warning-strong" : "text-muted-foreground hover:bg-muted",
          )}
        >
          {line.nonTax ? t.nonTaxShort : <ReceiptText className="size-3.5" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{line.nonTax ? t.nonTaxOn : t.nonTaxOff}</TooltipContent>
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
  const rowEditing = editing?.rowId === line.id;
  const node = (
    <div
      tabIndex={canEdit ? 0 : -1}
      role="gridcell"
      data-cell-key={`${line.id}:${column}`}
      aria-label={`${columnLabel} ${rowIndex + 1}`}
      data-invalid={errorMessage ? true : undefined}
      data-warning={warningMessage ? true : undefined}
      title={errorMessage ?? warningMessage}
      className={cn(
        "journal-grid-cell flex min-h-[1.8em] items-center truncate rounded-sm px-1 outline-none",
        canEdit && "cursor-cell",
      )}
      onFocus={() => editor.setActive({ rowId: line.id, column })}
      onClick={() => canEdit && !editing && editor.startEditing(line, column)}
      onDoubleClick={() => canEdit && editor.startEditing(line, column)}
      onKeyDown={(event) =>
        keyboard.onCellKeyDown(event, line, column, { canEdit, nonTaxAllowed, toggleNonTax })
      }
    >
      {column === "vatAmount" && line.vatManual && !rowEditing ? (
        <Pencil
          aria-label={t.vatManual}
          className="mr-1 size-[0.85em] shrink-0 text-muted-foreground"
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">
        {isEditing ? (
          <JournalCellEditor line={line} column={column} />
        ) : (
          editor.displayValue(line, column)
        )}
      </span>
      {column === "amount" && nonTaxAllowed && !rowEditing ? (
        <NonTaxToggle line={line} onToggle={toggleNonTax} />
      ) : null}
    </div>
  );
  const hint = accountTitle ?? (calculated ? t.quantityPriceHint : undefined);
  if (!hint) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}
