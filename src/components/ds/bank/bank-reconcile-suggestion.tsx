/**
 * Řádek návrhu rozpoznání pod pohybem.
 * Vlastní: prezentaci návrhu, výběr kandidáta a akce Přijmout / Odmítnout.
 * Nesmí: rozpoznávat ani párovat – kandidáty a výsledek dodává aplikace.
 */
import { Button } from "../../ui/button";
import { OptionSelect } from "../form/option-select";
import { useDsTexts } from "../../../ds-texts";
import { formatAmount, formatCurrency } from "../../../lib/format";
import type { BankMovementRow } from "./bank-types";

/** Props řádku návrhu. */
export interface BankReconcileSuggestionRowProps {
  /** Pohyb s návrhem. */
  row: BankMovementRow;
  /** Přijetí návrhu (s vybraným kandidátem). */
  onAccept: (rowId: string, candidateId?: string) => void;
  /** Odmítnutí návrhu. */
  onReject: (rowId: string) => void;
  /** Změna vybraného kandidáta. */
  onCandidateChange?: (rowId: string, candidateId: string) => void;
  /** Značka měny pro částky kandidátů. */
  currencySymbol: string;
  /** Jen pro čtení. */
  readOnly?: boolean;
}

/** Světlý řádek návrhu s kandidáty a akcemi. */
export function BankReconcileSuggestionRow({
  row,
  onAccept,
  onReject,
  onCandidateChange,
  currencySymbol,
  readOnly,
}: BankReconcileSuggestionRowProps) {
  const t = useDsTexts().bankReconcile;
  const suggestion = row.suggestion;
  if (!suggestion) return null;
  const candidates = suggestion.candidates ?? [];
  const candidateId = suggestion.candidateId ?? candidates[0]?.id ?? null;
  return (
    <div
      data-slot="bank-reconcile-suggestion"
      className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      {suggestion.accountCode ? <span>{suggestion.accountCode}</span> : null}
      {candidates.length > 1 ? (
        <OptionSelect
          ariaLabel={t.candidateLabel}
          value={candidateId}
          onChange={(id) => onCandidateChange?.(row.id, id)}
          options={candidates.map((c) => ({
            value: c.id,
            label: t.candidatePayment
              .replace("{document}", c.label)
              .replace("{remaining}", formatCurrency(c.remaining, currencySymbol)),
          }))}
          allowEmpty={false}
          disabled={readOnly}
          className="min-w-56"
        />
      ) : candidates.length === 1 ? (
        <span>
          {t.candidatePayment
            .replace("{document}", candidates[0].label)
            .replace("{remaining}", formatAmount(candidates[0].remaining))}
          {` ${currencySymbol}`}
        </span>
      ) : null}
      {!readOnly ? (
        <span className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onAccept(row.id, candidateId ?? undefined)}
          >
            {t.accept}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onReject(row.id)}>
            {t.reject}
          </Button>
        </span>
      ) : null}
    </div>
  );
}
