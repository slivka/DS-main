import { useState } from "react";
import { Check, GripVertical, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { gridFontSize } from "./grid-zoom";
import type { ColumnViewsApi } from "./grid-columns";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

export type PickerColumn<Id extends string = string> = {
  id: Id;
  label: string;
  locked?: boolean;
  /** Připnutý sloupec vlevo – ve výběru je nahoře a nejde přesouvat. */
  pinned?: boolean;
  /** Sekce, do které sloupec patří (oddělovač v seznamu). */
  section?: string;
};

/**
 * Výběr zobrazených sloupců – seznam se zaškrtávacími poli
 * a volitelně pojmenované pohledy (uložené sestavy sloupců).
 * Velikost obsahu se řídí zoomem gridu (em jednotky odvozené od fontSize).
 */
export function ColumnPicker<Id extends string>({
  columns,
  visible,
  onToggle,
  onReset,
  onReorder,
  zoom = 1,
  title = "Sloupce",
  views,
  onSaveDefault,
  onClearDefault,
  hasCustomDefault = false,
  hiddenSections = [],
  onToggleSection,
  texts: textOverrides,
}: {
  columns: PickerColumn<Id>[];
  visible: Record<Id, boolean>;
  onToggle: (id: Id) => void;
  onReset: () => void;
  /** Přesun sloupce myší (drag & drop). Pořadí se ukládá jako výchozí. */
  onReorder?: (id: Id, targetId: Id, position: "before" | "after") => void;
  zoom?: number;
  title?: string;
  views?: ColumnViewsApi;
  /** Uloží aktuální nastavení sloupců jako výchozí zobrazení gridu. */
  onSaveDefault?: () => void;
  /** Zruší vlastní výchozí zobrazení. */
  onClearDefault?: () => void;
  hasCustomDefault?: boolean;
  /** Vypnuté sekce sloupců (z `useGridColumns`). */
  hiddenSections?: string[];
  /** Zapnutí / vypnutí celé sekce. */
  onToggleSection?: (section: string) => void;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const fontSize = gridFontSize(zoom);
  const [newName, setNewName] = useState("");
  const [savedDefault, setSavedDefault] = useState(false);
  // Přetahování sloupců v seznamu: táhnutý sloupec a místo vložení.
  const [dragId, setDragId] = useState<Id | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: Id; position: "before" | "after" } | null>(
    null,
  );

  const endDrag = () => {
    setDragId(null);
    setDropTarget(null);
  };

  const dropPosition = (e: React.DragEvent<HTMLElement>): "before" | "after" => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientY - rect.top > rect.height / 2 ? "after" : "before";
  };

  const handleReset = () => {
    // „Výchozí“ vždy obnoví výchozí zobrazení – vlastní uložené, jinak tovární.
    onReset();
  };

  const saveDefault = () => {
    onSaveDefault?.();
    setSavedDefault(true);
    window.setTimeout(() => setSavedDefault(false), 1600);
  };

  // Připnuté sloupce jsou v gridu vždy vlevo – ve výběru je držíme nahoře.
  const sortedColumns = [...columns].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  const saveView = () => {
    if (!views) return;
    const name = newName.trim();
    if (!name) return;
    views.save(name);
    setNewName("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={texts.columnsTitle}
          title={texts.columnsTitle}
          className="grid-toolbar-control grid-toolbar-icon-control ml-auto shrink-0"
          style={{ fontSize }}
        >
          <SlidersHorizontal className="size-[1.25em]" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(26em,calc(100vw-2rem))] min-w-[17rem] overflow-hidden p-0"
        style={{ fontSize }}
      >
        <div className="flex items-center justify-between gap-2 border-b bg-secondary/60 px-[1em] py-[0.75em]">
          <span className="typo-label text-[1.05em] text-foreground">{title}</span>
          <span className="flex items-center gap-[0.8em]">
            {hasCustomDefault && onClearDefault ? (
              <button
                type="button"
                onClick={onClearDefault}
                title="Zruší uložené vlastní výchozí nastavení sloupců"
                className="text-[0.9em] text-muted-foreground transition-colors hover:text-destructive"
              >
                Zrušit vlastní
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              title={
                hasCustomDefault
                  ? "Obnovit uložené výchozí nastavení"
                  : "Obnovit tovární výchozí nastavení"
              }
              className="flex items-center gap-[0.4em] text-[0.9em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-[1.1em]" />
              Výchozí
            </button>
          </span>
        </div>

        <div className="max-h-[24em] overflow-y-auto py-[0.4em]">
          {sortedColumns.map((c, i) => {
            const section = c.section ?? "";
            const sectionStart = section && sortedColumns[i - 1]?.section !== section;
            const sectionOff = !!section && hiddenSections.includes(section);
            return (
              <div key={c.id}>
                {sectionStart ? (
                  <div
                    className={`mt-[0.3em] flex items-center justify-between gap-[0.5em] border-t px-[1em] pb-[0.2em] pt-[0.5em] ${
                      i === 0 ? "border-t-0" : ""
                    }`}
                  >
                    <span className="typo-label text-[0.85em] text-muted-foreground">
                      {section}
                    </span>
                    {onToggleSection ? (
                      <button
                        type="button"
                        onClick={() => onToggleSection(section)}
                        className="text-[0.8em] text-muted-foreground transition-colors hover:text-foreground"
                        title={sectionOff ? `Zobrazit sekci ${section}` : `Skrýt sekci ${section}`}
                      >
                        {sectionOff ? "Zobrazit" : "Skrýt"}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div
                  draggable={!!onReorder && !c.pinned}
                  onDragStart={
                    onReorder && !c.pinned
                      ? (e) => {
                          setDragId(c.id);
                          e.dataTransfer.effectAllowed = "move";
                          try {
                            e.dataTransfer.setData("text/plain", c.id);
                          } catch {
                            /* prohlížeč nepodporuje */
                          }
                        }
                      : undefined
                  }
                  onDragOver={
                    onReorder && !c.pinned
                      ? (e) => {
                          if (!dragId || dragId === c.id) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          const position = dropPosition(e);
                          setDropTarget((cur) =>
                            cur && cur.id === c.id && cur.position === position
                              ? cur
                              : { id: c.id, position },
                          );
                        }
                      : undefined
                  }
                  onDrop={
                    onReorder && !c.pinned
                      ? (e) => {
                          e.preventDefault();
                          if (dragId && dragId !== c.id) onReorder(dragId, c.id, dropPosition(e));
                          endDrag();
                        }
                      : undefined
                  }
                  onDragEnd={onReorder ? endDrag : undefined}
                  className={`group/col flex items-center gap-[0.7em] px-[1em] py-[0.4em] transition-colors hover-surface ${
                    sectionOff ? "opacity-50" : ""
                  } ${dragId === c.id ? "opacity-40" : ""} ${
                    dropTarget?.id === c.id && dropTarget.position === "before"
                      ? "border-t-2 border-t-primary"
                      : ""
                  } ${
                    dropTarget?.id === c.id && dropTarget.position === "after"
                      ? "border-b-2 border-b-primary"
                      : ""
                  }`}
                >
                  {onReorder && !c.pinned ? (
                    <GripVertical
                      className="size-[1.1em] shrink-0 cursor-grab text-muted-foreground/60 transition-colors group-hover/col:text-muted-foreground active:cursor-grabbing"
                      aria-hidden
                    />
                  ) : null}
                  <label
                    className={`flex min-w-0 flex-1 items-center gap-[0.7em] ${
                      c.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <Checkbox
                      checked={!!visible[c.id]}
                      disabled={c.locked}
                      onCheckedChange={() => !c.locked && onToggle(c.id)}
                      className="size-[1.25em]"
                    />
                    <span className="truncate text-[1em] text-foreground">
                      {c.label
                        ? c.label.charAt(0).toUpperCase() + c.label.slice(1).toLowerCase()
                        : c.label}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        {onSaveDefault ? (
          <div className="flex items-center justify-end gap-[0.5em] border-t px-[1em] py-[0.5em]">
            <button
              type="button"
              onClick={saveDefault}
              title="Uložit aktuální viditelnost i pořadí sloupců jako výchozí"
              className="typo-action flex h-[2em] items-center gap-[0.35em] rounded-md px-[0.7em] text-[0.9em] text-foreground transition-colors hover-surface"
            >
              {savedDefault ? <Check className="size-[1.1em] text-primary" /> : null}
              {savedDefault ? "Uloženo" : "Uložit nastavení sloupců"}
            </button>
          </div>
        ) : onReorder ? (
          <p className="border-t px-[1em] py-[0.45em] text-[0.8em] text-muted-foreground">
            Pořadí i viditelnost se ukládají jako výchozí zobrazení.
          </p>
        ) : null}

        {views && (
          <div className="border-t bg-secondary/30">
            <div className="typo-label px-[1em] pb-[0.3em] pt-[0.6em] text-[0.85em] text-muted-foreground">
              Uložené pohledy
            </div>

            {views.views.length === 0 ? (
              <p className="px-[1em] pb-[0.4em] text-[0.85em] text-muted-foreground">
                Zatím nemáte uložený žádný pohled.
              </p>
            ) : (
              <div className="max-h-[12em] overflow-y-auto pb-[0.3em]">
                {views.views.map((v) => (
                  <div
                    key={v.id}
                    className="group flex items-center gap-[0.5em] px-[1em] py-[0.3em] transition-colors hover-surface"
                  >
                    <button
                      type="button"
                      onClick={() => views.apply(v.id)}
                      className="flex min-w-0 flex-1 items-center gap-[0.5em] text-left"
                      title="Použít pohled"
                    >
                      <Check
                        className={`size-[1.1em] shrink-0 ${
                          views.activeId === v.id ? "text-primary" : "text-transparent"
                        }`}
                      />
                      <span className="truncate text-[1em] text-foreground">{v.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => views.overwrite(v.id)}
                      title="Přepsat aktuálním nastavením"
                      className="shrink-0 text-[0.85em] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      Přepsat
                    </button>
                    <button
                      type="button"
                      onClick={() => views.remove(v.id)}
                      title="Smazat pohled"
                      className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-[1.1em]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-[0.4em] border-t px-[1em] py-[0.6em]">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveView();
                  }
                }}
                placeholder="Název pohledu"
                className="typo-body h-[2em] min-w-0 flex-1 rounded-md border border-input bg-background px-[0.6em] text-[0.95em] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={saveView}
                disabled={!newName.trim()}
                title="Uložit aktuální zobrazení"
                className="typo-action flex h-[2em] shrink-0 items-center gap-[0.3em] rounded-md bg-primary px-[0.7em] text-[0.9em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Uložit
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
