import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { formatAccountCode, normalizeAccountCode } from "./account-code";
import { cn } from "../../../lib/utils";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense" | "offBalance";

/** Výchozí české popisky typů účtů. */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: "Aktivní",
  liability: "Pasivní",
  equity: "Vlastní kapitál",
  revenue: "Výnosový",
  expense: "Nákladový",
  offBalance: "Podrozvahový",
};

export type AccountOption = {
  /** Uložený kód, např. „221001“. */
  code: string;
  name: string;
  type?: AccountType;
  /** Kategorie účtu z osnovy (`accounts.category`) – řídí povinná stranová pole. */
  category?: string;
  /** Typ účtu z osnovy (`accounts.account_type`), např. „nakladovy“. */
  accountType?: string;
  /** Výchozí příznak Nedaňový při použití účtu na řádku dokladu. */
  nonTaxDefault?: boolean;
  active?: boolean;
  /** Zda lze na tento účet přímo účtovat (jinak je jen součtový). */
  postable?: boolean;
};

/** Úroveň v osnově: třída (1 znak), skupina (2), syntetický (3), analytický (4+). */
export type AccountLevel = "class" | "group" | "synthetic" | "analytic";

/** Položka číselníku tříd a skupin (kód „5“, „51“ + název). */
export type AccountCatalogItem = { code: string; name: string };

export interface AccountSelectProps {
  accounts: AccountOption[];
  value: string | null | undefined;
  onChange: (code: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  hideInactive?: boolean;
  disableSyntheticWithAnalytics?: boolean;
  typeLabels?: Record<AccountType, string>;
  allowLevels?: AccountLevel[];
  catalog?: AccountCatalogItem[];
  disabled?: boolean;
  initialSearch?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  /** Obsah uvnitř spouštěče před šipkou, např. strana MD / DAL. */
  suffix?: ReactNode;
  className?: string;
}

export function accountLevelOf(code: string): AccountLevel {
  const length = normalizeAccountCode(code).length;
  if (length <= 1) return "class";
  if (length === 2) return "group";
  if (length === 3) return "synthetic";
  return "analytic";
}

/** Výběr účtu z osnovy – kód, název a typ účtu. */
export function AccountSelect({
  accounts,
  value,
  onChange,
  placeholder = "Vyberte účet",
  searchPlaceholder = "Hledat účet nebo číslo…",
  emptyText = "Žádný účet nenalezen",
  /** Skrýt neaktivní účty (jinak jsou jen nevolitelné). */
  hideInactive = false,
  /** Zakázat výběr syntetického účtu, který má analytiky. */
  disableSyntheticWithAnalytics = true,
  typeLabels = ACCOUNT_TYPE_LABELS,
  allowLevels,
  catalog,
  disabled,
  initialSearch,
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  suffix,
  className,
}: AccountSelectProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(initialSearch ?? "");
  // Po zavření Radix vrátí fokus na trigger – potlačíme okamžité znovuotevření.
  const suppressFocusOpen = useRef(false);
  // Fokus z kliknutí myší necháváme na Radix (sám přepne), jinak by klik zavřel.
  const pointerDown = useRef(false);

  useEffect(() => setQuery(initialSearch ?? ""), [initialSearch]);

  const changeOpen = (next: boolean) => {
    if (!next) suppressFocusOpen.current = true;
    setOpen(next);
    onOpenChange?.(next);
  };

  const list = useMemo(() => {
    const codes = accounts.map((a) => normalizeAccountCode(a.code));
    const known = new Set(codes);
    const catalogOptions: AccountOption[] = (catalog ?? [])
      .filter((item) => !known.has(normalizeAccountCode(item.code)))
      .map((item) => ({ code: item.code, name: item.name, postable: false }));
    const merged = [...accounts, ...catalogOptions]
      .filter((a) => (hideInactive ? a.active !== false : true))
      .map((a) => {
        const code = normalizeAccountCode(a.code);
        const level = accountLevelOf(code);
        const hasAnalytics =
          code.length === 3 && codes.some((c) => c.length > 3 && c.startsWith(code));
        const blocked = allowLevels
          ? a.active === false || !allowLevels.includes(level)
          : a.active === false ||
            (a.postable !== undefined ? !a.postable : disableSyntheticWithAnalytics && hasAnalytics);
        return { ...a, code, level, blocked };
      });
    return catalogOptions.length ? merged.sort((a, b) => a.code.localeCompare(b.code, "cs")) : merged;
  }, [accounts, catalog, allowLevels, hideInactive, disableSyntheticWithAnalytics]);

  const selected = list.find((a) => a.code === normalizeAccountCode(value));
  const normalizedQuery = normalizeAccountCode(query).toLocaleLowerCase("cs");
  const filteredList = query.trim()
    ? list.filter((account) => {
        const numericQuery = /^\s*[\d.]+\s*$/.test(query);
        if (numericQuery) return account.code.startsWith(normalizedQuery);
        return `${account.code} ${formatAccountCode(account.code)} ${account.name}`
          .toLocaleLowerCase("cs")
          .includes(query.trim().toLocaleLowerCase("cs"));
      })
    : list;

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          onPointerDownCapture={() => {
            pointerDown.current = true;
          }}
          onPointerUp={() => {
            pointerDown.current = false;
          }}
          onFocus={() => {
            if (disabled || suppressFocusOpen.current || pointerDown.current) return;
            changeOpen(true);
          }}
          onBlur={() => {
            suppressFocusOpen.current = false;
            pointerDown.current = false;
          }}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? (
              <>
                <span className="font-mono tabular-nums">{formatAccountCode(selected.code)}</span>
                <span className="ml-2 text-muted-foreground">{selected.name}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {suffix}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput autoFocus placeholder={searchPlaceholder} value={query} onValueChange={setQuery} onKeyDown={onKeyDown} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredList.map((a) => (
                <CommandItem
                  key={a.code}
                  value={`${a.code} ${formatAccountCode(a.code)} ${a.name}`}
                  disabled={a.blocked}
                  onSelect={() => {
                    if (a.blocked) return;
                    onChange(a.code);
                    changeOpen(false);
                  }}
                  className={cn("gap-2", a.blocked && "opacity-50")}
                >
                  <span
                    className={cn(
                      "w-20 shrink-0 font-mono tabular-nums",
                      (a.level === "class" || a.level === "group") && "font-semibold",
                    )}
                  >
                    {formatAccountCode(a.code)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{a.name}</span>
                  {a.type ? (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {typeLabels[a.type]}
                    </span>
                  ) : null}
                  {selected?.code === a.code ? <Check className="size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
