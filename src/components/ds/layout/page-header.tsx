import * as React from "react";
import { cn } from "../../../lib/utils";

/** Hlavička stránky – nadpis, popis a akce vpravo, oddělené spodní linkou. */
export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "@container flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b pb-4",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="typo-title text-primary">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
