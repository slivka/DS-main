import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { StatusBadge } from "../data-display/status-badge";
import { GridAction } from "./grid-action";
import { GridToggleButton } from "./grid-toolbar";
import type { DataGridColumn } from "./DataGrid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export interface ActiveStatusTexts {
  column: string;
  active: string;
  inactive: string;
  showInactive: string;
  activate: string;
  deactivate: string;
  rowMenu: string;
}

export const DEFAULT_ACTIVE_STATUS_TEXTS: ActiveStatusTexts = {
  column: "Stav",
  active: "Aktivní",
  inactive: "Neaktivní",
  showInactive: "Zobrazit neaktivní",
  activate: "Aktivovat",
  deactivate: "Deaktivovat",
  rowMenu: "Další akce",
};

/** Štítek Aktivní / Neaktivní – stejný v gridu i v hlavičce dialogu. */
export function ActiveStatusBadge({
  active,
  texts,
}: {
  active: boolean;
  texts?: Partial<ActiveStatusTexts>;
}) {
  const t = { ...DEFAULT_ACTIVE_STATUS_TEXTS, ...texts };
  return (
    <StatusBadge
      status={active ? "active" : "inactive"}
      config={{
        active: { label: t.active, tone: "success" },
        inactive: { label: t.inactive, tone: "neutral" },
      }}
    />
  );
}

/** Standardní sloupec stavu záznamu: štítek, autofiltr podle textu, šířka podle obsahu. */
export function activeStatusColumn<Row>(
  isActive: (row: Row) => boolean,
  options: { id?: string; texts?: Partial<ActiveStatusTexts> } = {},
): DataGridColumn<Row> {
  const t = { ...DEFAULT_ACTIVE_STATUS_TEXTS, ...options.texts };
  return {
    id: options.id ?? "active",
    label: t.column,
    value: (row) => (isActive(row) ? t.active : t.inactive),
    render: (row) => <ActiveStatusBadge active={isActive(row)} texts={t} />,
    fitContent: true,
  };
}

/** Čistý filtr řádků: bez „Zobrazit neaktivní“ se neaktivní skryjí. */
export function filterInactiveRows<Row>(
  rows: Row[],
  showInactive: boolean,
  isActive: (row: Row) => boolean,
): Row[] {
  return showInactive ? rows : rows.filter(isActive);
}

/** Standardní přepínač „Zobrazit neaktivní“ nad gridem (výchozí vypnuto, zapnuto oranžově). */
export function ShowInactiveToggle({
  pressed,
  onPressedChange,
  label,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  label?: string;
}) {
  return (
    <GridToggleButton tone="grouping" pressed={pressed} onClick={() => onPressedChange(!pressed)}>
      {label ?? DEFAULT_ACTIVE_STATUS_TEXTS.showInactive}
    </GridToggleButton>
  );
}

export interface GridRowMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

/** Položka menu řádku Aktivovat / Deaktivovat podle stavu. */
export function activeToggleMenuItem(
  active: boolean,
  onToggle: (nextActive: boolean) => void,
  texts?: Partial<ActiveStatusTexts>,
): GridRowMenuItem {
  const t = { ...DEFAULT_ACTIVE_STATUS_TEXTS, ...texts };
  return {
    id: "toggle-active",
    label: active ? t.deactivate : t.activate,
    onSelect: () => onToggle(!active),
  };
}

/** Ikonové menu řádku gridu (…) pro `rowActions`. */
export function GridRowMenu({
  items,
  label = DEFAULT_ACTIVE_STATUS_TEXTS.rowMenu,
  children,
}: {
  items: GridRowMenuItem[];
  label?: string;
  children?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GridAction aria-label={label} title={label} onClick={(event) => event.stopPropagation()}>
          <MoreHorizontal className="size-4" />
        </GridAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
        {items.map((item) => (
          <div key={item.id}>
            {item.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              disabled={item.disabled}
              className={item.destructive ? "text-destructive focus:text-destructive" : undefined}
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
