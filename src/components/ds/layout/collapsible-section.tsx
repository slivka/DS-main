import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { cn } from "../../../lib/utils";

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** Nepovinný obsah v pravé části hlavičky (např. badge). Šipka je vždy napravo. */
  right?: React.ReactNode;
}

/** Jednotná sbaliteľná sekcia pre nástenku a prehľady. */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
  right,
}: CollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Card className={cn("overflow-hidden", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="group flex h-12 cursor-pointer flex-row items-center justify-between gap-3 bg-card px-4 py-0 transition-colors hover:bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {right}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 px-4 pb-4 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
