import { useEffect, useRef } from "react";

import { usePane } from "../components/ds/panes/pane-context";

/**
 * Zajistí, aby sa otevřený dialog zavřel tlačítkom „Zpět"
 * (tlačítko myši / prohlížeče), stejně jako přes „Zavřít".
 *
 * Při otevření vloží do historie prohlížeče záznam; stlačene „Zpět"
 * ho odstráni a dialóg sa zavrie. Pri bežnom zatvorení dialogu
 * (napr. výberom z vnoreného dialogu) sa história nemění, aby sa
 * nezavřel aj rodičovský dialóg.
 */
export function useDialogBackClose(open: boolean, onOpenChange: (open: boolean) => void) {
  const pane = usePane();
  const markerRef = useRef<string | null>(null);
  const pushedRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (typeof window === "undefined" || pane) return;
    if (open && !pushedRef.current) {
      markerRef.current = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      pushedRef.current = true;
      window.history.pushState({ ...(window.history.state ?? {}), __dialog: markerRef.current }, "");
    } else if (!open && pushedRef.current) {
      // Bežné zatvorene (Zrušiť, krížik, Esc, programové): odstránime náš
      // záznam z historie cez history.back(), aby sa nekupili „slepé" záznamy
      // a tlačítko Zpět prohlížeče fungovalo ďalej. Vyvolaný popstate
      // u nás nič neurobí (pushedRef už je false) a rodičovský dialóg
      // pozná vlastný marker a zostane otvorený.
      pushedRef.current = false;
      window.history.back();
    }
  }, [open, pane]);

  // Ak sa otevřený dialog odmontuje (napr. navigáciou na inú stránku),
  // odstránime jeho záznam z historie.
  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = (event: PopStateEvent) => {
      // Ak dialóg ne je otvorený, nič nezatvárame.
      if (!pushedRef.current) return;
      // Pokud se historie vrátíla na náš vlastní záznam (napr. zavřením
      // vnoreného dialogu), ponecháme tento dialóg otvorený.
      if (event.state?.__dialog === markerRef.current) return;
      pushedRef.current = false;
      onOpenChangeRef.current(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
