/**
 * Platební sekce formuláře dokladu.
 * Vlastní: rozložení symbolů, způsobu platby a bankovních účtů.
 * Nesmí: držet vlastní hodnotu ani rozhodovat o druhu dokladu.
 */
import type { ReactNode } from "react";
import type { DsTexts } from "../../../../ds-texts";
import { Fragment } from "react";
import { Input } from "../../../ui/input";
import { OptionSelect } from "../../form/option-select";
import { VsField } from "../vs-field";
import { SectionHeading } from "../../layout/section-heading";
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
  issuedDocument: boolean;
  issuedBankAccountAbove: boolean;
  paymentOrderEnabled: boolean;
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
    issuedDocument,
    issuedBankAccountAbove,
    paymentOrderEnabled,
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
      <div
        data-slot="document-payment-section"
        className="grid grid-cols-1 items-start gap-3 @min-[32rem]:grid-cols-3"
      >
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
              undefined,
              undefined,
              "@min-[32rem]:col-span-1",
            )
          : null}
        {f.symbols && paymentOrderEnabled
          ? field(
              "document-constantSymbol",
              t.constantSymbol,
              constantSymbolOptions ? (
                <OptionSelect
                  id="document-constantSymbol"
                  value={value.constantSymbol}
                  onChange={(constantSymbol) => patch({ constantSymbol })}
                  disabled={!can("constantSymbol")}
                  options={constantSymbolOptions.map((option) => ({
                    ...option,
                    selectedLabel: option.value,
                    searchText: option.label,
                  }))}
                  searchable
                  selectedLabel={(option) => option.value}
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
              undefined,
              undefined,
              "@min-[32rem]:col-span-1",
            )
          : null}
        {f.symbols && paymentOrderEnabled
          ? text("specificSymbol", t.specificSymbol, 3, "@min-[32rem]:col-span-1")
          : null}
        {paymentMethodOptions
          ? field(
              "document-paymentMethodId",
              t.paymentMethod,
              <OptionSelect
                id="document-paymentMethodId"
                value={value.paymentMethodId}
                onChange={(paymentMethodId) => patch({ paymentMethodId })}
                options={paymentMethodOptions}
                searchable
                disabled={!can("paymentMethodId")}
              />,
              undefined,
              undefined,
              "@min-[32rem]:col-span-1",
            )
          : null}
        {f.bankAccount && issuedDocument && !issuedBankAccountAbove && companyBankAccountOptions
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
              false,
              "@min-[32rem]:col-span-3",
            )
          : f.bankAccount && !issuedDocument
            ? bankAccountField
            : null}
      </div>
    </Fragment>
  ) : null;
}
