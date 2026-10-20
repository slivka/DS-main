/** Společný řádek/uzel vazby · vlastní obsah · navigaci i práva řídí aplikace. */
import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { cn } from "../../../lib/utils";
import { formatUserDate } from "../../../lib/date-time-preferences";
import { Button } from "../../ui/button";
import { StatusBadge } from "./status-badge";
import { TruncatedText } from "./truncated-text";
import type { LinkedRecordItem, LinkedRecordModifiers } from "./linked-record-types";

export interface LinkedRecordEntryProps extends Omit<ComponentPropsWithoutRef<"button">, "onClick"> {
  item: LinkedRecordItem;
  onOpen: (item: LinkedRecordItem, modifiers: LinkedRecordModifiers) => void;
  variant?: "row" | "node";
}
/** Jediný obsah pro seznam, tok a kandidáty; modifikátory předává bez navigačního kontextu. */
export const LinkedRecordEntry = forwardRef<HTMLButtonElement, LinkedRecordEntryProps>(
  function LinkedRecordEntry({ item, onOpen, variant = "row", className, ...props }, ref) {
    const open = (event: MouseEvent<HTMLButtonElement>) => onOpen(item, {
      ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey,
      target: event.ctrlKey || event.metaKey ? "replace" : "adjacentPane",
    });
    return <Button ref={ref} type="button" variant="ghost" {...props} onClick={open}
      aria-current={item.current ? "true" : undefined}
      className={cn("h-auto min-w-0 max-w-full flex-1 justify-start gap-2 whitespace-normal px-2 py-2 text-left font-normal",
        variant === "node" && "w-full border border-border bg-card",
        item.current && "border-primary bg-primary/10", className)}>
      {item.icon ? <span className="shrink-0 [&>svg]:size-4" aria-hidden="true">{item.icon}</span> : null}
      <span className="block min-w-0 flex-1 space-y-1">
        <span className="flex min-w-0 items-center gap-2">
          <TruncatedText text={item.number} className="min-w-0 flex-1 font-medium" />
          {item.status ? <StatusBadge className="shrink-0" status="value" config={{ value: item.status }} /> : null}
        </span>
        {item.name ? <TruncatedText text={item.name} className="text-xs" /> : null}
        <span className="flex min-w-0 flex-wrap justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="whitespace-nowrap">{formatUserDate(item.at)}</span>
          {item.amount ? <TruncatedText text={`${item.amount}${item.currency ? ` ${item.currency}` : ""}`} className="min-w-0 text-right tabular-nums" /> : null}
        </span>
        {item.relationType ? <TruncatedText text={item.relationType} className="text-xs text-muted-foreground" /> : null}
        {item.note ? <TruncatedText text={item.note} className="text-xs text-muted-foreground" /> : null}
      </span>
    </Button>;
  },
);
