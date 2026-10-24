/** Podání DPH · vlastní stav a potvrzení · nesmí ukládat podání ani zámky. */
import { forwardRef, useId, useState, type ComponentPropsWithoutRef } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { StatusBadge } from "../data-display/status-badge";
import { OptionSelect } from "../form/option-select";
import { ConfirmByTypingDialog } from "../feedback/confirm-by-typing-dialog";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../lib/format";
import { vatFilingKinds } from "./vat-report-model";
import type { VatFilingForm, VatFilingKind } from "./vat-report-types";
/** Akce a oprávnění dodává APP přítomností callbacku. */
export interface VatFilingActions {
  /** Vytvoření snímku. */ onCreate?: () => void;
  /** Stažení již připraveného XML. */ onDownloadXml?: () => void;
  /** Ruční označení podání. */ onMarkFiled?: () => void;
  /** Vytvoření dodatečného či následného. */ onCreateCorrection?: () => void;
  /** Odemknutí po potvrzení s důvodem. */ onUnlock?: (reason: string) => Promise<void>;
}
/** Parametry lišty podání. */
export interface VatFilingBarProps extends ComponentPropsWithoutRef<"div"> {
  /** Typ formuláře. */ form: VatFilingForm;
  /** Stav APP. */ status: "open" | "filed" | "changed";
  /** Druh podání APP. */ kind: VatFilingKind;
  /** Požadavek změny druhu. */ onKindChange?: (kind: VatFilingKind) => void;
  /** Datum podání ISO. */ filedAt?: string;
  /** Podal. */ filedBy?: string;
  /** Povolené akce. */ actions?: VatFilingActions;
  /** Přesný text k opsání při odemknutí. */ confirmText: string;
  /** Zakáže akce během běhu APP. */ disabled?: boolean;
}
/** Stav a akce podání; odemknutí vyžaduje neprázdný důvod i opsání. */
export const VatFilingBar = forwardRef<HTMLDivElement, VatFilingBarProps>(function VatFilingBar(
  {
    form,
    status,
    kind,
    onKindChange,
    filedAt,
    filedBy,
    actions = {},
    confirmText,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const t = useDsTexts().vatReports;
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const kinds = vatFilingKinds(form);
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-3 border-y bg-muted/40 py-3",
        className,
      )}
    >
      <StatusBadge
        status={status}
        config={{
          open: { label: t.states.open, tone: "neutral" },
          filed: { label: t.states.filed, tone: "success" },
          changed: { label: t.states.changed, tone: "warning" },
        }}
      />
      {filedAt ? (
        <span className="text-sm">
          {formatDate(filedAt.slice(0, 10))}
          {filedBy ? ` · ${filedBy}` : ""}
        </span>
      ) : null}
      <OptionSelect
        ariaLabel={t.filingKind}
        className="w-auto"
        value={kind}
        disabled={disabled || !onKindChange}
        allowEmpty={false}
        options={kinds.map((value) => ({ value, label: t.kinds[value] }))}
        onChange={(value) => {
          const next = kinds.find((k) => k === value);
          if (next) onKindChange?.(next);
        }}
      />
      <div className="flex min-w-0 flex-wrap gap-2">
        {actions.onCreate ? (
          <Button type="button" disabled={disabled} onClick={actions.onCreate}>
            {t.create}
          </Button>
        ) : null}
        {actions.onDownloadXml ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={actions.onDownloadXml}
          >
            {t.download}
          </Button>
        ) : null}
        {actions.onMarkFiled ? (
          <Button type="button" variant="outline" disabled={disabled} onClick={actions.onMarkFiled}>
            {t.markFiled}
          </Button>
        ) : null}
        {actions.onCreateCorrection ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={actions.onCreateCorrection}
          >
            {form === "return" ? t.additional : t.subsequent}
          </Button>
        ) : null}
        {actions.onUnlock ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => {
              setReason("");
              setOpen(true);
            }}
          >
            {t.unlock}
          </Button>
        ) : null}
      </div>
      <ConfirmByTypingDialog
        open={open}
        onOpenChange={setOpen}
        title={t.unlock}
        confirmText={confirmText}
        confirmLabel={t.unlock}
        description={
          <div className="space-y-3">
            <p>{t.unlockDescription}</p>
            <label htmlFor={reasonId}>{t.reason}</label>
            <Textarea id={reasonId} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        }
        onConfirm={async () => {
          if (!reason.trim()) throw new Error(t.reason);
          await actions.onUnlock?.(reason.trim());
        }}
      />
    </div>
  );
});
