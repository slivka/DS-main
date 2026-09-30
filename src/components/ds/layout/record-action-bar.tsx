import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Save,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

export interface RecordSaveAction {
  onSave: () => void;
  disabled?: boolean;
  busy?: boolean;
  dirty?: boolean;
}

export interface RecordPrimaryAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  icon?: LucideIcon;
}

export interface RecordMoreAction {
  id: string;
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  separatorBefore?: boolean;
}

export interface RecordActionError {
  title?: ReactNode;
  message: ReactNode;
  onClose?: () => void;
}

export interface RecordActionBarProps {
  /** Volitelný obsah vlevo, například přepínač ovlivňující formulář. */
  leftContent?: ReactNode;
  saveAction?: RecordSaveAction;
  primaryAction?: RecordPrimaryAction;
  moreActions?: RecordMoreAction[];
  /** Zablokuje všechny akce po dobu společné probíhající operace. */
  busy?: boolean;
  error?: RecordActionError;
  /** Jeden nebo více informačních pruhů pod chybou. */
  notices?: ReactNode;
  saveLabel?: string;
  moreActionsLabel?: string;
  errorTitle?: ReactNode;
  closeErrorLabel?: string;
  className?: string;
  /** Vnitřní kompatibilita DocumentForm; pro nové karty ponechte výchozí hodnotu. */
  dataSlot?: string;
  errorDataSlot?: string;
  noticesDataSlot?: string;
}

function CompactActionButton({
  label,
  icon: Icon,
  busy,
  compact,
  children,
  ...props
}: { label: string; icon: LucideIcon; busy?: boolean; compact: boolean } & ComponentPropsWithoutRef<
  typeof Button
>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          {...props}
          aria-label={label}
          className={cn(compact && "size-9 px-0", props.className)}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Icon />}
          <span className={cn(compact && "sr-only")}>{busy ? `${label}…` : label}</span>
          {children}
        </Button>
      </TooltipTrigger>
      {compact ? <TooltipContent>{label}</TooltipContent> : null}
    </Tooltip>
  );
}

/** Přilepený pruh akcí karty záznamu s jednotnou oblastí pro chybu a upozornění. */
export function RecordActionBar({
  leftContent,
  saveAction,
  primaryAction,
  moreActions = [],
  busy = false,
  error,
  notices,
  saveLabel,
  moreActionsLabel,
  errorTitle,
  closeErrorLabel,
  className,
  dataSlot = "record-action-bar",
  errorDataSlot = "record-action-error",
  noticesDataSlot = "record-action-notices",
}: RecordActionBarProps) {
  const dsTexts = useDsTexts();
  const barRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const saveText = saveLabel ?? dsTexts.common.save;
  const moreText = moreActionsLabel ?? dsTexts.recordAction.moreActions;
  const fallbackErrorTitle = errorTitle ?? dsTexts.recordAction.errorTitle;
  const closeText = closeErrorLabel ?? dsTexts.recordAction.closeError;
  const PrimaryIcon = primaryAction?.icon ?? CheckCircle2;

  useEffect(() => {
    const node = barRef.current;
    if (!node) return;
    const update = () => setCompact(node.getBoundingClientRect().width < 640);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  const allBusy = busy || saveAction?.busy || primaryAction?.busy;

  return (
    <TooltipProvider>
      <div
        ref={barRef}
        data-slot={dataSlot}
        data-compact={compact || undefined}
        aria-busy={allBusy || undefined}
        className={cn(
          "sticky top-0 z-30 -mx-1 flex min-h-12 items-center justify-between gap-3 bg-card/95 px-1 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/90",
          className,
        )}
      >
        <div className="min-w-0">{leftContent}</div>
        <div className="flex shrink-0 items-center gap-2">
          {saveAction ? (
            <CompactActionButton
              label={saveText}
              icon={Save}
              compact={compact}
              busy={busy || saveAction.busy}
              disabled={
                busy || saveAction.disabled || saveAction.busy || saveAction.dirty === false
              }
              onClick={saveAction.onSave}
            >
              {saveAction.dirty ? (
                <span
                  aria-label={dsTexts.recordAction.unsaved}
                  className="size-1.5 rounded-full bg-primary-foreground"
                />
              ) : null}
            </CompactActionButton>
          ) : null}
          {primaryAction ? (
            <CompactActionButton
              label={primaryAction.label}
              icon={PrimaryIcon}
              compact={compact}
              variant="outline"
              busy={busy || primaryAction.busy}
              disabled={busy || primaryAction.disabled || primaryAction.busy}
              onClick={primaryAction.onClick}
            />
          ) : null}
          {moreActions.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={moreText}
                  disabled={busy}
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                {moreActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <span key={action.id}>
                      {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                      <DropdownMenuItem
                        disabled={busy || action.disabled}
                        onSelect={action.onClick}
                        className={cn(
                          "flex-col items-start gap-0.5",
                          action.destructive && "text-destructive focus:text-destructive",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {Icon ? <Icon /> : null}
                          {action.label}
                        </span>
                        {action.disabled && action.disabledReason ? (
                          <span className="text-xs font-normal text-muted-foreground">
                            {action.disabledReason}
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    </span>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
      {error ? (
        <div
          ref={errorRef}
          role="alert"
          data-slot={errorDataSlot}
          className="flex items-start gap-3 border-l-4 border-destructive bg-destructive-soft px-4 py-3 text-destructive-strong"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{error.title ?? fallbackErrorTitle}</p>
            <div className="mt-0.5 text-sm text-foreground">{error.message}</div>
          </div>
          {error.onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={closeText}
              onClick={error.onClose}
              className="-mr-2 -mt-2 shrink-0 text-destructive-strong"
            >
              <X />
            </Button>
          ) : null}
        </div>
      ) : null}
      {notices ? (
        <div data-slot={noticesDataSlot} className="space-y-2">
          {notices}
        </div>
      ) : null}
    </TooltipProvider>
  );
}
