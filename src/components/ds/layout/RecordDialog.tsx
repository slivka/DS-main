/**
 * Jednotný dialog záznamu · vlastní velikost, hlavičku, záložky, ochranu neuložených změn,
 * režim jen pro čtení, pruh chyb a pořadí akcí patičky · nesmí sám ukládat ani zavírat po
 * uložení (to dělá aplikace po úspěchu).
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import type { FieldErrorLink } from "../feedback/field-error-summary";

import { usePane } from "../panes/pane-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { SectionHeading } from "./section-heading";
import { RecordDialogTabs } from "./record-dialog-tabs";
import { RecordDialogPanelToggle } from "./record-dialog-panel-toggle";
import { StatusBadge } from "../data-display/status-badge";
import { useDsTexts } from "../../../ds-texts";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { UnsavedChangesDialog } from "../panes/unsaved-changes-dialog";
import { RecordReadOnlyProvider } from "../form/record-read-only";
import { FieldGridBreakpointContext } from "./form-field-layout";
import {
  RecordDialogErrorStrip,
  RecordDialogFooter,
  RecordDialogFooterStart,
  RecordDialogSubmitButton,
} from "./record-dialog-footer";
import { RecordDialogPane } from "./record-dialog-pane";
import { cn } from "../../../lib/utils";

export { Field, FieldGrid, fieldSpanClass } from "./form-field-layout";

/** Rovnocenná sekce detailu záznamu. */
export interface RecordDialogTab {
  /** Stabilní hodnota záložky. */
  value: string;
  /** Popisek záložky. */
  label: ReactNode;
  /** Obsah sekce. */
  content: ReactNode;
  /** Záložka je zakázaná. */
  disabled?: boolean;
}

/** Stav záznamu vedle titulku. */
export interface RecordDialogStatus {
  /** Záznam je aktivní. */
  active: boolean;
  /** Vlastní text aktivního stavu. */
  activeLabel?: string;
  /** Vlastní text neaktivního stavu. */
  inactiveLabel?: string;
}

/** Akce životního cyklu (Deaktivovat / Aktivovat). */
export interface RecordDialogLifecycleAction {
  /** Např. „Deaktivovat“ / „Aktivovat“. */
  label: string;
  /** `saveFirst: true` = uživatel potvrdil „Uložit změny a …“. */
  onClick: (opts: { saveFirst: boolean }) => void | Promise<void>;
  /** Potvrzení před spuštěním. */
  confirm?: { title: string; description?: string; confirmLabel?: string };
  /** Akce je zakázaná. */
  disabled?: boolean;
  /** Důvod zákazu. */
  disabledReason?: string;
}

/** Odstranění záznamu – vždy úplně vlevo patičky, vždy s destruktivním potvrzením. */
export interface RecordDialogDeleteAction {
  /** Popisek; výchozí „Odstranit“ z DsTexts. */
  label?: string;
  /** Spustí se po potvrzení. */
  onClick: () => void | Promise<void>;
  /** Text potvrzení. */
  confirm: { title: string; description?: string; confirmLabel?: string };
  /** Akce je zakázaná. */
  disabled?: boolean;
  /** Důvod zákazu (tooltip, tlačítko zůstává zaměřitelné). */
  disabledReason?: string;
}

/** Velikost dialogu: sm 32 rem, md 48 rem, lg 56 rem, xl 80 rem; stejná i v panelu. */
export type RecordDialogSize = "sm" | "md" | "lg" | "xl";

/** Vlastnosti dialogu záznamu. */
export interface RecordDialogProps {
  /** Dialog je otevřený. */
  open: boolean;
  /** Změna otevření; `false` přichází až po případném potvrzení neuložených změn. */
  onOpenChange: (value: boolean) => void;
  /** Titulek dialogu (i název v potvrzení neuložených změn). */
  title: string;
  /** @deprecated Popis se zachovává pouze skrytě pro čtečky obrazovky. */
  description?: string;
  /** Uložení; dialog zavírá aplikace po úspěchu. */
  onSubmit?: () => void;
  /** Zakáže uložení i klávesou; neruší možnost zavřít dialog. */
  submitDisabled?: boolean;
  /** Důvod zákazu Uložit; tlačítko zůstane zaměřitelné a důvod ukáže bublina. */
  submitDisabledReason?: string;
  /** Text tlačítka Uložit. */
  submitLabel?: string;
  /** Text tlačítka Zavřít v režimu jen pro čtení. */
  closeLabel?: string;
  /** Probíhá ukládání: Uložit ukáže „Ukládám…“, dialog nejde zavřít. */
  busy?: boolean;
  /** Obsah formuláře. */
  children?: ReactNode;
  /** Doplňkové akce v patičce vlevo (za Odstranit). */
  extraActions?: ReactNode;
  /** Povinná šířka: sm 32 rem, md 48 rem, lg 56 rem, xl 80 rem. */
  size: RecordDialogSize;
  /** Doplňková třída obsahu dialogu. */
  contentClassName?: string;
  /** Boční panel (např. poznámky). */
  sidePanel?: ReactNode;
  /** Název bočního panelu. */
  sidePanelLabel?: string;
  /** Obsah tlačítka bočního panelu. */
  sidePanelTitle?: ReactNode;
  /** Doplňkový řádek pod titulkem. */
  headerExtra?: ReactNode;
  /** Stavové štítky zobrazené přímo vedle titulku. */
  titleBadges?: ReactNode;
  /** Doplňkový obsah pod tlačítkem bočního panelu. */
  sidePanelExtra?: ReactNode;
  /** Bez práva upravit: jen Zavřít a DS vstupy se vykreslí jako hodnoty. */
  readOnly?: boolean;
  /** Volitelné rovnocenné sekce detailu, jejichž obsah spravuje volající. */
  tabs?: RecordDialogTab[];
  /** Řízená aktivní záložka; bez této hodnoty dialog spravuje výběr sám. */
  activeTab?: string;
  /** Žádost o změnu záložky uživatelem; řízenou hodnotu aktualizuje aplikace. */
  onTabChange?: (value: string) => void;
  /** Stav záznamu vedle nadpisu (Aktivní / Neaktivní). U nového záznamu nepředávejte. */
  status?: RecordDialogStatus;
  /** Akce životního cyklu v patičce vlevo vedle Odstranit. U nového záznamu nepředávejte. */
  lifecycleAction?: RecordDialogLifecycleAction;
  /** Odstranění záznamu; v `readOnly` se nevykreslí. */
  deleteAction?: RecordDialogDeleteAction;
  /** Neuložené změny (i u nového záznamu = liší se od výchozích hodnot); hlídá zavření. */
  dirty?: boolean;
  /** Text tlačítka Zrušit. */
  cancelLabel?: string;
  /** Šablona potvrzení při změnách, `{label}` = akce (malými). */
  saveAndActionLabel?: string;
  /** Titulek potvrzení při neuložených změnách bez vlastního `confirm`. */
  dirtyConfirmTitle?: string;
  /** Souhrn chybných polí sticky nad patičkou (max 5 + „a další N“); klik fokusuje pole. */
  fieldErrors?: FieldErrorLink[];
  /** Celková chyba uložení (např. z databáze) v pruhu nad tlačítky. */
  error?: ReactNode;
}

const SIZE_CLASS: Record<RecordDialogSize, { dialog: string; pane: string }> = {
  sm: { dialog: "sm:max-w-lg", pane: "max-w-lg" },
  md: { dialog: "sm:max-w-3xl", pane: "max-w-3xl" },
  lg: { dialog: "sm:max-w-4xl", pane: "max-w-4xl" },
  xl: { dialog: "sm:max-w-7xl", pane: "max-w-7xl" },
};

/** Viditelný popis pod nadpisem: zalamuje se, nezkracuje. */
const DESCRIPTION_CLASS = "whitespace-normal break-words text-left text-sm text-muted-foreground";

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

/** Jednotný formulářový dialog pro všechny úpravy v aplikaci. */
export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitDisabled = false,
  submitDisabledReason,
  submitLabel,
  closeLabel,
  busy = false,
  children,
  extraActions,
  fieldErrors,
  error,
  size,
  contentClassName,
  sidePanel,
  sidePanelLabel,
  sidePanelTitle,
  headerExtra,
  titleBadges,
  sidePanelExtra,
  readOnly = false,
  tabs,
  activeTab: controlledTab,
  onTabChange,
  status,
  lifecycleAction,
  deleteAction,
  dirty = false,
  cancelLabel,
  saveAndActionLabel,
  dirtyConfirmTitle,
}: RecordDialogProps) {
  const dsTexts = useDsTexts();
  const submitText = submitLabel ?? dsTexts.common.save;
  const closeText = closeLabel ?? dsTexts.common.close;
  const cancelText = cancelLabel ?? dsTexts.common.cancel;
  const panelLabel = sidePanelLabel ?? dsTexts.recordDialog.notes;
  const saveAndActionText = saveAndActionLabel ?? dsTexts.recordDialog.saveAndAction;
  const dirtyTitle = dirtyConfirmTitle ?? dsTexts.recordDialog.dirtyTitle;
  const { confirm, confirmDialog } = useConfirmDialog();
  const [guardOpen, setGuardOpen] = useState(false);
  // Prvek s fokusem před potvrzením; „Zpět k záznamu“ na něj fokus vrátí.
  const [guardReturn, setGuardReturn] = useState<HTMLElement | null>(null);
  const requestClose = () => {
    if (busy) return;
    if (dirty && !readOnly) {
      const active = document.activeElement;
      setGuardReturn(active instanceof HTMLElement && active !== document.body ? active : null);
      setGuardOpen(true);
      return;
    }
    onOpenChange(false);
  };
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
  const deleteText = deleteAction?.label ?? dsTexts.recordDialog.deleteLabel;
  const runDelete = () => {
    if (!deleteAction) return;
    confirm({
      title: deleteAction.confirm.title,
      ...(deleteAction.confirm.description
        ? { description: deleteAction.confirm.description }
        : {}),
      confirmLabel: deleteAction.confirm.confirmLabel ?? deleteText,
      cancelLabel: cancelText,
      destructive: true,
      onConfirm: () => void deleteAction.onClick(),
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
  const [localTab, setLocalTab] = useState(tabs?.[0]?.value ?? "");
  const activeTab = controlledTab ?? localTab;
  const changeTab = (value: string) => {
    if (controlledTab === undefined) setLocalTab(value);
    onTabChange?.(value);
  };
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
    if (!open) {
      setPanelOpen(false);
      setGuardOpen(false);
    }
  }, [open]);
  useEffect(() => {
    if (controlledTab === undefined && tabs?.length && !tabs.some((tab) => tab.value === localTab))
      setLocalTab(tabs[0]?.value ?? "");
  }, [controlledTab, localTab, tabs]);
  const panelVisible = Boolean(sidePanel) && panelOpen;
  const showDelete = Boolean(deleteAction) && !readOnly;
  const descriptionId = useId();
  const inner = (
    <>
      {sidePanel ? (
        <RecordDialogPanelToggle
          visible={panelVisible}
          label={panelLabel}
          title={sidePanelTitle}
          onToggle={() => setPanelOpen((v) => !v)}
        />
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
            // React posílá submit stromem komponent i přes portál; vnořený dialog nesmí odeslat
            // formulář dialogu, ve kterém je otevřený (např. nový účet v dialogu partnera).
            e.stopPropagation();
            if (!readOnly && !busy && !submitDisabled) onSubmit?.();
          }}
        >
          <RecordReadOnlyProvider value={readOnly}>
            <FieldGridBreakpointContext.Provider value={size === "sm" ? "compact" : "default"}>
              {children}
              {tabs?.length === 1 ? tabs[0]?.content : null}
              {tabs && tabs.length > 1 ? (
                <RecordDialogTabs tabs={tabs} value={activeTab} onValueChange={changeTab} />
              ) : null}
            </FieldGridBreakpointContext.Provider>
          </RecordReadOnlyProvider>
          <RecordDialogErrorStrip error={error} fieldErrors={fieldErrors} />
          <RecordDialogFooter
            start={
              showDelete || extraActions || lifecycleAction ? (
                <RecordDialogFooterStart
                  deleteAction={showDelete ? deleteAction : undefined}
                  deleteLabel={deleteText}
                  onDelete={runDelete}
                  lifecycleAction={lifecycleAction}
                  onLifecycle={runLifecycle}
                  busy={busy}
                >
                  {extraActions}
                </RecordDialogFooterStart>
              ) : null
            }
          >
            <Button type="button" variant="outline" disabled={busy} onClick={requestClose}>
              {readOnly ? closeText : cancelText}
            </Button>
            {!readOnly ? (
              <RecordDialogSubmitButton
                label={submitText}
                busy={busy}
                disabled={submitDisabled}
                disabledReason={submitDisabledReason}
              />
            ) : null}
          </RecordDialogFooter>
        </form>
        {panelVisible ? <aside className="w-80 shrink-0 border-l pl-4">{sidePanel}</aside> : null}
      </div>
      {confirmDialog}
      <UnsavedChangesDialog
        open={guardOpen}
        action="record"
        tabTitle={title}
        intent=""
        restoreFocusTo={guardReturn}
        saving={busy}
        {...(onSubmit && !submitDisabled
          ? {
              onSave: () => {
                setGuardOpen(false);
                onSubmit();
              },
            }
          : {})}
        onDiscard={() => {
          setGuardOpen(false);
          onOpenChange(false);
        }}
        onBack={() => setGuardOpen(false)}
      />
    </>
  );

  const titleContent = (
    <>
      <span className="min-w-0 truncate" title={title}>
        {title}
      </span>
      {statusBadge}
      {titleBadges}
    </>
  );
  const extraLine = headerExtra ? (
    <div className="flex items-center pt-1 text-[0.78125rem] text-muted-foreground">
      {headerExtra}
    </div>
  ) : null;

  // Uvnitř panelu se dialog vykreslí jen nad obsahem svého panelu.
  if (open && paneElement) {
    return (
      <RecordDialogPane
        container={paneElement}
        sizeClassName={SIZE_CLASS[size].pane}
        contentClassName={contentClassName}
        onRequestClose={requestClose}
        descriptionId={description ? descriptionId : undefined}
        header={
          <>
            <h2 className="flex min-w-0 flex-nowrap items-center gap-2 text-lg font-semibold">
              {titleContent}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                data-slot="record-dialog-description"
                className={DESCRIPTION_CLASS}
              >
                {description}
              </p>
            ) : null}
            {extraLine}
          </>
        }
      >
        {inner}
      </RecordDialogPane>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
      <DialogContent
        className={cn(
          "@container max-h-[90dvh] overflow-y-auto overflow-x-hidden",
          SIZE_CLASS[size].dialog,
          panelVisible && "lg:!max-w-[min(96vw,1520px)]",
          contentClassName,
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex min-w-0 flex-nowrap items-center gap-2">
            {titleContent}
          </DialogTitle>
          {description ? (
            <DialogDescription data-slot="record-dialog-description" className={DESCRIPTION_CLASS}>
              {description}
            </DialogDescription>
          ) : null}
          {extraLine}
        </DialogHeader>
        {inner}
      </DialogContent>
    </Dialog>
  );
}
