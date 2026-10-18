/**
 * Souhrn chyb polí v chybovém pruhu · vlastní odkazy „Popisek: zpráva“, limit 5 a fokus pole
 * (i v řádku mřížky dokladu) · nesmí validovat ani měnit hodnoty.
 */
import type { ReactNode } from "react";
import { useDsTexts } from "../../../ds-texts";

/** Odkaz na chybné pole. */
export interface FieldErrorLink {
  /** Id ovládání pole (pro scrollIntoView a focus). */
  fieldId: string;
  /** Popisek pole. */
  label: ReactNode;
  /** Text chyby. */
  message: ReactNode;
  /** Řádek mřížky dokladu, pokud pole patří řádku. */
  rowId?: string;
  /** Sloupec mřížky dokladu. */
  columnId?: string;
}

/** Nejvyšší počet zobrazených odkazů. */
export const FIELD_ERROR_SUMMARY_LIMIT = 5;

const FOCUSABLE = "input, textarea, button, [role=combobox], [tabindex]";

/** Zaměří ovládání uvnitř prvku nebo prvek sám. */
function focusWithin(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const target = element.matches(FOCUSABLE)
    ? element
    : element.querySelector<HTMLElement>(FOCUSABLE);
  element.scrollIntoView?.({ behavior: "smooth", block: "center" });
  (target ?? element).focus();
  return true;
}

/**
 * Najde a zaměří pole odkazu: id pole → buňka řádku mřížky → pole rozbaleného detailu
 * (detail se v případě potřeby rozbalí).
 */
export function focusFieldErrorLink(link: FieldErrorLink, root: ParentNode = document): void {
  if (focusWithin(root.querySelector(`[id="${CSS.escape(link.fieldId)}"]`))) return;
  if (!link.rowId || !link.columnId) return;
  const key = `${link.rowId}:${link.columnId}`;
  const cell = root.querySelector<HTMLElement>(`[data-cell-key="${CSS.escape(key)}"]`);
  if (cell) {
    cell.click();
    focusWithin(cell);
    return;
  }
  const detail = `[data-journal-field="${CSS.escape(key)}"]`;
  if (focusWithin(root.querySelector(detail))) return;
  const toggle = root.querySelector<HTMLElement>(
    `[data-slot="journal-detail-toggle"][data-row-id="${CSS.escape(link.rowId)}"]`,
  );
  if (!toggle) return;
  toggle.click();
  // Detail se vykreslí až po rozbalení; fokus proběhne v dalším snímku.
  requestAnimationFrame(() => focusWithin(root.querySelector(detail)));
}

/** Vlastnosti souhrnu chyb. */
export interface FieldErrorSummaryProps {
  /** Chyby polí. */
  errors: FieldErrorLink[];
  /** Vlastní výběr pole; bez něj se použije `focusFieldErrorLink`. */
  onSelect?: (link: FieldErrorLink) => void;
}

/** Odkazy na chybná pole (max 5 + „a další N“). */
export function FieldErrorSummary({ errors, onSelect }: FieldErrorSummaryProps) {
  const texts = useDsTexts().recordAction;
  if (!errors.length) return null;
  const shown = errors.slice(0, FIELD_ERROR_SUMMARY_LIMIT);
  const rest = errors.length - shown.length;
  return (
    <ul data-slot="field-error-summary" className="mt-1 space-y-0.5 text-sm">
      {shown.map((link, index) => (
        <li key={`${link.fieldId}-${index}`}>
          <button
            type="button"
            className="cursor-pointer text-left underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            onClick={() => (onSelect ?? focusFieldErrorLink)(link)}
          >
            <span className="font-semibold">{link.label}</span>: {link.message}
          </button>
        </li>
      ))}
      {rest > 0 ? (
        <li data-slot="field-error-summary-more" className="text-muted-foreground">
          {texts.moreErrors.replace("{count}", String(rest))}
        </li>
      ) : null}
    </ul>
  );
}
