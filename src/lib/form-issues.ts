/**
 * Položky pruhu chyb a upozornění · vlastní deduplikaci, řazení a titulek s počtem ·
 * nesmí validovat hodnoty ani mazat serverové položky (to řeší aplikace).
 */

/** Jedna položka živého pruhu – co zbývá opravit. */
export interface FormIssue {
  /** Samostatná akce řešení; klik na odkaz pole zůstává navigací. */
  action?: { label: string; onClick: () => void };
  /** Id ovládání pole (fokus a rámeček); u hlavičky dokladu klíč hlavičky nebo document-klíč. */
  fieldId?: string;
  /** Řádek mřížky dokladu. */
  rowId?: string;
  /** Sloupec mřížky dokladu. */
  columnId?: string;
  /** Popisek pole. */
  label: string;
  /** Text zprávy. */
  message: string;
  /** Chyba blokuje, varování jen upozorňuje (žlutě). */
  severity: "error" | "warning";
  /** Klientská kontrola DS / aplikace, nebo položka ze serveru (DS ji jen zobrazí). */
  source: "client" | "server";
  /** Původ „editor“ = vlastní validace editoru řádků; do buněk se nepromítá (editor ji řeší sám). */
  origin?: "editor";
  /** Stabilní kód zprávy (např. vat_date_required) pro deduplikaci. */
  code?: string;
}

/** Texty titulků pruhu s tokenem {count}. */
export interface FormIssueTitleTexts {
  /** Uložení selhalo. */
  saveFailedTitle: string;
  /** Chyby k doplnění. */
  fixBeforeTitle: string;
  /** Jen varování. */
  warningsTitle: string;
}

const ROW_PREFIX = /^[^:]{1,40}\s\d+:\s*/;

/** Zpráva bez prefixu „Řádek N: “ pro porovnání s hláškou hlavičky. */
function bareMessage(message: string): string {
  return message.replace(ROW_PREFIX, "").trim();
}

/**
 * Sloučí položky: stejná hláška (kód nebo text, pole, řádek) jen jednou; chyba hlavičky se
 * neopakuje jako „Řádek N: …“; chyba má přednost před varováním. Pořadí: chyby, varování.
 * Klient × server stejného pole se deduplikuje bez ohledu na text – server má přednost.
 */
export function mergeFormIssues(issues: readonly FormIssue[]): FormIssue[] {
  const headers = issues.filter((issue) => !issue.rowId);
  const seen = new Set<string>();
  // Pole + závažnost → zdroj první (serverové) položky; dedup jen klient × server.
  const seenField = new Map<string, FormIssue["source"]>();
  const result: FormIssue[] = [];
  // Server má přednost před klientem se stejným polem (bez ohledu na kód i text).
  const bySeverity = (severity: FormIssue["severity"]) =>
    issues.filter((issue) => issue.severity === severity);
  const serverFirst = (a: FormIssue, b: FormIssue) =>
    a.source === b.source ? 0 : a.source === "server" ? -1 : 1;
  const ordered = [
    ...bySeverity("error").sort(serverFirst),
    ...bySeverity("warning").sort(serverFirst),
  ];
  for (const issue of ordered) {
    // Hlavička × řádek se dědikuje jen při shodném kódu nebo shodném fieldId, ne obecném textu.
    if (
      issue.rowId &&
      headers.some(
        (header) =>
          (header.code !== undefined && header.code === issue.code) ||
          (header.fieldId !== undefined && header.fieldId === issue.fieldId),
      )
    )
      continue;
    const key = `${bareMessage(issue.message)}|${issue.fieldId ?? ""}|${issue.rowId ?? ""}`;
    const loose = `${bareMessage(issue.message)}|${issue.rowId ?? ""}`;
    if (seen.has(key) || (!issue.fieldId && seen.has(loose))) continue;
    // Stejné pole a závažnost z obou zdrojů jen jednou (server je seřazený první, takže vyhraje).
    const fieldKey = issue.fieldId ? `${issue.severity}|${issue.fieldId}` : null;
    if (fieldKey) {
      const firstSource = seenField.get(fieldKey);
      if (firstSource && firstSource !== issue.source) continue;
    }
    seen.add(key);
    seen.add(loose);
    if (fieldKey && !seenField.has(fieldKey)) seenField.set(fieldKey, issue.source);
    result.push(issue);
  }
  return result;
}

/**
 * Ponechá serverové položky a varování vždy; neaktivní validace skrývá jen klientské chyby
 * (žlutá varování – ruční partner, VS – se zobrazují i před prvním pokusem o uložení).
 */
export function visibleFormIssues(
  issues: readonly FormIssue[],
  validationActive: boolean,
): FormIssue[] {
  return mergeFormIssues(
    validationActive
      ? issues
      : issues.filter((issue) => issue.source === "server" || issue.severity === "warning"),
  );
}

/**
 * Titulek s počtem: chyby → „Doklad nelze uložit (N)“ jen při saveFailed, jinak
 * „Před zařazením doplňte (N)“; jen varování → „Upozornění (N)“. Prázdno = null.
 */
export function formIssuesTitle(
  issues: readonly FormIssue[],
  saveFailed: boolean,
  texts: FormIssueTitleTexts,
): string | null {
  const errors = issues.filter((issue) => issue.severity === "error").length;
  if (errors > 0) {
    const template = saveFailed ? texts.saveFailedTitle : texts.fixBeforeTitle;
    return template.replace("{count}", String(errors));
  }
  if (issues.length > 0) return texts.warningsTitle.replace("{count}", String(issues.length));
  return null;
}
