/**
 * Pruh napojení na banku (I4) a štítek průběžného výpisu.
 * Vlastní: prezentaci stavu spojení a akce; token se nikdy nezobrazí.
 * Nesmí: odvozovat stav – barvu a texty volí aplikace přes props.
 */
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { NoticeBar } from "../feedback/notice-bar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/** Stav pruhu napojení. */
export type BankConnectionBannerState =
  | { tone: "connected"; date: string; newCount: number }
  | { tone: "tokenExpires"; days: number }
  | { tone: "error"; reason: string };

/** Props pruhu napojení. */
export interface BankConnectionBannerProps extends ComponentPropsWithoutRef<"div"> {
  /** Stav pruhu. */
  state: BankConnectionBannerState;
  /** Akce Stáhnout teď (jen connected). */
  onFetchNow?: () => void;
  /** Akce Změnit token (jen error / tokenExpires). */
  onChangeToken?: () => void;
  /** Blokace Stáhnout teď – zbývající sekundy. */
  fetchCooldownSeconds?: number;
}

/** Pruh stavu napojení na stránce Banka a ve výpisu. */
export function BankConnectionBanner({
  state,
  onFetchNow,
  onChangeToken,
  fetchCooldownSeconds = 0,
  className,
  ...rest
}: BankConnectionBannerProps) {
  const t = useDsTexts().bankConnection;
  const tone = state.tone === "connected" ? "success" : state.tone === "tokenExpires" ? "warning" : "danger";
  const text =
    state.tone === "connected"
      ? t.bannerConnected
          .replace("{date}", state.date)
          .replace("{count}", String(state.newCount))
      : state.tone === "tokenExpires"
        ? t.bannerTokenExpires.replace("{days}", String(state.days))
        : `${t.bannerError}: ${state.reason}`;
  return (
    <div {...rest} data-slot="bank-connection-banner" className={cn("min-w-0", className)}>
      <NoticeBar tone={tone}>
        <span className="flex flex-wrap items-center gap-2">
          {text}
          {state.tone === "connected" && onFetchNow ? (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              disabled={fetchCooldownSeconds > 0}
              onClick={onFetchNow}
            >
              {fetchCooldownSeconds
                ? t.fetchCooldown.replace("{seconds}", String(fetchCooldownSeconds))
                : t.fetchNow}
            </Button>
          ) : null}
          {state.tone !== "connected" && onChangeToken ? (
            <Button type="button" variant="link" className="h-auto p-0" onClick={onChangeToken}>
              {t.changeToken}
            </Button>
          ) : null}
        </span>
      </NoticeBar>
    </div>
  );
}

/** Props štítku průběžného výpisu. */
export interface BankOngoingBadgeProps extends ComponentPropsWithoutRef<"span"> {
  /** Vlastní popisek; výchozí z DsTexts. */
  label?: string;
}

/** Štítek „Průběžný“ u výpisu z API; vysvětlení v bublině. */
export function BankOngoingBadge({ label, className, ...rest }: BankOngoingBadgeProps) {
  const t = useDsTexts().bankConnection;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            {...rest}
            data-slot="bank-ongoing-badge"
            className={cn("cursor-help", className)}
          >
            {label ?? t.ongoing}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{t.ongoingHint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
