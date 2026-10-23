/**
 * Přesun fokusu mezi poli ke kontrole.
 * Vlastní: cyklické obcházení polí se značkou data-suggestion="uncertain".
 * Nesmí: měnit hodnoty polí ani stav návrhů.
 */

/** Přesune fokus na další pole se stavem ke kontrole (cyklicky). */
export function focusNextUncertainField(): void {
  const fields = Array.from(
    document.querySelectorAll<HTMLElement>('[data-suggestion="uncertain"]'),
  );
  if (!fields.length) return;
  const active = document.activeElement;
  const current = fields.findIndex((field) => field === active || field.contains(active));
  const next = fields[(current + 1) % fields.length];
  const control = next.matches("input,select,textarea,button,[tabindex]")
    ? next
    : next.querySelector<HTMLElement>("input,select,textarea,button,[tabindex]");
  control?.focus();
}
