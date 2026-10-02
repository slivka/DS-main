/**
 * Editor jedné buňky řádku dokladu.
 * Vlastní: volbu editoru podle typu sloupce (účet, zakázka, partner, MJ, kód DPH, částka, text)
 *   a zápis hodnoty do řádku.
 * Nesmí: měnit pořadí řádků ani řešit fokus mimo svou buňku (to dělá useJournalKeyboard).
 */
import { Input } from "../../ui/input";
import { DecimalInput } from "../form/decimal-input";
import { AccountSelect } from "./account-select";
import { DimensionSelect } from "./dimension-select";
import { useJournalEditor } from "./journal-editor-context";
import { isResultAccountType, type JournalLine } from "./journal-lines";
import {
  NUMERIC_COLUMNS,
  VAT_NUMERIC,
  VS_COLUMNS,
  accountDataColumn,
  dataColumnOf,
  isAccountColumn,
  type ColumnId,
} from "./journal-lines-model";
import { resolveLineVat } from "./journal-vat";
import { PartnerSelect } from "./partner-select";
import { UnitSelect } from "./unit-select";
import { VatCodeSelect } from "./vat-code-select";

/** Props editoru buňky. */
export interface JournalCellEditorProps {
  /** Editovaný řádek. */
  line: JournalLine;
  /** Editovaný sloupec. */
  column: ColumnId;
}

/** Výběr účtu v buňce; u protiúčtu zapíše i stranu proti hlavnímu účtu. */
function AccountCellEditor({ line, column }: JournalCellEditorProps) {
  const { editor, keyboard } = useJournalEditor();
  if (!isAccountColumn(column)) return null;
  const { selectKey, closeSelect } = keyboard.editorKeys(line, column);
  const dataColumn = accountDataColumn(column);
  const { accounts } = editor.props;
  const { mainOption, counterColumn } = editor;
  return (
    <AccountSelect
      defaultOpen
      accounts={
        editor.mainAccount && dataColumn === "counterAccount" && mainOption?.category
          ? accounts.filter((account) => account.category !== mainOption.category)
          : accounts
      }
      value={editor.accountFor(line, column)}
      initialSearch={editor.editing?.seed}
      onKeyDown={selectKey}
      onChange={(value) => {
        const selected = editor.accountByCode.get(value);
        const nonTax = isResultAccountType(selected, value) ? !!selected?.nonTaxDefault : false;
        editor.patch(
          line.id,
          dataColumn === "counterAccount" && counterColumn
            ? { counterAccount: value, [counterColumn]: value, nonTax }
            : { [dataColumn]: value, nonTax },
        );
        editor.finish();
      }}
      onOpenChange={closeSelect}
      className={VS_COLUMNS.has(dataColumn) ? "journal-cell-editor text-left" : "journal-cell-editor"}
    />
  );
}

/** Číselný editor částky, množství, ceny nebo částek DPH. */
function NumericCellEditor({ line, column }: JournalCellEditorProps) {
  const { editor, keyboard } = useJournalEditor();
  const { commonKey } = keyboard.editorKeys(line, column);
  const { editing, labels } = editor;
  const dataColumn = dataColumnOf(column);
  const clearSeed = () => {
    if (editing?.seed !== undefined) editor.setEditing({ ...editing, seed: undefined });
  };
  if (VAT_NUMERIC.has(column)) {
    const resolved = resolveLineVat(line, editor.vatCodeMap, {
      calcMode: editor.calcMode,
      foreign: editor.foreign,
    });
    return (
      <DecimalInput
        autoFocus
        aria-label={labels[dataColumn]}
        value={column === "vatAmount" ? resolved.vat : resolved.gross}
        seed={editing?.seed}
        decimals={2}
        className="journal-cell-editor"
        onKeyDown={commonKey}
        onBlur={editor.finish}
        onChange={(value) => {
          clearSeed();
          const numeric = value === "" ? undefined : Number(value);
          if (column === "vatAmount")
            editor.patchVat(
              line,
              numeric == null
                ? { vatManual: false, vatAmount: undefined }
                : { vatManual: true, vatAmount: numeric },
            );
          else editor.patchVat(line, { grossAmount: numeric });
        }}
      />
    );
  }
  const numericColumn = column === "quantity" || column === "unitPrice" ? column : "amount";
  const current =
    numericColumn === "amount" && editor.foreign ? line.foreignAmount : line[numericColumn];
  return (
    <DecimalInput
      autoFocus
      aria-label={labels[numericColumn]}
      value={current}
      seed={editing?.seed}
      decimals={numericColumn === "amount" ? 2 : 4}
      displayDecimals={numericColumn === "unitPrice" ? 2 : undefined}
      className="journal-cell-editor"
      onKeyDown={commonKey}
      onBlur={editor.finish}
      onChange={(value) => {
        clearSeed();
        const numeric = value === "" ? undefined : Number(value);
        if (line.isRounding) {
          editor.props.rounding?.onChange?.(numeric ?? 0);
          return;
        }
        if (numericColumn === "amount") editor.patch(line.id, editor.amountValues(numeric));
        else editor.updateCalculated(line, { [numericColumn]: numeric });
      }}
    />
  );
}

/** Editor buňky podle typu sloupce. */
export function JournalCellEditor({ line, column }: JournalCellEditorProps) {
  const { editor, keyboard } = useJournalEditor();
  if (isAccountColumn(column)) return <AccountCellEditor line={line} column={column} />;
  if (VAT_NUMERIC.has(column) || NUMERIC_COLUMNS.has(column))
    return <NumericCellEditor line={line} column={column} />;
  const { selectKey, closeSelect, commonKey } = keyboard.editorKeys(line, column);
  const { editing, props } = editor;
  const selectProps = {
    defaultOpen: true,
    initialSearch: editing?.seed,
    onKeyDown: selectKey,
    onOpenChange: closeSelect,
    className: "journal-cell-editor",
  };
  const choose = (values: Partial<JournalLine>) => {
    editor.patch(line.id, values);
    editor.finish();
  };
  if (column === "dimensionId" || column === "debitDimensionId" || column === "creditDimensionId")
    return (
      <DimensionSelect
        {...selectProps}
        options={props.dimensions ?? []}
        value={line[column]}
        onChange={(value) => choose({ [column]: value })}
      />
    );
  if (column === "partnerId" || column === "debitPartnerId" || column === "creditPartnerId")
    return (
      <PartnerSelect
        {...selectProps}
        partners={props.partners ?? []}
        value={line[column]}
        onChange={(value) => choose({ [column]: value })}
      />
    );
  if (column === "unitId")
    return (
      <UnitSelect
        {...selectProps}
        options={props.units ?? []}
        value={line.unitId}
        onChange={(value) => choose({ unitId: value })}
        onCreateUnit={props.onCreateUnit}
      />
    );
  if (column === "vatCodeId")
    return (
      <VatCodeSelect
        {...selectProps}
        codes={editor.vatCodes}
        value={line.vatCodeId}
        onChange={(value) => {
          editor.changeVatCode(line, value);
          editor.finish();
        }}
      />
    );
  const dataColumn = dataColumnOf(column);
  return (
    <Input
      autoFocus
      aria-label={editor.labels[dataColumn]}
      value={editing?.seed ?? String(line[dataColumn] ?? "")}
      className="journal-cell-editor"
      onKeyDown={commonKey}
      onBlur={editor.finish}
      onChange={(event) => {
        if (editing?.seed !== undefined) editor.setEditing({ ...editing, seed: undefined });
        editor.patch(line.id, {
          [dataColumn]: VS_COLUMNS.has(dataColumn)
            ? event.target.value.replace(/\D/g, "").slice(0, 10)
            : event.target.value,
        });
      }}
    />
  );
}
