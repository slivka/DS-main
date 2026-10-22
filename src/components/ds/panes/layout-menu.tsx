import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, MoreHorizontal, Settings2, Trash2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { DS_TEXTS_CS, useDsTexts } from "../../../ds-texts";
import { usePaneTabs } from "./pane-context";
import type { LayoutSnapshot, PaneLayoutCount } from "./pane-state";

/** Uložené rozložení (data drží aplikace). */
export type SavedLayoutItem = {
  id: string;
  name: string;
  /** Počet panelů uloženého snímku. */
  panes: PaneLayoutCount;
};

export type LayoutMenuTexts = {
  trigger: string;
  empty: string;
  saveCurrent: string;
  overwrite: string;
  manage: string;
  saveTitle: string;
  nameLabel: string;
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
};

/** Výchozí (české) texty – jediný zdroj je DS_TEXTS_CS.layoutMenu. */
export const DEFAULT_LAYOUT_MENU_TEXTS: LayoutMenuTexts = DS_TEXTS_CS.layoutMenu as LayoutMenuTexts;

export interface LayoutMenuProps {
  items: SavedLayoutItem[];
  /** Uložení aktuálního rozložení. `snapshot` je serializeLayout(state), když je menu uvnitř PaneTabsProvider. */
  onSave: (input: { name: string; snapshot: LayoutSnapshot | null }) => void;
  /** Použití uloženého rozložení – aplikace zavolá usePaneTabs().applyLayout(snapshot). */
  onApply: (id: string) => void;
  /** Přejmenování nebo přepsání aktuálním (`snapshot`). */
  onUpdate: (id: string, patch: { name?: string; snapshot?: LayoutSnapshot | null }) => void;
  onDelete: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  /** Zkratka Alt+L otevře nabídku. Výchozí true. */
  shortcut?: boolean;
  /** Textové tlačítko nebo kompaktní ikona ⋯ do řádku hledání menu. */
  trigger?: "default" | "icon";
  texts?: Partial<LayoutMenuTexts>;
  className?: string;
}

/** Nabídka uložených rozložení; ikonová varianta patří do AppShell.navSearchMenu. */
export function LayoutMenu({
  items,
  onSave,
  onApply,
  onUpdate,
  onDelete,
  onReorder,
  shortcut = true,
  trigger = "default",
  texts,
  className,
}: LayoutMenuProps) {
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_LAYOUT_MENU_TEXTS, ...dsTexts.layoutMenu, ...texts };
  const tabs = usePaneTabs();
  const [open, setOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const { confirm, confirmDialog } = useConfirmDialog();
  const snapshot = () => tabs?.serializeLayout() ?? null;

  React.useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.code === "KeyL"
      ) {
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
    onSave({ name: name.trim(), snapshot: snapshot() });
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
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn("size-8 shrink-0 text-sidebar-foreground", className)}
                  aria-label={t.trigger}
                >
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("gap-1", className)}
                >
                  {t.trigger}
                  <ChevronDown className="size-4" aria-hidden="true" />
                </Button>
              )}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{`${t.trigger} (Alt+L)`}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          align="end"
          className="min-w-72 max-w-[min(24rem,var(--radix-dropdown-menu-content-available-width))]"
        >
          <div className="flex items-center">
            <DropdownMenuItem
              className="min-w-0 flex-1"
              onSelect={() => {
                setName("");
                setSaveOpen(true);
              }}
            >
              {t.saveCurrent}
            </DropdownMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className="w-9 shrink-0 justify-center px-0"
                  aria-label={t.manage}
                  disabled={!items.length}
                  onSelect={() => setManageOpen(true)}
                >
                  <Settings2 className="size-4" aria-hidden="true" />
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent>{t.manage}</TooltipContent>
            </Tooltip>
          </div>
          <DropdownMenuSeparator />
          {items.length ? (
            items.map((item) => (
              <TruncatedItem key={item.id} name={item.name} onSelect={() => onApply(item.id)} />
            ))
          ) : (
            <DropdownMenuItem disabled>{t.empty}</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!items.length}>{t.overwrite}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-w-[min(24rem,var(--radix-dropdown-menu-content-available-width))]">
              {items.map((item) => (
                <TruncatedItem
                  key={item.id}
                  name={item.name}
                  onSelect={() => onUpdate(item.id, { snapshot: snapshot() })}
                />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
              <Input
                id="layout-menu-name"
                value={name}
                autoFocus
                onChange={(event) => setName(event.target.value)}
              />
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
              return (
                <li key={item.id} className="flex items-center gap-1.5">
                  <Input
                    aria-label={t.nameLabel}
                    defaultValue={item.name}
                    className="h-8 flex-1"
                    onBlur={(event) => {
                      const value = event.target.value.trim();
                      if (value && value !== item.name) onUpdate(item.id, { name: value });
                    }}
                  />
                  {onReorder ? (
                    <>
                      <ManageIcon
                        label={t.moveUp}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </ManageIcon>
                      <ManageIcon
                        label={t.moveDown}
                        disabled={index === items.length - 1}
                        onClick={() => move(index, 1)}
                      >
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

function ManageIcon({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-8", className)}
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Položka s názvem rozložení; tooltip jen když je název skutečně zkrácený. */
function TruncatedItem({ name, onSelect }: { name: string; onSelect: () => void }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [open, setOpen] = React.useState(false);
  const onOpenChange = (next: boolean) => {
    const el = ref.current;
    setOpen(next && !!el && el.scrollWidth > el.clientWidth);
  };
  return (
    <Tooltip open={open} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <DropdownMenuItem onSelect={onSelect}>
          <span ref={ref} className="min-w-0 flex-1 truncate">
            {name}
          </span>
        </DropdownMenuItem>
      </TooltipTrigger>
      <TooltipContent>{name}</TooltipContent>
    </Tooltip>
  );
}
