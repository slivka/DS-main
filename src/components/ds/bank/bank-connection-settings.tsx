/**
 * Napojení knihy na banku (I4) – sekce ve vlastnostech knihy.
 * Vlastní: prezentaci způsobu, stavu tokenu (nikdy hodnoty), stahování a stavu spojení.
 * Nesmí: znát token, komunikovat s bankou ani ukládat – vše dodává aplikace.
 */
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { OptionSelect } from "../form/option-select";
import { DateField } from "../form/date-field";
import { TimeInputRight } from "../form/time-input-right";
import { CheckboxField } from "../form/checkbox-field";
import { FieldValue } from "../form/field-value";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { NoticeBar } from "../feedback/notice-bar";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { SectionHeading } from "../layout/section-heading";
import { StatusBadge } from "../data-display/status-badge";
import { TooltipProvider } from "../../ui/tooltip";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { BankConnectionValue } from "./bank-types";

/** Props sekce napojení na banku. */
export interface BankConnectionSettingsProps
  extends Omit<ComponentPropsWithoutRef<"section">, "onChange"> {
  /** Hodnota napojení. */
  value: BankConnectionValue;
  /** Změna hodnoty. */
  onChange: (value: BankConnectionValue) => void;
  /** Uložení nového tokenu; hodnota se nevrací do UI. */
  onTokenSave: (token: string, kind: "read" | "payments") => void | Promise<void>;
  /** Otestování spojení. */
  onTest?: () => void;
  /** Stažení teď. */
  onFetchNow?: () => void;
  /** Čas, kdy je další dotaz na Fio možný (ISO); blokace Stáhnout teď. */
  nextAvailableAt?: string | null;
  /** Pozastavení / obnovení. */
  onPausedChange?: (paused: boolean) => void;
  /** Odpojení (po potvrzení). */
  onDisconnect?: () => void;
  /** Nejdřívější povolené Stahovat od (ISO); validace. */
  minFetchFrom?: string;
  /** Jen pro čtení. */
  readOnly?: boolean;
  /** Probíhá operace. */
  busy?: boolean;
}

/** Sekce napojení knihy na banku; token se nikdy nezobrazí. */
export function BankConnectionSettings({
  value,
  onChange,
  onTokenSave,
  onTest,
  onFetchNow,
  nextAvailableAt,
  onPausedChange,
  onDisconnect,
  minFetchFrom,
  readOnly,
  busy,
  className,
  ...rest
}: BankConnectionSettingsProps) {
  const t = useDsTexts().bankConnection;
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tokenValue, setTokenValue] = useState("");
  const [tokenKind, setTokenKind] = useState<"read" | "payments">(value.tokenKind ?? "read");
  const { confirm, confirmDialog } = useConfirmDialog();
  const [now, setNow] = useState(() => Date.now());

  const cooldownSeconds = nextAvailableAt
    ? Math.max(0, Math.ceil((new Date(nextAvailableAt).getTime() - now) / 1000))
    : 0;
  useEffect(() => {
    if (!cooldownSeconds) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const fetchFromTooOld = Boolean(minFetchFrom && value.fetchFrom < minFetchFrom);
  const paused = value.status === "paused";
  const connected = value.method === "fio" && value.status !== "disconnected";

  const statusLabels = {
    active: t.statusActive,
    tokenError: t.statusTokenError,
    error: t.statusError,
    paused: t.statusPaused,
    disconnected: t.statusDisconnected,
  } as const;

  const saveToken = async () => {
    if (!tokenValue.trim()) return;
    await onTokenSave(tokenValue.trim(), tokenKind);
    setTokenValue("");
    setTokenOpen(false);
  };

  return (
    <TooltipProvider>
    <section
      {...rest}
      data-slot="bank-connection-settings"
      className={cn("min-w-0 space-y-4", className)}
    >
      <SectionHeading>{t.title}</SectionHeading>
      <div className="grid max-w-xl gap-3">
        <OptionSelect
          ariaLabel={t.method}
          value={value.method}
          onChange={(method) => onChange({ ...value, method: method as "manual" | "fio" })}
          options={[
            { value: "manual", label: t.methodManual },
            { value: "fio", label: t.methodFio },
            { value: "other", label: `${t.methodOther} (${t.comingSoon})`, disabled: true },
          ]}
          allowEmpty={false}
          disabled={readOnly}
        />
        {value.method === "fio" ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{t.token}</span>
              <FieldValue>
                {value.tokenSaved
                  ? t.tokenSaved
                      .replace("{date}", value.tokenSavedAt ?? "")
                      .replace("{who}", value.tokenSavedBy ?? "")
                  : t.tokenMissing}
              </FieldValue>
              {!readOnly ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setTokenOpen(true)}>
                  {t.changeToken}
                </Button>
              ) : null}
            </div>
            {value.tokenValidTo ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t.tokenValidTo}</span>
                <FieldValue>{value.tokenValidTo}</FieldValue>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">{t.fetchSchedule}</span>
              <span className="text-sm">{t.fetchDaily}</span>
              <TimeInputRight
                value={value.fetchTime}
                onChange={(event) => onChange({ ...value, fetchTime: event.target.value })}
                disabled={readOnly}
                aria-label={t.fetchDaily}
              />
              <CheckboxField
                checked={value.fetchWorkdays}
                onCheckedChange={(fetchWorkdays) => onChange({ ...value, fetchWorkdays })}
                label={t.fetchWorkdays}
                disabled={readOnly}
              />
            </div>
            <div className="grid max-w-xs gap-1">
              <span className="text-sm text-muted-foreground">{t.fetchFrom}</span>
              <DateField
                value={value.fetchFrom}
                onChange={(fetchFrom) => onChange({ ...value, fetchFrom })}
                disabled={readOnly}
                error={fetchFromTooOld ? t.fetchFromTooOld : undefined}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.statements}</span>
              <FieldValue>{t.statementsNote}</FieldValue>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t.status}</span>
              <StatusBadge
                status={value.status}
                config={{
                  active: { label: statusLabels.active, tone: "success" },
                  tokenError: { label: statusLabels.tokenError, tone: "danger" },
                  error: { label: statusLabels.error, tone: "danger" },
                  paused: { label: statusLabels.paused, tone: "warning" },
                  disconnected: { label: statusLabels.disconnected, tone: "neutral" },
                }}
              />
              {value.lastError ? (
                <span className="text-destructive">
                  {t.lastError}: {value.lastError}
                </span>
              ) : null}
              {value.lastSuccess ? (
                <span className="text-muted-foreground">
                  {t.lastSuccess}: {value.lastSuccess}
                </span>
              ) : null}
            </div>
            {!readOnly ? (
              <div className="flex flex-wrap items-center gap-2">
                {onTest ? (
                  <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onTest}>
                    {t.testConnection}
                  </Button>
                ) : null}
                {onFetchNow ? (
                  <DisabledReasonTooltip
                    blocked={cooldownSeconds > 0}
                    content={
                      cooldownSeconds
                        ? t.fetchCooldown.replace("{seconds}", String(cooldownSeconds))
                        : undefined
                    }
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || cooldownSeconds > 0}
                      onClick={onFetchNow}
                    >
                      {cooldownSeconds
                        ? t.fetchCooldown.replace("{seconds}", String(cooldownSeconds))
                        : t.fetchNow}
                    </Button>
                  </DisabledReasonTooltip>
                ) : null}
                {onPausedChange ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => onPausedChange(!paused)}
                  >
                    {paused ? t.resume : t.pause}
                  </Button>
                ) : null}
                {onDisconnect && connected ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      confirm({
                        title: t.disconnect,
                        description: t.disconnectConfirm,
                        confirmLabel: t.disconnect,
                        destructive: true,
                        onConfirm: () => onDisconnect(),
                      })
                    }
                  >
                    {t.disconnect}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
      <Dialog open={tokenOpen} onOpenChange={setTokenOpen}>
        <DialogContent className="sm:max-w-md" data-slot="bank-token-dialog">
          <DialogHeader>
            <DialogTitle>{t.tokenDialogTitle}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void saveToken();
            }}
          >
            <Input
              type="password"
              autoComplete="new-password"
              aria-label={t.tokenField}
              value={tokenValue}
              onChange={(event) => setTokenValue(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t.tokenHint}</p>
            <OptionSelect
              ariaLabel={t.tokenKind}
              value={tokenKind}
              onChange={(kind) => setTokenKind(kind as "read" | "payments")}
              options={[
                { value: "read", label: t.tokenKindRead },
                { value: "payments", label: t.tokenKindPayments },
              ]}
              allowEmpty={false}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTokenOpen(false)}>
                {useDsTexts().confirmByTyping.cancel}
              </Button>
              <Button type="submit" disabled={!tokenValue.trim()}>
                {t.changeToken}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
      {fetchFromTooOld ? <NoticeBar tone="danger">{t.fetchFromTooOld}</NoticeBar> : null}
    </section>
    </TooltipProvider>
  );
}
