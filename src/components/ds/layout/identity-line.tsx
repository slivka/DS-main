/** Identita formuláře · vlastní oddělovače a číslo · nesmí znát doménu ani měnit data. */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "../../../lib/utils";

/** Vlastnosti společného řádku identity. */
export interface IdentityLineProps extends ComponentPropsWithoutRef<"div"> {
  /** Položky identity ve stanoveném pořadí. */
  items: ReactNode[];
  /** Volitelný příznak před první položkou. */
  leading?: ReactNode;
  /** Číslo vpravo; prázdné číslo nahradí fallback. */
  number?: string | null;
  /** Volitelný ovládací prvek čísla vpravo; má přednost před number a fallback. */
  numberContent?: ReactNode;
  /** Text před přidělením čísla. */
  fallback?: ReactNode;
  /** Id prvku čísla (fokus z chybového pruhu). */
  numberId?: string;
}

/** Společná identita dokladu i výpisu. */
export const IdentityLine = forwardRef<HTMLDivElement, IdentityLineProps>(function IdentityLine(
  { items, leading, number, numberContent, fallback, numberId, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="identity-line"
      {...props}
      className={cn("mb-3 border-b border-border pb-3", className)}
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,auto)] items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-y-1 text-[length:var(--text-identity)] font-semibold text-foreground">
          {leading}
          {items[0] != null ? (
            <span className="flex min-w-0 items-center">
              {leading ? <span aria-hidden="true" className="mx-2 h-4 w-px bg-border" /> : null}
              {items[0]}
            </span>
          ) : null}
          {items.length > 1 ? (
            <span className="flex min-w-0 flex-wrap items-center @max-[40rem]:basis-full">
              {items.slice(1).map((item, index) => (
                <span key={index} className="flex min-w-0 items-center">
                  <span
                    aria-hidden="true"
                    className={cn("mx-2 h-4 w-px bg-border", index === 0 && "@max-[40rem]:hidden")}
                  />
                  {item}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        <div
          id={numberId}
          className={cn(
            "self-center min-w-0 max-w-full text-right font-mono text-xl font-bold tabular-nums",
            !number &&
              !numberContent &&
              "max-w-48 font-sans text-sm font-normal italic leading-tight text-muted-foreground",
          )}
        >
          {numberContent ?? (number || fallback)}
        </div>
      </div>
    </div>
  );
});
