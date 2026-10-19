/**
 * Projekce položek pruhu do polí hlavičky a buněk řádků · vlastní filtraci podle zdroje a
 * hradlo validationActive · nesmí vracet vlastní chyby editoru řádků (ty editor validuje sám,
 * jinak by se nikdy nesmazaly).
 */
import { useMemo } from "react";
import type { FormIssue } from "../../../../lib/form-issues";
import type { JournalLinesEditorProps } from "../journal-editor-types";
import { headerFieldKey } from "./use-document-field-renderers";
import type { DocumentHeaderField } from "./document-form-types";

/** Vstupy projekce. */
export interface DocumentIssueProjectionArgs {
  /** Sloučené položky pruhu (klient i server). */
  issues: readonly FormIssue[];
  /** Neaktivní validace skrývá jen klientské chyby; serverové chyby a varování zůstávají. */
  validationActive?: boolean;
}

/** Výstupy projekce. */
export interface DocumentIssueProjection {
  /** Chyby polí hlavičky (rámeček + ikona + bublina). */
  issueFieldErrors: Partial<Record<DocumentHeaderField, string>>;
  /** Varování polí hlavičky (žlutě). */
  issueFieldWarnings: Partial<Record<DocumentHeaderField, string>>;
  /** Položky buněk řádků – jen serverové; vlastní chyby editoru se nevrací. */
  cellIssues: NonNullable<JournalLinesEditorProps["cellIssues"]>;
}

/** Rozdělí položky pruhu na rámečky polí a stavy buněk řádků. */
export function useDocumentIssueProjection(
  a: DocumentIssueProjectionArgs,
): DocumentIssueProjection {
  const active = a.validationActive !== false;
  return useMemo(() => {
    const issueFieldErrors: Partial<Record<DocumentHeaderField, string>> = {};
    const issueFieldWarnings: Partial<Record<DocumentHeaderField, string>> = {};
    const cellIssues: NonNullable<JournalLinesEditorProps["cellIssues"]> = [];
    for (const issue of a.issues) {
      if (issue.rowId && issue.columnId) {
        // Do buněk nesmí vlastní validace editoru (origin „editor“) – ta by se nikdy nesmazala.
        // Klientské položky řádků od aplikace (source client) se promítají stejně jako serverové.
        if (issue.origin === "editor") continue;
        cellIssues.push({
          rowId: issue.rowId,
          columnId: issue.columnId,
          message: issue.message,
          severity: issue.severity,
        });
        continue;
      }
      if (!issue.fieldId?.startsWith("document-")) continue;
      // Neaktivní validace skrývá jen klientské chyby; serverové chyby a varování zůstávají.
      if (!active && issue.source === "client" && issue.severity === "error") continue;
      const key = headerFieldKey(issue.fieldId);
      if (issue.severity === "error") issueFieldErrors[key] ??= issue.message;
      else issueFieldWarnings[key] ??= issue.message;
    }
    return { issueFieldErrors, issueFieldWarnings, cellIssues };
  }, [a.issues, active]);
}
