/**
 * Doplňkové záložky vydaného dokladu.
 * Vlastní: řízená pole odběratele a tiskových údajů.
 * Nesmí: ukládat data ani znát konkrétní aplikaci.
 */
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { AddressFieldGrid, type AddressFieldsValue } from "../form/address-fields";
import { CheckboxField, CheckboxGroup } from "../form/checkbox-field";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { SectionHeading } from "../layout/section-heading";
import { useDsTexts } from "../../../ds-texts";

/** Hodnoty záložky odběratele. */
export interface DocumentCounterpartyValue extends AddressFieldsValue {
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
}

/** Hotová záložka odběratele vydaného dokladu. */
export function DocumentCounterpartyTab({
  value,
  onChange,
  partnerId,
  onReloadFromPartner,
  readOnly = false,
}: DocumentCounterpartyTabProps) {
  const texts = useDsTexts().documentForm;
  const patch = (next: Partial<DocumentCounterpartyValue>) => onChange({ ...value, ...next });
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading>{texts.counterpartyTab}</SectionHeading>
        {partnerId && onReloadFromPartner ? (
          <Button type="button" variant="outline" onClick={onReloadFromPartner}>
            {texts.reloadFromPartner}
          </Button>
        ) : null}
      </div>
      <FieldGrid cols={12}>
        <Field label={texts.name} span={6}><Input value={value.name} readOnly={readOnly} onChange={(event) => patch({ name: event.target.value })} /></Field>
        <Field label={texts.ico} span={3}><Input value={value.ico} readOnly={readOnly} onChange={(event) => patch({ ico: event.target.value })} /></Field>
        <Field label={texts.dic} span={3}><Input value={value.dic} readOnly={readOnly} onChange={(event) => patch({ dic: event.target.value })} /></Field>
      </FieldGrid>
      <AddressFieldGrid value={value} onChange={(address) => patch(address)} disabled={readOnly} />
      <Field label={texts.email}><Input type="email" value={value.email} readOnly={readOnly} onChange={(event) => patch({ email: event.target.value })} /></Field>
    </div>
  );
}

/** Volby tisku dokladu. */
export interface DocumentPrintOptions {
  showHeader: boolean;
  showFooter: boolean;
  showVatRecap: boolean;
  showNote: boolean;
  showColumnHeadings: boolean;
  showTotalsRow: boolean;
  showPaymentSchedule: boolean;
}

/** Hodnoty záložky tiskových údajů. */
export interface DocumentPrintValue {
  options: DocumentPrintOptions;
  headerText: string;
  footerText: string;
  note: string;
  issuedByName: string;
  issuedByPhone: string;
  issuedByEmail: string;
}

/** Vlastnosti záložky tiskových údajů. */
export interface DocumentPrintTabProps {
  value: DocumentPrintValue;
  onChange: (value: DocumentPrintValue) => void;
  readOnly?: boolean;
}

/** Hotová záložka tiskových údajů dokladu. */
export function DocumentPrintTab({ value, onChange, readOnly = false }: DocumentPrintTabProps) {
  const texts = useDsTexts().documentForm;
  const patch = (next: Partial<DocumentPrintValue>) => onChange({ ...value, ...next });
  const option = (key: keyof DocumentPrintOptions, label: string) => (
    <CheckboxField label={label} checked={value.options[key]} disabled={readOnly} onCheckedChange={(checked) => patch({ options: { ...value.options, [key]: checked } })} />
  );
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="grid gap-5 @container @min-[48rem]:grid-cols-3">
        <CheckboxGroup legend={texts.printGeneral}>{option("showHeader", texts.printHeader)}{option("showFooter", texts.printFooter)}{option("showVatRecap", texts.printVatRecap)}{option("showNote", texts.printNote)}</CheckboxGroup>
        <CheckboxGroup legend={texts.printItems}>{option("showColumnHeadings", texts.printColumnHeadings)}{option("showTotalsRow", texts.printTotalsRow)}{option("showPaymentSchedule", texts.printPaymentSchedule)}</CheckboxGroup>
        <FieldGrid cols={1} title={texts.issuedBy}><Field label={texts.name}><Input value={value.issuedByName} readOnly={readOnly} onChange={(event) => patch({ issuedByName: event.target.value })} /></Field><Field label={texts.phone}><Input value={value.issuedByPhone} readOnly={readOnly} onChange={(event) => patch({ issuedByPhone: event.target.value })} /></Field><Field label={texts.email}><Input value={value.issuedByEmail} readOnly={readOnly} onChange={(event) => patch({ issuedByEmail: event.target.value })} /></Field></FieldGrid>
      </div>
      <div className="grid gap-3 @container @min-[48rem]:grid-cols-2">
        <div className="space-y-3"><Field label={texts.headerText}><Textarea rows={3} value={value.headerText} readOnly={readOnly} onChange={(event) => patch({ headerText: event.target.value })} /></Field><Field label={texts.footerText}><Textarea rows={3} value={value.footerText} readOnly={readOnly} onChange={(event) => patch({ footerText: event.target.value })} /></Field></div>
        <Field label={texts.note}><Textarea className="h-full min-h-[9rem]" value={value.note} readOnly={readOnly} onChange={(event) => patch({ note: event.target.value })} /></Field>
      </div>
    </div>
  );
}