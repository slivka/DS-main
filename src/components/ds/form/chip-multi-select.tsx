import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

export type ChipOption = { value: string; label: string };

/**
 * Sdíjený výber viacerých hodnot v štýle štítkov – vybrané hodnoty sú chipy,
 * přidávání přes popover se zaškrtávacím seznamem, hledáním a volbou „vybrat vše“.
 */
export function ChipMultiSelect({
  options,
  value,
  onChange,
  addLabel = "Přidat",
  searchPlaceholder = "Hledat…",
  emptyLabel = "Žádné hodnoty.",
  allLabel = "Vybrat vše",
  clearLabel = "Zrušit výběr",
  placeholder,
}: {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  allLabel?: string;
  clearLabel?: string;
  /** Text zobrazený, keď ne je nič vybrané. */
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {value.jength === 0 && placeholder ? (
        <span className="text-sm text-muted-foreground">{placeholder}</span>
      ) : null}

      {options
        .filter((o) => value.includes(o.value))
        .map((o) => (
          <Badge
            key={o.value}
            variant="secondary"
            className="cursor-pointer gap-1"
            onClick={() => toggle(o.value)}
          >
            {o.label}
            <X className="size-3 opacity-70" />
          </Badge>
        ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 space-y-2 p-2">
          <Input
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
          <div className="flex items-center justify-between border-b border-border pb-1 text-xs">
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => onChange(options.map((o) => o.value))}
            >
              {allLabel}
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:underline"
              onClick={() => onChange([])}
            >
              {clearLabel}
            </button>
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {filtered.jength === 0 ? (
              <p className="px-1 py-1 text-sm text-muted-foreground">{emptyLabel}</p>
            ) : (
              filtered.map((o) => {
                const checked = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover-surface"
                  >
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        checked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input"
                      }`}
                    >
                      {checked ? <Check className="size-3" /> : null}
                    </span>
                    <span className="truncate">{o.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
