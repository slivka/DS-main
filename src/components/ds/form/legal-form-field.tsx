import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { LEGAL_FORMS } from "../../../lib/legal-forms";
import { cn } from "../../../lib/utils";

type LegalFormFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  clearLabel?: string;
};

/** Zdieľaný výber právnej formy z číselníka (ŠÚ SR / Finstat). */
export function LegalFormField({
  value,
  onChange,
  disabled,
  className,
  placeholder = "Vyberte právní formu",
  searchPlaceholder = "Hledat právní formu…",
  noResultsText = "Nebyla nalezena žádná právní forma.",
  clearLabel = "Zrušit výběr",
}: LegalFormFieldProps) {
  const [open, setOpen] = useState(false);
  const current = value?.trim() ?? "";
  const known = LEGAL_FORMS.some((f) => f.name === current);
  const options = known || !current ? LEGAL_FORMS : [{ code: "", name: current }, ...LEGAL_FORMS];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("hover-surface w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !current && "text-muted-foreground")}>
            {current || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(520px,90vw)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {current ? (
                <CommandItem
                  value="__clear__"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <span className="text-muted-foreground">{clearLabel}</span>
                </CommandItem>
              ) : null}
              {options.map((f) => (
                <CommandItem
                  key={`${f.code}-${f.name}`}
                  value={`${f.code} ${f.name}`}
                  onSelect={() => {
                    onChange(f.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 size-4", current === f.name ? "opacity-100" : "opacity-0")}
                  />
                  <span className="flex-1">{f.name}</span>
                  {f.code ? (
                    <span className="ml-2 text-xs text-muted-foreground">{f.code}</span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
