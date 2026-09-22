import { useState, type ReactNode } from "react";
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
  /** Informačná hláška – zobrazí sa len tlačidlo na zatvorenie. */
  info?: boolean;
  onConfirm?: () => void;
};

/**
 * Zdieľaný potvrdzovací dialóg namiesto window.confirm.
 * Použitie:
 *   const { confirm, confirmDialog } = useConfirmDialog();
 *   confirm({ title: "Naozaj zrušiť zmluvu?", onConfirm: () => ... });
 *   ... v JSX: {confirmDialog}
 */
export function useConfirmDialog() {
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
          // Enter potvrdzuje len bezpečné (nedestruktívne) dialógy; pri
          // deštruktívnych akciách (napr. Odstranit) necháme štandardné
          // správanie – Enter funguje len na zaostrenom tlačidle.
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
              {opts?.confirmLabel ?? "Rozumiem"}
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel>{opts?.cancelLabel ?? "Zrušit"}</AlertDialogCancel>
              <AlertDialogAction
                className={opts?.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
                onClick={confirmCurrent}
              >
                {opts?.confirmLabel ?? "Potvrdit"}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, confirmDialog };
}
