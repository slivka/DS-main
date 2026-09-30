import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { cn } from "../../../lib/utils";

export interface PageTabItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface PageTabsProps extends React.ComponentPropsWithoutRef<typeof Tabs> {
  items: PageTabItem[];
  listLabel?: string;
  className?: string;
}

/** Přepínač rovnocenných sekcí stránky pod hlavním nadpisem. */
export const PageTabs = React.forwardRef<HTMLDivElement, PageTabsProps>(function PageTabs(
  { items, listLabel = "Sekce stránky", className, children, ...props },
  ref,
) {
  return (
    <Tabs ref={ref} className={cn("min-w-0", className)} {...props}>
      <TabsList
        aria-label={listLabel}
        className="h-10 gap-1 rounded-none border-b bg-transparent p-0"
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="relative h-10 rounded-none border-b-2 border-transparent px-3 py-2 text-base font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
});
