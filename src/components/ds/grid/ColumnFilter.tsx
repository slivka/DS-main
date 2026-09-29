import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { useResolvedGridTexts, type GridTexts } from "./grid-texts";

export type FilterOption = { value: string; label: string; section?: string };

type ColumnFilterProps = {
  /** Distinct values available in this column. */
  options: FilterOption[];
  /** Currently selected values. Empty set means "all / no filter". */
  selected: Set<string>;
  /** Called whenever the selection changes. */
  onChange: (next: Set<string>) => void;
  /** Accessible label for the trigger button. */
  label: string;
  /** Optional render of a custom numeric filter body. */
  children?: React.ReactNode;
  texts?: Partial<GridTexts>;
};

/**
 * Excel-style autofilter popover: a funnel icon in the column header opens a
 * panel with a search box and a checklist of distinct values, plus Select all
 * / Clear actions. An empty selection means "no filter".
 */
export function ColumnFilter({ options, selected, onChange, label, children, texts: textOverrides }: ColumnFilterProps) {
  const texts = useResolvedGridTexts(textOverrides);
  const [search, setSearch] = useState("");

  const active = selected.size > 0;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLocaleLowerCase(texts.locale).includes(q) || o.section?.toLocaleLowerCase(texts.locale).includes(q),
    );
  }, [options, search]);

  const sections = useMemo(() => {
    const result: { label?: string; options: FilterOption[] }[] = [];
    for (const option of filtered) {
      const current = result.at(-1);
      if (!current || current.label !== option.section) {
        result.push({ ...(option.section ? { label: option.section } : {}), options: [option] });
      } else {
        current.options.push(option);
      }
    }
    return result;
  }, [filtered]);

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  const selectAll = () => onChange(new Set());
  const clearAll = () => onChange(new Set(["__none__"]));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`size-6 shrink-0 p-0 ${active ? "rounded-md bg-destructive/12 text-destructive ring-1 ring-destructive/50 hover:text-destructive" : "text-muted-foreground/60 hover:text-foreground"}`}
          aria-label={texts.filterLabel(label)}
        >
          <Filter className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        {children ? (
          <div className="p-3">{children}</div>
        ) : (
          <>
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={texts.filterSearchPlaceholder}
                  className="h-8 pl-7 text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-b px-2 py-1 text-xs">
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={selectAll}
              >
                {texts.selectAll}
              </button>
              <button
                type="button"
                className="font-medium text-muted-foreground hover:underline"
                onClick={clearAll}
              >
                {texts.clear}
              </button>
            </div>
            <div className="max-h-56 overflow-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">{texts.noValues}</p>
              ) : (
                sections.map((section) => (
                  <div key={section.label ?? "values"}>
                    {section.label ? (
                      <div className="sticky top-0 border-y bg-muted/70 px-2 py-1 text-[0.6875rem] font-semibold uppercase text-muted-foreground first:border-t-0">
                        {section.label}
                      </div>
                    ) : null}
                    {section.options.map((opt) => {
                      const checked = selected.has(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex w-full cursor-pointer items-center gap-2 px-2 py-1.5 text-left text-xs hover-surface"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggle(opt.value)} />
                          <span className="truncate">{opt.label || "—"}</span>
                        </label>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
