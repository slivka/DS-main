import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { gridFontSize } from "./grid-zoom";

/** 0 = zobrazit vše (výchozí hodnota). */
export const PAGE_SIZE_OPTIONS = [0, 25, 50, 100, 200];

const label = (size: number) => (size === 0 ? "Vše" : String(size));

/**
 * Stránkování gridu s velikostí stránky uloženou v prohlížeči.
 * `defaultPageSize` = výchozí volba (0 = vše).
 * `maxUnpaged` = pojistka: při volbě „Vše“ se u velmi rozsáhlých dat
 * stejně stránkuje, aby prohlížeč nezamrzl.
 */
export function useGridPagination<T>(
  storageKey: string,
  items: T[],
  options: { defaultPageSize?: number; maxUnpaged?: number } = {},
) {
  const { defaultPageSize = 0, maxUnpaged = Infinity } = options;
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const raw = localStorage.getItem(`page-size:${storageKey}`);
    const parsed = Number(raw);
    if (raw !== null && PAGE_SIZE_OPTIONS.includes(parsed)) setPageSizeState(parsed);
  }, [storageKey]);

  const setPageSize = useCallback(
    (next: number) => {
      setPageSizeState(next);
      setPage(1);
      localStorage.setItem(`page-size:${storageKey}`, String(next));
    },
    [storageKey],
  );

  const total = items.length;
  const effSize = pageSize === 0 && total > maxUnpaged ? maxUnpaged : pageSize;
  const pageCount = effSize === 0 ? 1 : Math.max(1, Math.ceil(total / effSize));
  const current = Math.min(Math.max(1, page), pageCount);

  const rows = useMemo(
    () => (effSize === 0 ? items : items.slice((current - 1) * effSize, current * effSize)),
    [items, effSize, current],
  );

  useEffect(() => {
    if (page !== current) setPage(current);
  }, [page, current]);

  return { rows, page: current, pageCount, pageSize, setPage, setPageSize, total };
}

type Props = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  setPage: (v: number) => void;
  setPageSize: (v: number) => void;
  /** Zoom gridu – stránkování se zmenšuje/zvětšuje spolu s tabulkou. */
  zoom?: number;
  /** Lišta navazuje přímo na spodní hranu gridu (bez mezery a horního rámečku). */
  attached?: boolean;
  className?: string;
};

/** Kompaktní lišta stránkování navazující na grid. */
export function GridPagination({
  page,
  pageCount,
  pageSize,
  total,
  setPage,
  setPageSize,
  zoom = 1,
  attached = true,
  className = "",
}: Props) {
  const from = total === 0 ? 0 : pageSize === 0 ? 1 : (page - 1) * pageSize + 1;
  const to = pageSize === 0 ? total : Math.min(page * pageSize, total);

  const shell = attached
    ? "flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-b-lg border border-t-0 border-border bg-card"
    : "inline-flex shrink-0 items-center gap-2 rounded-md border border-border bg-card";

  return (
    <div
      className={`zoom-pagination ${shell} ${className}`}
      style={{ fontSize: gridFontSize(zoom) }}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground">Zobrazit</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="zoom-pagination-size num typo-action"
              aria-label="Počet záznamů na stránku"
            >
              {label(pageSize)}
              <ChevronDown className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="zoom-pagination-menu min-w-0"
            style={{ fontSize: gridFontSize(zoom) }}
          >
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <DropdownMenuRadioItem key={s} value={String(s)}>
                  {label(s)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="num text-muted-foreground">
          {total === 0 ? "žádné záznamy" : `${from}–${to} z ${total}`}
        </span>
      </div>

      {pageSize > 0 && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Předchozí stránka"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="num text-muted-foreground">
            Strana {page} / {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Další stránka"
            disabled={page >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
