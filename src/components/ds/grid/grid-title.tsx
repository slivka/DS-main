import type { ReactNode } from "react";
import { gridFontSize } from "./grid-zoom";
import { cn } from "../../../lib/utils";

/**
 * Výrazný název gridu nad panelem tlačítek.
 * Tvoří horní část podkladu gridu – navazuje na lištu i tabulku pod ní
 * a škáluje se stejným zoomem jako grid.
 */
export function GridTitleBar({
  title,
  zoom = 1,
  actions,
  className = "",
  hideMark = false,
}: {
  title: ReactNode;
  zoom?: number;
  /** Volitelné prvky vpravo od názvu. */
  actions?: ReactNode;
  className?: string;
  /** Skryje ozdobný pruh před názvem (např. pro vlastní hlavičku s datem). */
  hideMark?: boolean;
}) {
  return (
    <div
      className={
        "zoom-filters grid-title-bar flex flex-wrap items-center gap-3 rounded-t-lg border border-b-0 bg-card shadow-panel " +
        className
      }
      style={{ fontSize: gridFontSize(zoom) }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {hideMark ? null : <span aria-hidden className="grid-title-mark" />}
        <h2
          className={cn(
            "leading-[1.2] text-foreground",
            typeof title === "string" ? "typo-title min-w-0 truncate" : "",
          )}
        >
          {title}
        </h2>
      </div>
      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
