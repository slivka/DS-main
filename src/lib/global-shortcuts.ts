/**
 * Globální klávesové zkratky.
 * Vlastní: jediný posluchač `keydown` na `window` pro celou aplikaci a registr obsluh v pořadí
 * registrace (první registrovaná obsluha dostane událost první).
 * Nesmí: znát konkrétní zkratky – zoom, menu, panely i hledání je registrují jejich vlastníci.
 */
import { useEffect, useRef } from "react";

/** Obsluha jedné klávesové události; o zpracování rozhoduje sama. */
export type GlobalShortcutHandler = (event: KeyboardEvent) => void;

/** Jedna zkratka pro {@link useGlobalShortcuts}. */
export type GlobalShortcut = {
  /** Pojmenování účelu zkratky (pro čtení kódu a ladění). */
  id: string;
  /** Vrátí true, když událost patří této zkratce. */
  match: (event: KeyboardEvent) => boolean;
  /** Provede akci zkratky; `preventDefault` volá sama, pokud je potřeba. */
  run: (event: KeyboardEvent) => void;
  /** Zkratka platí i při psaní do pole formuláře. Výchozí false. */
  allowInEditing?: boolean;
  /** Dočasně vypnutá zkratka zůstává v registru. Výchozí true. */
  enabled?: boolean;
};

const handlers = new Set<GlobalShortcutHandler>();
let attached = false;

function dispatch(event: KeyboardEvent) {
  for (const handler of [...handlers]) handler(event);
}

/**
 * Přidá obsluhu do registru; první obsluha připojí posluchač, poslední odebraná ho odpojí.
 * Vrací funkci pro odregistrování.
 */
export function registerGlobalShortcut(handler: GlobalShortcutHandler): () => void {
  handlers.add(handler);
  if (!attached && typeof window !== "undefined") {
    window.addEventListener("keydown", dispatch);
    attached = true;
  }
  return () => {
    handlers.delete(handler);
    if (handlers.size === 0 && attached) {
      window.removeEventListener("keydown", dispatch);
      attached = false;
    }
  };
}

/** Událost vznikla při psaní do pole formuláře nebo editovatelného obsahu. */
export function isEditingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Zaregistruje sadu zkratek jednou za život komponenty. Sada se čte z aktuálního renderu,
 * takže změna stavu posluchač nepřepojuje.
 */
export function useGlobalShortcuts(shortcuts: GlobalShortcut[]) {
  const current = useRef(shortcuts);
  current.current = shortcuts;
  useEffect(
    () =>
      registerGlobalShortcut((event) => {
        const editing = isEditingTarget(event.target);
        for (const shortcut of current.current) {
          if (shortcut.enabled === false) continue;
          if (editing && !shortcut.allowInEditing) continue;
          if (shortcut.match(event)) shortcut.run(event);
        }
      }),
    [],
  );
}
