/**
 * Lišta editoru řádků dokladu.
 * Vlastní: přidání řádku, návrh zaokrouhlení, režim zadání částky s/bez DPH, stav rozepsání,
 *   hledání, výběr sloupců, zoom a pruh výsledku hledání.
 * Nesmí: měnit řádky jinak než přes akce stavu editoru.
 */
import { Plus, X } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { ColumnPicker } from "../grid/column-picker";
import { GridSearch } from "../grid/grid-search";
import { GridSegmentedToggle } from "../grid/grid-segmented-toggle";
import { GridToolbar, GridToolbarSeparator } from "../grid/grid-toolbar";
import { ZoomControl } from "../grid/grid-zoom";
import { useJournalEditor } from "./journal-editor-context";
import type { VatCalcMode } from "./journal-lines";
import { accountDataColumn, isAccountColumn, isAccountNameColumn } from "./journal-lines-model";

/** Levá část lišty: přidat řádek, zaokrouhlení, režim DPH a stav rozepsání. */
function ToolbarLeft() {
  const { editor } = useJournalEditor();
  const { t, totals, vatOn, vatReadOnly, documentMark } = editor;
  const { rounding } = editor.props;
  const addLabel = `${t.addLine} (Ctrl+Enter)`;
  const grossColumnVisible = editor.layout.visibleColumns.some((c) => c.id === "grossAmount");
  const handleRounding = () => {
    if (!rounding?.onChange || rounding.readOnly || totals.roundingExists) return;
    rounding.onChange(totals.suggestion);
  };
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
      {rounding ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-slot="journal-lines-rounding"
              data-limit={rounding.limit}
              type="button"
              variant="outline"
              disabled={rounding.readOnly || !rounding.onChange || totals.roundingExists}
              onClick={handleRounding}
              className="grid-toolbar-control"
            >
              ± {rounding.label ?? t.rounding}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {totals.roundingExists
              ? t.roundingExists
              : `${formatAmount(totals.suggestion, 2)} ${documentMark}`}
          </TooltipContent>
        </Tooltip>
      ) : null}
      {vatOn ? (
        <GridSegmentedToggle
          disabled={vatReadOnly || editor.editable.size === 0}
          ariaLabel={t.vatMode}
          options={[
            { value: "net", label: t.vatModeNet },
            { value: "gross", label: t.vatModeGross },
          ]}
          value={editor.calcMode}
          defaultValue={editor.calcMode}
          onChange={(value) => editor.changeCalcMode(value as VatCalcMode)}
          className={cn(vatReadOnly && "pointer-events-none opacity-60")}
          aria-disabled={vatReadOnly || undefined}
        />
      ) : null}
      {totals.showRemaining ? (
        <>
          <GridToolbarSeparator density={editor.layout.density} />
          <span
            data-slot="journal-lines-remaining"
            className={cn(
              "inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold",
              totals.difference === 0
                ? "bg-success-soft text-success-strong"
                : "bg-destructive-soft text-destructive-strong",
            )}
          >
            {totals.difference === 0
              ? `✓ ${t.balanced}`
              : `${t.remaining} ${formatAmount(totals.difference, 2)}`}
          </span>
          {vatOn && !grossColumnVisible ? (
            <span
              data-slot="journal-lines-toolbar-total"
              className="inline-flex h-8 items-center whitespace-nowrap px-2 text-xs font-semibold tabular-nums"
            >{`${t.total} ${formatAmount(totals.documentGrossTotal, 2)} ${documentMark}`}</span>
          ) : null}
        </>
      ) : null}
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
      <GridSearch value={editor.search} onChange={editor.setSearch} zoom={zoom} placeholder={t.search} />
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
      <GridToolbar zoom={editor.layout.zoom} density={editor.layout.density} left={<ToolbarLeft />} right={<ToolbarRight />} />
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
