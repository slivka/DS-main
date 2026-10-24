/** Uložení výkazu · dialog s názvem, druhem, obdobím a jednotkami · nesmí ukládat data. */
import { useId } from "react";
import { RecordDialog, Field, FieldGrid } from "../layout/RecordDialog";
import { OptionSelect, type SelectOption } from "../form/option-select";
import { Input } from "../../ui/input";
import { useDsTexts } from "../../../ds-texts";
import { statementUnitLabel } from "./statement-model";
import type { StatementKind, StatementSaveValue, StatementUnit } from "./statement-types";

/** Parametry dialogu uložení výkazu. */
export interface StatementSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Řízené hodnoty. */
  value: StatementSaveValue;
  onChange: (value: StatementSaveValue) => void;
  /** Uložení; dialog zavře APP po úspěchu. */
  onSubmit: () => void;
  /** Období z dat APP. */
  periods: SelectOption[];
  /** Měna z dat APP. */
  currency: string;
  /** Chyby polí od APP. */
  errors?: Partial<Record<keyof StatementSaveValue, string>>;
  /** Celková chyba uložení. */
  error?: string | null;
  /** Probíhá ukládání. */
  busy?: boolean;
  /** Druh a období jen ke čtení (úprava existujícího výkazu). */
  lockStructure?: boolean;
}

/** RecordDialog uložení výkazu pod názvem. */
export function StatementSaveDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  periods,
  currency,
  errors,
  error,
  busy,
  lockStructure,
}: StatementSaveDialogProps) {
  const t = useDsTexts().statements;
  const id = useId();
  const set = <K extends keyof StatementSaveValue>(key: K, next: StatementSaveValue[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <RecordDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.saveTitle}
      size="sm"
      onSubmit={onSubmit}
      submitDisabled={!value.name.trim()}
      busy={busy}
      error={error ?? undefined}
    >
      <FieldGrid cols={12}>
        <Field span={12} label={t.name} htmlFor={`${id}-name`} error={errors?.name}>
          <Input
            id={`${id}-name`}
            value={value.name}
            required
            onChange={(event) => set("name", event.target.value)}
          />
        </Field>
        <Field span={6} label={t.kind} htmlFor={`${id}-kind`} error={errors?.kind}>
          <OptionSelect
            id={`${id}-kind`}
            value={value.kind}
            allowEmpty={false}
            disabled={lockStructure}
            onChange={(next) => set("kind", next as StatementKind)}
            options={(["balance", "income"] as const).map((kind) => ({
              value: kind,
              label: t.kinds[kind],
            }))}
          />
        </Field>
        <Field span={6} label={t.unitsLabel} htmlFor={`${id}-unit`} error={errors?.unit}>
          <OptionSelect
            id={`${id}-unit`}
            value={value.unit}
            allowEmpty={false}
            onChange={(next) => set("unit", next as StatementUnit)}
            options={(["full", "thousands"] as const).map((unit) => ({
              value: unit,
              label: statementUnitLabel(t.units[unit], currency),
            }))}
          />
        </Field>
        <Field span={12} label={t.period} htmlFor={`${id}-period`} error={errors?.period}>
          <OptionSelect
            id={`${id}-period`}
            value={value.period}
            allowEmpty={false}
            disabled={lockStructure}
            onChange={(next) => set("period", next)}
            options={periods}
          />
        </Field>
      </FieldGrid>
    </RecordDialog>
  );
}
