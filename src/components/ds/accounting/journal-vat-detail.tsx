/** Údaje DPH mimo mřížku; používají sdílený model a pole. */
import { formatAmount } from "../../../lib/format";
import { mulDivRound } from "../../../lib/decimal-round";
import { formatCodeName } from "../../../lib/code-format";
import { Input } from "../../ui/input";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { DetailField } from "./journal-detail-field";
import { JournalVatAccountingFields } from "./journal-vat-accounting-fields";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine } from "./journal-lines";
import type { ColumnId } from "./journal-lines-model";
import { resolveLineVat } from "./journal-vat";
const READ_ONLY_AMOUNT = "text-right tabular-nums";

/** Údaje DPH řádku, které nejsou v mřížce. */
export function VatDetail({ line, shown }: { line: JournalLine; shown: Set<ColumnId> }) {
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
      <JournalVatAccountingFields line={line} inbound={Boolean(inbound)} code={code} />
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
