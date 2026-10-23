/** Viditelná identita · vlastní měření po ořezu rodiči · nesmí změnit rozvržení. */
/** Vrátí překryvy pouze vykreslených částí identity a odchylku její výšky. */
export function identityMetrics(identity: Element) {
  const row = identity.matches('[data-slot="identity-line-row"]')
    ? identity
    : identity.querySelector<HTMLElement>('[data-slot="identity-line-row"]');
  if (!(row instanceof HTMLElement)) throw new Error("Chybí řádek identity");
  const rect = row.getBoundingClientRect();
  const parts = Array.from(
    row.querySelectorAll<HTMLElement>(
      '[data-slot="identity-line-item"] > :not([aria-hidden]), ' +
        '[data-slot="identity-status-text"], .document-identity-account > span, ' +
        ".document-identity-account-box, .document-identity-pencil-slot",
    ),
  );
  const boxes = parts
    .filter((part) => !parts.some((other) => other !== part && part.contains(other)))
    .map((part) => {
      const box = part.getBoundingClientRect();
      let left = Math.max(rect.left, box.left);
      let right = Math.min(rect.right, box.right);
      let top = Math.max(rect.top, box.top);
      let bottom = Math.min(rect.bottom, box.bottom);
      for (
        let parent = part.parentElement;
        parent && row.contains(parent);
        parent = parent.parentElement
      ) {
        const style = getComputedStyle(parent);
        const clip = parent.getBoundingClientRect();
        if (style.overflowX !== "visible") {
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
        }
        if (style.overflowY !== "visible") {
          top = Math.max(top, clip.top);
          bottom = Math.min(bottom, clip.bottom);
        }
      }
      return { text: part.textContent, left, right, top, bottom };
    })
    .filter((box) => box.right > box.left && box.bottom > box.top);
  const overlaps = boxes.flatMap((a, index) =>
    boxes.slice(index + 1).flatMap((b) => {
      const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      return x > 1 && y > 1 ? [`${a.text} × ${b.text}`] : [];
    }),
  );
  return {
    difference: Math.abs(
      rect.height - parseFloat(getComputedStyle(row).getPropertyValue("--control-h")),
    ),
    overlaps,
  };
}
