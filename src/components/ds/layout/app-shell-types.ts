/**
 * Typy rámu aplikace.
 * Vlastní: veřejné typy AppShell (panely, části panelu, rozsah, props) a výchozí nápovědu zakázané položky.
 * Nesmí: obsahovat chování ani komponenty.
 */
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { Crumb } from "./breadcrumbs";
import type { StatusTone } from "../data-display/status-badge";
import type { NavGroup, NavItem } from "./nav-items";

/** Rozsah platnosti panelu: firma, prostor, nebo celá platforma. */
export type AppShellScope = "company" | "workspace" | "platform";

/** Řízená část panelu (např. Firma / Prostor) s vlastním nadpisem, kontextem a menu. */
export type AppShellPanelView = {
  id: string;
  label: string;
  title: string;
  context?: ReactNode | string;
  scope?: AppShellScope;
  nav: NavGroup[];
};

/** Přepínatelný panel rámu (Nastavení, Administrace…) s vlastním menu. */
export type AppShellPanel = {
  id: string;
  title: string;
  icon: LucideIcon;
  tooltip: string;
  nav?: NavGroup[];
  /** Barvy menu aplikace nebo neutrální barvy panelu. Výchozí je `panel`. */
  sidebarTone?: "app" | "panel";
  /** Rozsah, pro který panel platí. Výchozí je `company`. */
  scope?: AppShellScope;
  /** Řízené části panelu; při dvou a více se zobrazí segmentový přepínač. */
  views?: AppShellPanelView[];
  activeView?: string;
  onViewChange?: (id: string) => void;
  accent?: "default" | "warning";
  /** Volitelný stavový štítek vedle názvu panelu. */
  badge?: { label: string; tone: Extract<StatusTone, "neutral" | "info" | "warning" | "accent"> };
  /** Název prostoru, firmy nebo jiného objektu, kterého se panel týká. */
  context?: ReactNode | string;
};

/** @deprecated od 2.61.0 – výchozí text bere AppShell z DsTexts (`appShell.disabledHint`); odstraní se ve 3.0.0. */
export const NAV_DISABLED_HINT = "Připravujeme";

/** Props rámu aplikace. */
export interface AppShellProps {
  children: ReactNode;
  navGroups?: NavGroup[];
  bottomItems?: NavItem[];
  appName?: string;
  /** Volitelně spravuje titulek dokumentu; výchozí false ponechá titul aplikaci. */
  manageDocumentTitle?: boolean;
  logo?: ReactNode;
  showBrand?: boolean;
  breadcrumbs?: Crumb[];
  contextLeft?: ReactNode;
  /** Lišta pod horní lištou; při otevřeném panelu Nastavení/Administrace se skryje. */
  subHeader?: ReactNode;
  actions?: ReactNode;
  notificationBell?: ReactNode;
  themeToggleButton?: ReactNode;
  userMenu?: ReactNode;
  panels?: AppShellPanel[];
  activePanel?: string | null;
  onActivePanelChange?: (id: string | null) => void;
  closeLabel?: string;
  menuLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  disabledHint?: string;
  /** Klíč uloženého sbajení skupin; výchozí je appName. */
  navStateKey?: string;
  /** Zobrazit hledání v menu. */
  navSearch?: boolean;
  navSearchPlaceholder?: string;
  navSearchEmptyText?: string;
  /** Vysvětlení zakázaného kontextu firmy a období mimo firemní rozsah. */
  contextDisabledHint?: string;
  /** Nabídka uložených rozložení vedle hledání v menu. */
  navSearchMenu?: ReactNode;
  /** @deprecated Použijte navGroups. */
  items?: NavItem[];
  /** @deprecated Použijte panels. */
  adminNav?: NavItem[];
  /** @deprecated Použijte activePanel. */
  adminMode?: boolean;
  /** @deprecated Použijte title v panels. */
  adminTitle?: string;
  /** @deprecated Použijte tooltip v panels. */
  adminButtonLabel?: string;
  /** @deprecated Použijte closeLabel. */
  adminBackLabel?: string;
  /** @deprecated Cestu určují položky panels.nav. */
  adminBasePath?: string;
  /** @deprecated Použijte onActivePanelChange. */
  onAdminModeChange?: (active: boolean) => void;
  /** @deprecated Ovládání vzhledu skládejte do samostatných slotů. */
  showLegacyToolbar?: boolean;
}
