/**
 * Klávesnice editoru řádků.
 * Vlastní: přesun fokusu mezi buňkami (Tab / Enter, Shift zpět), zkratky Ctrl+Enter, Ctrl+D,
 *   Ctrl+Delete, Alt+šipky, F2, Esc a zahájení editace psaním.
 * Nesmí: registrovat globální posluchače na window; vše běží přes onKeyDown kořene a buněk.
 */
import type * as React from "react";

import type { JournalLine } from "./journal-lines";
import {
  DIMENSION_COLUMNS,
  NUMERIC_COLUMNS,
  PARTNER_COLUMNS,
  VAT_COLUMNS,
  VS_COLUMNS,
  dataColumnOf,
  isAccountColumn,
  type ColumnId,
} from "./journal-lines-model";
import type { JournalEditorState } from "./useJournalEditorState";

/** Klávesové akce editoru nad sdíleným stavem. */
export function useJournalKeyboard(editor: JournalEditorState) {
  const { layout } = editor;
  const { lines } = editor.props;

  /** Fokus na buňku o `delta` dál; za poslední buňkou založí nový řádek. */
  const focusRelative = (rowId: string, column: ColumnId, delta: number) =>
    requestAnimationFrame(() => {
      const cells = [
        ...(layout.rootRef.current?.querySelectorAll<HTMLElement>(
          "[data-cell-key][tabindex='0']",
        ) ?? []),
      ];
      const index = cells.findIndex((cell) => cell.dataset.cellKey === `${rowId}:${column}`);
      const target = cells[index + delta];
      if (target) target.focus();
      else if (delta > 0 && index === cells.length - 1) editor.addLine(true);
    });

  /** Zkratky nad celým editorem (jen v aktivním panelu a mimo editaci). */
  const onRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editor.paneActive || editor.editing || (!event.ctrlKey && !event.metaKey)) return;
    if (event.key === "Enter") {
      event.preventDefault();
      editor.addLine(true);
      return;
    }
    if (!editor.active) return;
    const activeRowId = editor.active.rowId;
    const line = lines.find((item) => item.id === activeRowId);
    if (!line || line.isRounding || line.isFxRounding) return;
    if (event.key.toLocaleLowerCase("cs") === "d") {
      event.preventDefault();
      editor.duplicate(line);
    }
    if (event.key === "Delete") {
      event.preventDefault();
      editor.remove(line);
    }
  };

  /** Psaní do neotevřené buňky: číslo se uloží hned, text se předvyplní a otevře editor. */
  const seedCell = (line: JournalLine, column: ColumnId, key: string) => {
    const dataColumn = dataColumnOf(column);
    const seed = VS_COLUMNS.has(dataColumn) ? key.replace(/\D/g, "") : key;
    if (NUMERIC_COLUMNS.has(column) && /^\d$/.test(seed)) {
      const numeric = Number(seed);
      if (column === "amount") editor.patch(line.id, editor.amountValues(numeric));
      else editor.updateCalculated(line, { [dataColumn]: numeric });
    } else if (
      !VAT_COLUMNS.has(dataColumn) &&
      !isAccountColumn(column) &&
      !DIMENSION_COLUMNS.has(dataColumn) &&
      !PARTNER_COLUMNS.has(dataColumn) &&
      column !== "unitId" &&
      !NUMERIC_COLUMNS.has(column)
    )
      editor.patch(line.id, { [dataColumn]: seed });
    editor.startEditing(line, column, seed);
  };

  /** Klávesy buňky mimo editaci. */
  const onCellKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    line: JournalLine,
    column: ColumnId,
    cell: { canEdit: boolean; nonTaxAllowed: boolean; toggleNonTax: () => void },
  ) => {
    if (
      column === "amount" &&
      event.altKey &&
      event.key.toLowerCase() === "n" &&
      cell.nonTaxAllowed
    ) {
      event.preventDefault();
      cell.toggleNonTax();
      return;
    }
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      editor.moveRow(line.id, event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (!cell.canEdit || editor.editing) return;
    if (event.key === "F2" || event.key === "Enter") {
      event.preventDefault();
      editor.startEditing(line, column);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      seedCell(line, column, event.key);
    }
  };

  /** Klávesy otevřeného editoru buňky. */
  const editorKeys = (line: JournalLine, column: ColumnId) => {
    const next = (event: React.KeyboardEvent) =>
      focusRelative(line.id, column, event.shiftKey ? -1 : 1);
    return {
      /** Esc vrátí hodnotu; Enter / Tab potvrdí a přesune fokus. */
      commonKey: (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          editor.cancel();
          return;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          editor.finish();
          next(event);
        }
      },
      /** Ve výběru Enter / Tab vybere zvýrazněnou položku a přesune fokus. */
      selectKey: (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Tab" && event.key !== "Enter") return;
        event.preventDefault();
        event.currentTarget
          .closest("[cmdk-root]")
          ?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]')
          ?.click();
        editor.finish();
        next(event);
      },
      /** Zavření výběru ukončí editaci. */
      closeSelect: (open: boolean) => {
        if (!open) editor.finish();
      },
    };
  };

  return { focusRelative, onRootKeyDown, onCellKeyDown, editorKeys };
}

/** Výsledek `useJournalKeyboard`. */
export type JournalKeyboard = ReturnType<typeof useJournalKeyboard>;
