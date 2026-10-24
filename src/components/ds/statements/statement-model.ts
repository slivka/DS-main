/** Výkazy · čisté pomocné funkce zobrazení · nesmí počítat hodnoty výkazu. */
import type { StatementRow } from "./statement-types";

/** Popisek jednotek s měnou z dat APP. */
export function statementUnitLabel(template: string, currency: string): string {
  return template.replace("{currency}", currency);
}

/** Řádek je upravitelný jen v režimu úprav a jen když není součtový. */
export function isStatementRowEditable(row: StatementRow, editable: boolean | undefined) {
  return Boolean(editable) && row.kind !== "sum";
}
