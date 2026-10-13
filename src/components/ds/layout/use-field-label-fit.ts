/** Popisky polí · vlastní měření dostupné šířky · nesmí měnit výšku ovládání ani text. */
import { useEffect, useRef } from "react";

/** Zmenší pouze popisek, který se sám nevejde, bez ořezu a zalamování. */
export function useFieldLabelFit(label: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const field = ref.current;
    const node = field?.querySelector("label");
    if (!field || !node || field.closest(".document-dates-compact")) return;
    let lastGeometry = "";
    const measure = () => {
      const geometry = `${field.clientWidth}:${getComputedStyle(document.documentElement).fontSize}`;
      if (geometry === lastGeometry) return;
      lastGeometry = geometry;
      node.style.removeProperty("font-size");
      const size = parseFloat(getComputedStyle(node).fontSize);
      if (node.scrollWidth > node.clientWidth && node.clientWidth > 0) {
        node.style.fontSize = `${(size * node.clientWidth) / node.scrollWidth}px`;
        for (let attempt = 0; attempt < 4 && node.scrollWidth > node.clientWidth; attempt += 1) {
          const current = parseFloat(getComputedStyle(node).fontSize);
          node.style.fontSize = `${(current * node.clientWidth) / node.scrollWidth}px`;
        }
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    observer.observe(document.documentElement);
    measure();
    void document.fonts?.ready.then(() => {
      lastGeometry = "";
      measure();
    });
    return () => observer.disconnect();
  }, [label]);
  return ref;
}
