import * as React from "react";
import { History } from "lucide-react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export type DraftRestoredBannerTexts = {
  /** {time} se nahradí časem HH:MM. */
  restored: string;
  conflict: string;
  showDraft: string;
  discard: string;
};

export const DEFAULT_DRAFT_RESTORED_BANNER_TEXTS: DraftRestoredBannerTexts = {
  restored: "Obnoveno z rozepsané verze z {time}",
  conflict: "Záznam byl mezitím změněn",
  showDraft: "Zobrazit rozepsanou verzi",
  discard: "Zahodit",
};

export interface DraftRestoredBannerProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  /** 'restored' = koncept byl použit; 'conflict' = záznam se mezitím změnil a koncept se nepoužil. */
  variant?: "restored" | "conflict";
  /** Čas uložení konceptu. */
  savedAt: number | Date;
  onDiscard: () => void;
  /** Jen u varianty 'conflict' – použije rozepsanou verzi. */
  onShowDraft?: () => void;
  texts?: Partial<DraftRestoredBannerTexts>;
}

const timeOf = (value: number | Date) =>
  new Intl.DateTimeFormat("cs-CZ", { hour: "2-digit", minute: "2-digit" }).format(value);

/** Upozornění, že formulář byl obnoven z rozepsané verze (useTabDraft → meta.restored / meta.conflict). */
export const DraftRestoredBanner = React.forwardRef<HTMLDivElement, DraftRestoredBannerProps>(
  function DraftRestoredBanner(
    { variant = "restored", savedAt, onDiscard, onShowDraft, texts, className, ...props },
    ref,
  ) {
    const t = { ...DEFAULT_DRAFT_RESTORED_BANNER_TEXTS, ...texts };
    const conflict = variant === "conflict";
    return (
      <div
        ref={ref}
        role="status"
        data-variant={variant}
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm",
          conflict
            ? "border-warning/40 bg-warning/10 text-foreground"
            : "border-primary/30 bg-primary/5 text-foreground",
          className,
        )}
        {...props}
      >
        <History
          className={cn("size-4 shrink-0", conflict ? "text-warning" : "text-primary")}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          {conflict ? t.conflict : t.restored.replace("{time}", timeOf(savedAt))}
        </span>
        <span className="flex items-center gap-1">
          {conflict && onShowDraft ? (
            <Button type="button" size="sm" variant="outline" className="h-7" onClick={onShowDraft}>
              {t.showDraft}
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="ghost" className="h-7" onClick={onDiscard}>
            {t.discard}
          </Button>
        </span>
      </div>
    );
  },
);
