/**
 * Rozbalený detail řádku dokladu.
 * Vlastní: pole skrytá z mřížky (množství, MJ, VS, partner, zakázka), údaje DPH řádku
 *   (sazba, s DPH, nárok na odpočet, PDP, domácí částky) a částku v domácí měně.
 * Nesmí: zobrazovat pole, které je viditelné v mřížce; nesmí počítat daň jinak než journal-vat.
 */
import type * as React from "react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { DetailField } from "./journal-detail-field";
import { VatDetail } from "./journal-vat-detail";
import { Input } from "../../ui/input";
import { DecimalInput } from "../form/decimal-input";
import { FieldValue } from "../form/field-value";
import { categoryLabel } from "./journal-category-model";
import { CategorySelect } from "./category-select";
import { JournalGrossHelper } from "./journal-gross-helper";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine, JournalLineColumn } from "./journal-lines";
import {
  CATEGORY_COLUMNS,
  PARTNER_COLUMNS,
  SHARED_COLUMNS,
  SPLIT_COLUMNS,
  VS_COLUMNS,
  type ColumnId,
} from "./journal-lines-model";
import { PartnerSelect } from "./partner-select";
import { UnitSelect } from "./unit-select";
import { VsField } from "./vs-field";

const READ_ONLY_AMOUNT = "text-right tabular-nums";

const widthClass = (id: JournalLineColumn) =>
  VS_COLUMNS.has(id)
    ? "flex-none w-[10rem]"
    : id === "quantity"
      ? "flex-none w-[7rem]"
      : id === "unitId"
        ? "flex-none w-[6rem]"
        : id === "unitPrice"
          ? "flex-none w-[8rem]"
          : PARTNER_COLUMNS.has(id) || CATEGORY_COLUMNS.has(id)
            ? "min-w-[12rem] flex-1 basis-[14rem]"
            : "flex-none w-auto";

/** Vstup jednoho pole detailu podle sloupce. */
function DetailInput({ line, id }: { line: JournalLine; id: JournalLineColumn }) {
  const { editor } = useJournalEditor();
  const { props } = editor;
  const disabled = !editor.canEditCell(line, id);
  const set = (values: Partial<JournalLine>) => editor.patch(line.id, values);
  if (id === "categoryId" || id === "debitCategoryId" || id === "creditCategoryId") {
    const state = editor.categoryState(line, id);
    if (state.single && !state.invalid) return <FieldValue className="text-muted-foreground" lockedReason={editor.dsTexts.economicCategory.singleAllowed}>{categoryLabel(props.categories ?? [], state.single.id)}</FieldValue>;
    return <CategorySelect options={state.options} value={line[id]} disabled={disabled}
      onChange={(value) => set({ [id]: value })} onEditSelected={props.onEditCategory} onCreate={props.onCreateCategory} />;
  }
  if (id === "partnerId" || id === "debitPartnerId" || id === "creditPartnerId")
    return (
      <PartnerSelect
        partners={props.partners ?? []}
        value={line[id]}
        disabled={disabled}
        onChange={(value) => set({ [id]: value })}
      />
    );
  if (id === "unitId")
    return (
      <UnitSelect
        options={props.units ?? []}
        value={line.unitId}
        disabled={disabled}
        onChange={(value) => set({ unitId: value })}
        onCreateUnit={props.onCreateUnit}
        onEditSelected={props.onEditUnit}
      />
    );
  if (id === "quantity" || id === "unitPrice") {
    const input = (
      <DecimalInput
        value={line[id]}
        disabled={disabled}
        className={id === "unitPrice" ? "pr-[calc(var(--control-h)*0.8)]" : undefined}
        onChange={(value) =>
          editor.updateCalculated(line, { [id]: value === "" ? undefined : Number(value) })
        }
      />
    );
    if (id === "quantity" || disabled) return input;
    return (
      <div className="relative">
        {input}
        <JournalGrossHelper
          line={line}
          column="unitPrice"
          tabbable
          className="absolute top-1/2 right-[0.4em] -translate-y-1/2"
        />
      </div>
    );
  }
  if (VS_COLUMNS.has(id))
    return (
      <VsField
        value={String(line[id] ?? "")}
        disabled={disabled}
        onChange={(value) => set({ [id]: value })}
      />
    );
  return (
    <Input
      value={String(line[id] ?? "")}
      disabled={disabled}
      onChange={(event) => set({ [id]: event.target.value })}
    />
  );
}

/** Detail řádku pod řádkem mřížky. */
export function JournalRowDetail({ line }: { line: JournalLine }) {
  const { editor } = useJournalEditor();
  const { labels, foreign, homeAmountLabel } = editor;
  const shown = new Set(editor.layout.visibleColumns.map((column) => column.id));
  const candidates: JournalLineColumn[] =
    editor.mode === "mainAccount"
      ? ["quantity", "unitId", "unitPrice", "vs", "partnerId", "categoryId"]
      : [
          "quantity",
          "unitId",
          "unitPrice",
          ...(editor.sideFields === "split" ? SPLIT_COLUMNS : SHARED_COLUMNS).filter((id) => !CATEGORY_COLUMNS.has(id)),
          ...(editor.props.categoryBySide ? ["debitCategoryId", "creditCategoryId"] as const : ["categoryId"] as const),
        ];
  const fields = candidates.filter((id) => !shown.has(id));
  const errors: Partial<Record<string, string>> = editor.validations.get(line.id) ?? {};
  const warnings: Partial<Record<string, string>> = editor.vatWarnings.get(line.id) ?? {};
  const detailFieldCount = fields.length + (foreign && !shown.has("homeAmount") ? 1 : 0);
  return (
    <div
      data-slot="journal-line-detail-fields"
      data-field-count={detailFieldCount}
      className="journal-line-detail-grid flex flex-wrap items-start gap-3 bg-muted/30 p-3"
    >
      {fields.map((id) => (
        <DetailField
          key={id}
          fieldKey={`${line.id}:${id}`}
          label={labels[id]}
          width={widthClass(id)}
          numeric={id === "quantity" || id === "unitPrice"}
          error={errors[id]}
          warning={warnings[id]}
        >
          <DetailInput line={line} id={id} />
        </DetailField>
      ))}
      {editor.vatOn ? <VatDetail line={line} shown={shown} /> : null}
      {foreign && !shown.has("homeAmount") ? (
        <DetailField label={homeAmountLabel} width="w-[9.5rem] flex-none">
          <Input
            readOnly
            value={editor.displayValue(line, "homeAmount")}
            className={READ_ONLY_AMOUNT}
          />
        </DetailField>
      ) : null}
    </div>
  );
}
