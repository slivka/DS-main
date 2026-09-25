import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { cn } from "../../../lib/utils";

export interface PageTabItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface PageTabsProps extends Omit<React.ComponentPropsWithoutRef<typeof Tabs>, "children"> {
  items: PageTabItem[];
  listLabel?: string;
  className?: string;
}

/** Přepínač rovnocenných sekcí stránky pod hlavním nadpisem. */
export const PageTabs = React.forwardRef<HTMLDivElement, PageTabsProps>(function PageTabs(
  { items, listLabel = "Sekce stránky", className, ...props },
  ref,
) {
  return (
    <Tabs ref={ref} className={cn("min-w-0", className)} {...props}>
      <TabsList aria-label={listLabel}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
});