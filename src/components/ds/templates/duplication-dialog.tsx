/** Dialog duplikace · vlastní ovládání parametrů · nesmí počítat data ani ukládat. */
import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { RecordDialog, Field, FieldGrid } from "../layout/RecordDialog";
import { DateField } from "../form/date-field";
import { StepperInput } from "../form/stepper-input";
import { SegmentedField } from "../form/segmented-field";
import { DuplicationPreview } from "./duplication-preview";
import type { DuplicationValue, DuplicationPreviewRow } from "./template-types";
/** Vlastnosti řízeného dialogu. */
export interface DuplicationDialogProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange" | "onSubmit"
> {
  /** Otevření. */ open: boolean;
  /** Ochranu zavření řeší RecordDialog. */ onOpenChange: (open: boolean) => void;
  /** Parametry od APP včetně výchozího data. */ value: DuplicationValue;
  /** APP spustí debounce a dodá nový náhled. */ onChange: (value: DuplicationValue) => void;
  /** Řádky. */ rows: DuplicationPreviewRow[];
  /** Náhled se načítá. */ loading?: boolean;
  /** Chyba náhledu nebo vytvoření. */ error?: string;
  /** Probíhá vytvoření. */ busy?: boolean;
  /** Neuložené změny. */ dirty?: boolean;
  /** Vytvořit; APP zavře až po úspěchu. */ onCreate: (value: DuplicationValue) => void;
  /** Samostatný klíč gridu. */ storageKey: string;
  /** Titulek. */ title?: string;
}
/** Jeden doklad nebo série; výchozí posun data vždy dodává APP. */
export const DuplicationDialog = forwardRef<HTMLDivElement, DuplicationDialogProps>(
  function DuplicationDialog(
    {
      open,
      onOpenChange,
      value,
      onChange,
      rows,
      loading,
      error,
      busy,
      dirty,
      onCreate,
      storageKey,
      title,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().templates;
    const id = useId();
    const invalid =
      value.mode === "series" &&
      (!Number.isInteger(value.months) ||
        value.months < 1 ||
        value.months > 24 ||
        !Number.isInteger(value.day) ||
        value.day < 1 ||
        value.day > 31);
    const blocked = Boolean(
      loading || error || invalid || !value.date || !rows.some((row) => row.canCreate),
    );
    return (
      <RecordDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={title ?? t.duplicate}
        dirty={dirty}
        busy={busy}
        error={error}
        submitLabel={t.create}
        submitDisabled={blocked}
        onSubmit={() => {
          if (!blocked && !busy) onCreate(value);
        }}
      >
        <div {...props} ref={ref} className={cn("min-w-0 space-y-4", className)}>
          <FieldGrid cols={12}>
            <Field span={12} label={t.mode}>
              <SegmentedField
                value={value.mode}
                ariaLabel={t.mode}
                disabled={busy}
                options={[
                  { value: "single", label: t.single },
                  { value: "series", label: t.series },
                ]}
                onChange={(mode) => onChange({ ...value, mode })}
              />
            </Field>
            <Field
              span={12}
              label={value.mode === "single" ? t.date : t.firstDate}
              htmlFor={`${id}-date`}
            >
              <DateField
                id={`${id}-date`}
                value={value.date}
                disabled={busy}
                onChange={(date) => onChange({ ...value, date })}
              />
            </Field>
            {value.mode === "series" ? (
              <>
                <Field span={6} label={t.months} htmlFor={`${id}-months`}>
                  <StepperInput
                    id={`${id}-months`}
                    value={value.months}
                    min={1}
                    max={24}
                    disabled={busy}
                    onChange={(months) => onChange({ ...value, months })}
                  />
                </Field>
                <Field span={6} label={t.day} htmlFor={`${id}-day`}>
                  <StepperInput
                    id={`${id}-day`}
                    value={value.day}
                    min={1}
                    max={31}
                    disabled={busy}
                    onChange={(day) => onChange({ ...value, day })}
                  />
                </Field>
              </>
            ) : null}
          </FieldGrid>
          <DuplicationPreview rows={rows} loading={loading} storageKey={storageKey} />
        </div>
      </RecordDialog>
    );
  },
);
