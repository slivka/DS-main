/** Připnutá poznámka · vlastní jediný řádek a bublinu · nesmí připínat ani měnit formulář. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Pin } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
/** Jednořádkový odkaz na poznámku. */
export interface PinnedNoteBarProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Celý text poznámky. */
  text: string;
  /** Otevření poznámek. */
  onOpen: () => void;
}
/** Jednořádkový pruh s celým textem dostupným myší i klávesnicí. */
export const PinnedNoteBar = forwardRef<HTMLButtonElement, PinnedNoteBarProps>(
  function PinnedNoteBar({ text, onOpen, className, ...props }, ref) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="ghost"
            {...props}
            onClick={onOpen}
            className={cn(
              "h-[var(--control-h)] w-full min-w-0 justify-start gap-2 rounded-none bg-muted px-3 text-sm",
              className,
            )}
          >
            <Pin className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{text}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm whitespace-pre-wrap">{text}</TooltipContent>
      </Tooltip>
    );
  },
);
