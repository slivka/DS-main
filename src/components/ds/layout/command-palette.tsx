import { useEffect, useState } from "react";
import { useNavigate, type LinkProps } from "@tanstack/react-router";

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
  open,
  onOpenChange,
  placeholder = "Hledat stránku…",
  emptyText = "Nic nenalezeno.",
}: CommandPaletteProps) {
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const setOpen = (next: boolean | ((value: boolean) => boolean)) => {
    const resolved = typeof next === "function" ? next(isOpen) : next;
    if (open === undefined) setOwnOpen(resolved);
    onOpenChange?.(resolved);
  };
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
    navigate({ to: t.to as LinkProps["to"], search: t.search as LinkProps["search"] });
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
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

export interface CommandPaletteProps {
  targets: CommandTarget[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyText?: string;
}
