/** Pole externího čísla a jeho vazba na variabilní symbol. */
import { useEffect, useRef } from "react";
import { Input } from "../../../ui/input";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";
import { vsFromDocumentNumber } from "./document-form-types";
interface Args {
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (k: DocumentHeaderField) => boolean;
  receivedDocument: boolean;
  showVatFields?: boolean;
  f: { handedOverBy?: boolean };
  t: DocumentFormTexts;
  field: (
    id: string,
    label: string,
    control: React.ReactNode,
    span?: number,
    required?: boolean,
    className?: string,
  ) => React.ReactNode;
}
/** Vykreslí externí číslo a udržuje automaticky odvozený VS. */
export function useExternalNumberField({
  value,
  patch,
  can,
  receivedDocument,
  showVatFields,
  f,
  t,
  field,
}: Args) {
  const externalNumberDigits = (value.externalNumber ?? "").replace(/\D/g, "");
  const externalNumberVsWarning =
    receivedDocument && externalNumberDigits.length > 10 ? t.documentNumberTooLongForVs : undefined;
  const initialSuggestedVs = vsFromDocumentNumber(value.externalNumber ?? "");
  const automaticVsRef = useRef<string | null>(
    value.variableSymbol === initialSuggestedVs ? initialSuggestedVs : null,
  );
  // Při přepnutí na jiný doklad znovu odvodíme, zda je VS automatický.
  useEffect(() => {
    const suggested = vsFromDocumentNumber(value.externalNumber ?? "");
    automaticVsRef.current =
      suggested !== null && value.variableSymbol === suggested ? suggested : null;
  }, [value.id, value.number]); // eslint-disable-line react-hooks/exhaustive-deps
  const changeExternalNumber = (externalNumber: string) => {
    const previousSuggested = vsFromDocumentNumber(value.externalNumber ?? "");
    const nextSuggested = vsFromDocumentNumber(externalNumber);
    const currentVs = value.variableSymbol ?? "";
    const mayUpdateVs =
      can("variableSymbol") &&
      (!currentVs || currentVs === previousSuggested || currentVs === automaticVsRef.current);
    const nextDigits = externalNumber.replace(/\D/g, "");
    const canApplySuggestion = nextSuggested !== null || nextDigits.length === 0;
    if (receivedDocument && mayUpdateVs && canApplySuggestion) {
      automaticVsRef.current = nextSuggested;
      const variableSymbol = nextSuggested ?? null;
      if ((value.variableSymbol || null) !== variableSymbol) {
        patch({ externalNumber, variableSymbol });
        return;
      }
    }
    patch({ externalNumber });
  };
  const externalNumberField = field(
    "document-externalNumber",
    receivedDocument
      ? showVatFields
        ? t.supplierTaxDocumentNumber
        : t.supplierNumber
      : t.externalNumber,
    <>
      <Input
        id="document-externalNumber"
        value={value.externalNumber ?? ""}
        onChange={(event) => changeExternalNumber(event.target.value)}
        disabled={!can("externalNumber")}
        className="h-9 font-mono tabular-nums"
      />
      {externalNumberVsWarning ? (
        <p
          data-slot="document-external-number-vs-warning"
          className="mt-1 whitespace-nowrap text-xs text-warning-strong"
        >
          {externalNumberVsWarning}
        </p>
      ) : null}
    </>,
    6,
    false,
    receivedDocument
      ? "@min-[40rem]:col-span-6 @min-[40rem]:col-start-15"
      : !f.handedOverBy
        ? "@min-[40rem]:col-start-15"
        : undefined,
  );
  return externalNumberField;
}
