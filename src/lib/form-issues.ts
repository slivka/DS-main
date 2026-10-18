/**
 * Položky pruhu chyb a upozornění · vlastní deduplikaci, řazení a titulek s počtem ·
 * nesmí validovat hodnoty ani mazat serverové položky (to řeší aplikace).
 */

/** Jedna položka živého pruhu – co zbývá opravit. */
export interface FormIssue {
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

/** Klíč stejné hlášky: kód, jinak text bez prefixu řádku. */
function sameKey(issue: FormIssue): string {
  return issue.code ?? bareMessage(issue.message);
}

/**
 * Sloučí položky: stejná hláška (kód nebo text, pole, řádek) jen jednou; chyba hlavičky se
 * neopakuje jako „Řádek N: …“; chyba má přednost před varováním. Pořadí: chyby, varování.
 */
export function mergeFormIssues(issues: readonly FormIssue[]): FormIssue[] {
  const headerKeys = new Set(issues.filter((issue) => !issue.rowId).map(sameKey));
  const seen = new Set<string>();
  const result: FormIssue[] = [];
  const ordered = [
    ...issues.filter((issue) => issue.severity === "error"),
    ...issues.filter((issue) => issue.severity === "warning"),
  ];
  for (const issue of ordered) {
    const key = sameKey(issue);
    if (issue.rowId && headerKeys.has(key)) continue;
    const id = `${key}|${issue.fieldId ?? ""}|${issue.rowId ?? ""}`;
    const loose = `${key}|${issue.rowId ?? ""}`;
    if (seen.has(id) || (!issue.fieldId && seen.has(loose))) continue;
    seen.add(id);
    seen.add(loose);
    result.push(issue);
  }
  return result;
}

/** Ponechá serverové položky vždy, klientské jen po prvním pokusu o uložení. */
export function visibleFormIssues(
  issues: readonly FormIssue[],
  validationActive: boolean,
): FormIssue[] {
  return mergeFormIssues(
    validationActive ? issues : issues.filter((issue) => issue.source === "server"),
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
