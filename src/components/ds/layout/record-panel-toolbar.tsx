/** Nástroje panelu · vlastní měření hlavní akce · nesmí určovat dostupnost operací. */
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
/** Hlavní akce nástrojů; dostupnost dodává aplikace. */
export interface RecordPanelToolbarAction {
  /** Plný název. */
  label: string;
  /** Zástupná ikona při nedostatku místa. */
  icon: LucideIcon;
  /** Vyvolání akce. */
  onClick: () => void;
  /** Akce není dostupná. */
  disabled?: boolean;
  /** Vysvětlení nedostupnosti. */
  disabledReason?: string;
}
/** Jednořádkový rám nástrojů. */
export interface RecordPanelToolbarProps extends ComponentPropsWithoutRef<"div"> {
  /** Zobrazení, filtr nebo řazení. */
  start?: ReactNode;
  /** Vlastní hlavní akce; může používat action pro automatické zkrácení. */
  end?: ReactNode;
  /** Modrá hlavní akce s automatickým zkrácením na ikonu. */
  action?: RecordPanelToolbarAction;
}
/** Stabilní řádek společný všem záložkám panelu. */
export const RecordPanelToolbar = forwardRef<HTMLDivElement, RecordPanelToolbarProps>(
  function RecordPanelToolbar({ start, end, action, className, children, ...props }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const leading = useRef<HTMLDivElement>(null);
    const trailing = useRef<HTMLDivElement>(null);
    const measure = useRef<HTMLSpanElement>(null);
    const [compact, setCompact] = useState(false);
    useEffect(() => {
      const element = host.current;
      if (!element) return;
      const update = () => {
        const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
        setCompact(
          (leading.current?.scrollWidth ?? 0) +
            (trailing.current?.offsetWidth ?? 0) +
            (measure.current?.offsetWidth ?? 0) +
            gap * 2 >
            element.clientWidth,
        );
      };
      const observer = new ResizeObserver(update);
      [element, leading.current, trailing.current, measure.current].forEach((node) => {
        if (node) observer.observe(node);
      });
      update();
      return () => observer.disconnect();
    }, [action?.label, start, end]);
    const Icon = action?.icon;
    return (
      <div
        ref={ref}
        {...props}
        className={cn("min-w-0", className)}
        data-slot="record-panel-toolbar"
      >
        <div ref={host} className="relative flex h-[var(--control-h)] min-w-0 items-center gap-2">
          <div ref={leading} className="flex min-w-0 items-center gap-1 overflow-hidden">
            {start}
            {children}
          </div>
          <div ref={trailing} className="ml-auto flex shrink-0 items-center gap-1">
            {end}
          </div>
          {action && Icon ? (
            <>
              <span
                ref={measure}
                aria-hidden="true"
                inert
                className="pointer-events-none absolute invisible inline-flex w-max"
              >
                <Button tabIndex={-1} className="h-[var(--control-h)]">
                  {action.label}
                </Button>
              </span>
              <DisabledReasonTooltip
                blocked={Boolean(action.disabled)}
                content={action.disabledReason ?? action.label}
              >
                <Button
                  type="button"
                  variant="default"
                  size={compact ? "icon" : "default"}
                  className="h-[var(--control-h)] shrink-0"
                  aria-label={action.label}
                  aria-disabled={action.disabled || undefined}
                  onClick={() => {
                    if (!action.disabled) action.onClick();
                  }}
                >
                  {compact ? <Icon className="size-4" aria-hidden="true" /> : action.label}
                </Button>
              </DisabledReasonTooltip>
            </>
          ) : null}
        </div>
      </div>
    );
  },
);
