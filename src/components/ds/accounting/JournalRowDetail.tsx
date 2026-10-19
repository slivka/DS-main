/**
 * Rozbalený detail řádku dokladu.
 * Vlastní: pole skrytá z mřížky (množství, MJ, VS, partner, zakázka), údaje DPH řádku
 *   (sazba, s DPH, nárok na odpočet, PDP, domácí částky) a částku v domácí měně.
 * Nesmí: zobrazovat pole, které je viditelné v mřížce; nesmí počítat daň jinak než journal-vat.
 */
import type * as React from "react";

import { formatAmount } from "../../../lib/format";
import { mulDivRound } from "../../../lib/decimal-round";
import { cn } from "../../../lib/utils";
import { formatCodeName } from "../../../lib/code-format";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { DecimalInput } from "../form/decimal-input";
import {
  FieldFeedbackContext,
  FieldFeedbackIndicator,
  useFieldStatus,
} from "../form/field-feedback";
import { OptionSelect } from "../form/option-select";
import { SegmentedField } from "../form/segmented-field";
import { DimensionSelect } from "./dimension-select";
import { JournalGrossHelper } from "./journal-gross-helper";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine, JournalLineColumn, VatDeduction } from "./journal-lines";
import {
  DIMENSION_COLUMNS,
  PARTNER_COLUMNS,
  SHARED_COLUMNS,
  SPLIT_COLUMNS,
  VS_COLUMNS,
  type ColumnId,
} from "./journal-lines-model";
import { resolveLineVat } from "./journal-vat";
import { PartnerSelect } from "./partner-select";
import { UnitSelect } from "./unit-select";
import { VsField } from "./vs-field";

/**
 * Popsané pole detailu: popisek nahoře, prvek pod ním, nic dalšího. Chyba i varování jsou
 * rámeček a ⚠ uvnitř pole s bublinou (čísla vlevo); plný text jde do pruhu formuláře.
 */
function DetailField({
  label,
  width,
  error,
  warning,
  numeric,
  fieldKey,
  children,
  labelFeedback,
}: {
  /** Klíč `rowId:columnId` pro fokus ze souhrnu chyb. */
  fieldKey?: string;
  label: string;
  width: string;
  error?: string;
  warning?: string;
  numeric?: boolean;
  children: React.ReactNode;
  /** Stav prvku bez místa uvnitř patří k popisku. */
  labelFeedback?: boolean;
}) {
  const status = useFieldStatus({ error, warning });
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1", width)}
      data-slot="journal-detail-field"
      data-journal-field={fieldKey}
    >
      <span className="flex min-w-0 items-center gap-1">
        <Label
          title={label}
          className={cn(
            "min-w-0 truncate whitespace-nowrap text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {label}
        </Label>
        {labelFeedback ? (
          <FieldFeedbackIndicator error={error} warning={warning} placement="label" />
        ) : null}
      </span>
      <FieldFeedbackContext.Provider value={{}}>
        <div
          data-feedback={status.tone}
          aria-invalid={status.controlProps["aria-invalid"]}
          aria-describedby={status.describedById}
          className={cn(
            "relative h-[var(--control-h)] min-w-0 [--field-feedback-offset:1.5em]",
            status.tone &&
              (numeric
                ? "[&_input]:pl-[1.75em]!"
                : "[&_input]:pr-[1.75em]! [&_[role=combobox]]:pr-[2.75em]!"),
            status.tone &&
              "[&_input]:ring-1 [&_[role=combobox]]:ring-1 [&_[role=radiogroup]]:ring-1",
            error &&
              "[&_input]:border-destructive [&_[role=combobox]]:border-destructive [&_[role=radiogroup]]:border-destructive [&_input]:ring-destructive [&_[role=combobox]]:ring-destructive [&_[role=radiogroup]]:ring-destructive",
            !error &&
              warning &&
              "[&_input]:border-warning-strong [&_[role=combobox]]:border-warning-strong [&_[role=radiogroup]]:border-warning-strong [&_input]:ring-warning-strong [&_[role=combobox]]:ring-warning-strong [&_[role=radiogroup]]:ring-warning-strong",
          )}
        >
          {children}
          {!labelFeedback ? (
            <FieldFeedbackIndicator
              error={error}
              warning={warning}
              side={numeric ? "start" : "end"}
              id={status.describedById}
            />
          ) : null}
        </div>
      </FieldFeedbackContext.Provider>
    </div>
  );
}

const READ_ONLY_AMOUNT = "text-right tabular-nums";

/** Údaje DPH řádku, které nejsou v mřížce. */
function VatDetail({ line, shown }: { line: JournalLine; shown: Set<ColumnId> }) {
  const { editor } = useJournalEditor();
  const { t, vatCodeMap, foreign } = editor;
  const vat = editor.props.vat;
  const code = line.vatCodeId ? vatCodeMap.get(line.vatCodeId) : undefined;
  const resolved = resolveLineVat(line, vatCodeMap, { calcMode: editor.calcMode, foreign });
  const readOnly = editor.vatReadOnly;
  const rate = editor.rate;
  const fxRate = vat?.vatRate || rate || 0;
  const fxUnit = (vat?.vatRate ? vat?.vatRateAmount : editor.rateAmount) || 1;
  const errors = editor.validations.get(line.id) ?? {};
  const warnings = editor.vatWarnings.get(line.id) ?? {};
  const inbound = (code?.direction === "in" || code?.selfAssessment) && code?.hasTax;
  const homeValue = (value: number | undefined, fallback: number) =>
    formatAmount(value ?? mulDivRound(fallback, fxRate, fxUnit, 2), 2);
  return (
    <>
      {!shown.has("vatRate") && code ? (
        <DetailField label={t.vatRate} width="flex-none w-[6rem]" numeric>
          <Input
            readOnly
            value={editor.displayValue(line, "vatRate")}
            className={READ_ONLY_AMOUNT}
          />
        </DetailField>
      ) : null}
      {!shown.has("grossAmount") && code ? (
        <DetailField
          label={t.grossAmount}
          width="flex-none w-[9.5rem]"
          numeric
          error={errors.vatAmount}
          warning={warnings.vatAmount}
        >
          <DecimalInput
            value={resolved.gross}
            decimals={2}
            disabled={!editor.canEditCell(line, "grossAmount")}
            onChange={(value) =>
              editor.patchVat(line, { grossAmount: value === "" ? undefined : Number(value) })
            }
          />
        </DetailField>
      ) : null}
      {inbound ? (
        <DetailField
          label={t.vatDeduction}
          width="flex-none w-max"
          labelFeedback
          warning={warnings.vatCodeId}
          error={errors.vatDeduction}
        >
          <SegmentedField
            ariaLabel={t.vatDeduction}
            error={errors.vatDeduction}
            warning={warnings.vatCodeId}
            disabled={readOnly}
            options={[
              { value: "full", label: t.deductionFull },
              { value: "none", label: t.deductionNone },
              { value: "partial", label: t.deductionPartial },
            ]}
            value={line.vatDeduction ?? "full"}
            onChange={(value) =>
              editor.patch(line.id, {
                vatDeduction: value as VatDeduction,
                vatDeductionShare: value === "partial" ? line.vatDeductionShare : undefined,
              })
            }
          />
        </DetailField>
      ) : null}
      {inbound && line.vatDeduction === "partial" ? (
        <DetailField
          fieldKey={`${line.id}:vatDeductionShare`}
          label={t.deductionShare}
          width="flex-none w-[6rem]"
          numeric
          error={errors.vatDeductionShare}
        >
          <DecimalInput
            value={line.vatDeductionShare}
            decimals={0}
            disabled={readOnly}
            onChange={(value) =>
              editor.patch(line.id, {
                vatDeductionShare: value === "" ? undefined : Number(value),
              })
            }
          />
        </DetailField>
      ) : null}
      {code?.requiresPdpSubject ? (
        <DetailField
          fieldKey={`${line.id}:pdpSubjectCode`}
          label={t.pdpSubject}
          width="min-w-[12rem] flex-1 basis-[14rem]"
          error={errors.pdpSubjectCode}
        >
          <OptionSelect
            value={line.pdpSubjectCode}
            disabled={readOnly}
            options={(vat?.pdpSubjects ?? []).map((item) => ({
              value: item.code,
              label: formatCodeName(item.code, item.name),
            }))}
            onChange={(value) => editor.patch(line.id, { pdpSubjectCode: value || null })}
          />
        </DetailField>
      ) : null}
      {foreign && code?.hasTax ? (
        <>
          <DetailField
            label={t.vatBaseHome.replace("{symbol}", editor.homeMark)}
            width="flex-none w-[9.5rem]"
          >
            <Input
              readOnly
              value={homeValue(line.vatBaseHome, resolved.base)}
              className={READ_ONLY_AMOUNT}
            />
          </DetailField>
          <DetailField
            label={t.vatHome.replace("{symbol}", editor.homeMark)}
            width="flex-none w-[9.5rem]"
          >
            <Input
              readOnly
              value={homeValue(line.vatAmountHome, resolved.vat)}
              className={READ_ONLY_AMOUNT}
            />
          </DetailField>
        </>
      ) : null}
    </>
  );
}

const widthClass = (id: JournalLineColumn) =>
  VS_COLUMNS.has(id)
    ? "flex-none w-[10rem]"
    : id === "quantity"
      ? "flex-none w-[7rem]"
      : id === "unitId"
        ? "flex-none w-[6rem]"
        : id === "unitPrice"
          ? "flex-none w-[8rem]"
          : PARTNER_COLUMNS.has(id) || DIMENSION_COLUMNS.has(id)
            ? "min-w-[12rem] flex-1 basis-[14rem]"
            : "flex-none w-auto";

/** Vstup jednoho pole detailu podle sloupce. */
function DetailInput({ line, id }: { line: JournalLine; id: JournalLineColumn }) {
  const { editor } = useJournalEditor();
  const { props } = editor;
  const disabled = !editor.canEditCell(line, id);
  const set = (values: Partial<JournalLine>) => editor.patch(line.id, values);
  if (id === "dimensionId" || id === "debitDimensionId" || id === "creditDimensionId")
    return (
      <DimensionSelect
        options={props.dimensions ?? []}
        value={line[id]}
        disabled={disabled}
        onChange={(value) => set({ [id]: value })}
        onEditSelected={props.onEditDimension}
        onCreate={props.onCreateDimension}
      />
    );
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
      ? ["quantity", "unitId", "unitPrice", "vs", "partnerId", "dimensionId"]
      : [
          "quantity",
          "unitId",
          "unitPrice",
          ...(editor.sideFields === "split" ? SPLIT_COLUMNS : SHARED_COLUMNS),
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
