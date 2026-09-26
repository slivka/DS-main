import * as React from "react";
import { History } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

export interface SuggestInputProps extends Omit<React.ComponentPropsWithoutRef<typeof Input>, "value" | "onChange" | "readOnly"> {
  value: string;
  onChange: (value: string) => void;
  loadSuggestions: (query: string) => Promise<string[]>;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  readOnly?: boolean;
  debounceMs?: number;
  enabledLabel?: string;
  disabledLabel?: string;
}

/** Textové pole s volitelným našeptávačem z předchozích záznamů. */
export const SuggestInput = React.forwardRef<HTMLInputElement, SuggestInputProps>(function SuggestInput({
  value,
  onChange,
  loadSuggestions,
  enabled,
  onEnabledChange,
  disabled,
  readOnly,
  debounceMs = 200,
  enabledLabel = "Našeptávač z předchozích dokladů – zapnuto",
  disabledLabel = "Našeptávač z předchozích dokladů – vypnuto",
  className,
  onFocus,
  onKeyDown,
  ...props
}, ref) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<string[]>([]);
  const [active, setActive] = React.useState(0);
  const request = React.useRef(0);

  React.useEffect(() => {
    if (!enabled || !open || disabled || readOnly) return;
    const current = ++request.current;
    const timer = window.setTimeout(() => {
      void loadSuggestions(value).then((next) => {
        if (current !== request.current) return;
        const unique = Array.from(new Set(next.map((item) => item.trim()).filter(Boolean))).slice(0, 10);
        setItems(unique);
        setActive(0);
      }).catch(() => {
        if (current === request.current) setItems([]);
      });
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, disabled, enabled, loadSuggestions, open, readOnly, value]);

  const choose = (item: string) => {
    onChange(item);
    setOpen(false);
  };
  const visible = enabled && open && items.length > 0 && !disabled && !readOnly;
  const tooltip = enabled ? enabledLabel : disabledLabel;

  return (
    <Popover open={visible} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative min-w-0">
          <Input
            ref={ref}
            value={value}
            onChange={(event) => { onChange(event.target.value); if (enabled) setOpen(true); }}
            onFocus={(event) => { onFocus?.(event); if (enabled) setOpen(true); }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented || !visible) return;
              if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(index + 1, items.length - 1)); }
              else if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(index - 1, 0)); }
              else if (event.key === "Enter" && items[active]) { event.preventDefault(); choose(items[active]); }
              else if (event.key === "Escape") setOpen(false);
            }}
            disabled={disabled}
            readOnly={readOnly}
            role="combobox"
            aria-expanded={visible}
            aria-autocomplete="list"
            className={cn("pr-10", className)}
            {...props}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                 variant={enabled ? "default" : "outline"}
                size="icon"
                aria-label={tooltip}
                aria-pressed={enabled}
                disabled={disabled || readOnly}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => { const next = !enabled; onEnabledChange(next); setOpen(next); }}
                 className={cn("absolute right-0 top-0 size-9", enabled ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground")}
              >
                 <span className="relative"><History className="size-4" />{!enabled ? <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" /> : null}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" onOpenAutoFocus={(event) => event.preventDefault()} className="w-[--radix-popover-trigger-width] min-w-64 p-1">
        <ul role="listbox" className="max-h-72 overflow-y-auto">
          {items.map((item, index) => {
            const query = value.trim();
            const at = query ? item.toLocaleLowerCase("cs").indexOf(query.toLocaleLowerCase("cs")) : -1;
            return <li key={item} role="option" aria-selected={index === active} onMouseEnter={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} className={cn("cursor-pointer rounded-sm px-2 py-1.5 text-sm", index === active && "bg-accent text-accent-foreground")}>{at >= 0 ? <>{item.slice(0, at)}<mark className="bg-transparent font-semibold text-inherit">{item.slice(at, at + query.length)}</mark>{item.slice(at + query.length)}</> : item}</li>;
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
});