import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { formatContactName } from "../../../lib/format";

interface ContactOption {
  id: string;
  display_name: string;
  type?: string | null;
  is_blacklisted?: boolean;
  blacklist_reason?: string | null;
  /** Voliteľné polia pre fulltextové hľadanie. */
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

function formatAddress(c: ContactOption) {
  const parts: string[] = [];
  const street = [c.street, c.house_number].filter(Boolean).join(" ");
  if (street) parts.push(street);
  const city = [c.zip, c.city].filter(Boolean).join(" ");
  if (city) parts.push(city);
  if (c.country && c.country !== "Slovensko" && c.country !== "SK") parts.push(c.country);
  return parts.join(", ");
}

function formatIdDoc(c: ContactOption) {
  if (!c.id_doc_number) return null;
  const labels: Record<string, string> = {
    op: "OP",
    pas: "Pas",
    vodicsky: "Vodičský",
    povolenie_pobyt: "Povolenie",
  };
  const type = c.id_doc_type ? labels[c.id_doc_type] ?? c.id_doc_type : "";
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
 * Výber klienta s vyhľadávaním a zvýraznením blacklistovaných kontaktov.
 * Používa sa vo formulároch záložných aj kúpnych zmlúv.
 */
export function ContactSelect({
  contacts,
  value,
  onChange,
  onCreateNew,
  className,
  placeholder = "– vyberte –",
  autoOpen = false,
}: {
  contacts: ContactOption[];
  value: string;
  onChange: (value: string) => void;
  /** Voliteľná obsluha pre tlačidlo „Nový kontakt" vo výbere. */
  onCreateNew?: () => void;
  className?: string;
  placeholder?: string;
  /** Pri prvom zobrazení automaticky otvorí výber a focusne vyhľadávanie. */
  autoOpen?: boolean;
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

  useEffect(() => {
    if (!open) return;
    // Po otvorení focusneme vyhľadávacie pole.
    const t = setTimeout(() => {
      inputRef.current?.focus();
      if (!inputRef.current) {
        document.querySelector<HTMLInputElement>("[cmdk-input]")?.focus();
      }
    }, 0);
    return () => clearTimeout(t);
  }, [open]);
  const queryTokens = useMemo(() => tokens(query), [query]);

  const filtered = useMemo(() => {
    const list = contacts
      .filter((c) => matchesContact(c, query, queryTokens))
      .sort((a, b) => a.display_name.localeCompare(b.display_name));
    return list;
  }, [contacts, query, queryTokens]);

  const isBlacklisted = Boolean(selected?.is_blacklisted);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            isBlacklisted &&
              "border-destructive text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive",
            className
          )}
        >
          <span className="truncate">{formatContactName(selected) ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(var(--radix-popover-trigger-width),95vw)] min-w-[28rem] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Hledat klienta…"
            value={query}
            onValueChange={setQuery}
          />
          {onCreateNew ? (
            <div className="border-b border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onCreateNew();
                  setOpen(false);
                  setQuery("");
                }}
              >
                Nový kontakt
              </Button>
            </div>
          ) : null}
          {/* stopPropagation: bez neho Popover/Radix pohltenie wheel udalostí blokuje scroll myšou */}
          <div onWheel={(e) => e.stopPropagation()}>
            <CommandList className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain">
              <CommandEmpty>Nenašiel sa žiadny klient.</CommandEmpty>
              <CommandGroup>
                {filtered.map((c) => {
                  const address = formatAddress(c);
                  const idDoc = formatIdDoc(c);
                  return (
                    <CommandItem
                      key={c.id}
                      value={c.id}
                      onSelect={() => {
                        onChange(c.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex-col items-start gap-1 py-2"
                    >
                      <div className="flex w-full items-start gap-2">
                        <span className="flex-1 truncate font-medium">{formatContactName(c)}</span>
                        {c.is_blacklisted ? (
                          <Badge variant="destructive" className="shrink-0 text-[0.65rem]">
                            Blacklist
                          </Badge>
                        ) : null}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            value === c.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                      <div className="flex w-full flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {c.ico ? <span>IČO: {c.ico}</span> : null}
                        {c.birth_number ? <span>RČ: {c.birth_number}</span> : null}
                        {idDoc ? <span>{idDoc}</span> : null}
                        {c.phone ? <span>{c.phone}</span> : null}
                        {c.email ? <span className="truncate max-w-[16rem]">{c.email}</span> : null}
                        {address ? <span className="w-full truncate">{address}</span> : null}
                      </div>
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
