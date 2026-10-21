/** Účetní pole DPH řádku; oprávnění a hodnoty řídí APP, skrytí nic nemaže. */
import type { ReactElement } from "react";
import { CheckboxField } from "../form/checkbox-field";
import { DecimalInput } from "../form/decimal-input";
import { SegmentedField } from "../form/segmented-field";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { DetailField } from "./journal-detail-field";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine, VatCodeOption, VatDeduction } from "./journal-lines";

type DetailColumn = "vatDeduction" | "vatDeductionShare" | "khLimitExcluded";
interface AccountingFieldsProps {
  line: JournalLine;
  inbound: boolean;
  code?: VatCodeOption;
}

/** Důvod je přístupný i fokusem a klepnutím na zakázané pole. */
function LockedField({ children, reason }: { children: ReactElement; reason?: string }) {
  return (
    <DisabledReasonTooltip content={reason} blocked={Boolean(reason)}>
      <div
        tabIndex={reason ? 0 : undefined}
        aria-label={reason}
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </div>
    </DisabledReasonTooltip>
  );
}

/** Sdílený detail faktur; zálohové listy účetní pole nezobrazí. */
export function JournalVatAccountingFields({ line, inbound, code }: AccountingFieldsProps) {
  const { editor } = useJournalEditor();
  const { t } = editor;
  if (editor.props.withoutAccounts) return null;
  const errors = editor.validations.get(line.id) ?? {};
  const warnings = editor.vatWarnings.get(line.id) ?? {};
  const reason = (field: DetailColumn) => {
    if (editor.canEditCell(line, field)) return undefined;
    const supplied = editor.props.vat?.rowDetails?.disabledReason;
    return (typeof supplied === "function" ? supplied(line, field) : supplied) ?? t.vatDetailLocked;
  };
  const deductionReason = reason("vatDeduction");
  const shareReason = reason("vatDeductionShare");
  const khReason = reason("khLimitExcluded");
  return (
    <>
      {inbound ? (
        <DetailField
          label={t.vatDeduction}
          width="flex-none w-max"
          labelFeedback
          warning={warnings.vatCodeId}
          error={errors.vatDeduction}
        >
          <LockedField reason={deductionReason}>
            <SegmentedField<VatDeduction>
              ariaLabel={t.vatDeduction}
              error={errors.vatDeduction}
              warning={warnings.vatCodeId}
              disabled={Boolean(deductionReason)}
              options={[
                { value: "full", label: t.deductionFull },
                { value: "partial", label: t.deductionPartial },
                { value: "none", label: t.deductionNone },
              ]}
              value={line.vatDeduction ?? "full"}
              onChange={(value) => {
                if (!deductionReason) editor.patch(line.id, { vatDeduction: value });
              }}
            />
          </LockedField>
        </DetailField>
      ) : null}
      {inbound && line.vatDeduction === "partial" ? (
        <DetailField
          fieldKey={`${line.id}:vatDeductionShare`}
          label={t.deductionShare}
          width="flex-none w-24"
          numeric
          error={errors.vatDeductionShare}
        >
          <LockedField reason={shareReason}>
            <DecimalInput
              aria-label={t.deductionShare}
              value={line.vatDeductionShare}
              decimals={0}
              disabled={Boolean(shareReason)}
              onChange={(value) => {
                if (!shareReason)
                  editor.patch(line.id, {
                    vatDeductionShare: value === "" ? undefined : Number(value),
                  });
              }}
            />
          </LockedField>
        </DetailField>
      ) : null}
      {code?.direction ? (
        <div className="min-w-0 basis-full" data-journal-field={`${line.id}:khLimitExcluded`}>
          <LockedField reason={khReason}>
            <CheckboxField
              label={t.khLimitExcluded}
              checked={line.khLimitExcluded ?? false}
              disabled={Boolean(khReason)}
              align="input"
              className="pt-0!"
              onCheckedChange={(value) => {
                if (!khReason) editor.patch(line.id, { khLimitExcluded: value });
              }}
            />
          </LockedField>
        </div>
      ) : null}
    </>
  );
}
