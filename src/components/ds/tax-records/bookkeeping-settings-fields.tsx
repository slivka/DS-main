/** Pole nastavení knihy/firmy; skryté účty se nikdy nemažou. */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Field, FieldGrid } from "../layout/form-field-layout";
import { RecordReadOnlyProvider } from "../form/record-read-only";
import { AccountSelect, type AccountOption } from "../accounting/account-select";
import { useDsTexts } from "../../../ds-texts";
import type { BookkeepingMode } from "./tax-record-types";
export interface BookkeepingSettingsFieldsProps extends ComponentPropsWithoutRef<"div"> {
  bookkeepingMode?: BookkeepingMode;
  scope?: "book" | "company";
  /** Hotová účetní pole hostitelské aplikace. */ accountFields?: ReactNode;
  items: AccountOption[];
  value: { income?: string | null; expense?: string | null };
  onValueChange: (value: { income?: string | null; expense?: string | null }) => void;
  readOnly?: boolean;
}
export const BookkeepingSettingsFields = forwardRef<HTMLDivElement, BookkeepingSettingsFieldsProps>(
  function BookkeepingSettingsFields(
    {
      bookkeepingMode = "accrual",
      scope = "company",
      accountFields,
      items,
      value,
      onValueChange,
      readOnly,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().taxRecords;
    return (
      <div ref={ref} {...props}>
        {bookkeepingMode === "accrual" ? (
          accountFields
        ) : scope === "company" ? (
          <RecordReadOnlyProvider value={!!readOnly}>
            <FieldGrid cols={12}>
              <Field span={6} label={t.roundingIncome}>
                <AccountSelect
                  bookkeepingMode="tax_records"
                  accounts={items}
                  value={value.income}
                  onChange={(income) => onValueChange({ ...value, income })}
                  disabled={readOnly}
                  ariaLabel={t.roundingIncome}
                />
              </Field>
              <Field span={6} label={t.roundingExpense}>
                <AccountSelect
                  bookkeepingMode="tax_records"
                  accounts={items}
                  value={value.expense}
                  onChange={(expense) => onValueChange({ ...value, expense })}
                  disabled={readOnly}
                  ariaLabel={t.roundingExpense}
                />
              </Field>
            </FieldGrid>
          </RecordReadOnlyProvider>
        ) : null}
      </div>
    );
  },
);
