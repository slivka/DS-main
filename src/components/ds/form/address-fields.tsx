import { OptionSelect } from "@/components/ds/form/option-select";
import type { ReactNode } from "react";
import { Field, FieldGrid } from "@/components/ds/layout/RecordDialog";
import { Input } from "@/components/ui/input";

export interface AddressValue {
  street?: string | null;
  house_number?: string | null;
  zip?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface AddressFieldGridProps {
  value: AddressValue;
  onChange: (patch: Partial<AddressValue>) => void;
  countries?: { code: string; name: string }[];
  showCountry?: boolean;
  /** Trieda pre pole Krajina (napr. „sm:col-span-2“). */
  countryClassName?: string;
  className?: string;
  children?: ReactNode;
}

/** Jednotná mriežka adresných polí: Ulica 3/4 + Číslo 1/4, PSČ 1/4 + Mesto 3/4. */
export function AddressFieldGrid({
  value,
  onChange,
  countries,
  showCountry = true,
  countryClassName = "sm:col-span-1",
  className,
  children,
}: AddressFieldGridProps) {
  return (
    <FieldGrid cols={4} className={className}>
      <Field label="Ulica" className="sm:col-span-3">
        <Input value={value.street ?? ""} onChange={(e) => onChange({ street: e.target.value })} />
      </Field>
      <Field label="Číslo" className="sm:col-span-1">
        <Input
          value={value.house_number ?? ""}
          onChange={(e) => onChange({ house_number: e.target.value })}
        />
      </Field>
      <Field label="PSČ" className="sm:col-span-1">
        <Input value={value.zip ?? ""} onChange={(e) => onChange({ zip: e.target.value })} />
      </Field>
      <Field label="Mesto" className="sm:col-span-3">
        <Input value={value.city ?? ""} onChange={(e) => onChange({ city: e.target.value })} />
      </Field>
      {showCountry ? (
        <Field label="Krajina" className={countryClassName}>
          {countries ? (
            <OptionSelect
              value={value.country ?? "SK"}
              onChange={(v) => onChange({ country: v })}
              allowEmpty={false}
              options={countries.map((c) => ({ value: c.code, label: c.name }))}
            />
          ) : (
            <Input
              value={value.country ?? ""}
              onChange={(e) => onChange({ country: e.target.value })}
            />
          )}
        </Field>
      ) : null}
      {children}
    </FieldGrid>
  );
}
