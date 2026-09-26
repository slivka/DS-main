import * as React from "react";

import { cn } from "../../../lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 2 | 3;
}

/** Jednotný nadpis sekce formuláře, dialogu, karty nebo panelu. */
export const SectionHeading = React.forwardRef<HTMLHeadingElement, SectionHeadingProps>(
  ({ level = 2, className, children, ...props }, ref) => {
    const Heading = level === 3 ? "h3" : "h2";
    return (
      <Heading
        ref={ref}
        className={cn(
          "section-heading mb-3 mt-5 border-b pb-1 text-[0.8125rem] font-semibold tracking-wide text-foreground first:mt-0",
          className,
        )}
        {...props}
      >
        {children}
      </Heading>
    );
  },
);
SectionHeading.displayName = "SectionHeading";