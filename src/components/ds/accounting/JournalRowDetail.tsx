/**
 * Rozbalený detail řádku dokladu.
 * Vlastní: pole skrytá z mřížky (množství, MJ, VS, partner, zakázka), údaje DPH řádku
 *   (sazba, s DPH, nárok na odpočet, PDP, domácí částky) a částku v domácí měně.
 * Nesmí: zobrazovat pole, které je viditelné v mřížce; nesmí počítat daň jinak než journal-vat.
 */
import type * as React from "react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { SegmentedField } from "../form/segmented-field";
import { DimensionSelect } from "./dimension-select";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine, JournalLineColumn, VatDeduction } from "./journal-lines";
import {
  DIMENSION_COLUMNS,
  PARTNER_COLUMNS,
  SHARED_COLUMNS,
  SPLIT_COLUMNS,
  VS_COLUMNS,
  roundJournalAmount,
  type ColumnId,
} from "./journal-lines-model";
import { resolveLineVat } from "./journal-vat";
import { PartnerSelect } from "./partner-select";
import { UnitSelect } from "./unit-select";
import { VsField } from "./vs-field";

/** Popsané pole detailu s volitelnou chybou. */
function DetailField({
  label,
  width,
  error,
  children,
}: {
  label: string;
  width: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", width)}>
      <Label title={label} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <span role="alert" className="truncate text-xs text-destructive" title={error}>
          {error}
        </span>
      ) : null}
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
  const conversion =
    (vat?.vatRate || rate || 0) / ((vat?.vatRate ? vat?.vatRateAmount : editor.rateAmount) || 1);
  const errors = editor.validations.get(line.id) ?? {};
  const inbound = (code?.direction === "in" || code?.selfAssessment) && code?.hasTax;
  const homeValue = (value: number | undefined, fallback: number) =>
    formatAmount(value ?? roundJournalAmount(fallback * conversion), 2);
  return (
    <>
      {!shown.has("vatRate") && code ? (
        <DetailField label={t.vatRate} width="flex-none w-[6rem]">
          <Input
            readOnly
            value={editor.displayValue(line, "vatRate")}
            className={READ_ONLY_AMOUNT}
          />
        </DetailField>
      ) : null}
      {!shown.has("grossAmount") && code ? (
        <DetailField label={t.grossAmount} width="flex-none w-[9.5rem]">
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
        <DetailField label={t.vatDeduction} width="flex-none w-max">
          <SegmentedField
            ariaLabel={t.vatDeduction}
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
          label={t.deductionShare}
          width="flex-none w-[6rem]"
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
          label={t.pdpSubject}
          width="min-w-[12rem] flex-1 basis-[14rem]"
          error={errors.pdpSubjectCode}
        >
          <OptionSelect
            value={line.pdpSubjectCode}
            disabled={readOnly}
            options={(vat?.pdpSubjects ?? []).map((item) => ({
              value: item.code,
              label: `${item.code} – ${item.name}`,
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
      />
    );
  if (id === "quantity" || id === "unitPrice")
    return (
      <DecimalInput
        value={line[id]}
        disabled={disabled}
        onChange={(value) =>
          editor.updateCalculated(line, { [id]: value === "" ? undefined : Number(value) })
        }
      />
    );
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
  const detailFieldCount = fields.length + (foreign && !shown.has("homeAmount") ? 1 : 0);
  return (
    <div
      data-slot="journal-line-detail-fields"
      data-field-count={detailFieldCount}
      className="journal-line-detail-grid flex flex-wrap items-end gap-3 bg-muted/30 p-3"
    >
      {fields.map((id) => (
        <DetailField key={id} label={labels[id]} width={widthClass(id)}>
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
