import { useEffect, useRef } from "react";

import { usePane } from "../components/ds/panes/pane-context";

/**
 * Zabezpečí, aby sa otvorený dialóg zavrel tlačidlom „Späť"
 * (tlačidlo myši / prehliadača), rovnako ako cez „Zavrieť".
 *
 * Pri otvorení vloží do histórie prehliadača záznam; stlačenie „Späť"
 * ho odstráni a dialóg sa zavrie. Pri bežnom zatvorení dialógu
 * (napr. výberom z vnoreného dialógu) sa história nemení, aby sa
 * nezavrel aj rodičovský dialóg.
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
      // Bežné zatvorenie (Zrušiť, krížik, Esc, programové): odstránime náš
      // záznam z histórie cez history.back(), aby sa nekupili „slepé" záznamy
      // a tlačidlo Späť prehliadača fungovalo ďalej. Vyvolaný popstate
      // u nás nič neurobí (pushedRef už je false) a rodičovský dialóg
      // pozná vlastný marker a zostane otvorený.
      pushedRef.current = false;
      window.history.back();
    }
  }, [open, pane]);

  // Ak sa otvorený dialóg odmontuje (napr. navigáciou na inú stránku),
  // odstránime jeho záznam z histórie.
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
      // Ak dialóg nie je otvorený, nič nezatvárame.
      if (!pushedRef.current) return;
      // Ak sa história vrátila na náš vlastný záznam (napr. zatvorením
      // vnoreného dialógu), ponecháme tento dialóg otvorený.
      if (event.state?.__dialog === markerRef.current) return;
      pushedRef.current = false;
      onOpenChangeRef.current(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
