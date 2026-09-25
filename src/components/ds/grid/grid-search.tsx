import { useContext, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "../../ui/button";
import { gridFontSize } from "./grid-zoom";
import { resolveGridTexts, type GridTexts } from "./grid-texts";
import { GridToolbarOverflowContext } from "./grid-toolbar";

/**
 * Kompaktní hledání v gridu – malé tlačítko, které se po rozkliknutí
 * roztáhne do vstupního pole. Velikost se řídí zoomem gridu.
 */
export function GridSearch({
  value,
  onChange,
  zoom = 1,
  placeholder,
  className = "",
  texts: textOverrides,
}: {
  value: string;
  onChange: (v: string) => void;
  zoom?: number;
  placeholder?: string;
  className?: string;
  texts?: Partial<GridTexts>;
  /** Zpětná kompatibilita; zvýraznění se vždy řídí pouze hledaným textem. */
  active?: boolean;
}) {
  const texts = resolveGridTexts(textOverrides);
  const fontSize = gridFontSize(zoom);
  const isActive = value.trim().length > 0;
  const [open, setOpen] = useState(!!value);
  const overflowLevel = useContext(GridToolbarOverflowContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Zkratka „/“ – rychlý skok do hledání gridu (mimo formulářová pole).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      setOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open || (overflowLevel >= 3 && !isActive)) {
    return (
      <Button
        variant="outline"
        size="sm"
        aria-label={texts.searchLabel}
        title={texts.searchLabel}
        onClick={() => setOpen(true)}
        className={`grid-toolbar-control grid-toolbar-icon-control shrink-0 ${isActive ? "grid-toolbar-active" : ""} ${className}`}
        style={{ fontSize }}
      >
        <Search className="size-[1.25em]" />
      </Button>
    );
  }

  return (
    <div
      className={`grid-filter-field relative flex min-w-0 basis-[16em] items-center ${className}`}
      style={{ fontSize }}
    >
      <Search
        className={`pointer-events-none absolute left-[0.6em] size-[1.15em] ${isActive ? "text-filter-active" : "text-muted-foreground"}`}
      />
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder ?? texts.searchPlaceholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            setOpen(false);
          }
        }}
        onBlur={() => {
          if (!value) setOpen(false);
        }}
        className={`grid-toolbar-control h-auto w-full min-w-0 rounded-md border border-input bg-background !pl-[2.35em] !pr-[2.2em] text-[1em] outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 ${
          isActive
             ? "grid-toolbar-active focus-visible:ring-filter-active"
            : "focus-visible:ring-ring"
        }`}
      />
      {isActive ? <button
        type="button"
        aria-label={texts.clearSearchLabel}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onChange("");
          setOpen(false);
        }}
        className="absolute right-[0.5em] text-filter-active transition-colors hover:opacity-75"
      >
        <X className="size-[1.15em]" />
      </button> : null}
    </div>
  );
}
