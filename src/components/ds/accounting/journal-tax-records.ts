/** Prezentační konfigurace DE sdílená výběrem, validací a popisky. */
import type { JournalLinesEditorProps } from "./journal-editor-types";
import type { JournalLine } from "./journal-lines";
export function taxItemSide(
  props: Pick<JournalLinesEditorProps, "mainSide" | "mode" | "taxMovementKind">,
): "debitAccount" | "creditAccount" {
  if (props.mode === "mainAccount")
    return props.mainSide === "D" ? "debitAccount" : "creditAccount";
  return (props.mainSide ?? (props.taxMovementKind === "non_cash_expense" ? "D" : "MD")) === "D"
    ? "creditAccount"
    : "debitAccount";
}
export function taxItemAccountRequired(
  line: JournalLine,
  props: Pick<JournalLinesEditorProps, "mainSide" | "mode" | "taxMovementKind"> & {
    accounts?: JournalLinesEditorProps["accounts"];
  },
): ("debitAccount" | "creditAccount")[] {
  const missing = (key: "debitAccount" | "creditAccount") =>
    !line[key] || Boolean(props.accounts?.some((a) => a.code === line[key] && a.technical));
  if (props.mode !== "mainAccount" && props.taxMovementKind === "transfer")
    return (["debitAccount", "creditAccount"] as const).filter(
      (key): key is "debitAccount" | "creditAccount" => missing(key),
    );
  const side = taxItemSide(props);
  return missing(side) ? [side] : [];
}
