/**
 * Dialog neuložených změn záložky panelu.
 * Vlastní: nadpis s názvem záložky, popis záměru a tlačítka pojmenovaná výsledkem.
 * Nesmí: sám ukládat ani zahazovat – rozhoduje poskytovatel záložek.
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { useRef } from "react";
import { DS_TEXTS_CS, type UnsavedChangesAction, useDsTexts } from "../../../ds-texts";

/** Vlastnosti dialogu neuložených změn. */
export interface UnsavedChangesDialogProps {
  /** Dialog je otevřený. */
  open: boolean;
  /** Druh odchodu; bez propu použije obecnou navigaci. */
  action?: UnsavedChangesAction;
  /** Název dotčené záložky. */
  tabTitle: string;
  /** Co se chystá (zavření, nahrazení obsahu, odhlášení …). */
  intent: string;
  /** Probíhá ukládání. */
  saving?: boolean;
  /** Uložit a pokračovat; bez něj se tlačítko nevykreslí. */
  onSave?: () => void;
  /** Pokračovat bez uložení (změny se zahodí). */
  onDiscard: () => void;
  /** Zpět bez akce. */
  onBack: () => void;
  /** Otevřít v nové záložce – jen když ji aplikace nabídne. */
  onOpenInNewTab?: () => void;
}

/** Dialog „{záložka} – neuložené změny“. */
export function UnsavedChangesDialog(props: UnsavedChangesDialogProps) {
  const t = useDsTexts().panes;
  const backRef = useRef<HTMLButtonElement>(null);
  const labels = (t.unsavedActions ?? DS_TEXTS_CS.panes.unsavedActions)?.[
    props.action ?? "navigate"
  ];
  return (
    <AlertDialog open={props.open} onOpenChange={(open) => !open && props.onBack()}>
      <AlertDialogContent
        className="@container w-[calc(100%-2rem)] max-w-2xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          backRef.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          if (!props.saving) props.onBack();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle title={labels?.title}>{labels?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.tabTitle} – {t.unsavedNotSaved}
            {props.intent ? <span className="mt-3 block">{props.intent}</span> : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div data-slot="unsaved-dialog-footer" className="flex flex-col items-start gap-2 @min-[36rem]:flex-row">
          <Button
            type="button"
            variant="outline-destructive"
            disabled={props.saving}
            className="order-3 mr-auto whitespace-nowrap @min-[36rem]:order-1"
            onClick={props.onDiscard}
          >
            {labels?.discard}
          </Button>
          <div className="order-1 flex flex-col-reverse items-start gap-2 @min-[36rem]:order-2 @min-[36rem]:flex-row">
            <Button
              type="button"
              ref={backRef}
              variant="outline"
              disabled={props.saving}
              className="whitespace-nowrap"
              onClick={props.onBack}
            >
              {labels?.back}
            </Button>
            {props.onOpenInNewTab ? (
              <Button
                type="button"
                variant="outline"
                disabled={props.saving}
                className="whitespace-nowrap"
                onClick={props.onOpenInNewTab}
              >
                {t.openInNewTab}
              </Button>
            ) : null}
            {props.onSave ? (
              <Button
                type="button"
                disabled={props.saving}
                className="whitespace-nowrap"
                onClick={props.onSave}
              >
                {labels?.save}
              </Button>
            ) : null}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
