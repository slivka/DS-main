/** Vícenásobné hledání · vlastní průchod fokusu a potvrzení · nemění jednotlivé výběry. */
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
    (node) => !target?.contains(node) && !content?.contains(node) && node.getClientRects().length > 0,
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