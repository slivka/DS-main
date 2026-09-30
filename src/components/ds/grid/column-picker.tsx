import { useState } from "react";
import { useDsTexts } from "../../../ds-texts";
import { Check, GripVertical, RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { gridFontSize } from "./grid-zoom";
import type { ColumnViewsApi } from "./grid-columns";
import { useResolvedGridTexts, type GridTexts } from "./grid-texts";

export type PickerColumn<Id extends string = string> = {
  id: Id;
  label: string;
  locked?: boolean;
  /** Volitelný dynamický důvod, proč nyní nelze viditelný sloupec vypnout. */
  disableToggleReason?: string;
  /** Připnutý sloupec – ve výběru zůstává na svém okraji a nejde přesouvat. */
  pinned?: boolean | "start" | "end";
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
  const dsTexts = useDsTexts();
  const texts = useResolvedGridTexts(textOverrides);
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

  const pinRank = (column: PickerColumn<Id>) =>
    column.pinned === "end" ? 2 : column.pinned ? 0 : 1;
  const sortedColumns = [...columns].sort((a, b) => pinRank(a) - pinRank(b));

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
                title={dsTexts.columnPicker.clearCustomTitle}
                className="text-[0.9em] text-muted-foreground transition-colors hover:text-destructive"
              >
                {dsTexts.columnPicker.clearCustom}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleReset}
              title={
                hasCustomDefault
                  ? dsTexts.columnPicker.restoreSaved
                  : dsTexts.columnPicker.restoreFactory
              }
              className="flex items-center gap-[0.4em] text-[0.9em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-[1.1em]" />
              {dsTexts.columnPicker.default}
            </button>
          </span>
        </div>

        <div className="max-h-[24em] overflow-y-auto py-[0.4em]">
          {sortedColumns.map((c, i) => {
            const section = c.section ?? "";
            const sectionStart = section && sortedColumns[i - 1]?.section !== section;
            const sectionOff = !!section && hiddenSections.includes(section);
            const toggleDisabled = Boolean(c.locked || c.disableToggleReason);
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
                        title={
                          sectionOff
                            ? dsTexts.columnPicker.showSection(section)
                            : dsTexts.columnPicker.hideSection(section)
                        }
                      >
                        {sectionOff ? dsTexts.columnPicker.show : dsTexts.columnPicker.hide}
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
                      toggleDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                  >
                    {c.disableToggleReason ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            tabIndex={0}
                            data-slot="column-toggle-disabled"
                            aria-label={c.disableToggleReason}
                            className="inline-flex"
                          >
                            <Checkbox checked={!!visible[c.id]} disabled aria-label={c.label} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{c.disableToggleReason}</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Checkbox
                        checked={!!visible[c.id]}
                        disabled={toggleDisabled}
                        onCheckedChange={() => !toggleDisabled && onToggle(c.id)}
                      />
                    )}
                    <span className="truncate text-[1em] text-foreground">
                      {c.label
                        ? c.label.replace(/\b(md|dal)\b/gi, (value) =>
                            value.toLocaleUpperCase("cs"),
                          )
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
              title={dsTexts.columnPicker.saveDefault}
              className="typo-action flex h-[2em] items-center gap-[0.35em] rounded-md px-[0.7em] text-[0.9em] text-foreground transition-colors hover-surface"
            >
              {savedDefault ? <Check className="size-[1.1em] text-primary" /> : null}
              {savedDefault ? dsTexts.columnPicker.saved : dsTexts.columnPicker.saveColumns}
            </button>
          </div>
        ) : onReorder ? (
          <p className="border-t px-[1em] py-[0.45em] text-[0.8em] text-muted-foreground">
            {dsTexts.columnPicker.persistenceHint}
          </p>
        ) : null}

        {views && (
          <div className="border-t bg-secondary/30">
            <div className="typo-label px-[1em] pb-[0.3em] pt-[0.6em] text-[0.85em] text-muted-foreground">
              {dsTexts.columnPicker.savedViews}
            </div>

            {views.views.length === 0 ? (
              <p className="px-[1em] pb-[0.4em] text-[0.85em] text-muted-foreground">
                {dsTexts.columnPicker.noSavedViews}
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
                      title={dsTexts.columnPicker.applyView}
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
                      title={dsTexts.columnPicker.overwriteTitle}
                      className="shrink-0 text-[0.85em] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                    >
                      {dsTexts.columnPicker.overwrite}
                    </button>
                    <button
                      type="button"
                      onClick={() => views.remove(v.id)}
                      title={dsTexts.columnPicker.deleteView}
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
                placeholder={dsTexts.columnPicker.viewName}
                className="typo-body h-[2em] min-w-0 flex-1 rounded-md border border-input bg-background px-[0.6em] text-[0.95em] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={saveView}
                disabled={!newName.trim()}
                title={dsTexts.columnPicker.saveView}
                className="typo-action flex h-[2em] shrink-0 items-center gap-[0.3em] rounded-md bg-primary px-[0.7em] text-[0.9em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {dsTexts.columnPicker.save}
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
