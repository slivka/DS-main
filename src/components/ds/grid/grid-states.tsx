import type { ComponentType, ReactNode } from "react";

import { Button } from "../../ui/button";
import { TableCell, TableRow } from "../../ui/table";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

/** Skeleton řádky – místo prázdné plochy během načítání gridu. */
export function GridSkeletonRows({ rows = 6, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={`skeleton-${r}`} className="hover:bg-transparent">
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <div
                className="h-3 animate-pulse rounded bg-muted"
                style={{ width: `${c === 0 ? 60 : 30 + ((r + c) % 4) * 12}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/** Jednotný prázdný stav uvnitř tabulky – s výzvou k akci. */
export function GridEmptyRow({
  colSpan,
  icon: _icon,
  title,
  description,
  actionLabel,
  onAction,
  filtered = false,
  onClearFilter,
  children,
  texts: textOverrides,
}: {
  colSpan: number;
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** true = prázdno kvůli hledání/filtru, ne kvůli chybějícím datům */
  filtered?: boolean;
  onClearFilter?: () => void;
  children?: ReactNode;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const hasActions = Boolean(
    (filtered && onClearFilter) || (!filtered && actionLabel && onAction) || children,
  );

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-4 py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 text-center">
          <p className="typo-label text-balance text-foreground">{title}</p>

          {description ? (
            <p className="typo-body max-w-prose text-pretty text-muted-foreground">{description}</p>
          ) : null}
          {hasActions ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filtered && onClearFilter ? (
                <Button
                  data-grid-cta
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onClearFilter}
                >
                  {texts.clearFilter}
                </Button>
              ) : null}
              {!filtered && actionLabel && onAction ? (
                <Button data-grid-cta type="button" size="sm" onClick={onAction}>
                  {actionLabel}
                </Button>
              ) : null}
              {children}
            </div>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Společné tělo gridu: skeleton při načítání, jednotný prázdný stav,
 * jinak vykreslí řádky.
 */
export function GridBody({
  loading,
  empty,
  cols,
  skeletonRows,
  children,
  ...emptyProps
}: {
  loading?: boolean;
  empty: boolean;
  cols: number;
  skeletonRows?: number;
  children: ReactNode;
} & Omit<Parameters<typeof GridEmptyRow>[0], "colSpan">) {
  if (loading) return <GridSkeletonRows rows={skeletonRows} cols={cols} />;
  if (empty) return <GridEmptyRow colSpan={cols} {...emptyProps} />;
  return <>{children}</>;
}

/**
 * Tenký indikátor průběhu ukotvený nad prvním řádkem gridu.
 * Zobrazí se při jakémkoli načítání (i při obnově dat na pozadí),
 * takže uživatel má okamžitou odezvu.
 */
export function GridProgress({
  show,
  label,
  texts: textOverrides,
}: {
  show?: boolean;
  label?: string;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const progressLabel = label ?? texts.loading;
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={progressLabel}
      className="sticky top-0 left-0 z-30 h-[3px] w-full overflow-hidden bg-primary/15"
    >
      <div className="loading-bar h-full w-1/3 rounded-full bg-primary" />
    </div>
  );
}

/**
 * Převede technickou chybu (Supabase / síť) na srozumitelnou českou hlášku.
 * Původní text ponecháme jako doplňující detail, ať je chyba dohledatelná.
 */
export function friendlyErrorMessage(error: unknown): { title: string; detail?: string } {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const text = raw.toLowerCase();

  if (!raw) return { title: "Data se nepodařilo načíst." };
  if (text.includes("failed to fetch") || text.includes("networkerror") || text.includes("network"))
    return {
      title: "Spojení se serverem se nezdařilo.",
      detail: "Zkontrolujte připojení k internetu a zkuste to znovu.",
    };
  if (text.includes("jwt") || text.includes("401") || text.includes("unauthorized"))
    return {
      title: "Přihlášení vypršelo.",
      detail: "Přihlaste se prosím znovu a akci zopakujte.",
    };
  if (text.includes("permission") || text.includes("row-level security") || text.includes("403"))
    return {
      title: "K těmto datům nemáte oprávnění.",
      detail: "Požádejte správce účtu o přidělení role.",
    };
  if (text.includes("timeout") || text.includes("timed out"))
    return {
      title: "Načítání trvalo příliš dlouho.",
      detail: "Zkuste zúžit období nebo akci opakovat.",
    };
  return { title: "Data se nepodařilo načíst.", detail: raw };
}

/** Jednotné chybové hlášení uvnitř tabulky – se srozumitelným textem a opakováním. */
export function GridErrorRow({
  colSpan,
  error,
  onRetry,
  texts: textOverrides,
}: {
  colSpan: number;
  error: unknown;
  onRetry?: () => void;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const { title, detail } = friendlyErrorMessage(error);
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="px-4 py-16 sm:py-20">
        <div
          role="alert"
          className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 text-center"
        >
          <p className="typo-label text-balance text-destructive">{title}</p>
          {detail ? (
            <p className="typo-body max-w-prose text-pretty text-muted-foreground">{detail}</p>
          ) : null}
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {texts.retry}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

/** Chybový stav mimo tabulku (karty, seznamy). */
export function ListError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { title, detail } = friendlyErrorMessage(error);
  return (
    <div role="alert" className="flex flex-col items-start gap-2 p-4">
      <p className="typo-label text-destructive">{title}</p>
      {detail ? <p className="typo-body text-muted-foreground">{detail}</p> : null}
      {onRetry ? (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Zkusit znovu
        </Button>
      ) : null}
    </div>
  );
}

/** Skeleton pro seznamy mimo tabulku (karty účtů apod.). */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 px-3 py-3">
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="h-3 flex-1 animate-pulse rounded bg-muted/70" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}
