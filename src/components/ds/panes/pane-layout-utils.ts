/** Geometrie a fokus panelů · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import type { PaneLayoutCount } from "./pane-state";
import type { PaneChromeTexts } from "./pane-context";
import type { PaneTabBarTexts } from "./pane-tab-bar";
/** Prvky, kterým panel nikdy nebere fokus. */
export const PANE_FOCUS_EXCLUDED =
  "input,textarea,select,button,a[href],label,summary,[contenteditable]:not([contenteditable=false]),[role=menu],[role=menuitem],[role=menuitemcheckbox],[role=menuitemradio],[role=option],[role=combobox],[role=tab],[role=slider],[role=grid],[role=dialog],[role=alertdialog],[role=listbox],[role=textbox],[role=button],[role=switch],[role=checkbox],[role=radio]";

type FocusNode = { closest?: (selector: string) => unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FocusContainer = { contains: (node: any) => boolean };

/**
 * Rozhodne, zda po kliku přesunout fokus na rolovací oblast panelu.
 * Jen když cíl leží skutečně v panelu (ne v portálu, jehož události bublají Reactem),
 * není interaktivní a klik fokus nepřesunul jinam (aktivní je body nebo prvek mimo panel).
 */
export function shouldFocusPaneScroll(
  section: FocusContainer,
  target: unknown,
  activeElement: unknown,
  body: unknown,
  scrollElement?: unknown,
): boolean {
  if (!target || !section.contains(target)) return false;
  const node = target as FocusNode;
  if (typeof node.closest === "function" && node.closest(PANE_FOCUS_EXCLUDED)) return false;
  if (
    activeElement &&
    activeElement !== body &&
    activeElement !== scrollElement &&
    section.contains(activeElement)
  )
    return false;
  return true;
}
export type PaneLayoutTexts = PaneTabBarTexts &
  PaneChromeTexts & {
    emptyHint: string;
    /** {index} se nahradí číslem panelu. */
    maximizedBanner: string;
    restoreLayout: string;
  };

export const DEFAULT_PANE_TEXTS: Pick<
  PaneLayoutTexts,
  "emptyHint" | "maximizedBanner" | "restoreLayout"
> = {
  emptyHint: "Otevřete položku z menu",
  maximizedBanner: "Panel {index} je maximalizovaný",
  restoreLayout: "Obnovit rozložení",
};

export const PANE_DIVIDER_WIDTH = 8;

/** Nejvyšší dostupné rozložení pro danou šířku a měřítko písma. */
export function maxPaneLayout(width: number, minPaneWidth: number, fontScale = 1): PaneLayoutCount {
  if (width < 768) return 1;
  const effective = width / (fontScale || 1);
  const fits = (count: number) =>
    effective >= count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH;
  if (fits(3)) return 3;
  if (fits(2)) return 2;
  return 1;
}

/** Potřebná šířka okna (v px) pro dané rozložení. */
export function requiredPaneWidth(count: number, minPaneWidth: number, fontScale = 1) {
  return (count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH) * (fontScale || 1);
}

/** Je prvek skutečně zobrazený (ne display:none, ne nulová velikost)? */
export function isPaneLayoutVisible(
  element: {
    getClientRects: () => { length: number };
    getBoundingClientRect: () => { width: number; height: number };
  } | null,
): boolean {
  if (!element || element.getClientRects().length === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** PaneLayout ovládá main AppShellu jen když není vložený a je zobrazený. */
export function shouldRegisterPaneLayout(embedded: boolean, visible: boolean) {
  return !embedded && visible;
}
