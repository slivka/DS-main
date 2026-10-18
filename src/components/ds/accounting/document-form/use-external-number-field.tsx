/** Pole externího čísla a jeho vazba na variabilní symbol. */
import { Input } from "../../../ui/input";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";
interface Args {
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (k: DocumentHeaderField) => boolean;
  receivedDocument: boolean;
  showVatFields?: boolean;
  f: { handedOverBy?: boolean; bankAccount?: boolean };
  t: DocumentFormTexts;
  field: (
    id: string,
    label: string,
    control: React.ReactNode,
    span?: number,
    required?: boolean,
    className?: string,
  ) => React.ReactNode;
  /** Úprava změny při uvolnění vazby VS (use-variable-symbol-link). */
  sourcePatch?: (next: Partial<DocumentHeaderValue>) => Partial<DocumentHeaderValue>;
}
/**
 * @deprecated 2.108.0 – varování patří jen do pole VS (use-variable-symbol-link);
 * funkce vrací undefined. Odstraní se v nejbližší major verzi.
 */
export function externalNumberVsWarning(
  _value: DocumentHeaderValue,
  _receivedDocument: boolean,
  _t: DocumentFormTexts,
): string | undefined {
  return undefined;
}
/** Vykreslí externí číslo; VS jen jako náhled přes vazbu. */
export function useExternalNumberField({
  value,
  patch,
  can,
  receivedDocument,
  showVatFields,
  f,
  t,
  field,
  sourcePatch,
}: Args) {
  const changeExternalNumber = (externalNumber: string) =>
    patch(sourcePatch ? sourcePatch({ externalNumber }) : { externalNumber });
  const externalNumberField = field(
    "document-externalNumber",
    receivedDocument
      ? showVatFields
        ? t.supplierTaxDocumentNumber
        : t.supplierNumber
      : t.externalNumber,
    <Input
      id="document-externalNumber"
      value={value.externalNumber ?? ""}
      onChange={(event) => changeExternalNumber(event.target.value)}
      disabled={!can("externalNumber")}
      className="h-[var(--control-h)] font-mono tabular-nums"
    />,
    6,
    false,
    receivedDocument
      ? // Číslo následuje Popis ve třetím řádku, nikoli bankovní účet.
        "@min-[40rem]:col-span-6 @min-[40rem]:col-start-15"
      : !f.handedOverBy
        ? "@min-[40rem]:col-start-15"
        : undefined,
  );
  return externalNumberField;
}
