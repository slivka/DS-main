/** Daňové číslo · vlastní vazbu a zámek · nesmí přidělovat čísla dokladů. */
import { Lock, LockOpen } from "lucide-react";
import { Input } from "../../../ui/input";
import { FieldToggleButton } from "../../form/field-toggle-button";
import { useDsTexts } from "../../../../ds-texts";
import type { DocumentHeaderValue } from "./document-form-types";

/** Vlastnosti pole daňového čísla. */
export interface TaxDocumentNumberFieldProps {
  /** Řízené údaje dokladu. */
  value: DocumentHeaderValue;
  /** Předá změnu hlavičky. */
  patch: (next: Partial<DocumentHeaderValue>) => void;
  /** Pole nelze měnit. */
  disabled?: boolean;
  /** Upozornění na duplicitní číslo. */
  warning?: string;
  /** Identifikátor společného pole. */
  id?: string;
  /** Ukládaná vlastní hodnota, u pokladny externalNumber. */
  valueKey?: "taxDocumentNumber" | "externalNumber";
}

/** Zamčené číslo sleduje doklad; opětovné zamčení obnoví vazbu. */
export function TaxDocumentNumberField({
  value,
  patch,
  disabled,
  warning,
  id = "document-taxDocumentNumber",
  valueKey = "taxDocumentNumber",
}: TaxDocumentNumberFieldProps) {
  const t = useDsTexts().documentEdit;
  const linked = value.taxDocumentNumberLinked ?? (valueKey === "taxDocumentNumber" || !value[valueKey]);
  return (
    // Při varování se ⚠ posune před zámek a text má rezervu pro obě ikony.
    <div className="relative min-w-0 [--field-feedback-offset:calc(var(--field-toggle-space)+0.25rem)]">
      <Input
        id={id}
        value={linked ? (value.number ?? "") : (value[valueKey] ?? "")}
        placeholder={linked && !value.number ? t.numberPending : undefined}
        readOnly={linked}
        disabled={disabled}
        warning={warning}
        className={
          warning
            ? "pr-[calc(var(--field-toggle-space)+1.75rem)]"
            : "pr-[var(--field-toggle-space)]"
        }
        onChange={(event) => patch({ [valueKey]: event.target.value })}
      />
      <FieldToggleButton
        icon={linked ? Lock : LockOpen}
        pressed={linked}
        label={t.numberLink}
        pressedTooltip={t.numberLinked}
        unpressedTooltip={t.numberUnlinked}
        disabled={disabled}
        onPressedChange={(pressed) =>
          patch({
            taxDocumentNumberLinked: pressed,
            [valueKey]: pressed
              ? (valueKey === "externalNumber" ? null : (value.number ?? ""))
              : (value[valueKey] ?? value.number ?? ""),
          })
        }
      />
    </div>
  );
}
