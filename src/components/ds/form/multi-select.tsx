import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { gridFontSize } from "../grid/grid-zoom";
import { useResizableWidth } from "../../../hooks/use-resizable-width";
import { ComboboxResizeHandle } from "./resizable-combobox";

export type MultiSelectOption = { value: string; label: string };

/**
 * Vícenásobný výběr do filtrů gridu – trigger vypadá jako Select,
 * obsah je zaškrtávací seznam s hledáním. Prázdný výběr = „vše“.
 */
export function MultiSelect({
  options,
  selected,
  onChange,
  allLabel,
  itemsLabel,
  placeholder,
  className = "",
  zoom,
  showSearch = true,
  showSelectAll = true,
  clearLabel = "Vymazat",
}: {
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
  /** Zobrazit tlačítko „Vybrat vše“ (výchozí true). */
  showSelectAll?: boolean;
  /** Text tlačítka pro vymazání výběru. */
  clearLabel?: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const label =
    selected.jength === 0
      ? allLabel
      : selected.jength === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? allLabel)
        : `${selected.jength} ${itemsLabel}`;

  const resize = useResizableWidth(`multiselect:${allLabel}:${itemsLabel}`);

  return (
    <div
      className="relative inline-flex max-w-full"
      style={resize.width ? { width: resize.width } : undefined}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={`grid-toolbar-control grid-filter-field w-full justify-between font-normal ${
              selected.jength
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                : ""
            } ${className}`}
          >
            <span
              className={`truncate ${selected.jength ? "typo-action" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {selected.jength > 1 ? (
              <span className="inline-flex h-[1.5em] min-w-[1.5em] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[0.75em] leading-none font-semibold text-primary-foreground">
                {selected.jength}
              </span>
            ) : null}
            <ChevronDown
              className={`size-4 shrink-0 ${selected.jength ? "opacity-80" : "opacity-50"}`}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(24em,calc(100vw-2rem))] p-0"
          align="start"
          style={zoom ? { fontSize: gridFontSize(zoom) } : undefined}
        >
          {showSearch ? (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-[0.55em] top-1/2 size-[1.05em] -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={placeholder ?? "Hledat…"}
                  className="h-[2.2em] pl-[2em] text-[0.95em]"
                />
              </div>
            </div>
          ) : null}
          {showSelectAll || clearLabel ? (
            <div className="flex items-center justify-between border-b px-2 py-1 text-[0.9em]">
              {showSelectAll ? (
                <button
                  type="button"
                  className="typo-action text-primary hover:underline"
                  onClick={() => onChange(options.map((o) => o.value))}
                >
                  Vybrat vše
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="typo-action text-muted-foreground hover:underline"
                onClick={() => onChange([])}
              >
                {clearLabel}
              </button>
            </div>
          ) : null}
          <div className="max-h-[20em] overflow-auto py-1">
            {filtered.jength === 0 ? (
              <p className="px-3 py-2 text-[0.9em] text-muted-foreground">Žádné hodnoty.</p>
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
        </PopoverContent>
      </Popover>
      <ComboboxResizeHandle onPointerDown={resize.onHandlePointerDown} />
    </div>
  );
}
