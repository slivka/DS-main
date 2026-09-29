import { useState, type ReactNode } from "react";
import { useDsTexts } from "../../../ds-texts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

type ConfirmOptions = {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Informačná hláška – zobrazí sa jen tlačítko na zatvorene. */
  info?: boolean;
  onConfirm?: () => void;
};

/**
 * Sdílený potvrdzovací dialóg namiesto window.confirm.
 * Použitie:
 *   const { confirm, confirmDialog } = useConfirmDialog();
 *   confirm({ title: "Opravdu zrušit smlouvu?", onConfirm: () => ... });
 *   ... v JSX: {confirmDialog}
 */
export function useConfirmDialog() {
  const dsTexts = useDsTexts();
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const confirm = (o: ConfirmOptions) => setOpts(o);

  const confirmCurrent = () => {
    if (!opts) return;
    opts.onConfirm?.();
    setOpts(null);
  };

  const confirmDialog = (
    <AlertDialog open={!!opts} onOpenChange={(open) => !open && setOpts(null)}>
      <AlertDialogContent
        onKeyDown={(event) => {
          // Enter potvrdzuje jen bezpečné (nedestruktívne) dialógy; pri
          // deštruktívnych akciách (napr. Odstranit) necháme štandardné
          // správane – Enter funguje jen na zaostrenom tlačidle.
          if (opts?.destructive) return;
          if (event.key !== "Enter" || event.repeat || event.nativeEvent.isComposing) return;
          event.preventDefault();
          confirmCurrent();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
          {opts?.description ? (
            <AlertDialogDescription>{opts.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {opts?.info ? (
            <AlertDialogAction onClick={confirmCurrent}>
              {opts?.confirmLabel ?? dsTexts.common.understand}
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel>{opts?.cancelLabel ?? dsTexts.common.cancel}</AlertDialogCancel>
              <AlertDialogAction
                className={opts?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
                onClick={confirmCurrent}
              >
                {opts?.confirmLabel ?? dsTexts.common.confirm}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmDialog };
}
