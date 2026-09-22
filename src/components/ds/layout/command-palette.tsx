import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";

export type CommandTarget = {
  label: string;
  group: string;
  to: string;
  search?: Record<string, string>;
};

/** Globální vyhledávání stránek – otevře se přes Ctrl/Cmd+K. Seznam dodá aplikace. */
export function CommandPalette({
  targets,
  placeholder = "Hledat stránku…",
  emptyText = "Nic nenalezeno.",
}: {
  targets: CommandTarget[];
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = Array.from(new Set(targets.map((t) => t.group)));

  const go = (t: CommandTarget) => {
    setOpen(false);
    navigate({ to: t.to, search: t.search } as never);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {targets
              .filter((t) => t.group === g)
              .map((t) => (
                <CommandItem
                  key={`${g}-${t.label}`}
                  value={`${g} ${t.label}`}
                  onSelect={() => go(t)}
                >
                  {t.label}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
