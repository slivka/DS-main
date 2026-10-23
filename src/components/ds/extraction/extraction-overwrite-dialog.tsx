/**
 * Potvrzení vytěžení do rozepsaného záznamu.
 * Vlastní: volby Přepsat vše / Doplnit jen prázdná pole / Zrušit.
 * Nesmí: samo měnit hodnoty; výsledek hlásí callbacky aplikaci.
 */
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";

/** Vlastnosti dialogu vytěžení do rozepsaného záznamu. */
export interface ExtractionOverwriteDialogProps {
  /** Viditelnost dialogu. */
  open: boolean;
  /** Změna viditelnosti (zavření křížkem, Escape nebo Zrušit). */
  onOpenChange: (open: boolean) => void;
  /** Přepsat všechny hodnoty vytěženými. */
  onOverwriteAll: () => void;
  /** Doplnit jen prázdná pole. */
  onFillEmpty: () => void;
}

/** Dialog „Doklad už má vyplněné hodnoty“ se třemi volbami pokračování. */
export function ExtractionOverwriteDialog({
  open,
  onOpenChange,
  onOverwriteAll,
  onFillEmpty,
}: ExtractionOverwriteDialogProps) {
  const texts = useDsTexts().extraction;
  const choose = (action: () => void) => () => {
    action();
    onOpenChange(false);
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-slot="extraction-overwrite-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{texts.overwriteTitle}</AlertDialogTitle>
          <AlertDialogDescription>{texts.overwriteDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
          <Button type="button" variant="outline" onClick={choose(onFillEmpty)}>
            {texts.overwriteEmptyOnly}
          </Button>
          <Button type="button" onClick={choose(onOverwriteAll)}>
            {texts.overwriteAll}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
