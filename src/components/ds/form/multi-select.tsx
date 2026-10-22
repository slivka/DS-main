import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { Command } from "../../ui/command";
import { InlineSearchPopover as Popover, InlineSearchContent as PopoverContent, InlineSearchTrigger as PopoverTrigger, InlineSearchInput } from "./inline-search";
import { gridFontSize } from "../grid/grid-zoom";
import { useResizableWidth } from "../../../hooks/use-resizable-width";
import { useDsTexts } from "../../../ds-texts";
import { ComboboxResizeHandle } from "./resizable-combobox";

export type MultiSelectOption = { value: string; label: string };

/**
 * Vícenásobný výběr do filtrů gridu – trigger vypadá jako Select,
 * obsah je zaškrtávací seznam s hledáním. Prázdný výběr = „vše“.
 */
export function MultiSelect({ options, selected, onChange, allLabel, itemsLabel, className = "", zoom, showSearch = true, showSelectAll = true, clearLabel }: {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  /** Text zobrazený, když není nic vybráno. */
  allLabel: string;
  /** Např. „firmy“ – použije se pro „3 firmy“. */
  itemsLabel: string;
  placeholder?: string;
  className?: string;
  /** Zoom gridu – rozbajený seznam se škáluje spolu s tabulkou. */
  zoom?: number;
  /** Zobrazit řádek hledání (výchozí true). */
  showSearch?: boolean;
  /** Zobrazit tlačítko „{dsTexts.multiSelect.selectAll}“ (výchozí true). */
  showSelectAll?: boolean;
  /** Text tlačítka pro vymazání výběru. */
  clearLabel?: string;
}) {
  const dsTexts = useDsTexts();
  const resolvedClearLabel = clearLabel ?? dsTexts.grid.clear;
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const label =
    selected.length === 0
      ? allLabel
      : selected.length === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? allLabel)
        : `${selected.length} ${itemsLabel}`;

  const resize = useResizableWidth(`multiselect:${allLabel}:${itemsLabel}`);

  return (
    <div
      className="relative inline-flex max-w-full"
      style={resize.width ? { width: resize.width } : undefined}
    >
      <Popover open={open} onOpenChange={setOpen} onSearchChange={setSearch}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={`ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 grid-toolbar-control grid-filter-field w-full justify-between font-normal ${
              selected.length
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                : ""
            } ${className}`}
          >
            <span
              data-placeholder={!selected.length ? "" : undefined}
              className={`truncate ${selected.length ? "typo-action" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {selected.length > 1 ? (
              <span className="inline-flex h-[1.5em] min-w-[1.5em] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[0.75em] leading-none font-semibold text-primary-foreground">
                {selected.length}
              </span>
            ) : null}
            <ChevronDown
              className={`size-4 shrink-0 ${selected.length ? "opacity-80" : "opacity-50"}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="ds-select-popover p-0"
          align="start"
          style={zoom ? { fontSize: gridFontSize(zoom) } : undefined}
        >
          <Command shouldFilter={false}>
            {showSearch ? <InlineSearchInput value={search} onValueChange={setSearch} /> : null}
            {showSelectAll || resolvedClearLabel ? (
              <div className="flex items-center justify-between border-b px-2 py-1 text-[0.9em]">
                {showSelectAll ? (
                  <button
                    type="button"
                    className="typo-action text-primary hover:underline"
                    onClick={() => onChange(options.map((o) => o.value))}
                  >
                    {dsTexts.multiSelect.selectAll}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  className="typo-action text-muted-foreground hover:underline"
                  onClick={() => onChange([])}
                >
                  {resolvedClearLabel}
                </button>
              </div>
            ) : null}
            <div className="max-h-[20em] overflow-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-[0.9em] text-muted-foreground">
                  {dsTexts.multiSelect.noValues}
                </p>
              ) : (
                filtered.map((opt) => {
                  const checked = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className="flex w-full items-center gap-[0.5em] px-[0.6em] py-[0.35em] text-left text-[0.95em] hover-surface"
                      onClick={() => toggle(opt.value)}
                    >
                      <span
                        className={`flex size-[1.1em] shrink-0 items-center justify-center rounded border ${
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input"
                        }`}
                      >
                        {checked && <Check className="size-[0.8em]" />}
                      </span>
                      <span className="truncate">{opt.label || "—"}</span>
                    </button>
                  );
                })
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      <ComboboxResizeHandle onPointerDown={resize.onHandlePointerDown} />
    </div>
  );
}
