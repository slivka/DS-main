/**
 * Doplňkové záložky vydaného dokladu.
 * Vlastní: řízená pole odběratele a tiskových údajů.
 * Nesmí: ukládat data ani znát konkrétní aplikaci.
 */
import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/utils";
import { DocumentDeliveryFields, type DocumentDeliveryValue } from "./document-delivery-fields";
import type { AddressMapAction } from "../form/address-fields";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { AddressFieldGrid, type AddressValue } from "../form/address-fields";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { SectionHeading } from "../layout/section-heading";
import { useDsTexts } from "../../../ds-texts";
import { FieldValue } from "../form/field-value";
import { StatusBadge } from "../data-display/status-badge";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { formatCodeName } from "../../../lib/code-format";

/** Hodnoty záložky odběratele. */
export interface DocumentCounterpartyValue extends AddressValue {
  /** Název odběratele. */
  name: string;
  /** Identifikační číslo. */
  ico: string;
  /** Daňové identifikační číslo. */
  dic: string;
  /** Kontaktní e-mail. */
  email: string;
  /** Jiná dodací adresa; null nebo absence znamená shodnou s odběratelem. */
  delivery?: DocumentDeliveryValue | null;
}

/** Vlastnosti záložky odběratele. */
export interface DocumentCounterpartyTabProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** APP otevře mapu dodání. */
  deliveryMapAction?: AddressMapAction;
  /** Řízená hodnota. */
  value: DocumentCounterpartyValue;
  /** Změna hodnoty. */
  onChange: (value: DocumentCounterpartyValue) => void;
  /** Identifikátor vybraného partnera. */
  partnerId?: string | null;
  /** Znovu načte údaje z partnera. */
  onReloadFromPartner?: () => void;
  /** Zakáže editaci. */
  readOnly?: boolean;
  /** Aplikace zamkla údaje protistrany, typicky po zařazení. */
  counterpartyLocked?: boolean;
  /** Důvod zamčení všech údajů protistrany. */
  counterpartyLockedReason?: string;
  /** Názvy polí, která uživatel upravil ručně. */
  counterpartyManualFields?: Array<keyof DocumentCounterpartyValue>;
  /** Aktualizuje údaje z partnera po potvrzení. */
  onRefreshCounterparty?: () => void;
  /** Varování dodané aplikací před aktualizací. */
  refreshCounterpartyWarning?: string;
  /** Datum zmrazení údajů při zařazení. */
  counterpartyFrozenAt?: string;
  /** Číselník zemí; zamčené pole Země pak ukáže název místo kódu. */
  countries?: Array<{ code: string; name: string }>;
  /** Zobrazit u názvu země i kód („CZ – Česko“). */
  showCountryCode?: boolean;
}

/** Hotová záložka odběratele vydaného dokladu. */
export const DocumentCounterpartyTab = forwardRef<HTMLDivElement, DocumentCounterpartyTabProps>(
  function DocumentCounterpartyTab(
    {
      value,
      onChange,
      partnerId,
      onReloadFromPartner,
      readOnly = false,
      counterpartyLocked = false,
      counterpartyLockedReason,
      counterpartyManualFields = [],
      onRefreshCounterparty,
      refreshCounterpartyWarning,
      counterpartyFrozenAt,
      countries,
      showCountryCode = false,
      deliveryMapAction,
      className,
      ...props
    },
    ref,
  ) {
    const texts = useDsTexts().documentForm;
    const { confirm, confirmDialog } = useConfirmDialog();
    const locked = readOnly || counterpartyLocked;
    const patch = (next: Partial<DocumentCounterpartyValue>) => onChange({ ...value, ...next });
    const label = (key: keyof DocumentCounterpartyValue, text: string) => (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{text}</span>
        {counterpartyManualFields.includes(key) ? (
          <StatusBadge
            status="manual"
            config={{ manual: { label: texts.manuallyEdited, tone: "warning" } }}
          />
        ) : null}
      </span>
    );
    const control = (key: keyof DocumentCounterpartyValue, input: ReactNode, display: string) =>
      locked ? <FieldValue lockedReason={counterpartyLockedReason}>{display}</FieldValue> : input;
    const refresh = onRefreshCounterparty ?? onReloadFromPartner;
    const runRefresh = () => {
      if (!refresh) return;
      // Potvrzení vždy: výchozí text z DsTexts, aplikace ho může nahradit.
      confirm({
        title: refreshCounterpartyWarning ?? texts.refreshCounterpartyConfirm,
        destructive: true,
        onConfirm: refresh,
      });
    };
    const countryName = countries?.find((item) => item.code === value.country)?.name;
    const countryDisplay = countryName
      ? showCountryCode
        ? formatCodeName(value.country ?? "", countryName)
        : countryName
      : (value.country ?? "");
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <div className="flex items-center justify-between gap-3">
          <SectionHeading
            aside={
              counterpartyFrozenAt ? (
                <StatusBadge
                  status="frozen"
                  config={{
                    frozen: { label: texts.frozenAt(counterpartyFrozenAt), tone: "neutral" },
                  }}
                />
              ) : null
            }
          >
            {texts.counterpartyTab}
          </SectionHeading>
          {/* Aktualizace je jediná cesta změny i po zamčení; skrytá jen u dokladu jen pro čtení. */}
          {partnerId && refresh && !readOnly ? (
            <Button type="button" variant="outline" onClick={runRefresh}>
              {texts.refreshCounterparty}
            </Button>
          ) : null}
        </div>
        <FieldGrid cols={12}>
          <Field label={label("name", texts.name)} span={6}>
            {control(
              "name",
              <Input
                value={value.name}
                onChange={(event) => patch({ name: event.target.value })}
              />,
              value.name,
            )}
          </Field>
          <Field label={label("ico", texts.ico)} span={3}>
            {control(
              "ico",
              <Input value={value.ico} onChange={(event) => patch({ ico: event.target.value })} />,
              value.ico,
            )}
          </Field>
          <Field label={label("dic", texts.dic)} span={3}>
            {control(
              "dic",
              <Input value={value.dic} onChange={(event) => patch({ dic: event.target.value })} />,
              value.dic,
            )}
          </Field>
        </FieldGrid>
        {locked ? (
          <FieldGrid cols={12}>
            <Field label={label("street", texts.street)} span={6}>
              <FieldValue lockedReason={counterpartyLockedReason}>{value.street}</FieldValue>
            </Field>
            <Field label={label("house_number", texts.houseNumber)} span={2}>
              <FieldValue lockedReason={counterpartyLockedReason}>{value.house_number}</FieldValue>
            </Field>
            <Field label={label("zip", texts.zip)} span={2}>
              <FieldValue lockedReason={counterpartyLockedReason}>{value.zip}</FieldValue>
            </Field>
            <Field label={label("city", texts.city)} span={6}>
              <FieldValue lockedReason={counterpartyLockedReason}>{value.city}</FieldValue>
            </Field>
            <Field label={label("country", texts.country)} span={4}>
              <FieldValue lockedReason={counterpartyLockedReason}>{countryDisplay}</FieldValue>
            </Field>
          </FieldGrid>
        ) : (
          <AddressFieldGrid
            value={value}
            onChange={(address) => patch(address)}
            countries={countries}
            labels={{
              street: texts.street,
              houseNumber: texts.houseNumber,
              zip: texts.zip,
              city: texts.city,
              country: texts.country,
            }}
          />
        )}
        <Field label={label("email", texts.email)}>
          {control(
            "email",
            <Input
              type="email"
              value={value.email}
              onChange={(event) => patch({ email: event.target.value })}
            />,
            value.email,
          )}
        </Field>
        <DocumentDeliveryFields
          value={value.delivery ?? null}
          onChange={(delivery) => patch({ delivery })}
          countries={countries}
          readOnly={locked}
          mapAction={deliveryMapAction}
        />
        {confirmDialog}
      </div>
    );
  },
);

export { DocumentPrintTab } from "./document-print-tab";
export type { DocumentPrintTabProps } from "./document-print-tab";
export { BookPrintTemplateFields } from "./document-print-fields";
export type {
  DocumentPrintOptions,
  DocumentPrintValue,
  BookPrintTemplateFieldsProps,
} from "./document-print-fields";
export { DocumentDeliveryFields } from "./document-delivery-fields";
export type {
  DocumentDeliveryValue,
  DocumentDeliveryFieldsProps,
} from "./document-delivery-fields";
