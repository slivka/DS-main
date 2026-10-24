/**
 * Dialog odeslání platební dávky do banky (I7).
 * Vlastní: souhrn dávky, upozornění, potvrzení opsáním a stav druhé osoby.
 * Nesmí: odesílat – výsledek potvrzení zpracovává aplikace.
 */
import { ConfirmByTypingDialog } from "../feedback/confirm-by-typing-dialog";
import { useDsTexts } from "../../../ds-texts";

/** Částkový součet dávky v jedné měně. */
export interface PaymentSendAmount {
  /** Zobrazená částka včetně měny. */
  label: string;
}

/** Props dialogu odeslání dávky. */
export interface PaymentOrderSendDialogProps {
  /** Dialog je otevřený. */
  open: boolean;
  /** Změna otevření. */
  onOpenChange: (open: boolean) => void;
  /** Počet plateb. */
  count: number;
  /** Částky po měnách (zobrazené texty). */
  amounts: string[];
  /** Účet plátce (zobrazený text). */
  payerAccount: string;
  /** Druhá osoba a stav schválení (APP); bez hodnoty se sekce skryje. */
  approver?: { name: string; status: string } | null;
  /** Limit dávky (zobrazený text). */
  batchLimit?: string;
  /** Limit dne (zobrazený text). */
  dayLimit?: string;
  /** Text k opsání; výchozí z DsTexts. */
  confirmText?: string;
  /** Odeslání po potvrzení; chyba se zobrazí v dialogu. */
  onConfirm: () => Promise<void>;
}

/** Potvrzení odeslání dávky opsáním textu. */
export function PaymentOrderSendDialog({
  open,
  onOpenChange,
  count,
  amounts,
  payerAccount,
  approver,
  batchLimit,
  dayLimit,
  confirmText,
  onConfirm,
}: PaymentOrderSendDialogProps) {
  const t = useDsTexts().bankPayments;
  return (
    <ConfirmByTypingDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.sendTitle}
      description={t.sendWarning}
      summary={
        <span className="block space-y-1">
          <span className="block font-medium">
            {t.sendSummary
              .replace("{count}", String(count))
              .replace("{amounts}", amounts.join(" · "))}
          </span>
          <span className="block text-muted-foreground">
            {t.payerAccount}: {payerAccount}
          </span>
          {approver ? (
            <span className="block text-muted-foreground">
              {t.approver}: {approver.name} · {t.approverStatus}: {approver.status}
            </span>
          ) : null}
          {batchLimit ? (
            <span className="block text-muted-foreground">
              {t.batchLimit.replace("{limit}", batchLimit)}
            </span>
          ) : null}
          {dayLimit ? (
            <span className="block text-muted-foreground">
              {t.dayLimit.replace("{limit}", dayLimit)}
            </span>
          ) : null}
        </span>
      }
      confirmText={confirmText ?? t.sendConfirmText}
      confirmLabel={t.sendConfirm}
      destructive={false}
      onConfirm={onConfirm}
    />
  );
}
