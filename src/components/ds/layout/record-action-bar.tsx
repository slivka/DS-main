/** Lišta akcí · vlastní společné ukládání a stavy · nesmí ukládat aplikační data. */
import { useEffect, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
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
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { DisabledReasonMenuItem } from "../feedback/disabled-reason-menu-item";
import { cn } from "../../../lib/utils";
import { useRecordActionWidth } from "./use-record-action-width";
import { FieldErrorSummary, type FieldErrorLink } from "../feedback/field-error-summary";
import { FormIssuesBar } from "../feedback/form-issues-bar";
import { mergeFormIssues, type FormIssue } from "../../../lib/form-issues";

export interface RecordSaveAction {
  onSave: () => void;
  disabled?: boolean;
  busy?: boolean;
  dirty?: boolean;
  /** Důvod zakázání; akce zůstane fokusovatelná (aria-disabled) a klik/klepnutí ukáže důvod. */
  disabledReason?: string;
}

export interface RecordPrimaryAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  icon?: LucideIcon;
  /** Důvod zakázání; akce zůstane fokusovatelná (aria-disabled) a klik/klepnutí ukáže důvod. */
  disabledReason?: string;
  /** Vysvětlení povolené akce, dostupné také krátce po dotyku. */
  tooltip?: string;
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
  /** Odkazy na chybná pole „Popisek: zpráva“ (max 5 + „a další N“); klik fokusuje pole. */
  fieldErrors?: FieldErrorLink[];
  /** Vlastní výběr pole ze souhrnu; výchozí je `focusFieldErrorLink`. */
  onFieldErrorSelect?: (link: FieldErrorLink) => void;
}

export interface RecordActionBarProps {
  /** Ovladač panelu vždy poslední za nabídkou, také při zkrácení ostatních akcí. */
  panelToggle?: ReactNode;
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
  /**
   * Živý seznam položek k opravě (2.108.0). Neprázdný seznam nahradí chybový pruh: titulek
   * s počtem, chyby a pod nimi varování; prázdný = pruh zmizí sám. `error.message` se vypíše
   * jen, když se neshoduje s položkou.
   */
  issues?: FormIssue[];
  /** Uložení selhalo – titulek „Doklad nelze uložit (N)“. */
  saveFailed?: boolean;
  /** Zavření pruhu položek ✕; bez callbacku si pruh zavření drží sám do změny seznamu. */
  onIssuesClose?: () => void;
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
  reason,
  tooltip,
  children,
  ...props
}: {
  label: string;
  icon?: LucideIcon;
  busy?: boolean;
  compact: boolean;
  /** Důvod zablokování: místo nativního disabled aria-disabled + tooltip i klepnutím. */
  reason?: string;
  tooltip?: string;
} & ComponentPropsWithoutRef<typeof Button>) {
  const reasonId = useId();
  const blocked = Boolean(reason);
  const button = (
    <Button
      type="button"
      {...props}
      disabled={blocked ? undefined : props.disabled}
      aria-disabled={blocked || undefined}
      aria-describedby={blocked ? reasonId : undefined}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          return;
        }
        props.onClick?.(event);
      }}
      aria-label={label}
      size="control"
      className={cn(
        compact && "w-[var(--control-h)] px-0",
        blocked && "cursor-not-allowed",
        props.className,
      )}
    >
      {busy ? <Loader2 className="animate-spin" /> : compact && Icon ? <Icon /> : null}
      <span className={cn(compact && "sr-only")}>{busy ? `${label}…` : label}</span>
      {children}
    </Button>
  );
  if (blocked)
    return (
      <>
        <DisabledReasonTooltip content={compact ? `${label}: ${reason}` : reason} blocked>
          {button}
        </DisabledReasonTooltip>
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      </>
    );
  if (tooltip)
    return (
      <DisabledReasonTooltip content={tooltip} blocked={false} openOnTouch>
        {button}
      </DisabledReasonTooltip>
    );
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Přilepený pruh akcí karty záznamu s jednotnou oblastí pro chybu a upozornění. */
export function RecordActionBar({
  panelToggle,
  leftContent,
  saveAction,
  primaryAction,
  moreActions = [],
  busy = false,
  error,
  notices,
  issues,
  saveFailed,
  onIssuesClose,
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
  const errorRef = useRef<HTMLDivElement>(null);
  const saveText = saveLabel ?? dsTexts.common.save;
  const moreText = moreActionsLabel ?? dsTexts.recordAction.moreActions;
  const fallbackErrorTitle = errorTitle ?? dsTexts.recordAction.errorTitle;
  const closeText = closeErrorLabel ?? dsTexts.recordAction.closeError;
  const PrimaryIcon = primaryAction?.icon ?? CheckCircle2;
  const { barRef, leftRef, measureRef, level } = useRecordActionWidth(
    [saveText, primaryAction?.label, moreText, Boolean(saveAction), moreActions.length, busy, Boolean(panelToggle)].join(
      "|",
    ),
  );
  const compact = level > 0;

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
        data-overflow-level={level}
        aria-busy={allBusy || undefined}
        className={cn(
          "sticky top-0 z-30 -mx-1 flex min-h-12 items-center justify-between gap-3 bg-card/95 px-1 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/90",
          className,
        )}
      >
        {leftContent ? (
          <div
            ref={leftRef}
            className="min-w-0 shrink overflow-hidden text-ellipsis whitespace-nowrap [&_[data-slot=button]]:whitespace-nowrap"
          >
            {leftContent}
          </div>
        ) : null}
        <div data-slot="record-action-buttons" className="ml-auto flex shrink-0 items-center gap-2">
          {primaryAction ? (
            <CompactActionButton
              label={primaryAction.label}
              icon={PrimaryIcon}
              compact={compact}
              variant="outline"
              busy={busy || primaryAction.busy}
              disabled={busy || primaryAction.disabled || primaryAction.busy}
              reason={
                !busy && !primaryAction.busy && primaryAction.disabled
                  ? primaryAction.disabledReason
                  : undefined
              }
              onClick={primaryAction.onClick}
              tooltip={primaryAction.tooltip}
            />
          ) : null}
          {saveAction ? (
            <CompactActionButton
              label={saveText}
              icon={Save}
              compact={level === 2}
              variant={saveAction.dirty ? "default" : "outline"}
              busy={busy || saveAction.busy}
              disabled={
                busy || saveAction.disabled || saveAction.busy || saveAction.dirty === false
              }
              reason={
                !busy && !saveAction.busy && saveAction.disabled
                  ? saveAction.disabledReason
                  : undefined
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
          {moreActions.length ? (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="control"
                      className="w-[var(--control-h)] px-0"
                      aria-label={moreText}
                      disabled={busy}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{moreText}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="min-w-56">
                {moreActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <span key={action.id}>
                      {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                      {action.disabled && action.disabledReason && !busy ? (
                        <DisabledReasonMenuItem
                          disabled
                          disabledReason={action.disabledReason}
                          onSelect={action.onClick}
                          className={cn(
                            action.destructive && "text-destructive focus:text-destructive",
                          )}
                        >
                          {Icon ? <Icon className="size-4 shrink-0" /> : null}
                          {action.label}
                        </DisabledReasonMenuItem>
                      ) : (
                        <DropdownMenuItem
                          disabled={busy || action.disabled}
                          onSelect={action.onClick}
                          className={cn(
                            "flex-col items-start gap-0.5",
                            action.destructive && "text-destructive focus:text-destructive",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {Icon ? <Icon className="size-4 shrink-0" /> : null}
                            {action.label}
                          </span>
                        </DropdownMenuItem>
                      )}
                    </span>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {panelToggle ? (
            <span data-slot="record-action-panel" className="inline-flex shrink-0 items-center">
              {panelToggle}
            </span>
          ) : null}
        </div>
        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none absolute invisible left-1 top-0 -z-10 w-max"
        >
          {[0, 1, 2].map((stage) => (
            <div key={stage} className="flex w-max items-center gap-2">
              {primaryAction ? (
                <Button
                  asChild
                  tabIndex={-1}
                  variant="outline"
                  size="control"
                  className={stage > 0 ? "w-[var(--control-h)] px-0" : undefined}
                >
                  <span>{stage > 0 ? <PrimaryIcon /> : primaryAction.label}</span>
                </Button>
              ) : null}
              {saveAction ? (
                <Button
                  asChild
                  size="control"
                  tabIndex={-1}
                  variant={saveAction.dirty ? "default" : "outline"}
                  className={stage === 2 ? "w-[var(--control-h)] px-0" : undefined}
                >
                  <span>
                    {stage === 2 ? <Save /> : saveText}
                    {saveAction.dirty ? <span className="size-1.5" /> : null}
                  </span>
                </Button>
              ) : null}
              {moreActions.length ? (
                <Button
                  asChild
                  tabIndex={-1}
                  variant="outline"
                  size="control"
                  className="w-[var(--control-h)] px-0"
                >
                  <span>
                    <MoreHorizontal />
                  </span>
                </Button>
              ) : null}
              {panelToggle ? (
                <span className="h-[var(--control-h)] w-[var(--control-h)] shrink-0" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {issues && mergeFormIssues(issues).length > 0 ? (
        <div ref={errorRef} data-slot={errorDataSlot}>
          <FormIssuesBar
            issues={issues}
            saveFailed={saveFailed}
            title={error?.title}
            message={error?.message}
            // Chyba z aplikace: pruh je červený i když položky obsahují jen varování.
            forceError={error ? { title: error.title, message: error.message } : undefined}
            fieldErrors={error?.fieldErrors}
            onFieldErrorSelect={error?.onFieldErrorSelect}
            onClose={error?.onClose ?? onIssuesClose}
            closeLabel={closeText}
          />
        </div>
      ) : error ? (
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
            {error.fieldErrors?.length ? (
              <FieldErrorSummary errors={error.fieldErrors} onSelect={error.onFieldErrorSelect} />
            ) : null}
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
