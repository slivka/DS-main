/**
 * Zavření otevřeného dialogu tlačítkem „Zpět“ (myš / prohlížeč).
 * Vlastní: jeden záznam historie na otevření dialogu, jeho odebrání při zavření a odpojení.
 * Nesmí: vložit druhý záznam ani zavřít dialog při dvojím připojení efektů ve StrictMode;
 *   uvnitř panelu (PaneLayout) historii nemění.
 */
import { useEffect, useRef } from "react";

import { usePane } from "../components/ds/panes/pane-context";

/**
 * Zajistí, aby se otevřený dialog zavřel tlačítkem „Zpět“, stejně jako přes „Zavřít“.
 *
 * Při otevření vloží do historie prohlížeče záznam; stisk „Zpět“ jej odebere a dialog se zavře.
 * Při běžném zavření (Zrušit, křížek, Esc) se záznam odebere přes `history.back()`; rodičovský
 * dialog pozná vlastní záznam a zůstane otevřený. Odpojení se vyhodnotí až v mikroúloze, aby
 * simulované odpojení a znovupřipojení ve StrictMode záznam neodebralo.
 */
export function useDialogBackClose(open: boolean, onOpenChange: (open: boolean) => void) {
  const pane = usePane();
  const markerRef = useRef<string | null>(null);
  const pushedRef = useRef(false);
  const mountedRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  useEffect(() => {
    if (typeof window === "undefined" || pane) return;
    if (open && !pushedRef.current) {
      markerRef.current = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      pushedRef.current = true;
      window.history.pushState(
        { ...(window.history.state ?? {}), __dialog: markerRef.current },
        "",
      );
    } else if (!open && pushedRef.current) {
      // Běžné zavření: odebrat vlastní záznam, aby se nehromadily „slepé“ záznamy.
      // Vyvolaný popstate tento dialog ignoruje (pushedRef je false).
      pushedRef.current = false;
      window.history.back();
    }
  }, [open, pane]);

  // Odpojení otevřeného dialogu (např. navigací) odebere jeho záznam. Kontrola proběhne až
  // v mikroúloze: StrictMode efekty hned znovu připojí a záznam musí zůstat.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      queueMicrotask(() => {
        if (typeof window === "undefined" || mountedRef.current || !pushedRef.current) return;
        pushedRef.current = false;
        window.history.back();
      });
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = (event: PopStateEvent) => {
      if (!pushedRef.current) return;
      // Historie se vrátila na vlastní záznam (zavřen vnořený dialog) – zůstat otevřený.
      if (event.state?.__dialog === markerRef.current) return;
      pushedRef.current = false;
      onOpenChangeRef.current(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
