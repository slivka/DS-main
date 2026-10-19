/**
 * Živý pruh formuláře dokladu · vlastní sběr klientských položek hlavičky i řádků, debounce,
 * hradlo validationActive a hlášení onFieldChange · nesmí mazat serverové položky.
 */
import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { visibleFormIssues, type FormIssue } from "../../../../lib/form-issues";
import type { JournalLine } from "../journal-lines";
import type { JournalLinesEditorProps } from "../journal-editor-types";
import { journalFieldId } from "../journal-lines-model";
import { documentClientIssues, type DocumentValidationArgs } from "./document-validation-feedback";
import {
  useDocumentIssueProjection,
  type DocumentIssueProjection,
} from "./use-document-issue-projection";
import type {
  DocumentFormError,
  DocumentHeaderField,
  DocumentHeaderValue,
} from "./document-form-types";

/** Hlášení změny pole (hlavička: document-klíč; řádek: id buňky s rowId a columnId). */
export type DocumentFieldChange = (fieldId: string, rowId?: string, columnId?: string) => void;

/** Vstupy pruhu. */
export interface DocumentFormIssuesArgs {
  /** Klientské položky hlavičky. */
  clientIssues: FormIssue[];
  /** Položky od aplikace (server i klient). */
  issues?: FormIssue[];
  /** Dosavadní odkazy chybového pruhu (zobrazí se vždy). */
  error?: DocumentFormError;
  /** Klientské kontroly a červené rámečky až po prvním pokusu o uložení; výchozí true. */
  validationActive?: boolean;
  /** Popisek řádku („Ř.“). */
  rowLabel: string;
  /** Původní hlášení editoru řádků. */
  onValidationChange?: JournalLinesEditorProps["onValidationChange"];
}

/** Položky pruhu a obsluha chyb řádků. */
export function useDocumentFormIssues(a: DocumentFormIssuesArgs) {
  const active = a.validationActive !== false;
  const [rowIssues, setRowIssues] = useState<FormIssue[]>([]);
  // Klientské kontroly se přepočítávají průběžně, zobrazení s odstupem ~300 ms.
  const clientKey = JSON.stringify([...a.clientIssues, ...rowIssues]);
  const debouncedKey = useDebouncedValue(clientKey, 300);
  const issues = useMemo(() => {
    const client: FormIssue[] = JSON.parse(debouncedKey);
    // error.fieldErrors se nepřevádí (label je ReactNode) – vykreslí je RecordActionBar
    // jako FieldErrorSummary v pruhu, stejně jako v 2.107.0.
    return visibleFormIssues([...(a.issues ?? []), ...client], active);
  }, [debouncedKey, a.issues, active]);
  const onValidationChange: NonNullable<JournalLinesEditorProps["onValidationChange"]> = (
    count,
    errors,
  ) => {
    setRowIssues(
      errors.map((error) => ({
        fieldId: error.fieldId,
        rowId: error.rowId,
        columnId: error.columnId,
        label: `${a.rowLabel} ${error.line} – ${error.field}`,
        message: error.message,
        severity: "error",
        source: "client",
        // Vlastní validace editoru – do buněk se nepromítá (editor ji vykresluje sám).
        origin: "editor",
      })),
    );
    a.onValidationChange?.(count, errors);
  };
  return { issues, active, onValidationChange };
}

/** Vstupy celé zpětné vazby formuláře (pruh + projekce do polí a buněk). */
export interface DocumentFormFeedbackArgs {
  /** Vstupy klientských kontrol hlavičky. */
  validation: DocumentValidationArgs;
  /** Položky od aplikace (server i klient). */
  issues?: FormIssue[];
  /** Dosavadní chyba formuláře. */
  error?: DocumentFormError;
  /** Klientské kontroly a červené rámečky až po prvním pokusu o uložení; výchozí true. */
  validationActive?: boolean;
  /** Popisek řádku („Ř.“). */
  rowLabel: string;
  /** Původní hlášení editoru řádků. */
  onValidationChange?: JournalLinesEditorProps["onValidationChange"];
}

/** Pruh položek, obsluha chyb řádků a projekce do polí a buněk. */
export function useDocumentFormFeedback(a: DocumentFormFeedbackArgs): {
  issues: FormIssue[];
  onValidationChange: NonNullable<JournalLinesEditorProps["onValidationChange"]>;
} & DocumentIssueProjection {
  const formIssues = useDocumentFormIssues({
    clientIssues: documentClientIssues(a.validation),
    issues: a.issues,
    error: a.error,
    validationActive: a.validationActive,
    rowLabel: a.rowLabel,
    onValidationChange: a.onValidationChange,
  });
  const projection = useDocumentIssueProjection({
    issues: formIssues.issues,
    validationActive: a.validationActive,
  });
  return {
    issues: formIssues.issues,
    onValidationChange: formIssues.onValidationChange,
    ...projection,
  };
}

/** Přepínače v poli hlásí id pole, ne id vazby. */
const REPORT_FIELD_ID: Partial<Record<DocumentHeaderField, string>> = {
  variableSymbolLinked: "document-variableSymbol",
  totalMode: "document-amountTotal",
};

/** Obalí patch hlavičky hlášením změněných polí. */
export function reportingPatch(
  patch: (next: Partial<DocumentHeaderValue>) => void,
  onFieldChange?: DocumentFieldChange,
) {
  return (next: Partial<DocumentHeaderValue>) => {
    patch(next);
    for (const key of Object.keys(next) as DocumentHeaderField[])
      onFieldChange?.(REPORT_FIELD_ID[key] ?? `document-${key}`);
  };
}

/** Obalí změnu řádků hlášením změněných buněk (rowId, columnId). */
export function reportingLinesChange(
  previous: JournalLine[],
  onLinesChange: (lines: JournalLine[]) => void,
  onFieldChange?: DocumentFieldChange,
) {
  return (next: JournalLine[]) => {
    onLinesChange(next);
    if (!onFieldChange) return;
    const before = new Map(previous.map((line) => [line.id, line]));
    for (const line of next) {
      const old = before.get(line.id);
      if (!old) continue;
      const keys = new Set([...Object.keys(old), ...Object.keys(line)]) as Set<keyof JournalLine>;
      for (const key of keys) {
        if (old[key] !== line[key])
          onFieldChange(journalFieldId(line.id, String(key)), line.id, String(key));
      }
    }
  };
}
