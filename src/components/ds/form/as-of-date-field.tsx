import { DateField } from "./date-field";

/** @deprecated Použijte AsOfDateToggle v jednotném řádku akcí gridu. */
export function AsOfDateField({
  value,
  onChange,
  label = "Stav k datu",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="whitespace-nowrap text-[0.923em] font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <DateField
        value={value}
        onChange={(v) => onChange(v ?? "")}
        className="w-[11.5em]"
        inputClassName="grid-toolbar-control"
      />
    </div>
  );
}
