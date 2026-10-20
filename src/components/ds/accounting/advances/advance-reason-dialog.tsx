/** Důvod rozhodnutí · vlastní řízená pole · nesmí určovat právní důvody APP. */
import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { cn } from "../../../../lib/utils";
import { RecordDialog, Field, FieldGrid } from "../../layout/RecordDialog";
import { OptionSelect, type SelectOption } from "../../form/option-select";
import { Input } from "../../../ui/input";
import type { AdvanceReasonValue } from "./advance-types";
/** Důvod storna nebo rozhodnutí DD nebude. */
export interface AdvanceReasonDialogProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** Otevření. */ open: boolean;
  /** Ochrana zavření. */ onOpenChange: (open: boolean) => void;
  /** Název akce z APP. */ title: string;
  /** Důvody z APP. */ reasons: SelectOption[];
  /** Řízené hodnoty. */ value: AdvanceReasonValue;
  /** Změna. */ onChange: (value: AdvanceReasonValue) => void;
  /** Potvrzení APP. */ onConfirm: (value: AdvanceReasonValue) => void;
  /** Změny. */ dirty?: boolean;
  /** Ukládání. */ busy?: boolean;
  /** Chyba APP. */ error?: string;
}
/** Sdílený dialog důvodu bez pevně zadaných důvodů. */
export const AdvanceReasonDialog = forwardRef<HTMLDivElement, AdvanceReasonDialogProps>(
  function AdvanceReasonDialog(
    {
      open,
      onOpenChange,
      title,
      reasons,
      value,
      onChange,
      onConfirm,
      dirty,
      busy,
      error,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const id = useId();
    const valid = reasons.some(
      (reason) => reason.value === value.reason && !reason.disabled && !reason.inactive,
    );
    return (
      <RecordDialog
        open={open}
        onOpenChange={onOpenChange}
        size="md"
        title={title}
        dirty={dirty}
        busy={busy}
        error={error}
        submitLabel={t.confirm}
        submitDisabled={!valid || Boolean(error)}
        onSubmit={() => {
          if (valid && !busy && !error) onConfirm(value);
        }}
      >
        <div ref={ref} className={cn("min-w-0", className)} {...props}>
          <FieldGrid cols={12}>
            <Field span={12} label={t.reason} htmlFor={`${id}-reason`}>
              <OptionSelect
                id={`${id}-reason`}
                options={reasons}
                value={value.reason}
                disabled={busy}
                searchable
                onChange={(reason) => onChange({ ...value, reason })}
              />
            </Field>
            <Field span={12} label={t.note} htmlFor={`${id}-note`}>
              <Input
                id={`${id}-note`}
                value={value.note}
                disabled={busy}
                onChange={(event) => onChange({ ...value, note: event.target.value })}
              />
            </Field>
          </FieldGrid>
        </div>
      </RecordDialog>
    );
  },
);
