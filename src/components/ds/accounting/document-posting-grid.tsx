/**
 * Záložka Zaúčtování (2.118.0, DPH 5 B) – grid jen ke čtení se všemi stranami deníku dokladu.
 * Vlastní: zobrazení řádků deníku, účty v rozšířené formě a štítky automatických řádků.
 * Nesmí: počítat zaúčtování (vytváří DB) ani ukazovat kontrolní součet MD / DAL.
 */
import * as React from "react";

import { useDsTexts } from "../../../ds-texts";
import type { VatFiveTexts } from "../../../ds-texts/vat-five-texts";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import type { AccountOption } from "./account-select";
import { formatJournalAccountDisplay } from "./journal-lines-model";

/** Druh automatického řádku deníku. */
export type DocumentPostingAutoKind =
  | "vat"
  | "nonDeductible"
  | "advance"
  | "advance_fx"
  | "rounding"
  | "fxRounding";

/** Jeden řádek deníku dokladu. */
export interface DocumentPostingEntry {
  /** Stálé id řádku. */
  id: string;
  /** Popis řádku. */
  text?: string;
  /** Účet MD (uložený tvar 221001). */
  debitAccount?: string | null;
  /** Účet DAL. */
  creditAccount?: string | null;
  /** Částka v měně firmy. */
  amount: number;
  /** Automatický řádek vytvořený DB – zobrazí štítek. */
  auto?: DocumentPostingAutoKind;
}

/** Props záložky Zaúčtování. */
export interface DocumentPostingGridProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Řádky deníku v pořadí z DB. */
  entries: DocumentPostingEntry[];
  /** Účtový rozvrh pro rozšířenou formu účtu. */
  accounts: AccountOption[];
  /** Přepis textů (priorita: prop → DsTextsProvider → čeština). */
  texts?: Partial<VatFiveTexts>;
}

const AUTO_LABEL: Record<DocumentPostingAutoKind, keyof VatFiveTexts> = {
  vat: "autoVat",
  nonDeductible: "autoNonDeductible",
  advance: "autoAdvance",
  advance_fx: "autoAdvanceFx",
  rounding: "autoRounding",
  fxRounding: "autoFxRounding",
};

/** Grid zaúčtování dokladu jen ke čtení. */
export const DocumentPostingGrid = React.forwardRef<HTMLDivElement, DocumentPostingGridProps>(
  function DocumentPostingGrid({ entries, accounts, texts, className, ...props }, ref) {
    const t = { ...useDsTexts().vatFive, ...texts };
    const byCode = React.useMemo(
      () => new Map(accounts.map((account) => [account.code, account])),
      [accounts],
    );
    const account = (code?: string | null) =>
      code ? formatJournalAccountDisplay(code, byCode.get(code)?.name, true) : "";
    return (
      <div
        ref={ref}
        data-slot="document-posting-grid"
        className={cn("overflow-auto rounded-lg border bg-card", className)}
        {...props}
      >
        <Table className="table-fixed">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[26%]" />
            <col className="w-[26%]" />
            <col className="w-[14%]" />
          </colgroup>
          <TableHeader className="grid-column-header">
            <TableRow>
              <TableHead>{t.postingText}</TableHead>
              <TableHead>{t.postingDebit}</TableHead>
              <TableHead>{t.postingCredit}</TableHead>
              <TableHead className="text-right">{t.postingAmount}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                  {t.postingEmpty}
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} data-auto={entry.auto}>
                  <TableCell className="max-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate" title={entry.text}>
                        {entry.text}
                      </span>
                      {entry.auto ? (
                        <span
                          data-slot="document-posting-auto"
                          className="ds-badge inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-1.5 text-xs leading-none text-muted-foreground"
                        >
                          {t[AUTO_LABEL[entry.auto]] as string}
                        </span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="truncate">{account(entry.debitAccount)}</TableCell>
                  <TableCell className="truncate">{account(entry.creditAccount)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono tabular-nums whitespace-nowrap",
                      entry.amount < 0 && "text-destructive",
                    )}
                  >
                    {formatAmount(entry.amount, 2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
);
