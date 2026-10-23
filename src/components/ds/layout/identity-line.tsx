/** Identita formuláře · vlastní oddělovače, číslo a bezpřekryvové rozvržení · nesmí znát doménu ani měnit data. */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { TruncatedText } from "../data-display/truncated-text";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useIdentityLayout } from "./use-identity-layout";
import { Info } from "lucide-react";

/** Vlastnosti společného řádku identity. */
export interface IdentityLineProps extends ComponentPropsWithoutRef<"div"> {
  /** Položky identity ve stanoveném pořadí; poslední položka smí ustoupit (zkrátit se). */
  items: ReactNode[];
  /** Volitelný příznak před první položkou. */
  leading?: ReactNode;
  /** Číslo vpravo; prázdné číslo nahradí fallback. */
  number?: string | null;
  /** Volitelný ovládací prvek čísla vpravo; má přednost před number a fallback. */
  numberContent?: ReactNode;
  /** Text před přidělením čísla; text se zkracuje trojtečkou s bublinou. */
  fallback?: ReactNode;
  /** Krátký stav při nedostatku místa; plný fallback zůstává v bublině a názvu. */
  fallbackShort?: string;
  /** Kód první položky pro krajní šířku; plný název zůstává dostupný. */
  bookCode?: string;
  /** Plná identita pro bublinu a přístupný název při ořezu. */
  fullLabel?: string;
  /** Id prvku čísla (fokus z chybového pruhu). */
  numberId?: string;
}

/**
 * Společná identita dokladu i výpisu. Nic se nepřekrývá: poslední položka (účet) se zkracuje,
 * pak ustoupí stav a nakonec kniha. Řádek nikdy nemění výšku ani se nezalamuje.
 */
export const IdentityLine = forwardRef<HTMLDivElement, IdentityLineProps>(function IdentityLine(
  {
    items,
    leading,
    number,
    numberContent,
    fallback,
    fallbackShort,
    bookCode,
    fullLabel,
    numberId,
    className,
    ...props
  },
  ref,
) {
  const { rowRef, level } = useIdentityLayout();
  const pending = !number && !numberContent;
  const fullStatus = numberContent ?? (number || fallback);
  const statusText = pending && level >= 2 && fallbackShort ? fallbackShort : fullStatus;
  const status =
    typeof statusText === "string" ? (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              aria-label={typeof fullStatus === "string" ? fullStatus : undefined}
              className="block min-w-0 truncate"
              data-slot="identity-status-text"
            >
              {pending && level >= 7 ? <Info aria-hidden="true" className="size-4" /> : statusText}
            </span>
          </TooltipTrigger>
          <TooltipContent>{fullStatus}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      statusText
    );
  const last = items.length - 1;
  return (
    <div
      ref={ref}
      data-slot="identity-line"
      {...props}
      className={cn("mb-3 border-b border-border pb-3", className)}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={rowRef}
              data-slot="identity-line-row"
              data-identity-level={level}
              data-pending={pending ? "true" : "false"}
              aria-label={fullLabel}
              tabIndex={level >= 8 ? 0 : undefined}
              className="ds-identity-row relative flex h-[var(--control-h)] min-w-0 items-center gap-3"
            >
              <div
                data-slot="identity-line-items"
                className="ds-identity-items flex min-w-0 flex-nowrap items-center whitespace-nowrap text-[length:var(--text-identity)] font-semibold text-foreground"
              >
                {leading ? <span className="inline-flex shrink-0">{leading}</span> : null}
                {items.map((item, index) => (
                  <span
                    key={index}
                    data-slot="identity-line-item"
                    data-identity-first={index === 0 ? "true" : undefined}
                    className={cn(
                      "ds-identity-item flex items-center",
                      index === last ? "min-w-0" : "shrink-0",
                    )}
                  >
                    {index > 0 || leading ? (
                      <span aria-hidden="true" className="mx-2 h-4 w-px shrink-0 bg-border" />
                    ) : null}
                    {index === 0 ? (
                      <>
                        <span className="ds-identity-book-full min-w-0">
                          {typeof item === "string" ? <TruncatedText text={item} /> : item}
                        </span>
                        {bookCode ? (
                          <span className="ds-identity-book-code">{bookCode}</span>
                        ) : null}
                      </>
                    ) : (
                      item
                    )}
                  </span>
                ))}
              </div>
              <div
                id={numberId}
                data-slot="identity-line-number"
                className={cn(
                  "ds-identity-status flex h-[var(--control-h)] min-w-0 items-center justify-end whitespace-nowrap text-right font-mono text-xl font-bold tabular-nums",
                  pending &&
                    "overflow-hidden font-sans text-sm font-normal italic text-muted-foreground",
                )}
              >
                {status}
              </div>
            </div>
          </TooltipTrigger>
          {fullLabel ? <TooltipContent>{fullLabel}</TooltipContent> : null}
        </Tooltip>
      </TooltipProvider>
      <div
        aria-hidden="true"
        inert
        className="ds-identity-measure absolute invisible pointer-events-none"
      >
        <div data-slot="identity-measure-full" data-identity-measure />
        <div data-slot="identity-measure-minimum" data-identity-measure />
        <span data-slot="identity-measure-code" className="block w-max text-[length:var(--text-identity)] font-semibold">
          {bookCode}
        </span>
        <span
          data-slot="identity-measure-status"
          className={cn(
            "block w-max whitespace-nowrap",
            pending ? "text-sm italic" : "font-mono text-xl font-bold",
          )}
        >
          {typeof fullStatus === "string" ? fullStatus : null}
        </span>
        <span
          data-slot="identity-measure-short"
          className={cn(
            "block w-max whitespace-nowrap",
            pending ? "text-sm italic" : "font-mono text-xl font-bold",
          )}
        >
          {fallbackShort ?? (typeof fullStatus === "string" ? fullStatus : null)}
        </span>
      </div>
    </div>
  );
});
