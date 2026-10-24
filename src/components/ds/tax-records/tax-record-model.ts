/** Prezentační filtr a bezpečný výběr položek; žádné daňové výpočty. */
import type { AccountOption } from "../accounting/account-select";
import type { TaxBookEntry, TaxBookFilters } from "./tax-record-types";
export function visibleTaxItems(accounts: AccountOption[]) {
  return accounts.filter((a) => !a.technical);
}
export function taxItemLabel(account?: AccountOption) {
  return !account || account.technical ? "" : account.name;
}
export function filterTaxBook(rows: TaxBookEntry[], filters: TaxBookFilters) {
  return rows.filter(
    (r) =>
      (!filters.from || r.date >= filters.from) &&
      (!filters.to || r.date <= filters.to) &&
      (!filters.itemId || r.itemId === filters.itemId) &&
      (!filters.treatment || r.treatment === filters.treatment) &&
      (!filters.categoryId || r.categoryId === filters.categoryId),
  );
}
