/**
 * Pomocné chování rámu formuláře dokladu.
 * Vlastní: výšku přilepeného pruhu a změnu řádku zaokrouhlení.
 * Nesmí: vykreslovat formulář ani rozhodovat o oprávnění.
 */
import { useEffect, useRef } from "react";
import type { JournalLine } from "../journal-lines";

/** Vrátí ref formuláře a průběžně nastavuje výšku přilepeného pruhu akcí. */
export function useDocumentFormStickyTop() {
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = formRef.current;
    const bar = root?.querySelector<HTMLElement>('[data-slot="document-action-bar"]');
    if (!root || !bar) return;
    const update = () =>
      root.style.setProperty("--pane-sticky-top", `${bar.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  return formRef;
}

/** Změní existující řádek zaokrouhlení nebo jej přidá. */
export function changeDocumentRounding(
  lines: JournalLine[],
  roundingAmount: number,
  label: string,
): JournalLine[] {
  const roundingLine = lines.find((line) => line.isRounding);
  if (roundingLine)
    return lines.map((line) =>
      line.id === roundingLine.id ? { ...line, amount: roundingAmount } : line,
    );
  if (!roundingAmount) return lines;
  return [
    ...lines,
    { id: `rounding-${Date.now()}`, amount: roundingAmount, text: label, isRounding: true },
  ];
}