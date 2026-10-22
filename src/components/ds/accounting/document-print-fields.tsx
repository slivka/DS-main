/** Tisková pole · vlastní pět voleb a texty předlohy · nesmí ukládat ani načítat knihu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { CheckboxField, CheckboxGroup } from "../form/checkbox-field";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { InvoicePrintOptions } from "../print/invoice/invoice-types";
/** Nové úplné volby faktury; staré přepínače jsou odstraněné. */
export type DocumentPrintOptions = InvoicePrintOptions;
/** Řízená tisková hodnota formuláře. */
export interface DocumentPrintValue {
  /** Pět voleb. */ options: DocumentPrintOptions;
  /** Nad položkami. */ headerText: string;
  /** Pod položkami. */ footerText: string;
  /** Poznámka. */ note: string;
  /** Jméno. */ issuedByName: string;
  /** Telefon. */ issuedByPhone: string;
  /** E-mail. */ issuedByEmail: string;
}
/** Společná pole knihy i dokladu. */
export interface BookPrintTemplateFieldsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** Hotová hodnota. */ value: DocumentPrintValue;
  /** Řízená změna. */ onChange: (value: DocumentPrintValue) => void;
  /** Pouze čtení. */ readOnly?: boolean;
}
/** Pět voleb, texty s nápovědou a vystavující osoba; žádná akce načtení. */
export const BookPrintTemplateFields = forwardRef<HTMLDivElement, BookPrintTemplateFieldsProps>(
  function BookPrintTemplateFields(
    { value, onChange, readOnly = false, className, ...props },
    ref,
  ) {
    const t = useDsTexts().invoicePrint;
    const patch = (next: Partial<DocumentPrintValue>) => onChange({ ...value, ...next });
    const options: Array<keyof DocumentPrintOptions> = [
      "showPaymentSchedule",
      "showAdvanceDetail",
      "showQr",
      "showSignature",
      "showIssuedBy",
    ];
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <CheckboxGroup>
          {options.map((key) => (
            <CheckboxField
              key={key}
              label={t[key]}
              checked={value.options[key]}
              disabled={readOnly}
              onCheckedChange={(checked) =>
                patch({ options: { ...value.options, [key]: checked } })
              }
            />
          ))}
        </CheckboxGroup>
        <FieldGrid cols={2}>
          {(["headerText", "footerText", "note"] as const).map((key) => (
            <Field key={key} label={t[key]} hint={t.textHint}>
              <Textarea
                rows={3}
                value={value[key]}
                readOnly={readOnly}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </Field>
          ))}
        </FieldGrid>
        <FieldGrid cols={3} title={t.issuedBy}>
          {(["issuedByName", "issuedByPhone", "issuedByEmail"] as const).map((key, i) => (
            <Field key={key} label={[t.name, t.phone, t.email][i]}>
              <Input
                type={i === 2 ? "email" : i === 1 ? "tel" : "text"}
                value={value[key]}
                readOnly={readOnly}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </Field>
          ))}
        </FieldGrid>
      </div>
    );
  },
);
