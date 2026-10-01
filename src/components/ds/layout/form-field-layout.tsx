/**
 * Sdílená mřížka formuláře a obal jednoho pole.
 * Vlastní: popisek, chybu, nápovědu, šířku pole a responzivní počet sloupců.
 * Nesmí: řídit hodnotu ovládání ani znát doménu formuláře.
 */
import type { ReactNode } from "react";

import { Label } from "../../ui/label";
import { SectionHeading } from "./section-heading";

const FIELD_SPAN_CLASSES = {
  1: "@min-[40rem]:col-span-1",
  2: "@min-[40rem]:col-span-2",
  3: "@min-[40rem]:col-span-3",
  4: "@min-[40rem]:col-span-4",
  5: "@min-[40rem]:col-span-5",
  6: "@min-[40rem]:col-span-6",
  7: "@min-[40rem]:col-span-7",
  8: "@min-[40rem]:col-span-8",
  9: "@min-[40rem]:col-span-9",
  10: "@min-[40rem]:col-span-10",
  11: "@min-[40rem]:col-span-11",
  12: "@min-[40rem]:col-span-12",
  13: "@min-[40rem]:col-span-13",
  14: "@min-[40rem]:col-span-14",
  15: "@min-[40rem]:col-span-15",
  16: "@min-[40rem]:col-span-16",
  17: "@min-[40rem]:col-span-17",
  18: "@min-[40rem]:col-span-18",
  19: "@min-[40rem]:col-span-19",
  20: "@min-[40rem]:col-span-20",
} as const;

/** Vlastnosti jednoho pole formuláře. */
export interface FieldProps {
  /** Viditelný popisek pole. */
  label?: ReactNode;
  /** Identifikátor ovládání svázaný s popiskem. */
  htmlFor?: string;
  /** Výjimečná nápověda přímo pod polem. */
  hint?: ReactNode;
  /** Chyba pole; má přednost před nápovědou. */
  error?: ReactNode;
  /** Šířka pole v mřížce; pod 40 rem zůstává pole přes celý řádek. */
  span?: keyof typeof FIELD_SPAN_CLASSES;
  /** Doplňující třídy obalu. */
  className?: string;
  /** Ovládací prvek nebo hodnota pole. */
  children: ReactNode;
}

/** Vrátí třídu šířky pole ve formulářové mřížce. */
export function fieldSpanClass(span?: keyof typeof FIELD_SPAN_CLASSES): string {
  return span ? FIELD_SPAN_CLASSES[span] : "";
}

/** Pole formuláře s popiskem a jednotným umístěním chyby nebo nápovědy. */
export function Field({ label, htmlFor, hint, error, span, className = "", children }: FieldProps) {
  return (
    <div
      data-invalid={error ? "true" : undefined}
      className={`${label ? "flex min-w-0 flex-col gap-1" : ""} ${fieldSpanClass(span)} ${
        error
          ? "[&_.border-input]:border-destructive [&_input]:border-destructive [&_select]:border-destructive [&_textarea]:border-destructive"
          : ""
      } ${className}`}
    >
      {label ? (
        <Label
          htmlFor={htmlFor}
          title={typeof label === "string" ? label : undefined}
          className={error ? "text-destructive" : undefined}
        >
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p data-slot="field-error" role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p data-slot="field-hint" className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Vlastnosti sdílené mřížky formulářových polí. */
export interface FieldGridProps {
  /** Počet sloupců mřížky na širokém zobrazení. */
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 20;
  /** Volitelný nadpis nad mřížkou. */
  title?: ReactNode;
  /** Jedna vysvětlující věta pod celou mřížkou. */
  hint?: ReactNode;
  /** Doplňující třídy vnitřní mřížky. */
  className?: string;
  /** Pole mřížky. */
  children: ReactNode;
}

/** Mřížka polí formuláře se společnými svislicemi a nápovědou celé skupiny. */
export function FieldGrid({ cols = 2, title, hint, className = "", children }: FieldGridProps) {
  const cls =
    cols === 1
      ? "grid-cols-1"
      : cols === 12
        ? "grid-cols-1 @min-[40rem]:grid-cols-12"
        : cols === 20
          ? "grid-cols-1 @min-[40rem]:grid-cols-20"
          : cols === 3
            ? "@min-[40rem]:grid-cols-3"
            : cols === 4
              ? "@min-[40rem]:grid-cols-4"
              : cols === 6
                ? "@min-[40rem]:grid-cols-6"
                : "@min-[40rem]:grid-cols-2";
  return (
    <div className="@container">
      {title ? <SectionHeading>{title}</SectionHeading> : null}
      <div className={`grid grid-cols-1 gap-3 ${cls} ${className}`}>{children}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
