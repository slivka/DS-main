/** Zamčené datum · vlastní zobrazení ve sdílené šířce data · nesmí měnit hodnotu. */
import { FieldValue } from "../../form/field-value";
import { useDateTimePreferences } from "../../../../lib/date-time-preferences";
export interface LockedDocumentDateProps {
  /** Identifikátor pole. */ id: string;
  /** ISO datum. */ value?: string | null;
  /** Důvod aplikace. */ reason: string;
}
/** Používá stejnou měřenou geometrii jako DateField v datové oblasti dokladu. */
export function LockedDocumentDate({ id, value, reason }: LockedDocumentDateProps) {
  const { formatDate } = useDateTimePreferences();
  return (
    <FieldValue
      id={id}
      aria-labelledby={`${id}-label`}
      lockedReason={reason}
      data-slot="field-value"
      data-document-date-locked=""
      className="tabular-nums"
    >
      {value ? formatDate(value) : ""}
    </FieldValue>
  );
}
