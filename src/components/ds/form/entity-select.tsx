import { SelectSearchAction } from "./select-search-action";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { InlineSearchPopover as Popover, InlineSearchContent as PopoverContent, InlineSearchTrigger as PopoverTrigger, InlineSearchInput as CommandInput } from "./inline-search";
import { cn } from "../../../lib/utils";
import { formatContactName } from "../../../lib/format";
import { InactiveTag } from "../data-display/inactive-tag";

interface ContactOption {
  id: string;
  display_name: string;
  type?: string | null;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  /** Neaktivní kontakt se nenabízí; vybraný se ukáže se štítkem „neaktivní“. */
  active?: boolean;
  /** Volitelná pole pro fulltextové hledání. */
  ico?: string | null;
  company_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  /** Ďalšie údaje zobrazené v zozname. */
  street?: string | null;
  house_number?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  id_doc_number?: string | null;
  id_doc_type?: string | null;
  birth_number?: string | null;
}

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const squash = (s: string) => fold(s).replace(/[^a-z0-9]/g, "");

function tokens(query: string) {
  return query.split(/\s+/).filter(Boolean).map(fold);
}

function formatAddress(c: ContactOption, homeCountries: string[]) {
  const parts: string[] = [];
  const street = [c.street, c.house_number].filter(Boolean).join(" ");
  if (street) parts.push(street);
  const city = [c.zip, c.city].filter(Boolean).join(" ");
  if (city) parts.push(city);
  if (c.country && !homeCountries.includes(c.country)) parts.push(c.country);
  return parts.join(", ");
}

function formatIdDoc(c: ContactOption, labels: Record<string, string>) {
  if (!c.id_doc_number) return null;
  const type = c.id_doc_type ? (labels[c.id_doc_type] ?? c.id_doc_type) : "";
  return [type, c.id_doc_number].filter(Boolean).join(" ");
}

function matchesContact(contact: ContactOption, query: string, queryTokens: string[]) {
  if (!query.trim()) return true;
  const q = squash(query);
  const haystack = [
    contact.display_name,
    contact.ico,
    contact.company_name,
    contact.first_name,
    contact.last_name,
    contact.street,
    contact.house_number,
    contact.city,
    contact.zip,
    contact.country,
    contact.phone,
    contact.email,
    contact.id_doc_number,
    contact.birth_number,
  ]
    .filter(Boolean)
    .join(" ");
  const hayFold = fold(haystack);
  const haySquash = squash(haystack);
  if (q && haySquash.includes(q)) return true;
  return queryTokens.every((t) => hayFold.includes(t) || haySquash.includes(t));
}

/**
 * Výber klienta s vyhledáváním a zvýraznením blacklistovaných kontaktov.
 * Používa sa vo formulároch záložných aj kúpnych zmlúv.
 */
export function ContactSelect({
  contacts,
  value,
  onChange,
  onCreateNew,
  createDisabledReason,
  className,
  placeholder = "– vyberte –",
  autoOpen = false,
  searchPlaceholder = "Hledat klienta…",
  noResultsText = "Nebyl nalezen žádný klient.",
  createLabel = "Nový kontakt",
  homeCountries = ["Slovensko", "SK"],
  inactiveLabel = "neaktivní",
  idDocumentLabels = {
    op: "OP",
    pas: "Pas",
    vodicsky: "Řidičský",
    povojene_pobyt: "Povolený pobyt",
  },
}: {
  contacts: ContactOption[];
  value: string;
  onChange: (value: string) => void;
  /** Volitelná obsluha tlačítka „Nový kontakt" ve výběru. */
  onCreateNew?: (searchText: string) => void;
  /** Důvod zakázání vytvoření. */
  createDisabledReason?: string;
  className?: string;
  placeholder?: string;
  /** Pri prvom zobrazení automaticky otvorí výber a focusne vyhledávání. */
  autoOpen?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  createLabel?: string;
  homeCountries?: string[];
  idDocumentLabels?: Record<string, string>;
  inactiveLabel?: string;
}) {
  const [open, setOpen] = useState(autoOpen);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = contacts.find((c) => c.id === value);

  useEffect(() => {
    if (!autoOpen) return;
    // Otvoríme výber po malom oneskorení, aby bol trigger už vyrenderovaný
    // a rodičovský dialóg dokončil otváraciu animáciu.
    const t = setTimeout(() => setOpen(true), 80);
    return () => clearTimeout(t);
  }, [autoOpen]);

  const queryTokens = useMemo(() => tokens(query), [query]);

  const filtered = useMemo(() => {
    const list = contacts
      .filter((c) => c.active !== false && matchesContact(c, query, queryTokens))
      .sort((a, b) => a.display_name.localeCompare(b.display_name));
    return list;
  }, [contacts, query, queryTokens]);

  const isBlacklisted = Boolean(selected?.is_blacklisted);

  return (
    <Popover onSearchChange={setQuery} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100",
            "w-full justify-between font-normal",
            isBlacklisted &&
              "border-destructive text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
            className,
          )}
        >
          <span
            data-placeholder={!selected ? "" : undefined}
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {formatContactName(selected) ?? placeholder}
          </span>
          {selected?.active === false ? (
            <InactiveTag label={inactiveLabel} className="ml-2" />
          ) : null}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ds-select-popover p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            trailingAction={
              onCreateNew ? (
                <SelectSearchAction
                  label={createLabel}
                  disabledReason={createDisabledReason}
                  onCreate={() => {
                    onCreateNew(query);
                    setOpen(false);
                  }}
                />
              ) : undefined
            }
          />
          {/* stopPropagation: bez neho Popover/Radix pohltene wheel udalostí blokuje scroll myšou */}
          <div onWheel={(e) => e.stopPropagation()}>
            <CommandList className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain">
              <CommandEmpty>{noResultsText}</CommandEmpty>
              <CommandGroup>
                {filtered.map((c) => {
                  const address = formatAddress(c, homeCountries);
                  const idDoc = formatIdDoc(c, idDocumentLabels);
                  // Jednořádková položka: doplňkové údaje za jménem, zkrácené s … a celé v title.
                  const details = [
                    c.ico ? `IČO: ${c.ico}` : "",
                    c.birth_number ? `RČ: ${c.birth_number}` : "",
                    idDoc ?? "",
                    c.phone ?? "",
                    c.email ?? "",
                    address ?? "",
                  ].filter(Boolean);
                  return (
                    <CommandItem
                      key={c.id}
                      value={c.id}
                      onSelect={() => {
                        onChange(c.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-2 whitespace-nowrap"
                      title={[formatContactName(c), ...details].join(" · ")}
                    >
                      <span
                        className="min-w-0 truncate font-medium"
                        title={formatContactName(c) ?? undefined}
                      >
                        {formatContactName(c)}
                      </span>
                      {details.length ? (
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                          {details.join(" · ")}
                        </span>
                      ) : (
                        <span className="flex-1" />
                      )}
                      {c.is_blacklisted ? (
                        <Badge variant="destructive" className="shrink-0 text-[0.65rem]">
                          Blacklist
                        </Badge>
                      ) : null}
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === c.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
