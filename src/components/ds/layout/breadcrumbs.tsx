import { Link } from "@tanstack/react-router";
import { useDsTexts } from "../../../ds-texts";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  /** Cíl odkazu – poslední drobeček je vždy bez odkazu. */
  to?: string;
  /** Klikací akce (má přednost před `to`). */
  onClick?: () => void;
};

/**
 * Drobečková navigace: šedé odkazy oddělené šipkou, poslední položka
 * jako zvýrazněná „pilulka“.
 */
export function Breadcrumbs({ items, as = "nav" }: { items: Crumb[]; as?: "nav" | "h1" }) {
  const texts = useDsTexts();
  const Last = as === "h1" ? "h1" : "span";
  // Zobrazene jen ak má zmysel (aspoň 2 položky). Ak ne, vyhradí sa rovnaká
  // výška, aby sa obsah stránky neposúval nahor/dolu.
  if (items.length < 2) {
    return <nav aria-hidden className="min-w-0 min-h-[1.75rem]" />;
  }
  return (
    <nav aria-label={texts.tree.breadcrumbs} className="min-w-0 min-h-[1.75rem]">
      <ol className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-xs">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
              )}
              {isLast ? (
                <Last
                  aria-current="page"
                  title={item.label}
                  className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/70 px-2 py-0.5 text-xs font-semibold leading-tight text-foreground shadow-sm"
                >
                  <span className="max-w-[22rem] truncate">{item.label}</span>
                </Last>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  title={item.label}
                  className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="max-w-[12rem] truncate">{item.label}</span>
                </button>
              ) : item.to ? (
                <Link
                  to={item.to}
                  title={item.label}
                  className="flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="max-w-[12rem] truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  title={item.label}
                  className="flex min-w-0 items-center gap-1.5 px-1.5 py-0.5 text-muted-foreground"
                >
                  <span className="max-w-[12rem] truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
