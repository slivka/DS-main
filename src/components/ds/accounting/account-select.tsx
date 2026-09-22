import { useMemo, useState } from "react";
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
  active?: boolean;
};

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
  disabled,
  className,
}: {
  accounts: AccountOption[];
  value: string | null | undefined;
  onChange: (code: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  hideInactive?: boolean;
  disableSyntheticWithAnalytics?: boolean;
  typeLabels?: Record<AccountType, string>;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const codes = accounts.map((a) => normalizeAccountCode(a.code));
    return accounts
      .filter((a) => (hideInactive ? a.active !== false : true))
      .map((a) => {
        const code = normalizeAccountCode(a.code);
        const hasAnalytics =
          code.length === 3 && codes.some((c) => c.length > 3 && c.startsWith(code));
        const blocked =
          a.active === false || (disableSyntheticWithAnalytics && hasAnalytics);
        return { ...a, code, blocked };
      });
  }, [accounts, hideInactive, disableSyntheticWithAnalytics]);

  const selected = list.find((a) => a.code === normalizeAccountCode(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
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
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {list.map((a) => (
                <CommandItem
                  key={a.code}
                  value={`${a.code} ${formatAccountCode(a.code)} ${a.name}`}
                  disabled={a.blocked}
                  onSelect={() => {
                    if (a.blocked) return;
                    onChange(a.code);
                    setOpen(false);
                  }}
                  className={cn("gap-2", a.blocked && "opacity-50")}
                >
                  <span className="w-20 shrink-0 font-mono tabular-nums">
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
