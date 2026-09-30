import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Input } from "../../ui/input";
import { CheckboxField } from "../form/checkbox-field";
import { NoticeBar } from "./notice-bar";
import { useDsTexts } from "../../../ds-texts";
import { TruncatedText } from "../data-display/truncated-text";
import { matchesConfirmText } from "./confirm-text";

export interface ConfirmByTypingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  /** Shrnutí dopadu (např. seznam počtů). */
  summary?: ReactNode;
  /** Text, který musí uživatel přesně opsat (po oříznutí mezer, rozlišuje velikost písmen). */
  confirmText: string;
  /** Povinné potvrzující zaškrtávátko; jen když je zadán. */
  acknowledgement?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Pokyn před textem k opsání. */
  instruction?: string;
  /** Červené potvrzovací tlačítko. Výchozí true. */
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}


/** Potvrzení nevratné akce opsáním názvu. */
export function ConfirmByTypingDialog({
  open, onOpenChange, title, description, summary, confirmText, acknowledgement, confirmLabel, cancelLabel, instruction, destructive = true, onConfirm,
}: ConfirmByTypingDialogProps) {
  const texts = useDsTexts();
  const t = texts.confirmByTyping;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runningRef = useRef(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    // Nový běh při každé změně otevření: výsledek dřívějšího onConfirm se zahodí.
    runIdRef.current += 1;
    runningRef.current = false;
    // Stav nulujeme při otevření – při zavření by text zmizel během animace.
    if (open) { setValue(""); setAcknowledged(false); setError(null); setRunning(false); }
  }, [open]);

  const canConfirm = matchesConfirmText(value, confirmText) && (!acknowledgement || acknowledged) && !running;

  const confirm = async () => {
    if (!canConfirm || runningRef.current) return;
    runningRef.current = true;
    const runId = runIdRef.current;
    setRunning(true);
    setError(null);
    try {
      await onConfirm();
      if (runId !== runIdRef.current) return;
      runningRef.current = false;
      setRunning(false);
      onOpenChange(false);
    } catch (reason) {
      if (runId !== runIdRef.current) return;
      runningRef.current = false;
      setRunning(false);
      setError(reason instanceof Error ? reason.message : String(reason));
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!running) onOpenChange(next); }}>
      <DialogContent
        data-slot="confirm-by-typing-dialog"
        className="sm:max-w-lg"
        onOpenAutoFocus={(event) => { event.preventDefault(); inputRef.current?.focus(); }}
        onEscapeKeyDown={(event) => { if (running) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (running) event.preventDefault(); }}
        onInteractOutside={(event) => { if (running) event.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="min-w-0 whitespace-nowrap"><TruncatedText text={title} /></DialogTitle>
          <DialogDescription asChild><div className="text-sm text-muted-foreground">{description}</div></DialogDescription>
        </DialogHeader>
        {error ? <NoticeBar tone="danger">{error}</NoticeBar> : null}
        {summary ? <div className="rounded-md border bg-muted/40 p-3 text-sm">{summary}</div> : null}
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => { event.preventDefault(); void confirm(); }}
        >
          <label htmlFor={inputId} className="text-sm">
            {instruction ?? t.instruction} <strong className="font-semibold">{confirmText}</strong>
          </label>
          <Input
            ref={inputRef}
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            readOnly={running}
            aria-readonly={running || undefined}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {acknowledgement ? <CheckboxField checked={acknowledged} onCheckedChange={setAcknowledged} label={acknowledgement} disabled={running} /> : null}
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" disabled={running} onClick={() => onOpenChange(false)}>{cancelLabel ?? t.cancel}</Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={!canConfirm} aria-busy={running || undefined}>
              {running ? <Loader2 aria-label={t.running} className="animate-spin" /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
