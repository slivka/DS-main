import { OptionSelect } from "./option-select";
import type { ReactNode } from "react";
import { Field, FieldGrid } from "../layout/RecordDialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

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
  /** Třída pro pole Země (např. „sm:col-span-2“). */
  countryClassName?: string;
  className?: string;
  children?: ReactNode;
  /** Přepis popisků polí pro jiný jazyk. */
  labels?: Partial<AddressFieldLabels>;
  /** Výchozí kód země při prázdné hodnotě. */
  defaultCountry?: string;
  /** Tlačítko Mapa v posledním řádku (Země 2/4 · prázdná 1/4 · Mapa 1/4). */
  mapAction?: AddressMapAction;
}

export interface AddressMapAction {
  /** Výchozí „Mapa“. */
  label?: string;
  onClick: () => void;
  disabled?: boolean;
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

/** Jednotná mřížka adresních polí: Ulice 3/4 + Číslo 1/4, PSČ 1/4 + Město 3/4. */
export function AddressFieldGrid({
  value,
  onChange,
  countries,
  showCountry = true,
  countryClassName = "@min-[40rem]:col-span-1",
  className,
  children,
  labels: labelOverrides,
  defaultCountry = "SK",
  mapAction,
}: AddressFieldGridProps) {
  const labels = { ...DEFAULT_ADDRESS_FIELD_LABELS, ...labelOverrides };
  return (
    <FieldGrid cols={4} className={className}>
      <Field label={labels.street} className="@min-[40rem]:col-span-3">
        <Input value={value.street ?? ""} onChange={(e) => onChange({ street: e.target.value })} />
      </Field>
      <Field label={labels.houseNumber} className="@min-[40rem]:col-span-1">
        <Input
          value={value.house_number ?? ""}
          onChange={(e) => onChange({ house_number: e.target.value })}
        />
      </Field>
      <Field label={labels.zip} className="@min-[40rem]:col-span-1">
        <Input value={value.zip ?? ""} onChange={(e) => onChange({ zip: e.target.value })} />
      </Field>
      <Field label={labels.city} className="@min-[40rem]:col-span-3">
        <Input value={value.city ?? ""} onChange={(e) => onChange({ city: e.target.value })} />
      </Field>
      {showCountry ? (
        <Field
          label={labels.country}
          className={mapAction ? "@min-[40rem]:col-span-2" : countryClassName}
        >
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
      {mapAction ? (
        <div data-slot="address-map-action" className="flex flex-col @min-[40rem]:col-start-4">
          <span aria-hidden className="hidden h-5 @min-[40rem]:mb-1 @min-[40rem]:block" />
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full"
            onClick={mapAction.onClick}
            disabled={mapAction.disabled}
          >
            {mapAction.label ?? "Mapa"}
          </Button>
        </div>
      ) : null}
      {children}
    </FieldGrid>
  );
}
