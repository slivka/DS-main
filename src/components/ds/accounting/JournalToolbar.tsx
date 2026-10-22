/**
 * Lišta editoru řádků dokladu.
 * Vlastní: přidání řádku (Součet, Zaokrouhlení a Rozdíl jsou od 2.109.0 v patičce),
 *   hledání, výběr sloupců, zoom a pruh výsledku hledání.
 * Nesmí: měnit řádky jinak než přes akce stavu editoru.
 */
import { Plus, X } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { ColumnPicker } from "../grid/column-picker";
import { GridSearch } from "../grid/grid-search";
import { GridToolbar } from "../grid/grid-toolbar";
import { ZoomControl } from "../grid/grid-zoom";
import { useJournalEditor } from "./journal-editor-context";
import { JournalDeductionAdd } from "./journal-deduction-rows";
import { accountDataColumn, isAccountColumn, isAccountNameColumn } from "./journal-lines-model";

/** Levá část lišty: přidat řádek. */
function ToolbarLeft() {
  const { editor } = useJournalEditor();
  const { t } = editor;
  const addLabel = `${t.addLine} (Ctrl+Enter)`;
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.addLine(true)}
            disabled={editor.editable.size === 0}
            aria-label={addLabel}
            className="grid-toolbar-control grid-toolbar-primary shrink-0"
          >
            <Plus className="size-[1.2em]" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{addLabel}</TooltipContent>
      </Tooltip>
      <JournalDeductionAdd />
    </>
  );
}

/** Pravá část lišty: hledání, sloupce a zoom. */
function ToolbarRight() {
  const { editor } = useJournalEditor();
  const { layout, t } = editor;
  const { columns, zoom } = layout;
  return (
    <>
      <GridSearch
        value={editor.search}
        onChange={editor.setSearch}
        zoom={zoom}
        placeholder={t.search}
      />
      <ColumnPicker
        columns={columns.columns.map((column) => {
          const dataId = isAccountColumn(column.id) ? accountDataColumn(column.id) : null;
          const pairId = dataId
            ? isAccountNameColumn(column.id)
              ? dataId
              : (`${dataId}Name` as const)
            : null;
          const disableToggleReason =
            dataId && columns.columnVisible[column.id] && pairId && !columns.columnVisible[pairId]
              ? editor.accountFormRequired
              : undefined;
          return {
            id: column.id,
            label: column.label,
            locked: column.locked,
            disableToggleReason,
            pinned: column.id === "actions" ? ("end" as const) : undefined,
          };
        })}
        visible={columns.columnVisible}
        onToggle={columns.toggle}
        onReset={columns.reset}
        onReorder={columns.reorder}
        zoom={zoom}
      />
      <ZoomControl
        zoom={zoom}
        setZoom={layout.setZoom}
        density={layout.density}
        setDensity={layout.setDensity}
        auto={layout.isAuto}
      />
    </>
  );
}

/** Lišta editoru a pruh výsledku hledání. */
export function JournalToolbar() {
  const { editor } = useJournalEditor();
  const { t, search } = editor;
  return (
    <>
      <GridToolbar
        zoom={editor.layout.zoom}
        density={editor.layout.density}
        left={<ToolbarLeft />}
        right={<ToolbarRight />}
      />
      {search ? (
        <div className="flex items-center justify-between border-b bg-filter-active/10 px-3 py-1 text-xs text-filter-active">
          <span>
            {t.searchResult
              .replace("{shown}", String(editor.displayedLines.length))
              .replace("{total}", String(editor.normalizedLines.length))}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.clearSearch}
            onClick={() => editor.setSearch("")}
            className="size-7 text-filter-active"
          >
            <X />
          </Button>
        </div>
      ) : null}
    </>
  );
}
