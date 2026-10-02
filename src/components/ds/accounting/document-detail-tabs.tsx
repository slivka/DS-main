/**
 * Doplňkové záložky vydaného dokladu.
 * Vlastní: řízená pole odběratele a tiskových údajů.
 * Nesmí: ukládat data ani znát konkrétní aplikaci.
 */
import type { ReactNode } from "react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { AddressFieldGrid, type AddressValue } from "../form/address-fields";
import { CheckboxField, CheckboxGroup } from "../form/checkbox-field";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { SectionHeading } from "../layout/section-heading";
import { useDsTexts } from "../../../ds-texts";
import { FieldValue } from "../form/field-value";
import { StatusBadge } from "../data-display/status-badge";
import { useConfirmDialog } from "../feedback/confirm-dialog";

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
}

/** Vlastnosti záložky odběratele. */
export interface DocumentCounterpartyTabProps {
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
}

/** Hotová záložka odběratele vydaného dokladu. */
export function DocumentCounterpartyTab({
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
}: DocumentCounterpartyTabProps) {
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
  const control = (
    key: keyof DocumentCounterpartyValue,
    input: ReactNode,
    display: string,
  ) => (locked ? <FieldValue lockedReason={counterpartyLockedReason}>{display}</FieldValue> : input);
  const refresh = onRefreshCounterparty ?? onReloadFromPartner;
  const runRefresh = () => {
    if (!refresh) return;
    if (!refreshCounterpartyWarning) {
      refresh();
      return;
    }
    confirm({
      title: refreshCounterpartyWarning,
      destructive: true,
      onConfirm: refresh,
    });
  };
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
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
        {partnerId && refresh && !locked ? (
          <Button type="button" variant="outline" onClick={runRefresh}>
            {texts.refreshCounterparty}
          </Button>
        ) : null}
      </div>
      <FieldGrid cols={12}>
        <Field label={label("name", texts.name)} span={6}>
          {control(
            "name",
            <Input value={value.name} onChange={(event) => patch({ name: event.target.value })} />,
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
          <Field label={label("street", "Ulice")} span={6}>
            <FieldValue lockedReason={counterpartyLockedReason}>{value.street}</FieldValue>
          </Field>
          <Field label={label("house_number", "Číslo")} span={2}>
            <FieldValue lockedReason={counterpartyLockedReason}>{value.house_number}</FieldValue>
          </Field>
          <Field label={label("zip", "PSČ")} span={2}>
            <FieldValue lockedReason={counterpartyLockedReason}>{value.zip}</FieldValue>
          </Field>
          <Field label={label("city", "Město")} span={6}>
            <FieldValue lockedReason={counterpartyLockedReason}>{value.city}</FieldValue>
          </Field>
          <Field label={label("country", "Země")} span={4}>
            <FieldValue lockedReason={counterpartyLockedReason}>{value.country}</FieldValue>
          </Field>
        </FieldGrid>
      ) : (
        <AddressFieldGrid value={value} onChange={(address) => patch(address)} />
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
      {confirmDialog}
    </div>
  );
}

/** Volby tisku dokladu. */
export interface DocumentPrintOptions {
  /** Tisknout záhlaví. */
  showHeader: boolean;
  /** Tisknout zápatí. */
  showFooter: boolean;
  /** Tisknout rekapitulaci DPH. */
  showVatRecap: boolean;
  /** Tisknout poznámku. */
  showNote: boolean;
  /** Tisknout nadpisy sloupců. */
  showColumnHeadings: boolean;
  /** Tisknout součtový řádek. */
  showTotalsRow: boolean;
  /** Tisknout platební kalendář. */
  showPaymentSchedule: boolean;
}

/** Hodnoty záložky tiskových údajů. */
export interface DocumentPrintValue {
  /** Přepínače obsahu tisku. */
  options: DocumentPrintOptions;
  /** Vlastní záhlaví. */
  headerText: string;
  /** Vlastní zápatí. */
  footerText: string;
  /** Poznámka pro tisk. */
  note: string;
  /** Jméno vystavující osoby. */
  issuedByName: string;
  /** Telefon vystavující osoby. */
  issuedByPhone: string;
  /** E-mail vystavující osoby. */
  issuedByEmail: string;
}

/** Vlastnosti záložky tiskových údajů. */
export interface DocumentPrintTabProps {
  /** Řízená hodnota. */
  value: DocumentPrintValue;
  /** Změna hodnoty. */
  onChange: (value: DocumentPrintValue) => void;
  /** Zakáže editaci. */
  readOnly?: boolean;
}

/** Hotová záložka tiskových údajů dokladu. */
export function DocumentPrintTab({ value, onChange, readOnly = false }: DocumentPrintTabProps) {
  const texts = useDsTexts().documentForm;
  const patch = (next: Partial<DocumentPrintValue>) => onChange({ ...value, ...next });
  const option = (key: keyof DocumentPrintOptions, label: string) => (
    <CheckboxField
      label={label}
      checked={value.options[key]}
      disabled={readOnly}
      onCheckedChange={(checked) => patch({ options: { ...value.options, [key]: checked } })}
    />
  );
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-5 @container @min-[48rem]:grid-cols-3">
        <CheckboxGroup title={texts.printGeneral}>
          {option("showHeader", texts.printHeader)}
          {option("showFooter", texts.printFooter)}
          {option("showVatRecap", texts.printVatRecap)}
          {option("showNote", texts.printNote)}
        </CheckboxGroup>
        <CheckboxGroup title={texts.printItems}>
          {option("showColumnHeadings", texts.printColumnHeadings)}
          {option("showTotalsRow", texts.printTotalsRow)}
          {option("showPaymentSchedule", texts.printPaymentSchedule)}
        </CheckboxGroup>
        <FieldGrid cols={1} title={texts.issuedBy}>
          <Field label={texts.name}>
            <Input
              value={value.issuedByName}
              readOnly={readOnly}
              onChange={(event) => patch({ issuedByName: event.target.value })}
            />
          </Field>
          <Field label={texts.phone}>
            <Input
              value={value.issuedByPhone}
              readOnly={readOnly}
              onChange={(event) => patch({ issuedByPhone: event.target.value })}
            />
          </Field>
          <Field label={texts.email}>
            <Input
              value={value.issuedByEmail}
              readOnly={readOnly}
              onChange={(event) => patch({ issuedByEmail: event.target.value })}
            />
          </Field>
        </FieldGrid>
      </div>
      <div className="grid gap-3 @container @min-[48rem]:grid-cols-2">
        <div className="space-y-3">
          <Field label={texts.headerText}>
            <Textarea
              rows={3}
              value={value.headerText}
              readOnly={readOnly}
              onChange={(event) => patch({ headerText: event.target.value })}
            />
          </Field>
          <Field label={texts.footerText}>
            <Textarea
              rows={3}
              value={value.footerText}
              readOnly={readOnly}
              onChange={(event) => patch({ footerText: event.target.value })}
            />
          </Field>
        </div>
        <Field label={texts.note}>
          <Textarea
            className="h-full min-h-[9rem]"
            value={value.note}
            readOnly={readOnly}
            onChange={(event) => patch({ note: event.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
