/**
 * Akce řádku gridu.
 * Vlastní: ikony Upravit / Odstranit v ukotveném sloupci, potvrzení odstranění, zakázané akce
 * s důvodem, dvojklik na řádek (úprava, jinak náhradní akce) a viditelnost sloupce akcí.
 * Nesmí: znát data řádku ani vzhled gridu – sdílí ho DataGrid i TreeGrid. Položka Aktivní /
 * Neaktivní do nabídky řádku je sdílená zvlášť (`activeToggleMenuItem`).
 */
import type { MouseEvent, ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { useConfirmDialog } from "../feedback/confirm-dialog";
import { GridAction, GridActions } from "./grid-action";
import type { GridRowActionProps } from "./grid-base-props";
import type { GridTexts } from "./grid-texts";

/** Výsledek {@link useRowActions}. */
export type RowActions<Row> = {
  /** Sloupec akcí je vidět (mimo režim výběru a jen s nějakou akcí). */
  visible: boolean;
  /** Obsah buňky akcí řádku. */
  render: (row: Row) => ReactNode;
  /** Úprava řádku je povolená (dvojklik). */
  canEdit: (row: Row) => boolean;
  /** Dialog potvrzení – vykreslit jednou v gridu. */
  confirmDialog: ReactNode;
};

/** Ikony akcí řádku a potvrzení odstranění pro DataGrid i TreeGrid. */
export function useRowActions<Row>(
  props: GridRowActionProps<Row>,
  texts: Pick<GridTexts, "edit" | "remove" | "removeConfirm">,
  selectMode: boolean,
): RowActions<Row> {
  const { confirm, confirmDialog } = useConfirmDialog();
  const {
    onEditRow,
    onDeleteRow,
    deleteConfirm,
    rowActions,
    canEditRow,
    canDeleteRow,
    editDisabledReason,
    deleteDisabledReason,
    hideDefaultActions,
  } = props;
  const visible =
    Boolean(
      (onEditRow && !hideDefaultActions) || (onDeleteRow && !hideDefaultActions) || rowActions,
    ) && !selectMode;
  const stop = (event: MouseEvent, action: () => void) => {
    event.stopPropagation();
    action();
  };
  const render = (row: Row) => (
    <GridActions>
      {rowActions?.(row)}
      {!hideDefaultActions &&
      onEditRow &&
      ((canEditRow?.(row) ?? true) || editDisabledReason?.(row)) ? (
        <GridAction
          title={texts.edit}
          aria-label={texts.edit}
          disabled={Boolean(editDisabledReason?.(row))}
          disabledReason={editDisabledReason?.(row)}
          onClick={(event) => stop(event, () => onEditRow(row))}
        >
          <Pencil className="size-3.5" />
        </GridAction>
      ) : null}
      {!hideDefaultActions &&
      onDeleteRow &&
      ((canDeleteRow?.(row) ?? true) || deleteDisabledReason?.(row)) ? (
        <GridAction
          tone="destructive"
          title={texts.remove}
          aria-label={texts.remove}
          disabled={Boolean(deleteDisabledReason?.(row))}
          disabledReason={deleteDisabledReason?.(row)}
          onClick={(event) =>
            stop(event, () =>
              confirm({
                title: deleteConfirm?.(row) ?? texts.removeConfirm,
                confirmLabel: texts.remove,
                destructive: true,
                onConfirm: () => onDeleteRow(row),
              }),
            )
          }
        >
          <Trash2 className="size-3.5" />
        </GridAction>
      ) : null}
    </GridActions>
  );
  const canEdit = (row: Row) =>
    Boolean(onEditRow) && !editDisabledReason?.(row) && (canEditRow?.(row) ?? true);
  return { visible, render, canEdit, confirmDialog };
}
