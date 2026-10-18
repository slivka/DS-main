/** Kaskáda akcí · vlastní měření kopií · nesmí rozhodovat o oprávnění akce. */
import { useEffect, useRef, useState } from "react";

/** Změří plnou, sekundárně kompaktní a zcela kompaktní podobu lišty. */
export function useRecordActionWidth(key: string) {
  const barRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState<0 | 1 | 2>(0);
  useEffect(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;
    const update = () => {
      const gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
      // Levá část smí ustoupit nejvýš na rezervu (10 rem), pak se zkrátí s …;
      // akce se zkracují dřív, než by levý obsah musel pod rezervu.
      const left = leftRef.current;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const leftNatural = left ? left.scrollWidth : 0;
      const leftReserve = Math.min(leftNatural, 10 * rem);
      const width = bar.clientWidth - leftReserve - (left && leftNatural ? gap : 0);
      const rows = Array.from(measure.children);
      const full = rows[0]?.getBoundingClientRect().width ?? 0;
      const secondary = rows[1]?.getBoundingClientRect().width ?? 0;
      setLevel(full <= width ? 0 : secondary <= width ? 1 : 2);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    observer.observe(measure);
    if (bar.parentElement) observer.observe(bar.parentElement);
    if (leftRef.current) observer.observe(leftRef.current);
    void document.fonts?.ready.then(update);
    return () => observer.disconnect();
  }, [key]);
  return { barRef, leftRef, measureRef, level };
}
