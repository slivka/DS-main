import { useId, type KeyboardEvent } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { AccountSelect, type AccountOption } from "./account-select";
import { DimensionSelect, type DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { VsField } from "./vs-field";
import { DecimalInput } from "../form/decimal-input";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type JournalLine = {
  id: string;
  debitAccount?: string | null;
  creditAccount?: string | null;
  amount: number;
  text?: string;
  dimensionId?: string | null;
  vs?: string;
  partnerId?: string | null;
};

export type JournalLinesEditorTexts = {
  debitAccount: string;
  creditAccount: string;
  amount: string;
  text: string;
  dimension: string;
  vs: string;
  partner: string;
  actions: string;
  addLine: string;
  duplicateLine: string;
  removeLine: string;
  total: string;
  balanced: string;
  difference: string;
  empty: string;
};

export const DEFAULT_JOURNAL_LINES_TEXTS: JournalLinesEditorTexts = {
  debitAccount: "MD účet",
  creditAccount: "DAL účet",
  amount: "Částka",
  text: "Text",
  dimension: "Zakázka",
  vs: "VS",
  partner: "Partner",
  actions: "Akce",
  addLine: "Přidat řádek",
  duplicateLine: "Duplikovat řádek",
  removeLine: "Odebrat řádek",
  total: "Celkem",
  balanced: "Zápis je vyrovnaný",
  difference: "Rozdíl MD/DAL",
  empty: "Zatím zde nejsou žádné řádky",
};

const newId = () => `line-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Editovatelná tabulka řádků účetního zápisu (controlled).
 * Ovládání klávesnicí: Enter přeskočí na další pole, na konci vytvoří nový řádek.
 */
export function JournalLinesEditor({
  lines,
  onChange,
  accounts,
  dimensions = [],
  partners = [],
  readOnly = false,
  expectedTotal,
  texts,
  className,
}: {
  lines: JournalLine[];
  onChange: (lines: JournalLine[]) => void;
  accounts: AccountOption[];
  dimensions?: DimensionOption[];
  partners?: PartnerOption[];
  readOnly?: boolean;
  /** Očekávaná celková částka dokladu; rozdíl se průběžně zvýrazní. */
  expectedTotal?: number;
  texts?: Partial<JournalLinesEditorTexts>;
  className?: string;
}) {
  const t = { ...DEFAULT_JOURNAL_LINES_TEXTS, ...texts };
  const tableId = useId();

  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const difference = expectedTotal === undefined ? 0 : Math.round((expectedTotal - total) * 100) / 100;

  const patch = (id: string, values: Partial<JournalLine>) =>
    onChange(lines.map((line) => (line.id === id ? { ...line, ...values } : line)));

  const addLine = () =>
    onChange([...lines, { id: newId(), amount: 0, debitAccount: null, creditAccount: null }]);

  const duplicate = (line: JournalLine) => {
    const index = lines.findIndex((item) => item.id === line.id);
    const copy = { ...line, id: newId() };
    onChange([...lines.slice(0, index + 1), copy, ...lines.slice(index + 1)]);
  };

  const remove = (id: string) => onChange(lines.filter((line) => line.id !== id));

  /** Enter posune kurzor na další pole; na posledním poli přidá nový řádek. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" || readOnly) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "BUTTON" && target.getAttribute("role") !== "combobox") return;
    const root = document.getElementById(tableId);
    if (!root) return;
    const fields = Array.from(
      root.querySelectorAll<HTMLElement>("input, [role='combobox']"),
    ).filter((element) => !(element as HTMLInputElement).disabled);
    const index = fields.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    const next = fields[index + 1];
    if (next) next.focus();
    else addLine();
  };

  return (
    <div className={cn("rounded-lg border bg-card", className)} id={tableId} onKeyDown={onKeyDown}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">{t.debitAccount}</TableHead>
            <TableHead className="w-[220px]">{t.creditAccount}</TableHead>
            <TableHead className="w-[140px] text-right">{t.amount}</TableHead>
            <TableHead>{t.text}</TableHead>
            <TableHead className="w-[200px]">{t.dimension}</TableHead>
            <TableHead className="w-[120px]">{t.vs}</TableHead>
            <TableHead className="w-[220px]">{t.partner}</TableHead>
            {readOnly ? null : (
              <TableHead className="w-[104px] text-right">{t.actions}</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.length === 0 ? (
            <TableRow>
              <TableCell colSpan={readOnly ? 7 : 8} className="py-8 text-center text-muted-foreground">
                {t.empty}
              </TableCell>
            </TableRow>
          ) : (
            lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <AccountSelect
                    accounts={accounts}
                    value={line.debitAccount ?? ""}
                    onChange={(value) => patch(line.id, { debitAccount: value })}
                    disabled={readOnly}
                  />
                </TableCell>
                <TableCell>
                  <AccountSelect
                    accounts={accounts}
                    value={line.creditAccount ?? ""}
                    onChange={(value) => patch(line.id, { creditAccount: value })}
                    disabled={readOnly}
                  />
                </TableCell>
                <TableCell>
                  <DecimalInput
                    value={line.amount}
                    onChange={(value) => patch(line.id, { amount: value })}
                    decimals={2}
                    disabled={readOnly}
                    aria-label={t.amount}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={line.text ?? ""}
                    onChange={(event) => patch(line.id, { text: event.target.value })}
                    disabled={readOnly}
                    aria-label={t.text}
                    className="h-9"
                  />
                </TableCell>
                <TableCell>
                  <DimensionSelect
                    options={dimensions}
                    value={line.dimensionId ?? ""}
                    onChange={(value) => patch(line.id, { dimensionId: value })}
                    disabled={readOnly || dimensions.length === 0}
                  />
                </TableCell>
                <TableCell>
                  <VsField
                    value={line.vs ?? ""}
                    onChange={(value) => patch(line.id, { vs: value })}
                    disabled={readOnly}
                    aria-label={t.vs}
                  />
                </TableCell>
                <TableCell>
                  <PartnerSelect
                    partners={partners}
                    value={line.partnerId ?? ""}
                    onChange={(value) => patch(line.id, { partnerId: value })}
                    disabled={readOnly || partners.length === 0}
                  />
                </TableCell>
                {readOnly ? null : (
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.duplicateLine}
                            onClick={() => duplicate(line)}
                          >
                            <Copy className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.duplicateLine}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.removeLine}
                            className="text-destructive"
                            onClick={() => remove(line.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t.removeLine}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-semibold">
              {t.total}
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {formatAmount(total, 2)}
            </TableCell>
            <TableCell colSpan={readOnly ? 4 : 5}>
              {expectedTotal === undefined ? null : difference === 0 ? (
                <span className="text-sm text-muted-foreground">{t.balanced}</span>
              ) : (
                <span className={cn("text-sm font-semibold", amountClass(-Math.abs(difference)))}>
                  {`${t.difference}: ${formatAmount(difference, 2)}`}
                </span>
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {readOnly ? null : (
        <div className="border-t p-2">
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            <Plus className="size-4" />
            {t.addLine}
          </Button>
        </div>
      )}
    </div>
  );
}
