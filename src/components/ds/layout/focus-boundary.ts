/** Hranice fokusu · vlastní společnou past dialogů a panelů · nesmí řešit otevření či ukládání. */
import type { KeyboardEvent } from "react";
const FOCUSABLE =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
/** Viditelné zaměřitelné prvky v pořadí DOM. */
export function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (node) =>
      node.tabIndex >= 0 &&
      !node.closest('[hidden],[aria-hidden="true"],[inert],[data-state="inactive"]'),
  );
}
/** Tab cyklí uvnitř místního překryvu, vnořené portály mají vlastní past. */
export function trapTab(event: KeyboardEvent<HTMLElement>) {
  const container = event.currentTarget;
  if (!(event.target instanceof Node) || !container.contains(event.target)) return;
  const items = focusables(container);
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) {
    event.preventDefault();
    return;
  }
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || active === container)) {
    event.preventDefault();
    first.focus();
  }
}
