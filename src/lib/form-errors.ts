import { useCallback, useState } from "react";
import type { FieldErrorLink } from "../components/ds/feedback/field-error-summary";

export type FieldErrors = Record<string, string>;

/** Validační pravidlo jednoho pole – vrátí text chyby nebo null. */
export type Rule<T> = (form: T) => string | null;

/** Definice validace formuláře: klíč pole → pravidlo. */
export type Rules<T> = Record<string, Rule<T>>;

/**
 * Sdílená validace formulářů.
 * Chyby se zobrazují uvnitř polí (komponenta `Field` s `error`) a souhrnně v pruhu
 * přes `fieldErrors(labels)`, takže všechny úpravy v aplikaci hlásí chyby stejně.
 */
export function useFormErrors<T>(rules: Rules<T>) {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = useCallback(
    (form: T): boolean => {
      const next: FieldErrors = {};
      for (const [key, rule] of Object.entries(rules)) {
        const message = (rule as Rule<T>)(form);
        if (message) next[key] = message;
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [rules],
  );

  const clear = useCallback((key?: string) => {
    setErrors((prev) => {
      if (!key) return {};
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Odkazy pro souhrn chyb; `labels` = id pole → popisek. */
  const fieldErrors = useCallback(
    (labels: Record<string, string> = {}): FieldErrorLink[] =>
      Object.entries(errors).map(([fieldId, message]) => ({
        fieldId,
        label: labels[fieldId] ?? fieldId,
        message,
      })),
    [errors],
  );

  return { errors, validate, clear, setErrors, fieldErrors };
}

/** Pole je povinné. */
export const required =
  (message = "Pole je povinné.") =>
  (value: unknown): string | null => {
    if (value == null) return message;
    if (typeof value === "string" && !value.trim()) return message;
    return null;
  };

/** Hodnota musí být kladné číslo. */
export const positiveNumber =
  (message = "Zadejte kladné číslo.") =>
  (value: unknown): string | null => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? null : message;
  };

/** První datum nesmí být později než druhé. */
export function dateOrder(
  from: string | null | undefined,
  to: string | null | undefined,
  message = "Datum nesmí být dřívější než předchozí.",
): string | null {
  if (!from || !to) return null;
  return to < from ? message : null;
}
