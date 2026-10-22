/** Pomocníci fiktivních dat evidence · nepatří do knihovny. */
import type { AdvanceRegisterViewRow } from "../ds/accounting/advances/advance-register-view-types";

export type Side = "provided" | "received";
export const ACC = {
  provided: [
    { value: "314100", name: "Poskytnuté zálohy – tuzemsko" },
    { value: "314200", name: "Poskytnuté zálohy – zahraničí" },
  ],
  received: [{ value: "324100", name: "Přijaté zálohy" }],
};
export const advanceAccounts = (side: Side) => ACC[side];

export const d = (row: Partial<AdvanceRegisterViewRow> & { id: string; account: string }) =>
  ({ rowKind: "detail", ...row }) as AdvanceRegisterViewRow;
export const s = (
  rowKind: AdvanceRegisterViewRow["rowKind"],
  id: string,
  account: string,
  values: Partial<AdvanceRegisterViewRow>,
): AdvanceRegisterViewRow => ({ id, rowKind, account, ...values });
