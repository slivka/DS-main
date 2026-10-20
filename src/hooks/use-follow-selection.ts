/** Sledování výběru · vlastní zpoždění přes sdílený hook · nesmí načítat ani rušit dotazy. */
import { useDebouncedValue } from "./useDebouncedValue";
/** Možnosti sledování výběru. */
export interface FollowSelectionOptions {
  /** Prodleva v milisekundách; výchozí 250. */
  delay?: number;
}
/** Zpožděný jednotlivý záznam nebo souhrn více řádků. */
export type FollowSelectionResult<Row> =
  | { kind: "empty" }
  | { kind: "single"; record: Row }
  | { kind: "multi"; count: number };
/** Přeskočí rychlé mezikroky; pole výběru aplikace stabilizuje mezi nesouvisejícími renderováními. */
export function useFollowSelection<Row>(
  selectedRows: readonly Row[],
  { delay = 250 }: FollowSelectionOptions = {},
): FollowSelectionResult<Row> {
  const rows = useDebouncedValue(selectedRows, delay);
  if (rows.length > 1) return { kind: "multi", count: rows.length };
  const record = rows[0];
  return record === undefined ? { kind: "empty" } : { kind: "single", record };
}
