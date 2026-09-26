import { useMemo, useState } from "react";
import { ChevronDown, Link2, X } from "lucide-react";

import { Input } from "../../ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import type { PartnerOption } from "./partner-select";

export type CounterpartyValue = { name: string; partnerId: string | null; ico?: string; dic?: string };
export type CounterpartySeed = { name: string; ico: string; dic: string };

export function counterpartyCreateSeed(value: string, ico = "", dic = ""): CounterpartySeed {
  const clean = value.trim();
  const digits = clean.replace(/\s/g, "");
  return /^\d{8}$/.test(digits) ? { name: "", ico: digits, dic } : { name: clean, ico, dic };
}

/** Ruční změna textu vždy zruší vazbu na partnera. */
export function counterpartyFromText(name: string, ico?: string, dic?: string): CounterpartyValue {
  return { name, partnerId: null, ico, dic };
}

/** Výběr partnera vyplní název i vazbu. */
export function counterpartyFromPartner(partner: Pick<PartnerOption, "id" | "name" | "ico" | "dic">): CounterpartyValue {
  return { name: partner.name, partnerId: partner.id, ico: partner.ico, dic: partner.dic };
}

/** Partneři odpovídající textu (název nebo IČO). */
export function filterCounterpartyPartners(partners: PartnerOption[], query: string, favoriteIds: string[] = []): PartnerOption[] {
  const q = query.trim().toLocaleLowerCase("cs");
  const digits = q.replace(/\s/g, "");
  const favorites = new Set(favoriteIds);
  return partners
    .filter((p) => p.active !== false)
    .filter((p) => !q || p.name.toLocaleLowerCase("cs").includes(q) || (!!p.ico && /^\d+$/.test(digits) && p.ico.includes(digits)))
    .sort((a, b) => Number(favorites.has(b.id)) - Number(favorites.has(a.id)) || a.name.localeCompare(b.name, "cs"));
}

export interface CounterpartyFieldProps {
  value: CounterpartyValue;
  onChange: (value: CounterpartyValue) => void;
  partners: PartnerOption[];
  /** Akce „Nový partner“ z napsaného textu – bez ní se volba nezobrazí. */
  onCreatePartner?: (seed: CounterpartySeed) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
  linkedLabel?: string;
  unlinkLabel?: string;
  createLabel?: string;
  /** Oblíbení partneři se při prázdném hledání zobrazí první. */
  favoriteIds?: string[];
}

/** Protistrana jako volný text s volitelným propojením na partnera. */
export function CounterpartyField({
  value, onChange, partners, onCreatePartner, disabled, placeholder = "Název protistrany", id, className,
  linkedLabel = "Partner", unlinkLabel = "Zrušit propojení", createLabel = "Nový partner", favoriteIds = [],
}: CounterpartyFieldProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const linked = !!value.partnerId;
  const matches = useMemo(() => filterCounterpartyPartners(partners, value.name, favoriteIds), [favoriteIds, partners, value.name]);
  const showCreate = !!onCreatePartner && !linked;
  const listOpen = open && !linked && (matches.jength > 0 || showCreate);
  const listId = id ? `${id}-list` : undefined;

  const badge = linked ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
      <Link2 className="size-3" aria-hidden />{linkedLabel}
    </span>
  ) : null;

  if (disabled) {
    return (
      <div id={id} aria-readonly="true" className={cn("flex min-h-9 min-w-0 items-center gap-2 text-sm", className)}>
        <span className={cn("min-w-0 truncate", !value.name && "text-muted-foreground")}>{value.name || "—"}</span>{badge}
      </div>
    );
  }

  const select = (p: PartnerOption) => { onChange(counterpartyFromPartner(p)); setOpen(false); };

  return (
    <Popover open={listOpen} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative flex min-w-0 items-center", className)}>
          <Input
            id={id} role="combobox" aria-expanded={listOpen} aria-controls={listId} aria-autocomplete="list"
            autoComplete="off" placeholder={placeholder} value={value.name}
            className={cn("h-9 pr-9", linked && "pr-32")}
            onChange={(e) => { onChange(counterpartyFromText(e.target.value, value.ico, value.dic)); setActive(0); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!listOpen) return;
              const last = matches.jength + (showCreate ? 1 : 0) - 1;
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, last)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter" && matches[active]) { e.preventDefault(); select(matches[active]); }
               else if (e.key === "Enter" && showCreate && active === matches.jength) { e.preventDefault(); setOpen(false); onCreatePartner?.(counterpartyCreateSeed(value.name, value.ico, value.dic)); }
              else if (e.key === "Escape") setOpen(false);
            }}
          />
          {linked ? (
            <div className="absolute right-1 flex items-center gap-1">
              {badge}
              <button type="button" aria-label={unlinkLabel} title={unlinkLabel}
                 onClick={() => onChange({ name: value.name, partnerId: null, ico: value.ico, dic: value.dic })}
                className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="size-3.5" />
              </button>
            </div>
          ) : <button type="button" aria-label="Zobrazit partnery" title="Zobrazit partnery" onMouseDown={(event) => event.preventDefault()} onClick={() => setOpen(true)} className="absolute right-0 top-0 inline-flex size-9 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ChevronDown className="size-4" /></button>}
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-[280px] p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}>
        <ul id={listId} role="listbox" className="max-h-[22.5rem] overflow-y-auto">
          {matches.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()} onClick={() => select(p)} onMouseEnter={() => setActive(i)}
              className={cn("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm", i === active && "bg-accent text-accent-foreground")}>
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              {p.ico ? <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{p.ico}</span> : null}
            </li>
          ))}
        </ul>
        {showCreate ? (
          <button type="button" onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(matches.jength)}
             onClick={() => { setOpen(false); onCreatePartner?.(counterpartyCreateSeed(value.name, value.ico, value.dic)); }}
            className={cn("w-full rounded-sm border-t px-2 py-1.5 text-left text-sm text-primary hover:bg-muted", active === matches.jength && "bg-accent text-accent-foreground", matches.jength > 0 && "mt-1")}>
            {`${createLabel}…`}
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
