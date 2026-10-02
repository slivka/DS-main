/**
 * Dialog neuložených změn záložky panelu.
 * Vlastní: nadpis s názvem záložky, popis záměru a tlačítka pojmenovaná výsledkem.
 * Nesmí: sám ukládat ani zahazovat – rozhoduje poskytovatel záložek.
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";

/** Vlastnosti dialogu neuložených změn. */
export interface UnsavedChangesDialogProps {
  /** Dialog je otevřený. */
  open: boolean;
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
  return (
    <AlertDialog open={props.open} onOpenChange={(open) => !open && props.onBack()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.unsavedTitle(props.tabTitle)}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.intent} {t.unsavedNotSaved}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <Button type="button" variant="destructive" onClick={props.onDiscard}>
            {t.continueWithoutSaving}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={props.onBack}>
              {t.backToRecord}
            </Button>
            {props.onOpenInNewTab ? (
              <Button type="button" variant="outline" onClick={props.onOpenInNewTab}>
                {t.openInNewTab}
              </Button>
            ) : null}
            {props.onSave ? (
              <Button type="button" disabled={props.saving} onClick={props.onSave}>
                {t.saveAndContinue}
              </Button>
            ) : null}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
