/** Interní doklad DE: nepeněžní příjem/výdaj nebo přeřazení z položky na položku. DS nic neúčtuje. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Field, FieldGrid } from "../layout/form-field-layout";
import { OptionSelect } from "../form/option-select";
import { AmountInput } from "../accounting/amount";
import { Textarea } from "../../ui/textarea";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { TaxMovementSelect } from "./tax-movement-select";
import type { TaxInternalMovementValue, TaxItemOption } from "./tax-record-types";
export interface TaxInternalMovementFieldsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  value: TaxInternalMovementValue;
  onChange: (value: TaxInternalMovementValue) => void;
  items: TaxItemOption[];
  currency: string;
  errors?: Partial<Record<"itemId" | "fromItemId" | "toItemId" | "amount" | "reason", string>>;
  disabled?: boolean;
}
export const TaxInternalMovementFields = forwardRef<HTMLDivElement, TaxInternalMovementFieldsProps>(
  function TaxInternalMovementFields(
    { value, onChange, items, currency, errors = {}, disabled, className, ...props },
    ref,
  ) {
    const texts = useDsTexts();
    const t = texts.taxYear;
    const r = texts.taxRecords;
    const options = items
      .filter((i) => !i.technical)
      .map((i) => ({ value: i.id, label: i.label, trailingLabel: i.displayCode }));
    const item = (key: "itemId" | "fromItemId" | "toItemId", label: string) => (
      <Field label={label} error={errors[key]}>
        <OptionSelect
          searchable
          ariaLabel={label}
          value={value[key] ?? ""}
          emptyLabel={r.chooseItem}
          disabled={disabled}
          options={options}
          onChange={(next) => onChange({ ...value, [key]: next || null })}
        />
      </Field>
    );
    return (
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        <FieldGrid cols={2} title={t.internalMovement}>
          <Field label={r.movement}>
            <TaxMovementSelect
              value={value.kind}
              disabled={disabled}
              onChange={(kind) => onChange({ ...value, kind })}
            />
          </Field>
          <Field label={`${t.amount} · ${currency}`} error={errors.amount}>
            <AmountInput
              aria-label={t.amount}
              value={value.amount}
              disabled={disabled}
              onChange={(amount) => onChange({ ...value, amount })}
            />
          </Field>
          {value.kind === "transfer" ? (
            <>
              {item("fromItemId", r.fromItem)}
              {item("toItemId", r.toItem)}
            </>
          ) : (
            item("itemId", r.item)
          )}
          <Field label={t.reason} error={errors.reason} span={2}>
            <Textarea
              aria-label={t.reason}
              value={value.reason ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, reason: e.target.value })}
            />
          </Field>
        </FieldGrid>
      </div>
    );
  },
);
