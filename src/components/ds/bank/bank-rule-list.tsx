/**
 * Seznam pravidel účtování banky (I5).
 * Vlastní: grid pravidel v pořadí a akce; pořadí mění aplikace přes onReorder.
 * Nesmí: vyhodnocovat pravidla ani ukládat.
 */
import type { ComponentPropsWithoutRef } from "react";
import { Copy, Power } from "lucide-react";
import { DataGrid } from "../grid/DataGrid";
import { GridAction } from "../grid/grid-action";
import type { DataGridColumn } from "../grid/data-grid-types";
import { Badge } from "../../ui/badge";
import { StatusBadge } from "../data-display/status-badge";
import { useDsTexts } from "../../../ds-texts";
import type { BankRule } from "./bank-types";

/** Props seznamu pravidel. */
export interface BankRuleListProps extends ComponentPropsWithoutRef<"div"> {
  /** Klíč uložení nastavení gridu. */
  storageKey: string;
  /** Pravidla v pořadí. */
  rules: BankRule[];
  /** Změna pořadí přetažením – nové pořadí klíčů. */
  onReorder?: (ids: string[]) => void;
  /** Nové pravidlo. */
  onAdd?: () => void;
  /** Úprava pravidla. */
  onEdit?: (id: string) => void;
  /** Duplikace pravidla. */
  onDuplicate?: (id: string) => void;
  /** Aktivace / deaktivace. */
  onActiveChange?: (id: string, active: boolean) => void;
  /** Jen pro čtení. */
  readOnly?: boolean;
}

/** Grid pravidel účtování banky. */
export function BankRuleList({
  storageKey,
  rules,
  onReorder,
  onAdd,
  onEdit,
  onDuplicate,
  onActiveChange,
  readOnly,
  ...rest
}: BankRuleListProps) {
  const t = useDsTexts().bankRules;
  const columns: DataGridColumn<BankRule>[] = [
    { id: "order", label: t.order, value: (r) => r.order, numeric: true, width: 64 },
    { id: "name", label: t.name, value: (r) => r.name },
    {
      id: "conditions",
      label: t.conditions,
      value: (r) => r.conditionsText ?? null,
      render: (r) => <span className="block truncate">{r.conditionsText}</span>,
    },
    {
      id: "result",
      label: t.result,
      value: (r) => r.resultText ?? null,
      render: (r) => <span className="block truncate">{r.resultText}</span>,
    },
    {
      id: "certainty",
      label: t.certainty,
      value: (r) => (r.result.certainty === "certain" ? t.certain : t.suggestion),
      render: (r) => (
        <Badge variant={r.result.certainty === "certain" ? "default" : "outline"}>
          {r.result.certainty === "certain" ? t.certain : t.suggestion}
        </Badge>
      ),
      width: 96,
    },
    {
      id: "books",
      label: t.books,
      value: (r) => (r.bookLabels?.length ? r.bookLabels.join(", ") : t.allBooks),
    },
    {
      id: "status",
      label: t.status,
      value: (r) => (r.active ? "active" : "inactive"),
      render: (r) => (
        <StatusBadge
          status={r.active ? "active" : "inactive"}
          config={{
            active: { label: t.activate, tone: "success" },
            inactive: { label: t.deactivate, tone: "neutral" },
          }}
        />
      ),
      width: 96,
    },
  ];
  return (
    <div {...rest} data-slot="bank-rule-list" className="min-w-0">
      <DataGrid
        storageKey={storageKey}
        title={t.title}
        showTitle
        rows={rules}
        columns={columns}
        rowKey={(r) => r.id}
        defaultSort="order"
        emptyTitle={t.empty}
        addAction={onAdd && !readOnly ? { label: t.add, onClick: onAdd } : undefined}
        onEditRow={onEdit && !readOnly ? (r) => onEdit(r.id) : undefined}
        rowActions={
          readOnly
            ? undefined
            : (r) => (
                <>
                  {onDuplicate ? (
                    <GridAction
                      title={t.duplicate}
                      aria-label={t.duplicate}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate(r.id);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </GridAction>
                  ) : null}
                  {onActiveChange ? (
                    <GridAction
                      title={r.active ? t.deactivate : t.activate}
                      aria-label={r.active ? t.deactivate : t.activate}
                      onClick={(event) => {
                        event.stopPropagation();
                        onActiveChange(r.id, !r.active);
                      }}
                    >
                      <Power className="size-3.5" />
                    </GridAction>
                  ) : null}
                </>
              )
        }
        contextRight={
          onReorder ? (
            <span className="text-xs text-muted-foreground" data-reorder-hint="">
              {t.order}
            </span>
          ) : undefined
        }
      />
    </div>
  );
}
