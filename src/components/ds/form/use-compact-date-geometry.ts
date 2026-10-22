/** Měření kompaktních dat · vlastní synchronizaci s DOM · nesmí řídit hodnoty polí. */
import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";

// SSR neměří DOM; v prohlížeči měření předchází vykreslení.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Sdílené měření aktivního formátu a jednotlivých přetékajících datových polí. */
export function useCompactDateGeometry(labelsKey: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dateFormat, formatDate } = useDateTimePreferences();
  const sample = formatDate("2000-11-22").replace(/\d/g, "0");
  const geometry: CSSProperties & Record<string, string> = {
    "--document-date-format-sample": `"${sample}"`,
  };
  // Rozměry DOM jsou vnější stav: přepočet jen při změně prostoru, písma či formátu.
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastGeometry = "";
    const measure = () => {
      const key = `${container.clientWidth}:${getComputedStyle(document.documentElement).fontSize}`;
      if (key === lastGeometry) return;
      lastGeometry = key;
      const fields = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="field"]'));
      for (const field of fields) field.style.setProperty("--document-date-scale", "1");
      for (const field of fields) {
        const input = field.querySelector("input, [data-document-date-locked]");
        if (!input) continue;
        const style = getComputedStyle(input);
        const border = 2 * parseFloat(style.borderLeftWidth);
        const available = container.clientWidth - border;
        const width = field.getBoundingClientRect().width;
        if (!available || width <= available) continue;
        // Každé pole se zmenší jen pokud samo přesahuje prostor; delší popisek nezmenší sousedy.
        const label = field.querySelector("label");
        const labelWidth = label?.getBoundingClientRect().width ?? 0;
        const fixed = labelWidth >= width - border ? 0 : parseFloat(style.paddingLeft) + border;
        const scale = Math.max(0, (available - fixed) / Math.max(1, width - fixed));
        field.style.setProperty("--document-date-scale", String(Math.min(1, scale)));
        // Popisek obsahuje i pevné odsazení; korekce vychází ze skutečného výsledku.
        for (let attempt = 0; attempt < 4; attempt += 1) {
          const measuredWidth = field.getBoundingClientRect().width;
          if (measuredWidth <= available) break;
          const currentScale = Number(field.style.getPropertyValue("--document-date-scale"));
          const correctedScale = Math.max(
            0,
            Math.min(
              1,
              (currentScale * Math.max(0, available - fixed)) / Math.max(1, measuredWidth - fixed),
            ),
          );
          field.style.setProperty("--document-date-scale", String(correctedScale));
        }
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(document.documentElement);
    measure();
    void document.fonts?.ready.then(() => {
      lastGeometry = "";
      measure();
    });
    return () => observer.disconnect();
  }, [dateFormat, labelsKey]);
  return { containerRef, geometry };
}
