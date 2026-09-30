import { cn } from "../../../lib/utils";

/** Šedý štítek „neaktivní“ u již vybrané neaktivní položky ve výběrech. */
export function InactiveTag({
  label = "neaktivní",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      data-slot="inactive-tag"
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-1.5 text-[0.6875rem] font-medium leading-4 text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * Jednotné pravidlo výběrů: neaktivní položky se nenabízejí,
 * již vybraná neaktivní položka zůstane, aby ji šlo zobrazit.
 */
export function selectableItems<T>(
  items: T[],
  isActive: (item: T) => boolean,
  isSelected: (item: T) => boolean,
): T[] {
  return items.filter((item) => isActive(item) || isSelected(item));
}
