import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
export type Country = { code: string; code3?: string; name: string; is_eu?: boolean };

/** Vyhledávání bez ohledu na diakritiku a velikost písmen ("ceska" najde "Česká republika"). */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Text bez diakritiky, interpunkce a mezer – "kostarika" tak najde "Kosta Rika". */
const squash = (s: string) => fold(s).replace(/[^a-z0-9]/g, "");

/**
 * Skóre shody: 0 = neshoda, vyšší = lepší.
 * Podporuje částečné shody i více slov v libovolném pořadí.
 */
function scoreCountry(c: Country, tokens: string[], rawQuery: string): number {
  if (tokens.length === 0) return 1;
  const name = fold(c.name);
  const nameSquashed = squash(c.name);
  const words = name.split(/[^a-z0-9]+/).filter(Boolean);
  const code = fold(c.code);
  const code3 = fold(c.code3 ?? "");
  const q = squash(rawQuery);

  // Celý dotaz slitý dohromady (např. "kostarika" vs "Kosta Rika").
  if (q && nameSquashed.includes(q)) {
    return nameSquashed.startsWith(q) ? 100 : 70;
  }
  if (q && (code === q || code3 === q)) return 120;

  let score = 0;
  for (const t of tokens) {
    if (words.some((w) => w.startsWith(t))) score += 40;
    else if (nameSquashed.includes(t)) score += 25;
    else if (code.startsWith(t) || code3.startsWith(t)) score += 20;
    else return 0; // všechny části dotazu musí někde sedět
  }
  return score;
}

const RECENT_KEY = "country-select:recent";
const RECENT_MAX = 5;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(codes: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(codes.slice(0, RECENT_MAX)));
  } catch {
    /* localStorage nemusí být dostupné */
  }
}

type Props = {
  id?: string;
  countries: Country[];
  /** Kód ISO-3166-1 alpha-2 vybraného státu. */
  value: string;
  onChange: (code: string, country: Country | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

/**
 * Výběr státu s fulltextovým hledáním (název, ISO kód dvou i třípísmenný)
 * a rychlým filtrováním. EU státy jsou vypsané v samostatné skupině nahoře.
 */
export function CountrySelect({
  id,
  countries,
  value,
  onChange,
  disabled,
  placeholder = "Vyberte stát",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  // localStorage čteme až po hydrataci, aby nedošlo k rozdílu SSR vs. klient.
  useEffect(() => setRecent(readRecent()), []);

  const selected = countries.find((c) => c.code === value);

  const { recentHits, eu, rest } = useMemo(() => {
    const tokens = fold(query)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);
    const scored = countries
      .map((c) => ({ c, s: scoreCountry(c, tokens, query) }))
      .filter((x) => x.s > 0);
    if (tokens.length > 0) {
      scored.sort((a, b) => b.s - a.s || a.c.name.localeCompare(b.c.name, "cs"));
    }
    const hits = scored.map((x) => x.c);
    const recentHits = recent
      .map((code) => hits.find((c) => c.code === code))
      .filter((c): c is Country => Boolean(c));
    const recentCodes = new Set(recentHits.map((c) => c.code));
    const others = hits.filter((c) => !recentCodes.has(c.code));
    return {
      recentHits,
      eu: others.filter((c) => c.is_eu),
      rest: others.filter((c) => !c.is_eu),
    };
  }, [countries, query, recent]);

  const total = recentHits.length + eu.length + rest.length;

  const pick = (c: Country) => {
    const next = [c.code, ...recent.filter((x) => x !== c.code)].slice(0, RECENT_MAX);
    setRecent(next);
    writeRecent(next);
    onChange(c.code, c);
    setOpen(false);
    setQuery("");
  };

  const renderItem = (c: Country, prefix = "") => (
    <CommandItem
      key={`${prefix}${c.code}`}
      value={`${prefix}${c.name} ${c.code} ${c.code3 ?? ""}`}
      onSelect={() => pick(c)}
    >
      <Check className={cn("size-4", c.code === value ? "opacity-100" : "opacity-0")} />
      <span className="truncate">{c.name}</span>
      <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">{c.code}</span>
    </CommandItem>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selected ? `${selected.name} (${selected.code})` : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        {/* Filtrování si řídíme sami (diakritika + ISO kódy), proto shouldFilter=false. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Hledat stát nebo kód…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-64">
            {total === 0 && (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                  <SearchX className="size-7 text-muted-foreground" />

                  <p className="text-sm font-medium">Nic jsme nenašli</p>
                  <p className="text-xs text-muted-foreground">
                    Pro „{query.trim()}“ neodpovídá žádný stát. Zkuste jiný název nebo ISO kód
                    (např. CR).
                  </p>
                </div>
              </CommandEmpty>
            )}
            {recentHits.length > 0 && (
              <CommandGroup heading="Nedávno použité">
                {recentHits.map((c) => renderItem(c, "recent:"))}
              </CommandGroup>
            )}
            {eu.length > 0 && (
              <CommandGroup heading="Evropská unie">{eu.map((c) => renderItem(c))}</CommandGroup>
            )}
            {rest.length > 0 && (
              <CommandGroup
                heading={eu.length > 0 || recentHits.length > 0 ? "Ostatní státy" : undefined}
              >
                {rest.map((c) => renderItem(c))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
