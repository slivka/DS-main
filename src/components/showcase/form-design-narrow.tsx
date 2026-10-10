/**
 * Ukázka nejužších polí pro měření v e2e.
 * Vlastní: MJ v šířce nejužšího sloupce a výzvu účtu v úzkém poli s přepínačem banky.
 * Nesmí: zavádět vlastní varianty ovládání.
 */
import { BankAccountField, PaymentOrderAccountField, UnitSelect, type UnitOption } from "../ds";
import { JOURNAL_COLUMN_WIDTHS } from "../ds/accounting/journal-column-layout";
import { useDsTexts } from "../../ds-texts";

const units: UnitOption[] = [
  { id: "piece", code: "ks", name: "kus", isActive: true },
  { id: "hour", code: "hod", name: "hodina", isActive: true },
];

/** Nejužší MJ (s tužkou i bez) a úzké pole účtu se zakázanou výzvou. */
export function FormDesignNarrowFields() {
  const texts = useDsTexts().documentForm;
  const width = `${JOURNAL_COLUMN_WIDTHS.unitId}rem`;
  return (
    <div className="flex flex-wrap items-start gap-4" data-testid="narrow-fields">
      {units.flatMap((unit) =>
        [true, false].map((editable) => (
          <div
            key={`${unit.id}-${editable}`}
            data-testid={`unit-${unit.code}-${editable ? "edit" : "plain"}`}
            className="h-[var(--control-h)] rounded-sm border"
            style={{ width }}
          >
            <UnitSelect
              options={units}
              value={unit.id}
              onChange={() => {}}
              onEditSelected={editable ? () => {} : undefined}
            />
          </div>
        )),
      )}
      <div className="w-40" data-testid="narrow-payment-order">
        <PaymentOrderAccountField
          enabled
          onEnabledChange={() => {}}
          enabledLabel={texts.payByOrder}
          disabledLabel={texts.excludeFromPaymentOrders}
          disabledReason={texts.paymentOrderDisabled}
        >
          <BankAccountField
            selectionOnly
            value=""
            onChange={() => {}}
            disabledReason={texts.selectSupplierFirst}
          />
        </PaymentOrderAccountField>
      </div>
    </div>
  );
}
