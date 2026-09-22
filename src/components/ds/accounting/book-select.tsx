import { OptionSelect } from "../form/option-select";

export type DocumentBookType =
  | "invoiceIn"
  | "invoiceOut"
  | "bank"
  | "cash"
  | "internal"
  | "other";

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

/** Výběr knihy dokladů – kód, název a typ dokladu. */
export function BookSelect({
  books,
  value,
  onChange,
  typeLabels = DOCUMENT_BOOK_TYPE_LABELS,
  placeholder = "Vyberte knihu",
  allowEmpty = false,
  disabled,
  id,
  className,
}: {
  books: BookOption[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  typeLabels?: Record<DocumentBookType, string>;
  placeholder?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <OptionSelect
      id={id}
      value={value}
      onChange={onChange}
      allowEmpty={allowEmpty}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      options={books
        .filter((book) => book.active !== false)
        .map((book) => ({ value: book.id, label: formatBook(book, typeLabels) }))}
    />
  );
}
