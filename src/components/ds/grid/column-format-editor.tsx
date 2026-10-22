/**
 * Rozbalený formát sloupce v seznamu Sloupce.
 * Vlastní: tučný řez, tokenové vzorky a klávesnicový výběr.
 * Nesmí: nabízet volnou barvu ani držet uložený formát.
 */
import { forwardRef, useState, type CSSProperties, type HTMLAttributes } from "react";
import { useDsTexts } from "../../../ds-texts";
import { COLUMN_HUES, type ColumnTone, type GridColumnStyle } from "../../../lib/column-tones";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

/** Props editoru jednoho formátu. */
export interface ColumnFormatEditorProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Řízený formát. */
  value: GridColumnStyle;
  /** Okamžitá změna formátu. */
  onChange: (value: GridColumnStyle) => void;
  /** Escape zavře pouze editor. */
  onClose: () => void;
}

/** Řada vzorků s jedním tabIndex a cyklickými šipkami. */
function ToneRow({
  strength,
  value,
  onChange,
}: {
  strength: "soft" | "strong";
  value: GridColumnStyle;
  onChange: (value: GridColumnStyle) => void;
}) {
  const t = useDsTexts().columnPicker;
  const options: (ColumnTone | null)[] = [
    null,
    ...COLUMN_HUES.map((hue) => `${hue}-${strength}` as const),
  ];
  const [focusIndex, setFocusIndex] = useState(Math.max(0, options.indexOf(value.tone ?? null)));
  return (
    <div>
      <div className="mb-1 text-sm text-muted-foreground">
        {strength === "soft" ? t.backgroundSoft : t.backgroundStrong}
      </div>
      <div
        role="group"
        aria-label={strength === "soft" ? t.backgroundSoft : t.backgroundStrong}
        className="flex gap-[var(--col-format-gap)] overflow-x-auto py-1"
      >
        {options.map((tone, index) => {
          const hue = COLUMN_HUES[index - 1];
          const name =
            tone && hue
              ? `${t.toneNames[hue]} ${strength === "soft" ? t.soft : t.strong}`
              : t.noColor;
          return (
            <Tooltip key={tone ?? "none"}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="column-tone-swatch"
                  style={
                    tone
                      ? ({
                          "--col-swatch-bg": `var(--col-tone-${tone})`,
                          "--col-swatch-fg": `var(--col-tone-${tone}-fg)`,
                        } as CSSProperties)
                      : undefined
                  }
                  aria-label={name}
                  aria-pressed={(value.tone ?? null) === tone}
                  tabIndex={focusIndex === index ? 0 : -1}
                  onFocus={() => setFocusIndex(index)}
                  onKeyDown={(event) => {
                    const next =
                      event.key === "ArrowRight" || event.key === "ArrowDown"
                        ? (index + 1) % options.length
                        : event.key === "ArrowLeft" || event.key === "ArrowUp"
                          ? (index + options.length - 1) % options.length
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? options.length - 1
                              : null;
                    if (next === null) return;
                    event.preventDefault();
                    setFocusIndex(next);
                    const buttons =
                      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                        "button",
                      );
                    buttons?.item(next)?.focus();
                  }}
                  onClick={() =>
                    onChange({ ...(value.bold ? { bold: true } : {}), ...(tone ? { tone } : {}) })
                  }
                >
                  {tone ? "Aa" : "∅"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

/** Formát sloupce pouze v okně Sloupce; změny se projeví okamžitě. */
export const ColumnFormatEditor = forwardRef<HTMLDivElement, ColumnFormatEditorProps>(
  function ColumnFormatEditor({ value, onChange, onClose, className, onKeyDown, ...props }, ref) {
    const t = useDsTexts().columnPicker;
    return (
      <div
        {...props}
        ref={ref}
        data-slot="column-format-editor"
        className={cn("space-y-2 border-y bg-secondary/30 px-3 py-2", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
        }}
      >
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={value.bold === true}
            onCheckedChange={(checked) => onChange({ ...value, bold: checked === true })}
          />
          {t.bold}
        </label>
        <ToneRow strength="soft" value={value} onChange={onChange} />
        <ToneRow strength="strong" value={value} onChange={onChange} />
      </div>
    );
  },
);
