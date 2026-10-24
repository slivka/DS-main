/** Šablona výkazu · strom řádků s mapováním, typem a pořadím · nesmí validovat ani ukládat (dělá APP). */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { TooltipProvider } from "../../ui/tooltip";
import { GridAction } from "../grid/grid-action";
import { OptionSelect } from "../form/option-select";
import { MultiSelect } from "../form/multi-select";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { moveTemplateRow, removeTemplateRow, templateRowDepth } from "./statement-template-model";
import type { StatementMappingOption, StatementTemplateRow } from "./statement-types";

/** Parametry editoru šablony. */
export interface StatementTemplateEditorProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Řízené řádky šablony v pořadí zobrazení. */
  rows: StatementTemplateRow[];
  /** Změna řádků. */
  onChange: (rows: StatementTemplateRow[]) => void;
  /** Účty a skupiny k mapování z dat APP. */
  mappingOptions: StatementMappingOption[];
  /** Chyby validace od APP podle id řádku. */
  issues?: Record<string, string>;
  /** Generátor id nového řádku. */
  createRowId?: () => string;
  /** Jen ke čtení. */
  readOnly?: boolean;
}

/** Editor šablony výkazu: přidání, odebrání, přetažení, typ a mapování řádků. */
export const StatementTemplateEditor = forwardRef<HTMLDivElement, StatementTemplateEditorProps>(
  function StatementTemplateEditor(
    {
      rows,
      onChange,
      mappingOptions,
      issues,
      createRowId = () => crypto.randomUUID(),
      readOnly,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().statements;
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const update = (id: string, patch: Partial<StatementTemplateRow>) =>
      onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    const parentOptions = (id: string) => [
      { value: "", label: t.noParent },
      ...rows
        .filter((row) => row.id !== id && row.kind === "sum")
        .map((row) => ({ value: row.id, label: `${row.mark} ${row.label}`.trim() })),
    ];
    return (
      <TooltipProvider>
        <div
          ref={ref}
          data-slot="statement-template-editor"
          {...props}
          className={cn("min-w-0 space-y-3", className)}
        >
          <ol aria-label={t.templateTitle} className="space-y-1">
            {rows.map((row, index) => {
              const issue = issues?.[row.id];
              return (
                <li
                  key={row.id}
                  data-row-id={row.id}
                  draggable={!readOnly}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => {
                    if (dragIndex !== null) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragIndex !== null) onChange(moveTemplateRow(rows, dragIndex, index));
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "rounded-md border bg-card px-2 py-1",
                    dragIndex === index && "opacity-50",
                    issue && "border-destructive",
                  )}
                  style={{ marginInlineStart: `${templateRowDepth(rows, row) * 1.25}rem` }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <GripVertical
                      className="size-4 shrink-0 cursor-grab text-muted-foreground"
                      aria-label={t.dragHandle}
                    />
                    <Input
                      aria-label={t.mark}
                      value={row.mark}
                      disabled={readOnly}
                      className="w-20"
                      onChange={(event) => update(row.id, { mark: event.target.value })}
                    />
                    <Input
                      aria-label={t.name}
                      value={row.label}
                      disabled={readOnly}
                      className="min-w-40 flex-1"
                      onChange={(event) => update(row.id, { label: event.target.value })}
                    />
                    <OptionSelect
                      ariaLabel={t.rowType}
                      value={row.kind}
                      allowEmpty={false}
                      disabled={readOnly}
                      className="w-32"
                      onChange={(next) => update(row.id, { kind: next as "sum" | "mapped" })}
                      options={(["sum", "mapped"] as const).map((kind) => ({
                        value: kind,
                        label: t.rowTypes[kind],
                      }))}
                    />
                    <OptionSelect
                      ariaLabel={t.parent}
                      value={row.parentId ?? ""}
                      allowEmpty={false}
                      disabled={readOnly}
                      className="w-44"
                      onChange={(next) => update(row.id, { parentId: next || null })}
                      options={parentOptions(row.id)}
                    />
                    {row.kind === "mapped" ? (
                      <MultiSelect
                        aria-label={t.mapping}
                        className="w-48"
                        options={mappingOptions}
                        selected={row.mapping}
                        onChange={(mapping) => update(row.id, { mapping })}
                        allLabel={t.mappingAll}
                        itemsLabel={t.mappingItems}
                      />
                    ) : null}
                    {!readOnly ? (
                      <span className="ml-auto flex items-center gap-1">
                        <GridAction
                          aria-label={t.moveUp}
                          disabled={index === 0}
                          onClick={() => onChange(moveTemplateRow(rows, index, index - 1))}
                        >
                          <ArrowUp className="size-4" aria-hidden />
                        </GridAction>
                        <GridAction
                          aria-label={t.moveDown}
                          disabled={index === rows.length - 1}
                          onClick={() => onChange(moveTemplateRow(rows, index, index + 1))}
                        >
                          <ArrowDown className="size-4" aria-hidden />
                        </GridAction>
                        <GridAction
                          aria-label={t.removeRow}
                          tone="destructive"
                          onClick={() => onChange(removeTemplateRow(rows, row.id))}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </GridAction>
                      </span>
                    ) : null}
                  </div>
                  {issue ? (
                    <p role="alert" className="mt-1 text-sm text-destructive">
                      {issue}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
          {!readOnly ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onChange([
                  ...rows,
                  { id: createRowId(), parentId: null, mark: "", label: "", kind: "mapped", mapping: [] },
                ])
              }
            >
              {t.addRow}
            </Button>
          ) : null}
        </div>
      </TooltipProvider>
    );
  },
);
