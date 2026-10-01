import { useEffect } from "react";

import { OptionSelect } from "../form/option-select";
import { FieldValue } from "../form/field-value";
import { cn } from "../../../lib/utils";

export type DocumentBookType = "invoiceIn" | "invoiceOut" | "bank" | "cash" | "internal" | "other";

/** Výchozí české popisky typů dokladů knihy. */
export const DOCUMENT_BOOK_TYPE_LABELS: Record<DocumentBookType, string> = {
  invoiceIn: "Přijatá faktura",
  invoiceOut: "Vydaná faktura",
  bank: "Banka",
  cash: "Pokladna",
  internal: "Interní doklad",
  other: "Ostatní",
};

export type BookOption = {
  id: string;
  /** Kód knihy, např. „FP“. */
  code: string;
  name: string;
  type?: DocumentBookType;
  active?: boolean;
};

/** Zobrazení knihy: „FP – Přijaté faktury (Přijatá faktura)“. */
export function formatBook(
  book: BookOption | null | undefined,
  typeLabels: Record<DocumentBookType, string> = DOCUMENT_BOOK_TYPE_LABELS,
) {
  if (!book) return "";
  const base = `${book.code} – ${book.name}`;
  return book.type ? `${base} (${typeLabels[book.type]})` : base;
}

export interface BookSelectProps {
  books: BookOption[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  typeLabels?: Record<DocumentBookType, string>;
  placeholder?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  /** Jedinou aktivní knihu zobrazí jako hodnotu jen pro čtení místo zakázaného výběru. */
  displayWhenSingle?: boolean;
  id?: string;
  className?: string;
}

/** Výběr knihy dokladů – kód, název a typ dokladu. */
export function BookSelect({
  books,
  value,
  onChange,
  typeLabels = DOCUMENT_BOOK_TYPE_LABELS,
  placeholder = "Vyberte knihu",
  allowEmpty = false,
  disabled,
  displayWhenSingle = true,
  id,
  className,
}: BookSelectProps) {
  const active = books.filter((book) => book.active !== false);
  const single = displayWhenSingle && active.length === 1 ? active[0] : undefined;

  useEffect(() => {
    if (single && value !== single.id) onChange(single.id);
  }, [onChange, single, value]);

  if (single) {
    return (
      <FieldValue id={id} className={cn("font-medium text-foreground", className)}>
        {formatBook(single, typeLabels)}
      </FieldValue>
    );
  }

  return (
    <OptionSelect
      id={id}
      value={value}
      onChange={onChange}
      allowEmpty={allowEmpty}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      options={books.map((book) => ({
        value: book.id,
        label: formatBook(book, typeLabels),
        inactive: book.active === false,
      }))}
    />
  );
}
