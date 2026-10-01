import * as React from "react";

import { cn } from "../../../lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Úroveň nadpisu v osnově stránky. */
  level?: 2 | 3;
  /** Doplňující text nebo štítek vpravo na stejném řádku. */
  aside?: React.ReactNode;
}

/** Jednotný nadpis sekce formuláře, dialogu, karty nebo panelu. */
export const SectionHeading = React.forwardRef<HTMLHeadingElement, SectionHeadingProps>(
  ({ level = 2, aside, className, children, ...props }, ref) => {
    const Heading = level === 3 ? "h3" : "h2";
    return (
      <Heading
        ref={ref}
        className={cn(
          "section-heading mb-3 mt-5 flex min-w-0 items-center justify-between gap-3 border-b pb-1 text-[0.8125rem] font-semibold leading-[1.35] tracking-wide text-foreground first:mt-0",
          className,
        )}
        {...props}
      >
        <span className="min-w-0 truncate whitespace-nowrap">{children}</span>
        {aside ? (
          <span className="shrink-0 text-left font-normal normal-case tracking-normal text-muted-foreground">
            {aside}
          </span>
        ) : null}
      </Heading>
    );
  },
);
SectionHeading.displayName = "SectionHeading";
