/**
 * Editor řádků dokladu (předkontace) – skládání.
 * Vlastní: propojení stavu (useJournalEditorState), klávesnice (useJournalKeyboard) a částí:
 *   lišta, hlavička sloupců, řádky, patička a rekapitulace.
 * Nesmí: obsahovat výpočty ani logiku řádků – ty patří do modelu a hooků.
 */
import * as React from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { cn } from "../../../lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { ColumnResizeHandle } from "../grid/grid-column-resize";
import { GridZoomContext, ZoomGrid } from "../grid/grid-zoom";
import { JournalFooter } from "./JournalFooter";
import { JournalRow } from "./JournalRow";
import { JournalToolbar } from "./JournalToolbar";
import { JournalEditorContext, useJournalEditor } from "./journal-editor-context";
import type { JournalLinesEditorProps } from "./journal-editor-types";
import { JournalLinesRecap } from "./journal-lines-recap";
import { accountDataColumn, isAccountColumn, isPinnedLine } from "./journal-lines-model";
import { useJournalEditorState } from "./useJournalEditorState";
import { useJournalKeyboard } from "./useJournalKeyboard";

/** Hlavička sloupců se zkrácenými formami účtu a úchyty šířky. */
function JournalHeader() {
  const { editor } = useJournalEditor();
  const { t, layout } = editor;
  return (
    <TableHeader className="grid-column-header">
      <TableRow>
        {layout.visibleColumns.map((column) => {
          const compact = layout.compactAccountIds.has(column.id) && isAccountColumn(column.id);
          const dataId =
            compact && isAccountColumn(column.id) ? accountDataColumn(column.id) : null;
          const heading =
            dataId === "debitAccount"
              ? t.sideDebit
              : dataId === "creditAccount"
                ? t.sideCredit
                : dataId
                  ? editor.counterShortLabel
                  : column.label;
          return (
            <TableHead
              key={column.id}
              data-pin-right={column.id === "actions" || undefined}
              className={cn(
                "relative",
                column.id === "row" && "journal-row-cell",
                column.align === "right" && "text-right",
                column.id === "actions" && "grid-actions-header sticky right-0 z-20 bg-muted",
              )}
            >
              {compact ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} data-slot="compact-account-heading">
                      {heading}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {editor.dsTexts.columnPicker.compactAccountHeading(column.label)}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span>{heading}</span>
              )}
              {column.id !== "row" && column.id !== "actions" ? (
                <ColumnResizeHandle
                  scale={(layout.rootRemPx / 16) * layout.zoom}
                  onResize={(width) => layout.columns.setWidth(column.id, width)}
                  onReset={() => layout.columns.clearWidth(column.id)}
                />
              ) : null}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}

/** Mřížka řádků s přetahováním. */
function JournalGrid() {
  const { editor } = useJournalEditor();
  const { layout, displayedLines, t } = editor;
  const storageKey = editor.props.storageKey ?? "journal-lines";
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const dragIds = displayedLines.filter((line) => !isPinnedLine(line)).map((line) => line.id);
  return (
    <ZoomGrid
      zoom={layout.zoom}
      setZoom={layout.setZoom}
      density={layout.density}
      height="auto"
      stickyHeader="pane"
      className="journal-lines-grid"
      overflowFallback={layout.zoomLayout.scroll}
    >
      <DndContext
        id={`journal-lines-${storageKey}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={editor.onDragEnd}
      >
        <SortableContext items={dragIds} strategy={verticalListSortingStrategy}>
          <Table
            role="grid"
            data-auto-hidden={layout.columnLayout.hiddenColumnIds.join(",")}
            data-compact-accounts={layout.compactAccountIds.size > 0 || undefined}
            className="w-full table-fixed"
          >
            <colgroup>
              {layout.visibleColumns.map((column) => (
                <col key={column.id} style={{ width: `${layout.colWidthsRem[column.id]}rem` }} />
              ))}
            </colgroup>
            <JournalHeader />
            <TableBody>
              {displayedLines.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={layout.visibleColumns.length}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {t.empty}
                  </TableCell>
                </TableRow>
              ) : (
                displayedLines.map((line, rowIndex) => (
                  <JournalRow key={line.id} line={line} rowIndex={rowIndex} />
                ))
              )}
            </TableBody>
            <JournalFooter />
          </Table>
        </SortableContext>
      </DndContext>
    </ZoomGrid>
  );
}

/** Editovatelná mřížka předkontací s jednotnou měnou dokladu, řazením a rekapitulací. */
export const JournalLinesEditor = React.forwardRef<HTMLDivElement, JournalLinesEditorProps>(
  function JournalLinesEditor(props, forwardedRef) {
    const editor = useJournalEditorState(props, forwardedRef);
    const keyboard = useJournalKeyboard(editor);
    const { layout, totals, t, vatOn } = editor;
    const { recap = {}, recapTabs = [], storageKey = "journal-lines" } = props;
    return (
      <JournalEditorContext.Provider value={{ editor, keyboard }}>
        <GridZoomContext.Provider
          value={{ zoom: layout.zoom, setZoom: layout.setZoom, density: layout.density }}
        >
          <div
            ref={layout.setRootRef}
            className={cn("@container overflow-clip rounded-lg border bg-card", props.className)}
            onKeyDown={keyboard.onRootKeyDown}
          >
            <JournalToolbar />
            <JournalGrid />
            <JournalLinesRecap
              lines={
                vatOn
                  ? [
                      ...totals.gridSource.filter(
                        (line) => !line.isVatLine && !(line.isFxRounding && line.isVatPreview),
                      ),
                      ...totals.taxLines.map((line) =>
                        line.isFxRounding ? { ...line, text: t.fxRoundingPreview } : line,
                      ),
                    ]
                  : props.lines
              }
              vatSummary={vatOn ? totals.vatSummary : undefined}
              accounts={props.accounts}
              dimensions={props.dimensions ?? []}
              documentCurrency={props.documentCurrency}
              documentCurrencySymbol={props.documentCurrencySymbol}
              homeCurrency={props.homeCurrency}
              homeCurrencySymbol={props.homeCurrencySymbol}
              open={recap.open}
              onOpenChange={recap.onOpenChange}
              tab={recap.tab}
              onTabChange={recap.onTabChange}
              recapTabs={recapTabs}
              zoom={layout.zoom}
              storageKey={`${storageKey}:recap`}
              texts={{ rounding: t.rounding, fxRounding: t.fxRounding, total: t.total }}
            />
          </div>
        </GridZoomContext.Provider>
      </JournalEditorContext.Provider>
    );
  },
);
