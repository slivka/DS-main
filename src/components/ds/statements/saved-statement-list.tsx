/** Uložené výkazy · grid a akce · nesmí ukládat ani mazat data (dělá APP). */
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { GridRowMenu } from "../grid/grid-active-status";
import { useDsTexts } from "../../../ds-texts";
import { formatDate } from "../../../lib/format";
import { statementUnitLabel } from "./financial-statement-view";
import type { SavedStatement } from "./statement-types";

/** Parametry seznamu uložených výkazů. */
export interface SavedStatementListProps {
  /** Uložené výkazy od APP. */
  items: SavedStatement[];
  /** Měna z dat APP (popisek jednotek). */
  currency: string;
  /** Otevření výkazu (i dvojklik). */
  onOpen: (item: SavedStatement) => void;
  /** Přejmenování. */
  onRename?: (item: SavedStatement) => void;
  /** Duplikace. */
  onDuplicate?: (item: SavedStatement) => void;
  /** Smazání po potvrzení. */
  onDelete?: (item: SavedStatement) => void;
  /** Nový výkaz z účetnictví. */
  onCreateFromLedger?: () => void;
  /** Probíhá načítání. */
  loading?: boolean;
  /** Klíč uložení nastavení gridu. */
  storageKey?: string;
  /** Doplňková třída. */
  className?: string;
}

/** Grid uložených výkazů s akcemi Otevřít, Přejmenovat, Duplikovat, Smazat a Nový z účetnictví. */
export function SavedStatementList({
  items,
  currency,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  onCreateFromLedger,
  loading,
  storageKey = "saved-statements",
  className,
}: SavedStatementListProps) {
  const t = useDsTexts().statements;
  const columns: DataGridColumn<SavedStatement>[] = [
    { id: "name", label: t.name, value: (row) => row.name },
    { id: "kind", label: t.kind, value: (row) => t.kinds[row.kind] },
    { id: "period", label: t.period, value: (row) => row.period },
    {
      id: "unit",
      label: t.unitsLabel,
      value: (row) => statementUnitLabel(t.units[row.unit], currency),
    },
    { id: "savedBy", label: t.savedBy, value: (row) => row.savedBy },
    {
      id: "savedAt",
      label: t.savedAt,
      value: (row) => `${formatDate(row.savedAt)} ${row.savedAt.slice(11, 16)}`.trim(),
      sortValue: (row) => row.savedAt,
      defaultSortDirection: "desc",
    },
  ];
  return (
    <DataGrid
      title={t.savedTitle}
      storageKey={storageKey}
      rows={items}
      rowKey={(row) => row.id}
      columns={columns}
      loading={loading}
      className={className}
      emptyTitle={t.emptySaved}
      defaultSort="savedAt"
      onRowOpen={onOpen}
      onDeleteRow={onDelete}
      deleteConfirm={(row) => t.deleteConfirm.replace("{name}", row.name)}
      addAction={
        onCreateFromLedger ? { label: t.newFromLedger, onClick: onCreateFromLedger } : undefined
      }
      rowActions={(row) => (
        <GridRowMenu
          items={[
            { id: "open", label: t.open, onSelect: () => onOpen(row) },
            ...(onRename ? [{ id: "rename", label: t.rename, onSelect: () => onRename(row) }] : []),
            ...(onDuplicate
              ? [{ id: "duplicate", label: t.duplicate, onSelect: () => onDuplicate(row) }]
              : []),
          ]}
        />
      )}
    />
  );
}
