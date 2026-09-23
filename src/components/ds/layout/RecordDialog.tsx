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

/** Pojmenovaná sekcia formulára – optické zoskupenie polí v editoch. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="border-b pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

/** Jednotný formulárový dialóg pre všetky editácie v aplikácii. */
export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = "Uložit",
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  onSubmit: () => void;
  submitLabel?: string;
  busy?: boolean;
  children: ReactNode;
  extraActions?: ReactNode;
  wide?: boolean;
  contentClassName?: string;
  /** Voliteľný vysúvací panel vpravo (napr. poznámky k záznamu). */
  sidePanel?: ReactNode;
  sidePanelLabel?: string;
  /** Voliteľný bohatší názov tlačidla panela (napr. s počtami). Keď nie je zadaný, použije sa sidePanelLabel. */
  sidePanelTitle?: ReactNode;
  /** Voliteľný doplnkový prvok pod nadpisom dialógu (napr. informácie o operátorovi). */
  headerExtra?: ReactNode;
  /** Voliteľný doplnkový prvok pod tlačidlom vysúvacieho panela (napr. odznak Omega). */
  sidePanelExtra?: ReactNode;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
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
            onSubmit();
          }}
        >
          {children}
          <div className="flex flex-col-reverse items-start gap-2 pt-2 @min-[40rem]:flex-row @min-[40rem]:items-center @min-[40rem]:justify-between">
            {extraActions}
            <div className="flex items-center gap-2 @min-[40rem]:ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zrušit
              </Button>
              <Button type="submit" disabled={busy}>
                {submitLabel}
              </Button>
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
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
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
          {description ? <DialogDescription>{description}</DialogDescription> : null}
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
 * rovnako vo všetkých formulároch aplikácie.
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
  className = "",
  children,
}: {
  cols?: 1 | 2 | 3 | 4 | 6;
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
  return <div className={`@container grid grid-cols-1 gap-3 ${cls} ${className}`}>{children}</div>;
}
