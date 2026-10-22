/** Vícenásobné hledání · vlastní průchod fokusu a potvrzení · nemění jednotlivé výběry. */
import type { KeyboardEvent } from "react";
/** Předá zkratku uložení mimo cmdk, které jinak každý Enter potvrzuje. */
export function forwardSaveKey(event: KeyboardEvent<HTMLInputElement>, target: HTMLElement | null) {
  event.stopPropagation();
  const unhandled = target?.dispatchEvent(new window.KeyboardEvent("keydown", {
    key: event.key, code: event.code, ctrlKey: event.ctrlKey, metaKey: event.metaKey,
    shiftKey: event.shiftKey, altKey: event.altKey, bubbles: true, cancelable: true,
  }));
  if (unhandled === false) event.preventDefault();
}
/** Klávesnice akcí v nabídce; jednotlivé výběry tuto cestu nepoužívají. */
export function multipleContentKey(
  event: KeyboardEvent,
  target: HTMLElement | null,
  content: HTMLElement | null,
  close: () => void,
) {
  if (event.key !== "Tab" && event.key !== "Escape") return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === "Tab") moveMultipleFocus(target, content, event.shiftKey, close);
  else {
    close();
    target?.querySelector<HTMLButtonElement>("button")?.focus();
  }
}
/** Přesune Tab mezi hledáním a akcemi; po opuštění zavře nabídku. */
export function moveMultipleFocus(
  target: HTMLElement | null,
  content: HTMLElement | null,
  backwards: boolean,
  close: () => void,
) {
  const input = target?.querySelector<HTMLElement>("[cmdk-input]");
  const actions = Array.from(content?.querySelectorAll<HTMLElement>("button:not(:disabled)") ?? []);
  const inside = [...(input ? [input] : []), ...actions];
  const index = inside.indexOf(document.activeElement as HTMLElement);
  const next = inside[index + (backwards ? -1 : 1)];
  if (next) {
    next.focus();
    return;
  }
  const trigger = target?.querySelector<HTMLElement>("button");
  const outside = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ),
  ).filter(
    (node) =>
      !target?.contains(node) && !content?.contains(node) && node.getClientRects().length > 0,
  );
  const before = outside.filter(
    (node) => trigger && node.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  const after = outside.find(
    (node) => trigger && trigger.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
  close();
  (backwards ? before.at(-1) : after)?.focus();
}

/** Mezerník přepíná aktivní položku, dotaz se tím nemění. */
export function toggleMultipleActive(input: HTMLInputElement) {
  const listId = input.getAttribute("aria-controls");
  const root = listId ? document.getElementById(listId)?.closest("[cmdk-root]") : null;
  root?.querySelector<HTMLElement>('[cmdk-item][data-selected="true"]')?.click();
}
/** Jednotlivý výběr při Tab nevybírá a přesouvá fokus mimo nabídku. */
export function moveSingleFocus(
  target: HTMLElement | null,
  content: HTMLElement | null,
  backwards: boolean,
  close: () => void,
) {
  const trigger = target?.querySelector<HTMLElement>('button[role="combobox"]');
  const focusable = Array.from(
    document.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ),
  ).filter(
    (node) =>
      !target?.contains(node) && !content?.contains(node) && node.getClientRects().length > 0,
  );
  const next = backwards
    ? focusable
        .filter(
          (node) =>
            trigger && node.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING,
        )
        .at(-1)
    : focusable.find(
        (node) =>
          trigger && trigger.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
  close();
  next?.focus();
}

/** Přístupný název tlačítka (aria-label nebo <label for>) převzatý vstupem hledání. */
export function triggerName(target: HTMLDivElement): string | undefined {
  const button = target.querySelector<HTMLButtonElement>("button[role=combobox], button");
  if (!button) return undefined;
  const label = button.getAttribute("aria-label");
  if (label) return label;
  const text = Array.from(button.labels ?? [])
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .join(" ");
  return text || undefined;
}
