/** Kategorie · vlastní veřejné typy výběru · bez vykreslování. */
import type * as React from "react";
/** Ekonomická kategorie stromu; kód není povinný. */
export interface CategoryOption {
  id: string;
  parentId?: string | null;
  /** Nepovinný kód ekonomické kategorie. */
  code?: string | null;
  /** Vykazovatelný uzel; false se zobrazí, ale nelze vybrat. */
  postable?: boolean;
  /** Kompatibilní rodič obecného výběru. */
  parent_id?: string | null;
  /** Kompatibilní aktivita obecného výběru. */
  is_active?: boolean | null;
  name: string;
  /** Nadřazené větve bývají vidět, ale nejdou vybrat. */
  selectable?: boolean;
  /** Vysvětlení, proč nejde vybrat. */
  reason?: string;
  /** Neaktivní položka se nenabízí; vybraná se ukáže se štítkem „neaktivní“. */
  active?: boolean;
}

/** Veřejné vlastnosti výběru kategorie. */
export interface CategorySelectProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange" | "onKeyDown" | "value"
> {
  options: CategoryOption[];
  inactiveLabel?: string;
  value: string | null | undefined;
  onChange: (id: string) => void;
  /**
   * Založí položku z textu hledání. Vrátí-li Promise položku, výběr ji doplní do voleb
   * a vybere; `null` / `undefined` / zamítnutí nic nemění.
   */
  onCreate?: (searchText: string) => void | Promise<CategoryOption | null | undefined>;
  /** Název přidání. */
  createLabel?: string;
  /** Důvod chybějícího práva. */
  createDisabledReason?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  defaultReason?: string;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  initialSearch?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  id?: string;
  className?: string;
  /** Otevře úpravu vybraného záznamu. */
  onEditSelected?: (id: string) => void;
  /** Přístupný název tužky. */
  editSelectedLabel?: string;

  /** Kompatibilní prázdná volba. */
  allowEmpty?: boolean;
  emptyLabel?: string;
  noResultsText?: string;
  variant?: "cell" | "field";
}
