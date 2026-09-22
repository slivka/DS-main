import { OptionSelect } from "./option-select";
import type { ReactNode } from "react";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { Input } from "../../ui/input";

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
  /** Přepis popisků polí pro jiný jazyk. */
  labels?: Partial<AddressFieldLabels>;
  /** Výchozí kód země při prázdné hodnotě. */
  defaultCountry?: string;
}

export interface AddressFieldLabels {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
}

export const DEFAULT_ADDRESS_FIELD_LABELS: AddressFieldLabels = {
  street: "Ulice",
  houseNumber: "Číslo",
  zip: "PSČ",
  city: "Město",
  country: "Země",
};

/** Jednotná mriežka adresných polí: Ulica 3/4 + Číslo 1/4, PSČ 1/4 + Mesto 3/4. */
export function AddressFieldGrid({
  value,
  onChange,
  countries,
  showCountry = true,
  countryClassName = "sm:col-span-1",
  className,
  children,
  labels: labelOverrides,
  defaultCountry = "CZ",
}: AddressFieldGridProps) {
  const labels = { ...DEFAULT_ADDRESS_FIELD_LABELS, ...labelOverrides };
  return (
    <FieldGrid cols={4} className={className}>
      <Field label={labels.street} className="sm:col-span-3">
        <Input value={value.street ?? ""} onChange={(e) => onChange({ street: e.target.value })} />
      </Field>
      <Field label={labels.houseNumber} className="sm:col-span-1">
        <Input
          value={value.house_number ?? ""}
          onChange={(e) => onChange({ house_number: e.target.value })}
        />
      </Field>
      <Field label={labels.zip} className="sm:col-span-1">
        <Input value={value.zip ?? ""} onChange={(e) => onChange({ zip: e.target.value })} />
      </Field>
      <Field label={labels.city} className="sm:col-span-3">
        <Input value={value.city ?? ""} onChange={(e) => onChange({ city: e.target.value })} />
      </Field>
      {showCountry ? (
        <Field label={labels.country} className={countryClassName}>
          {countries ? (
            <OptionSelect
              value={value.country ?? defaultCountry}
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
