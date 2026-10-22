/**
 * Horní část formuláře dokladu · vlastní nadpis se stavem, lištu akcí s živým pruhem a banner
 * jen pro čtení · nesmí počítat položky pruhu ani měnit hodnoty.
 */
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useDsTexts } from "../../../../ds-texts";
import type { DsTexts } from "../../../../ds-texts";
import type { FormIssue } from "../../../../lib/form-issues";
import { ReadOnlyBanner } from "../../feedback/read-only-banner";
import { PageHeader } from "../../layout/page-header";
import { RecordActionBar, type RecordMoreAction } from "../../layout/record-action-bar";
import { DocumentStatusBadge } from "../document-status-badge";
import { DocumentVatActionStatus, UnverifiedSupplierBadge } from "./document-vat-action-status";
import type { DocumentFormProps, DocumentFormTexts, DocumentSaveAction } from "./document-form-types";

/** Vlastnosti horní části. */
export interface DocumentFormTopProps {
  /** Vlastnosti formuláře. */
  props: DocumentFormProps;
  /** Nadpis. */
  title: ReactNode;
  /** Nabídka dalších akcí. */
  moreActions: RecordMoreAction[];
  /** Položky živého pruhu. */
  issues: FormIssue[];
  /** Provozní pruhy. */
  notices: ReactNode;
  /** Doklad vstupuje do DPH. */
  vatRelevant: boolean;
  /** Dodavatel je zadaný ručně (neověřený) – štítek vedle „Vstupuje do DPH“. */
  manualSupplier?: boolean;
  /** Změna vstupu do DPH. */
  onVatRelevantChange: (next: boolean) => void;
  /** Texty formuláře včetně DsTexts. */
  t: DocumentFormTexts & DsTexts["documentForm"];
}

/**
 * Ctrl/Cmd+S uloží povolený doklad; Ctrl/Cmd+Enter zavolá `onSaveAndClose` (bez tlačítka).
 * Aplikace v `onSaveAndClose` uloží a zavře jen po úspěchu – při chybě formulář zůstává.
 * Zkratku, kterou už zpracoval vnořený prvek (např. Ctrl+Enter = nový řádek), nepřebírá.
 */
export function handleDocumentSaveShortcut(
  event: KeyboardEvent<HTMLDivElement>,
  saveAction?: DocumentSaveAction,
  onSaveAndClose?: () => void,
) {
  if (event.defaultPrevented || !(event.ctrlKey || event.metaKey)) return;
  if (!saveAction || saveAction.disabled || saveAction.busy) return;
  if (event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveAction.onSave();
  } else if (event.key === "Enter" && onSaveAndClose) {
    event.preventDefault();
    onSaveAndClose();
  }
}

/** Nadpis, lišta akcí s pruhem a banner jen pro čtení. */
export function DocumentFormTop({
  props: p,
  title,
  moreActions,
  issues,
  notices,
  vatRelevant,
  manualSupplier,
  onVatRelevantChange,
  t,
}: DocumentFormTopProps) {
  const dsTexts = useDsTexts();
  // Stav dokladu je štítek; pruh upozornění zůstává jen pro věci, které jde opravit.
  const counterpartyStatus = manualSupplier ? (
    <UnverifiedSupplierBadge label={t.unverifiedSupplier} hint={t.unverifiedSupplierHint} />
  ) : null;
  return (
    <>
      <PageHeader
        title={title}
        panelToggle={p.panelToggle}
        titleBadge={
          <span
            data-slot="document-title-badges"
            className="inline-flex h-[1.625rem] shrink-0 items-center gap-1.5 whitespace-nowrap [&_[data-slot=badge]]:h-[1.625rem] [&_[data-slot=badge]]:px-2.5 [&_[data-slot=badge]]:text-sm"
          >
            <DocumentStatusBadge status={p.status} approved={p.approved} size="md" />
            {p.titleBadges}
          </span>
        }
      />
      <RecordActionBar
        leftContent={
          <>
            {p.actionBarContent}
            {p.vat?.visible ? (
              <DocumentVatActionStatus
                checked={vatRelevant}
                readOnly={p.vat.relevantReadOnly}
                onCheckedChange={onVatRelevantChange}
                status={p.vatPartnerStatus}
                counterpartyStatus={counterpartyStatus}
                texts={t}
              />
            ) : (
              counterpartyStatus
            )}
          </>
        }
        saveAction={p.saveAction}
        primaryAction={p.primaryAction}
        moreActions={moreActions}
        error={p.error}
        issues={issues}
        saveFailed={p.saveFailed}
        onIssuesClose={p.onIssuesClose}
        notices={notices}
        saveLabel={dsTexts.common.save}
        moreActionsLabel={dsTexts.recordAction.moreActions}
        errorTitle={t.errorTitle}
        closeErrorLabel={t.closeError}
        dataSlot="document-action-bar"
        errorDataSlot="document-form-error"
        noticesDataSlot="document-form-notices"
      />
      {p.readOnly && p.readOnlyReason ? (
        <ReadOnlyBanner
          reason={p.readOnlyReason}
          title={p.readOnlyTitle}
          actions={p.readOnlyActions}
        />
      ) : null}
    </>
  );
}

/** Aktivní záložka spodní části: řízená, jinak vlastní stav (výchozí řádky). */
export function useDetailTab(
  active: string | undefined,
  onChange?: (tabId: string) => void,
): [string, (next: string) => void] {
  const [own, setOwn] = useState("lines");
  return [
    active ?? own,
    (next) => {
      if (active === undefined) setOwn(next);
      onChange?.(next);
    },
  ];
}
