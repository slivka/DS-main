/**
 * Platební sekce formuláře dokladu.
 * Vlastní: rozložení symbolů, způsobu platby a bankovních účtů.
 * Nesmí: držet vlastní hodnotu ani rozhodovat o druhu dokladu.
 */
import type { ReactNode } from "react";
import type { DsTexts } from "../../../../ds-texts";
import { Fragment } from "react";
import { Input } from "../../../ui/input";
import { CheckboxField } from "../../form/checkbox-field";
import { OptionSelect } from "../../form/option-select";
import { VsField } from "../vs-field";
import { SectionHeading } from "../../layout/section-heading";
import { cn } from "../../../../lib/utils";
import type { DocumentFields } from "../document-fields";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";

type FieldRenderer = (
  id: string,
  label: ReactNode,
  control: ReactNode,
  span?: number,
  mobileHalf?: boolean,
  className?: string,
) => ReactNode;
export interface DocumentPaymentSectionProps {
  f: DocumentFields;
  t: DocumentFormTexts & Pick<DsTexts["documentForm"], "paymentMethod" | "companyBankAccount">;
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (key: DocumentHeaderField) => boolean;
  receivedDocument: boolean;
  issuedDocument: boolean;
  constantSymbolOptions?: Array<{ value: string; label: string }>;
  paymentMethodOptions?: Array<{ value: string; label: string }>;
  companyBankAccountOptions?: Array<{
    id: string;
    label: string;
    account: string;
    currency: string;
    isDefault?: boolean;
  }>;
  bankAccountField: ReactNode;
  field: FieldRenderer;
  text: (
    key: "constantSymbol" | "specificSymbol" | "handedOverBy",
    label: string,
    span?: number,
    className?: string,
  ) => ReactNode;
}

/** Vykreslí platební údaje v pořadí společném všem dokladům. */
export function DocumentPaymentSection(p: DocumentPaymentSectionProps) {
  const {
    f,
    t,
    value,
    patch,
    can,
    receivedDocument,
    issuedDocument,
    constantSymbolOptions,
    paymentMethodOptions,
    companyBankAccountOptions,
    bankAccountField,
    field,
    text,
  } = p;
  return f.symbols || f.bankAccount || f.paymentOrders ? (
    <Fragment>
      <SectionHeading>{t.paymentSection}</SectionHeading>
      <div data-slot="document-payment-section" className="grid grid-cols-20 items-start gap-3">
        {f.symbols
          ? field(
              "document-variableSymbol",
              t.variableSymbol,
              <VsField
                id="document-variableSymbol"
                value={value.variableSymbol ?? ""}
                onChange={(variableSymbol) => patch({ variableSymbol })}
                disabled={!can("variableSymbol")}
              />,
            )
          : null}
        {f.symbols
          ? field(
              "document-constantSymbol",
              t.constantSymbol,
              constantSymbolOptions ? (
                <OptionSelect
                  id="document-constantSymbol"
                  value={value.constantSymbol}
                  onChange={(constantSymbol) => patch({ constantSymbol })}
                  disabled={!can("constantSymbol")}
                  options={constantSymbolOptions}
                />
              ) : (
                <Input
                  id="document-constantSymbol"
                  value={value.constantSymbol ?? ""}
                  onChange={(event) => patch({ constantSymbol: event.target.value })}
                  disabled={!can("constantSymbol")}
                  className="font-mono tabular-nums"
                />
              ),
            )
          : null}
        {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
        {paymentMethodOptions
          ? field(
              "document-paymentMethodId",
              t.paymentMethod,
              <OptionSelect
                id="document-paymentMethodId"
                value={value.paymentMethodId}
                onChange={(paymentMethodId) => patch({ paymentMethodId })}
                options={paymentMethodOptions}
                disabled={!can("paymentMethodId")}
              />,
            )
          : null}
        {f.bankAccount && receivedDocument ? bankAccountField : null}
        {f.bankAccount && issuedDocument && companyBankAccountOptions
          ? field(
              "document-companyBankAccountId",
              t.companyBankAccount,
              <OptionSelect
                id="document-companyBankAccountId"
                value={value.companyBankAccountId}
                onChange={(companyBankAccountId) => patch({ companyBankAccountId })}
                options={companyBankAccountOptions.map((option) => ({
                  value: option.id,
                  label: [option.label, option.account, option.currency].join(" · "),
                }))}
                disabled={!can("companyBankAccountId")}
              />,
              20,
            )
          : f.bankAccount && !receivedDocument
            ? bankAccountField
            : null}
        {f.paymentOrders ? (
          <CheckboxField
            id="document-exclude-payment-orders"
            className={cn(
              "col-span-20",
              receivedDocument &&
                "@min-[40rem]:col-span-6 @min-[40rem]:mt-4 @min-[40rem]:flex @min-[40rem]:h-9 @min-[40rem]:items-center [&_label]:whitespace-nowrap",
            )}
            label={t.excludeFromPaymentOrders}
            checked={!!value.excludeFromPaymentOrders}
            disabled={!can("excludeFromPaymentOrders")}
            onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked })}
          />
        ) : null}
      </div>
    </Fragment>
  ) : null;
}
