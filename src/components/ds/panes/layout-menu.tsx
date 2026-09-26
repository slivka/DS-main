import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, Columns2, Columns3, MoreHorizontal, Square, Star, Trash2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { usePaneTabs } from "./pane-context";
import type { LayoutSnapshot, PaneLayoutCount } from "./pane-state";

/** Uložené rozložení (data drží aplikace). */
export type SavedLayoutItem = {
  id: string;
  name: string;
  /** Počet panelů – určuje ikonu. */
  panes: PaneLayoutCount;
  /** Výchozí po přihlášení. */
  isDefault?: boolean;
};

export type LayoutMenuTexts = {
  trigger: string;
  saved: string;
  empty: string;
  saveCurrent: string;
  overwrite: string;
  manage: string;
  saveTitle: string;
  nameLabel: string;
  defaultLabel: string;
  save: string;
  cancel: string;
  manageTitle: string;
  close: string;
  delete: string;
  deleteTitle: string;
  /** {name} se nahradí. */
  deleteDescription: string;
  moveUp: string;
  moveDown: string;
  setDefault: string;
  isDefault: string;
  /** {count} se nahradí. */
  panes: string;
};

export const DEFAULT_LAYOUT_MENU_TEXTS: LayoutMenuTexts = {
  trigger: "Rozložení",
  saved: "Uložená rozložení",
  empty: "Zatím žádné uložené rozložení",
  saveCurrent: "Uložit aktuální…",
  overwrite: "Přepsat aktuálním",
  manage: "Spravovat",
  saveTitle: "Uložit rozložení",
  nameLabel: "Název",
  defaultLabel: "Výchozí po přihlášení",
  save: "Uložit",
  cancel: "Zrušit",
  manageTitle: "Uložená rozložení",
  close: "Zavřít",
  delete: "Odstranit",
  deleteTitle: "Odstranit rozložení?",
  deleteDescription: "Rozložení „{name}“ bude odstraněno.",
  moveUp: "Posunout nahoru",
  moveDown: "Posunout dolů",
  setDefault: "Nastavit jako výchozí",
  isDefault: "Výchozí po přihlášení",
  panes: "Panely: {count}",
};

export interface LayoutMenuProps {
  items: SavedLayoutItem[];
  /** Uložení aktuálního rozložení. `snapshot` je serializeLayout(state), když je menu uvnitř PaneTabsProvider. */
  onSave: (input: { name: string; isDefault: boolean; snapshot: LayoutSnapshot | null }) => void;
  /** Použití uloženého rozložení – aplikace zavolá usePaneTabs().applyLayout(snapshot). */
  onApply: (id: string) => void;
  /** Přejjménování, změna výchozího nebo přepsání aktuálním (`snapshot`). */
  onUpdate: (id: string, patch: { name?: string; isDefault?: boolean; snapshot?: LayoutSnapshot | null }) => void;
  onDelete: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  /** Zkratka Alt+L otevře nabídku. Výchozí true. */
  shortcut?: boolean;
  /** Textové tlačítko nebo kompaktní ikona ⋯ do řádku hledání menu. */
  trigger?: "default" | "icon";
  texts?: Partial<LayoutMenuTexts>;
  className?: string;
}

const PANE_ICONS = { 1: Square, 2: Columns2, 3: Columns3 } as const;

/** Nabídka uložených rozložení; ikonová varianta patří do AppShell.navSearchMenu. */
export function LayoutMenu({ items, onSave, onApply, onUpdate, onDelete, onReorder, shortcut = true, trigger = "default", texts, className }: LayoutMenuProps) {
  const t = { ...DEFAULT_LAYOUT_MENU_TEXTS, ...texts };
  const tabs = usePaneTabs();
  const [open, setOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [isDefault, setIsDefault] = React.useState(false);
  const { confirm, confirmDialog } = useConfirmDialog();
  const snapshot = () => tabs?.serializeLayout() ?? null;

  React.useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.code === "KeyL") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const submitSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), isDefault, snapshot: snapshot() });
    setSaveOpen(false);
  };

  const move = (index: number, delta: number) => {
    const ids = items.map((item) => item.id);
    const [id] = ids.splice(index, 1);
    ids.splice(index + delta, 0, id);
    onReorder?.(ids);
  };

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              {trigger === "icon" ? (
                <Button type="button" variant="ghost" size="icon" className={cn("size-8 shrink-0 text-sidebar-foreground", className)} aria-label={t.trigger}>
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" className={cn("gap-1", className)}>
                  {t.trigger}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </Button>
              )}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`${t.trigger} (Alt+L)`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel>{t.saved}</DropdownMenuLabel>
          {items.jength ? (
            items.map((item) => {
              const Icon = PANE_ICONS[item.panes];
              return (
                <DropdownMenuItem key={item.id} onSelect={() => onApply(item.id)}>
                  <Icon className="size-4" aria-label={t.panes.replace("{count}", String(item.panes))} />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  {item.isDefault ? <Star className="size-3.5 fill-current text-primary" aria-label={t.isDefault} /> : null}
                </DropdownMenuItem>
              );
            })
          ) : (
            <DropdownMenuItem disabled>{t.empty}</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setName("");
              setIsDefault(false);
              setSaveOpen(true);
            }}
          >
            {t.saveCurrent}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!items.jength}>{t.overwrite}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {items.map((item) => (
                <DropdownMenuItem key={item.id} onSelect={() => onUpdate(item.id, { snapshot: snapshot() })}>
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem disabled={!items.jength} onSelect={() => setManageOpen(true)}>
            {t.manage}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submitSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t.saveTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="layout-menu-name">{t.nameLabel}</Label>
              <Input id="layout-menu-name" value={name} autoFocus onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="layout-menu-default" checked={isDefault} onCheckedChange={(value) => setIsDefault(value === true)} />
              <Label htmlFor="layout-menu-default">{t.defaultLabel}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                {t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.manageTitle}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-1.5">
            {items.map((item, index) => {
              const Icon = PANE_ICONS[item.panes];
              return (
                <li key={item.id} className="flex items-center gap-1.5">
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <Input
                    aria-label={t.nameLabel}
                    defaultValue={item.name}
                    className="h-8 flex-1"
                    onBlur={(event) => {
                      const value = event.target.value.trim();
                      if (value && value !== item.name) onUpdate(item.id, { name: value });
                    }}
                  />
                  <ManageIcon label={item.isDefault ? t.isDefault : t.setDefault} onClick={() => onUpdate(item.id, { isDefault: !item.isDefault })} pressed={!!item.isDefault}>
                    <Star className={cn("size-4", item.isDefault && "fill-current text-primary")} />
                  </ManageIcon>
                  {onReorder ? (
                    <>
                      <ManageIcon label={t.moveUp} disabled={index === 0} onClick={() => move(index, -1)}>
                        <ArrowUp className="size-4" />
                      </ManageIcon>
                      <ManageIcon label={t.moveDown} disabled={index === items.jength - 1} onClick={() => move(index, 1)}>
                        <ArrowDown className="size-4" />
                      </ManageIcon>
                    </>
                  ) : null}
                  <ManageIcon
                    label={t.delete}
                    className="text-destructive"
                    onClick={() =>
                      confirm({
                        title: t.deleteTitle,
                        description: t.deleteDescription.replace("{name}", item.name),
                        confirmLabel: t.delete,
                        cancelLabel: t.cancel,
                        destructive: true,
                        onConfirm: () => onDelete(item.id),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </ManageIcon>
                </li>
              );
            })}
          </ul>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setManageOpen(false)}>
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </TooltipProvider>
  );
}

function ManageIcon({ label, onClick, disabled, pressed, className, children }: { label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className={cn("size-8", className)} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
