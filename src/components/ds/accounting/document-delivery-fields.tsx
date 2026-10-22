/** Dodání · vlastní řízenou adresu a vymazání při vypnutí · APP vlastní ukládání a mapu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Input } from "../../ui/input";
import { AddressFieldGrid, type AddressValue, type AddressMapAction } from "../form/address-fields";
import { CheckboxField } from "../form/checkbox-field";
import { Field } from "../layout/RecordDialog";
import { SectionHeading } from "../layout/section-heading";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Dodací adresa s kontaktem. */
export interface DocumentDeliveryValue extends AddressValue {
  /** Název místa/osoby. */ name: string;
  /** Kontakt pro převzetí. */ contact: string;
}
/** Props řízené adresy. */
export interface DocumentDeliveryFieldsProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** Null vypíná jinou adresu. */ value: DocumentDeliveryValue | null;
  /** Vypnutí předává null a nemaže jiná pole. */ onChange: (
    value: DocumentDeliveryValue | null,
  ) => void;
  /** Číselník zemí. */ countries?: Array<{ code: string; name: string }>;
  /** Pouze čtení. */ readOnly?: boolean;
  /** APP otevře mapu. */ mapAction?: AddressMapAction;
}
/** Dodací adresa přes AddressFieldGrid, Mapa za Zemí. */
export const DocumentDeliveryFields = forwardRef<HTMLDivElement, DocumentDeliveryFieldsProps>(
  function DocumentDeliveryFields(
    { value, onChange, countries, readOnly = false, mapAction, className, ...props },
    ref,
  ) {
    const all = useDsTexts(),
      t = all.invoicePrint,
      a = all.documentForm;
    const patch = (v: Partial<DocumentDeliveryValue>) => {
      if (value) onChange({ ...value, ...v });
    };
    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        <SectionHeading>{t.deliverySection}</SectionHeading>
        <CheckboxField
          label={t.otherDelivery}
          checked={value !== null}
          disabled={readOnly}
          onCheckedChange={(enabled) =>
            onChange(
              enabled
                ? {
                    name: "",
                    contact: "",
                    street: "",
                    house_number: "",
                    zip: "",
                    city: "",
                    country: "",
                  }
                : null,
            )
          }
        />
        {value ? (
          <>
            <Field label={a.name}>
              <Input
                value={value.name}
                readOnly={readOnly}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <AddressFieldGrid
              value={value}
              onChange={patch}
              countries={countries}
              defaultCountry=""
              readOnly={readOnly}
              mapAction={mapAction}
              labels={{
                street: a.street,
                houseNumber: a.houseNumber,
                zip: a.zip,
                city: a.city,
                country: a.country,
              }}
            />
            <Field label={t.contact}>
              <Input
                value={value.contact}
                readOnly={readOnly}
                onChange={(e) => patch({ contact: e.target.value })}
              />
            </Field>
          </>
        ) : null}
      </div>
    );
  },
);
