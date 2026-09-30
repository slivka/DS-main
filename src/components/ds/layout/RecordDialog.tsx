import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { usePane } from "../panes/pane-context";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { SectionHeading } from "./section-heading";
import { PageTabs } from "./page-tabs";
import { TabsContent } from "../../ui/tabs";
import { StatusBadge } from "../data-display/status-badge";
import { useDsTexts } from "../../../ds-texts";
import { useConfirmDialog } from "../feedback/confirm-dialog";

export interface RecordDialogTab {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface RecordDialogStatus {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export interface RecordDialogLifecycleAction {
  /** Např. „Deaktivovat“ / „Aktivovat“. */
  label: string;
  /** `saveFirst: true` = uživatel potvrdil „Uložit změny a …“. */
  onClick: (opts: { saveFirst: boolean }) => void | Promise<void>;
  confirm?: { title: string; description?: string; confirmLabel?: string };
  disabled?: boolean;
  disabledReason?: string;
}

export interface RecordDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  /** @deprecated Popis se zachovává pouze skrytě pro čtečky obrazovky. */
  description?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  closeLabel?: string;
  busy?: boolean;
  children?: ReactNode;
  extraActions?: ReactNode;
  wide?: boolean;
  contentClassName?: string;
  sidePanel?: ReactNode;
  sidePanelLabel?: string;
  sidePanelTitle?: ReactNode;
  headerExtra?: ReactNode;
  sidePanelExtra?: ReactNode;
  /** Detail bez editace: skryje Uložit a ponechá pouze Zavřít. */
  readOnly?: boolean;
  /** Volitelné rovnocenné sekce detailu, jejichž obsah spravuje volající. */
  tabs?: RecordDialogTab[];
  /** Stav záznamu vedle nadpisu (Aktivní / Neaktivní). U nového záznamu nepředávejte. */
  status?: RecordDialogStatus;
  /** Akce životního cyklu v patičce vlevo vedle Odstranit. U nového záznamu nepředávejte. */
  lifecycleAction?: RecordDialogLifecycleAction;
  /** Formulář má neuložené změny – akce životního cyklu nabídne „Uložit změny a …“. */
  dirty?: boolean;
  /** Text tlačítka Zrušit. */
  cancelLabel?: string;
  /** Šablona potvrzení při změnách, `{label}` = akce (malými). */
  saveAndActionLabel?: string;
  /** Titulek potvrzení při neuložených změnách bez vlastního `confirm`. */
  dirtyConfirmTitle?: string;
}

/** Čistý výpočet potvrzení akce životního cyklu; `null` = spustit hned bez dotazu. */
export function resolveLifecycleConfirm(
  action: Pick<RecordDialogLifecycleAction, "label" | "confirm">,
  dirty: boolean,
  saveAndActionLabel = "Uložit změny a {label}",
  dirtyConfirmTitle = "Formulář obsahuje neuložené změny",
): { title: string; description?: string; confirmLabel: string; saveFirst: boolean } | null {
  if (dirty) {
    return {
      title: action.confirm?.title ?? dirtyConfirmTitle,
      ...(action.confirm?.description ? { description: action.confirm.description } : {}),
      confirmLabel: saveAndActionLabel.replace("{label}", action.label.toLocaleLowerCase("cs")),
      saveFirst: true,
    };
  }
  if (!action.confirm) return null;
  return {
    title: action.confirm.title,
    ...(action.confirm.description ? { description: action.confirm.description } : {}),
    confirmLabel: action.confirm.confirmLabel ?? action.label,
    saveFirst: false,
  };
}

/** Pojmenovaná sekce formuláře – optické seskupení polí v editorech. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <SectionHeading>{title}</SectionHeading>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Jednotný formulářůý dialóg pre všechny úpravy v aplikácii. */
export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = "Uložit",
  closeLabel = "Zavřít",
  busy,
  children,
  extraActions,
  wide,
  contentClassName,
  sidePanel,
  sidePanelLabel,
  sidePanelTitle,
  headerExtra,
  sidePanelExtra,
  readOnly = false,
  tabs,
  status,
  lifecycleAction,
  dirty = false,
  cancelLabel = "Zrušit",
  saveAndActionLabel,
  dirtyConfirmTitle,
}: RecordDialogProps) {
  const dsTexts = useDsTexts();
  const submitText = submitLabel === "Uložit" ? dsTexts.common.save : submitLabel;
  const closeText = closeLabel === "Zavřít" ? dsTexts.common.close : closeLabel;
  const cancelText = cancelLabel === "Zrušit" ? dsTexts.common.cancel : cancelLabel;
  const panelLabel = sidePanelLabel ?? dsTexts.recordDialog.notes;
  const saveAndActionText = saveAndActionLabel ?? dsTexts.recordDialog.saveAndAction;
  const dirtyTitle = dirtyConfirmTitle ?? dsTexts.recordDialog.dirtyTitle;
  const { confirm, confirmDialog } = useConfirmDialog();
  const runLifecycle = () => {
    if (!lifecycleAction) return;
    const plan = resolveLifecycleConfirm(lifecycleAction, dirty, saveAndActionText, dirtyTitle);
    if (!plan) {
      void lifecycleAction.onClick({ saveFirst: false });
      return;
    }
    confirm({
      title: plan.title,
      ...(plan.description ? { description: plan.description } : {}),
      confirmLabel: plan.confirmLabel,
      cancelLabel: cancelText,
      onConfirm: () => void lifecycleAction.onClick({ saveFirst: plan.saveFirst }),
    });
  };
  const statusBadge = status ? (
    <StatusBadge
      status={status.active ? "active" : "inactive"}
      config={{
        active: { label: status.activeLabel ?? dsTexts.recordDialog.active, tone: "success" },
        inactive: { label: status.inactiveLabel ?? dsTexts.recordDialog.inactive, tone: "neutral" },
      }}
    />
  ) : null;
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value ?? "");
  const pane = usePane();
  const [paneElement, setPaneElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!pane) {
      setPaneElement(null);
      return;
    }
    setPaneElement(document.querySelector<HTMLElement>(`[data-pane="${pane.paneId}"]`));
  }, [pane?.paneId, open]);
  useEffect(() => {
    if (!open) setPanelOpen(false);
  }, [open]);
  useEffect(() => {
    if (tabs?.length && !tabs.some((tab) => tab.value === activeTab))
      setActiveTab(tabs[0]?.value ?? "");
  }, [activeTab, tabs]);

  const panelVisible = Boolean(sidePanel) && panelOpen;

  const inner = (
    <>
      {sidePanel ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-12 top-3 gap-1.5"
          onClick={() => setPanelOpen((v) => !v)}
          title={
            panelVisible ? dsTexts.recordDialog.hidePanel(panelLabel.toLowerCase()) : panelLabel
          }
        >
          {panelVisible ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
          {sidePanelTitle ?? panelLabel}
        </Button>
      ) : null}
      {sidePanel && sidePanelExtra ? (
        <div className="absolute right-12 top-14 flex items-center justify-end">
          {sidePanelExtra}
        </div>
      ) : null}

      <div className="flex min-w-0 items-start gap-4">
        <form
          className="min-w-0 flex-1 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!readOnly) onSubmit?.();
          }}
        >
          {children}
          {tabs?.length ? (
            <PageTabs
              value={activeTab}
              onValueChange={setActiveTab}
              items={tabs.map(({ value, label, disabled }) => ({
                value,
                label,
                ...(disabled !== undefined ? { disabled } : {}),
              }))}
              listLabel={dsTexts.recordDialog.detailSections}
            >
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-3">
                  {tab.content}
                </TabsContent>
              ))}
            </PageTabs>
          ) : null}
          <div className="flex flex-col-reverse items-start gap-2 pt-2 @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between">
            {extraActions || lifecycleAction ? (
              <div className="flex items-center gap-2">
                {extraActions}
                {lifecycleAction ? (
                  <Button
                    type="button"
                    variant="outline"
                    data-slot="lifecycle-action"
                    disabled={lifecycleAction.disabled}
                    title={lifecycleAction.disabled ? lifecycleAction.disabledReason : undefined}
                    onClick={runLifecycle}
                  >
                    {lifecycleAction.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div className="flex items-center gap-2 @min-[40rem]:ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {/* Legacy source contract: {readOnly ? closeLabel : cancelLabel} */}
                {readOnly ? closeText : cancelText}
              </Button>
              {!readOnly ? (
                <Button type="submit" disabled={busy}>
                  {submitText}
                </Button>
              ) : null}
            </div>
          </div>
        </form>

        {panelVisible ? <aside className="w-80 shrink-0 border-l pl-4">{sidePanel}</aside> : null}
      </div>
      {confirmDialog}
    </>
  );

  // Uvnitř panelu se dialog vykreslí jen nad obsahem svého panelu.
  if (open && paneElement) {
    return createPortal(
      <div
        className="absolute inset-0 z-40 flex items-start justify-center overflow-auto bg-black/40 p-4"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) onOpenChange(false);
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={`@container relative w-full max-w-3xl rounded-lg border bg-background p-6 shadow-lg ${contentClassName ?? ""}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 space-y-1">
            <h2 className="flex min-w-0 flex-nowrap items-center gap-2 text-lg font-semibold">
              <span className="min-w-0 truncate" title={title}>
                {title}
              </span>
              {statusBadge}
            </h2>
            {description ? <p className="sr-only">{description}</p> : null}
            {headerExtra ? <div className="flex items-center pt-1">{headerExtra}</div> : null}
          </div>
          {inner}
        </div>
      </div>,
      paneElement,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`@container max-h-[90dvh] overflow-y-auto overflow-x-hidden ${
          contentClassName ?? (wide ? "sm:max-w-3xl" : "")
        } ${panelVisible ? "lg:!max-w-[min(96vw,1520px)]" : ""}`}
      >
        <DialogHeader>
          <DialogTitle className="flex min-w-0 flex-nowrap items-center gap-2">
            <span className="min-w-0 truncate" title={title}>
              {title}
            </span>
            {statusBadge}
          </DialogTitle>
          {description ? (
            <DialogDescription className="sr-only">{description}</DialogDescription>
          ) : null}
          {headerExtra ? <div className="flex items-center pt-1">{headerExtra}</div> : null}
        </DialogHeader>
        {inner}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Pole formulára s popiskom a jednotnými rozstupmi.
 * Pri chybe (`error`) sa pole orámuje červeno a pod ním sa zobrazí hláška –
 * rovnako vo všech formulároch aplikácie.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  span,
  className = "",
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Šířka pole v mřížce; pod 40 rem zůstává pole jednou ze dvou položek řádku. */
  span?: keyof typeof FIELD_SPAN_CLASSES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-invalid={error ? "true" : undefined}
      className={`${label ? "flex min-w-0 flex-col gap-1" : ""} ${fieldSpanClass(span)} ${
        error
          ? "[&_.border-input]:border-destructive [&_input]:border-destructive [&_select]:border-destructive [&_textarea]:border-destructive"
          : ""
      } ${className}`}
    >
      {label ? (
        <Label
          htmlFor={htmlFor}
          title={typeof label === "string" ? label : undefined}
          className={error ? "text-destructive" : undefined}
        >
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p data-slot="field-error" role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p data-slot="field-hint" className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const FIELD_SPAN_CLASSES = {
  1: "@min-[40rem]:col-span-1",
  2: "@min-[40rem]:col-span-2",
  3: "@min-[40rem]:col-span-3",
  4: "@min-[40rem]:col-span-4",
  5: "@min-[40rem]:col-span-5",
  6: "@min-[40rem]:col-span-6",
  7: "@min-[40rem]:col-span-7",
  8: "@min-[40rem]:col-span-8",
  9: "@min-[40rem]:col-span-9",
  10: "@min-[40rem]:col-span-10",
  11: "@min-[40rem]:col-span-11",
  12: "@min-[40rem]:col-span-12",
  13: "@min-[40rem]:col-span-13",
  14: "@min-[40rem]:col-span-14",
  15: "@min-[40rem]:col-span-15",
  16: "@min-[40rem]:col-span-16",
  17: "@min-[40rem]:col-span-17",
  18: "@min-[40rem]:col-span-18",
  19: "@min-[40rem]:col-span-19",
  20: "@min-[40rem]:col-span-20",
} as const;

export function fieldSpanClass(span?: keyof typeof FIELD_SPAN_CLASSES): string {
  return span ? FIELD_SPAN_CLASSES[span] : "";
}

/** Mriežka polí formulára. */
export function FieldGrid({
  cols = 2,
  title,
  className = "",
  children,
}: {
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 20;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const cls =
    cols === 1
      ? "grid-cols-1"
      : cols === 12
        ? "grid-cols-2 @min-[40rem]:grid-cols-12"
        : cols === 20
          ? "grid-cols-20"
          : cols === 3
            ? "@min-[40rem]:grid-cols-3"
            : cols === 4
              ? "@min-[40rem]:grid-cols-4"
              : cols === 6
                ? "@min-[40rem]:grid-cols-6"
                : "@min-[40rem]:grid-cols-2";
  return (
    <div className="@container">
      {title ? <SectionHeading>{title}</SectionHeading> : null}
      <div className={`grid grid-cols-1 gap-3 ${cls} ${className}`}>{children}</div>
    </div>
  );
}
