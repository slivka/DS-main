/** Návrhy hlavičky · vlastní mapování id a oznámení ruční změny · nesmí mazat návrhy APP. */
import { useRef } from "react";
import type { FieldSuggestion } from "../../form/field-feedback";
import { headerFieldKeyFromId } from "./document-validation-feedback";
import type { DocumentFormProps, DocumentHeaderValue } from "./document-form-types";

/** Sdílené ovládání zruší i návrh svého druhého hodnotového klíče. */
const SHARED_SUGGESTION_KEYS = [
  ["bankAccount", "partnerBankAccountId", "manualBankAccount"],
  ["amountTotal", "totalMode"],
  ["variableSymbol", "variableSymbolLinked"],
  ["taxDocumentNumber", "taxDocumentNumberLinked"],
  ["rate", "rateManual"],
] as const;

/** Návrh ovládání; sdílené id účtů a partnera respektují aktivní režim. */
export function documentFieldSuggestion(props: DocumentFormProps, id: string) {
  const { value, fieldSuggestions: suggestions } = props;
  const key = headerFieldKeyFromId(id, {
    code: props.documentType?.toUpperCase(),
    bankAccountKind: value.bankAccountKind,
  });
  const aliases: Record<string, string[]> = {
    "document-partner":
      props.counterpartyInput === "manual" ? ["counterpartyName", "partnerId"] : ["partnerId"],
    "document-bankAccount":
      props.counterpartyInput === "manual"
        ? ["manualBankAccount", "bankAccount"]
        : ["partnerBankAccountId", "bankAccount"],
    "document-movement-account": [key, "bankAccountKind"],
    "document-amountTotal": ["amountTotal", "totalMode"],
    "document-variableSymbol": ["variableSymbol", "variableSymbolLinked"],
    "document-taxDocumentNumber": ["taxDocumentNumber", "taxDocumentNumberLinked"],
    "document-rate": ["rate", "rateManual"],
  };
  return (aliases[id] ?? [key]).map((name) => suggestions?.[name]).find(Boolean);
}

/** Oznámí návrh jednou do jeho odebrání/výměny rodičem, nikoli při dalším psaní. */
export function useSuggestionClear(
  suggestions: Partial<Record<string, FieldSuggestion>> | undefined,
  onCleared: ((key: string, rowId?: string) => void) | undefined,
) {
  const cleared = useRef(new Map<string, string>());
  for (const [key, signature] of cleared.current)
    if (JSON.stringify(suggestions?.[key]) !== signature) cleared.current.delete(key);
  return (key: string) => {
    const suggestion = suggestions?.[key];
    const signature = JSON.stringify(suggestion);
    if (!suggestion || cleared.current.get(key) === signature) return;
    cleared.current.set(key, signature);
    onCleared?.(key);
  };
}

/** Oznámí jen skutečně změněné klíče ručního patch, ne automatické vazby datumů. */
export function clearChangedHeaderSuggestions(
  value: DocumentHeaderValue,
  next: Partial<DocumentHeaderValue>,
  clear: (key: string) => void,
) {
  for (const key of Object.keys(next) as (keyof DocumentHeaderValue)[]) {
    if (value[key] === next[key]) continue;
    clear(key);
    const aliases = SHARED_SUGGESTION_KEYS.find((keys) => keys.some((name) => name === key));
    for (const alias of aliases ?? []) clear(alias);
  }
}
