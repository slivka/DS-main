/**
 * Stav DPH partnera a stav protistrany vedle přepínače v pruhu akcí dokladu.
 * Vlastní: přepínač „Vstupuje do DPH“ a stavové štítky · nesmí měnit data dokladu.
 */
import type { ReactNode } from "react";
import { Switch } from "../../../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { StatusBadge } from "../../data-display/status-badge";
import { VatStatusBadge } from "../../data-display/vat-status-badge";
import type { DocumentFormProps, DocumentFormTexts } from "./document-form-types";
import { Field } from "../../layout/form-field-layout";

/** Vlastnosti štítku ručně zadaného dodavatele. */
export interface UnverifiedSupplierBadgeProps {
  /** Text štítku. */
  label: string;
  /** Vysvětlení v bublině. */
  hint: string;
}

/** Žlutý štítek „Neověřený dodavatel“ s vysvětlením v bublině. */
export function UnverifiedSupplierBadge({ label, hint }: UnverifiedSupplierBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          data-slot="document-counterparty-status"
          aria-description={hint}
          className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StatusBadge status="unverified" config={{ unverified: { label, tone: "warning" } }} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

/** Vlastnosti stavu DPH v pruhu akcí. */
export interface DocumentVatActionStatusProps {
  /** Doklad vstupuje do DPH. */
  checked: boolean;
  /** Přepínač jen ke čtení. */
  readOnly?: boolean;
  /** Změna přepínače. */
  onCheckedChange: (value: boolean) => void;
  /** Ověřený stav plátce (jen při zapnutém přepínači). */
  status?: DocumentFormProps["vatPartnerStatus"];
  /** Stav protistrany – zobrazuje se vždy, i při vypnutém přepínači. */
  counterpartyStatus?: ReactNode;
  /** Texty. */
  texts: DocumentFormTexts & { vatVerified: (date: string) => string };
}

export function DocumentVatActionStatus({
  checked,
  readOnly,
  onCheckedChange,
  status,
  counterpartyStatus,
  texts,
}: DocumentVatActionStatusProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Field htmlFor="document-vatRelevant" className="shrink-0 [&[data-suggestion=uncertain]_.ds-field-control]:pr-6">
      <label className="flex h-[var(--control-h)] items-center gap-2 whitespace-nowrap text-sm font-medium">
        <Switch
          id="document-vatRelevant"
          checked={checked}
          disabled={readOnly}
          onCheckedChange={onCheckedChange}
          aria-label={texts.vatRelevant}
        />
        {texts.vatRelevant}
      </label>
      </Field>
      {counterpartyStatus}
      {checked && status ? (
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          <VatStatusBadge status={status.status} unreliableSince={status.unreliableSince} />
          {status.checkedAt ? (
            <span
              className="hidden truncate text-xs text-muted-foreground @min-[44rem]:inline"
              title={texts.vatVerified(status.checkedAt)}
            >
              {texts.vatVerified(status.checkedAt)}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
