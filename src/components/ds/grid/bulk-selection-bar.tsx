import { CheckSquare, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";

export type BulkSelectionBarProps = {
  /** Počet vybraných záznamů. */
  count: number;
  /** Celkový počet záznamů na stránce / v seznamu (volitelně). */
  total?: number;
  /** Callback pro výběr všech dostupných záznamů. */
  onSelectAll?: () => void;
  /** Callback pro zrušení výběru. */
  onClear?: () => void;
  className?: string;
  /** Název entity v jednotném a množném čísle. */
  entity?: { one: string; few: string; many: string };
  /** Zobrazí pruh i když není nic vybráno (např. při aktivním multiselect režimu). */
  showZero?: boolean;
  /** Text tlačítka pro zrušení. */
  clearLabel?: string;
};

function czechCount(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

/**
 * Výrazný informační pruh o počtu vybraných záznamů při hromadných operacích.
 * Zobrazuje se jako výrazná pilulka v liště gridu a obsahuje rychlé akce
 * „Vybrat vše“ a „Zrušit výběr“.
 */
export function BulkSelectionBar({
  count,
  total,
  onSelectAll,
  onClear,
  className,
  entity = { one: "záznam", few: "záznamy", many: "záznamů" },
  showZero,
  clearLabel = "Zrušit",
}: BulkSelectionBarProps) {
  if (count <= 0 && !showZero) return null;

  const label = count > 0 ? czechCount(count, entity.one, entity.few, entity.many) : "";
  const allSelected = total !== undefined && total > 0 && count >= total;

  if (count <= 0) {
    return (
      <div
        className={cn(
          "grid-toolbar-control flex shrink-0 items-center gap-[0.5em] bg-muted text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200",
          className,
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="whitespace-nowrap">Není vybrán žádný řádek</span>
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-[0.4em] py-[0.2em] text-muted-foreground hover-surface-foreground/10 hover:text-muted-foreground"
            onClick={onClear}
            title="Zrušit výběr"
          >
            <X className="size-[1.1em]" />
            <span>{clearLabel}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid-toolbar-control flex shrink-0 items-center gap-[0.5em] bg-primary text-primary-foreground shadow animate-in fade-in slide-in-from-top-1 duration-200",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <Badge
        variant="default"
        className="border-transparent bg-primary/80 text-primary-foreground hover:bg-primary/80 min-w-[1.6em] justify-center px-[0.35em] py-0 text-[0.95em]"
      >
        {count}
      </Badge>
      <span className="whitespace-nowrap font-medium">{label} vybráno</span>

      {onSelectAll && total !== undefined && total > 0 && !allSelected && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-[0.4em] py-[0.2em] text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          onClick={onSelectAll}
          title="Vybrat všechny záznamy na stránce"
        >
          <CheckSquare className="size-[1.1em]" />
          <span>Vybrat vše</span>
        </Button>
      )}
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-[0.4em] py-[0.2em] text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          onClick={onClear}
          title="Zrušit výběr"
        >
          <X className="size-[1.1em]" />
          <span>{clearLabel}</span>
        </Button>
      )}
    </div>
  );
}
