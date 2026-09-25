import { useContext, useState, type ReactNode } from "react";
import { CheckSquare, MoreHorizontal } from "lucide-react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { gridFontSize } from "./grid-zoom";
import { resolveGridTexts, type GridTexts } from "./grid-texts";
import { GridToolbarOverflowContext } from "./grid-toolbar";

export type GridMoreItem = {
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  /** Nadpis sekce, do které položka patří (např. „Nad celým gridem“). */
  group?: string;
  onSelect?: () => void | Promise<void>;
  /** Zobrazí položku jako přepínač (checkbox) místo běžné akce. */
  toggle?: boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
};

/** Tlačítko „…“ s návazným menu doplňkových akcí gridu. */
export function GridMoreMenu({
  items,
  tools,
  secondary,
  footer,
  zoom = 1,
  className = "",
  responsiveOverflow = false,
  texts: textOverrides,
}: {
  items: GridMoreItem[];
  /** Nástroje přesunuté do nabídky v úzkém gridu. */
  tools?: ReactNode;
  /** Další ovládání přesunuté do nabídky v úzkém gridu. */
  secondary?: ReactNode;
  /** Poslední skupina nabídky v úzkém gridu, typicky obnovení dat. */
  footer?: ReactNode;
  zoom?: number;
  className?: string;
  /** Vnitřní nabídka gridu řízená skutečně dostupnou šířkou lišty. */
  responsiveOverflow?: boolean;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const overflowLevel = useContext(GridToolbarOverflowContext);
  const shownTools = !responsiveOverflow || overflowLevel >= 1 ? tools : null;
  const shownSecondary = !responsiveOverflow || overflowLevel >= 2 ? secondary : null;
  const shownItems = !responsiveOverflow || overflowLevel >= 2 ? items : [];
  const [open, setOpen] = useState(false);
  const fontSize = gridFontSize(zoom);
  if (shownItems.length === 0 && !shownTools && !shownSecondary && !footer) return null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={texts.moreActions}
          title={texts.moreActions}
          className={`shrink-0 px-[0.5em] ${className}`}
          style={{ fontSize }}
        >
          <MoreHorizontal className="size-[1.25em]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[18em] p-[0.35em]" style={{ fontSize }}>
        {shownTools ? <div className={`grid-more-tools pb-[0.5em] ${(shownSecondary || shownItems.length || footer) ? "mb-[0.35em] border-b border-border/50" : ""}`}><div className="px-[0.6em] pb-[0.25em] pt-[0.45em] text-[0.8em] font-semibold text-muted-foreground">Nástroje</div><div className="flex flex-wrap items-center gap-[0.35em] px-[0.35em]">{shownTools}</div></div> : null}
        {shownSecondary ? <div className={`flex flex-wrap items-center gap-[0.35em] px-[0.35em] pb-[0.5em] ${(shownItems.length || footer) ? "mb-[0.35em] border-b border-border/50" : ""}`}>{shownSecondary}</div> : null}
        {shownItems.map((item, i) => {
          const key = item.label ? `${item.label}-${i}` : `item-${i}`;
          return (
            <div key={key}>
              {item.group && item.group !== shownItems[i - 1]?.group ? (
                <div
                  className={`px-[0.6em] pb-[0.25em] pt-[0.45em] text-[0.8em] font-semibold text-muted-foreground ${i > 0 ? "mt-[0.35em] border-t border-border/50 pt-[0.6em]" : ""}`}
                >
                  {item.group}
                </div>
              ) : null}
              {item.separator ? (
                <div className="my-[0.35em] border-t border-border/50" />
              ) : item.toggle ? (
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onToggle?.(!item.checked);
                  }}
                  className={`flex w-full items-center gap-[0.5em] rounded-md px-[0.6em] py-[0.45em] text-left hover-surface disabled:pointer-events-none disabled:opacity-50 ${item.danger ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : ""} ${item.checked ? "font-semibold" : ""}`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    void item.onSelect?.();
                  }}
                  className={`flex w-full items-center gap-[0.5em] rounded-md px-[0.6em] py-[0.45em] text-left hover-surface disabled:pointer-events-none disabled:opacity-50 ${item.danger ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : ""}`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              )}
            </div>
          );
        })}
        {footer ? <div className={`${(shownTools || shownSecondary || shownItems.length) ? "mt-[0.35em] border-t border-border/50 pt-[0.5em]" : ""} flex flex-wrap items-center gap-[0.35em] px-[0.35em]`}>{footer}</div> : null}
      </PopoverContent>
    </Popover>
  );
}
