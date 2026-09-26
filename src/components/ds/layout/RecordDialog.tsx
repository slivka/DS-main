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

export interface RecordDialogTab {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
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
}

/** Pojjménovaná sekcia formulára – optické zoskupene polí v editoch. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <SectionHeading>{title}</SectionHeading>
      {children}
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
  sidePanelLabel = "Poznámky",
  sidePanelTitle,
  headerExtra,
  sidePanelExtra,
  readOnly = false,
  tabs,
}: RecordDialogProps) {
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
    if (tabs?.length && !tabs.some((tab) => tab.value === activeTab)) setActiveTab(tabs[0]?.value ?? "");
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
          title={panelVisible ? `Skrýt ${sidePanelLabel.toLowerCase()}` : sidePanelLabel}
        >
          {panelVisible ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
          {sidePanelTitle ?? sidePanelLabel}
        </Button>
      ) : null}
      {sidePanel && sidePanelExtra ? (
        <div className="absolute right-12 top-14 flex items-center justify-end">{sidePanelExtra}</div>
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
            <PageTabs value={activeTab} onValueChange={setActiveTab} items={tabs.map(({ value, label, disabled }) => ({ value, label, ...(disabled !== undefined ? { disabled } : {}) }))} listLabel="Sekce detailu">
              {tabs.map((tab) => <TabsContent key={tab.value} value={tab.value} className="mt-3">{tab.content}</TabsContent>)}
            </PageTabs>
          ) : null}
          <div className="flex flex-col-reverse items-start gap-2 pt-2 @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between">
            {extraActions}
            <div className="flex items-center gap-2 @min-[40rem]:ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {readOnly ? closeLabel : "Zrušit"}
              </Button>
              {!readOnly ? <Button type="submit" disabled={busy}>
                {submitLabel}
              </Button> : null}
            </div>
          </div>
        </form>

        {panelVisible ? <aside className="w-80 shrink-0 border-l pl-4">{sidePanel}</aside> : null}
      </div>
    </>
  );

  // Uvnitř panelu se dialog vykreslí jen nad obsahem svého panelu.
  if (open && paneElement) {
    return createPortal(
      <div className="absolute inset-0 z-40 flex items-start justify-center overflow-auto bg-black/40 p-4" onPointerDown={(event) => { if (event.target === event.currentTarget) onOpenChange(false); }}>
        <div
          role="dialog"
          aria-modal="true"
          className={`@container relative w-full max-w-3xl rounded-lg border bg-background p-6 shadow-lg ${contentClassName ?? ""}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-semibold">{title}</h2>
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
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription className="sr-only">{description}</DialogDescription> : null}
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
  className = "",
  children,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-invalid={error ? "true" : undefined}
      className={`${label ? "space-y-1" : ""} ${
        error
          ? "[&_.border-input]:border-destructive [&_input]:border-destructive [&_select]:border-destructive [&_textarea]:border-destructive"
          : ""
      } ${className}`}
    >
      {label ? (
        <Label htmlFor={htmlFor} className={error ? "text-destructive" : undefined}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Mriežka polí formulára. */
export function FieldGrid({
  cols = 2,
  title,
  className = "",
  children,
}: {
  cols?: 1 | 2 | 3 | 4 | 6;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const cls =
    cols === 1
      ? "grid-cols-1"
      : cols === 3
        ? "@min-[40rem]:grid-cols-3"
        : cols === 4
          ? "@min-[40rem]:grid-cols-4"
          : cols === 6
            ? "@min-[40rem]:grid-cols-6"
            : "@min-[40rem]:grid-cols-2";
  return <div className="@container">{title ? <SectionHeading>{title}</SectionHeading> : null}<div className={`grid grid-cols-1 gap-3 ${cls} ${className}`}>{children}</div></div>;
}
