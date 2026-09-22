import { useCallback, useState } from "react";

export type FieldErrors = Record<string, string>;

/** Pravidlo validácie jedného poľa – vráti text chyby alebo null. */
export type Rule<T> = (form: T) => string | null;

/** Definícia validácie formulára: kľúč poľa → pravidlo. */
export type Rules<T> = Record<string, Rule<T>>;

/**
 * Zdieľaná validácia formulárov.
 * Chyby sa zobrazujú priamo pri poliach (komponenta `Field` s `error`),
 * takže všetky editácie v aplikácii hlásia chyby rovnako.
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

  return { errors, validate, clear, setErrors };
}

/** Pole je povinné. */
export const required =
  (message = "Pole je povinné.") =>
  (value: unknown): string | null => {
    if (value == null) return message;
    if (typeof value === "string" && !value.trim()) return message;
    return null;
  };

/** Hodnota musí byť kladné číslo. */
export const positiveNumber =
  (message = "Zadajte kladné číslo.") =>
  (value: unknown): string | null => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? null : message;
  };

/** Prvý dátum nesmie byť neskôr ako druhý. */
export function dateOrder(
  from: string | null | undefined,
  to: string | null | undefined,
  message = "Datum nesmí být dřívější než předchozí.",
): string | null {
  if (!from || !to) return null;
  return to < from ? message : null;
}
