/** Identita formuláře · vlastní oddělovače, číslo a bezpřekryvové rozvržení · nesmí znát doménu ani měnit data. */
import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../../../lib/utils";
import { TruncatedText } from "../data-display/truncated-text";

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
  /** Id prvku čísla (fokus z chybového pruhu). */
  numberId?: string;
}

const useIsoLayoutEffect = typeof window === "undefined" ? () => undefined : useLayoutEffect;

/**
 * Společná identita dokladu i výpisu. Nic se nepřekrývá: poslední položka (účet) se zkracuje,
 * a když se nevejdou ani pevné položky, přejde číslo / stav na druhý řádek.
 */
export const IdentityLine = forwardRef<HTMLDivElement, IdentityLineProps>(function IdentityLine(
  { items, leading, number, numberContent, fallback, numberId, className, ...props },
  ref,
) {
  const rowRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const [stacked, setStacked] = useState(false);
  const stackedAt = useRef(0);
  const check = () => {
    const row = rowRef.current;
    const left = leftRef.current;
    if (!row || !left) return;
    const width = row.clientWidth;
    if (stacked) {
      // Zpět na jeden řádek zkusíme až při širším řádku, než kdy došlo k zalomení.
      if (width > stackedAt.current + 1) setStacked(false);
      return;
    }
    // Stav se smí zkrátit jen do čitelné šířky (8 rem); pevné položky vlevo se zkrátit nesmí.
    const numberEl = numberRef.current;
    const inner = numberEl?.firstElementChild ?? numberEl;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const statusCut =
      !!numberEl &&
      !!inner &&
      inner.scrollWidth > numberEl.clientWidth + 1 &&
      numberEl.clientWidth < rem * 8;
    if (left.scrollWidth > left.clientWidth + 1 || statusCut) {
      stackedAt.current = width;
      setStacked(true);
    }
  };
  useIsoLayoutEffect(check);
  useIsoLayoutEffect(() => {
    const row = rowRef.current;
    if (!row || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => check());
    observer.observe(row);
    return () => observer.disconnect();
  });
  const pending = !number && !numberContent;
  const status =
    numberContent ??
    (number ||
      (typeof fallback === "string" ? (
        <TruncatedText text={fallback} className="min-w-0" />
      ) : (
        fallback
      )));
  const last = items.length - 1;
  return (
    <div
      ref={ref}
      data-slot="identity-line"
      {...props}
      className={cn("mb-3 border-b border-border pb-3", className)}
    >
      <div
        ref={rowRef}
        data-slot="identity-line-row"
        data-stacked={stacked ? "true" : undefined}
        className={cn(
          "grid min-h-[var(--control-h)] min-w-0 items-center gap-x-3 gap-y-1",
          stacked ? "grid-cols-1" : "grid-cols-[minmax(0,1fr)_minmax(0,auto)]",
        )}
      >
        <div
          ref={leftRef}
          data-slot="identity-line-items"
          className="flex min-w-0 flex-nowrap items-center whitespace-nowrap text-[length:var(--text-identity)] font-semibold text-foreground"
        >
          {leading ? <span className="inline-flex shrink-0">{leading}</span> : null}
          {items.map((item, index) => (
            <span
              key={index}
              data-slot="identity-line-item"
              className={cn("flex items-center", index === last ? "min-w-0" : "shrink-0")}
            >
              {index > 0 || leading ? (
                <span aria-hidden="true" className="mx-2 h-4 w-px shrink-0 bg-border" />
              ) : null}
              {item}
            </span>
          ))}
        </div>
        <div
          ref={numberRef}
          id={numberId}
          data-slot="identity-line-number"
          className={cn(
            "flex min-h-[var(--control-h)] min-w-0 items-center overflow-hidden self-center whitespace-nowrap font-mono text-xl font-bold tabular-nums",
            stacked ? "justify-start text-left" : "justify-end text-right",
            pending && "font-sans text-sm font-normal italic text-muted-foreground",
            pending && !stacked && "max-w-48",
          )}
        >
          {status}
        </div>
      </div>
    </div>
  );
});
