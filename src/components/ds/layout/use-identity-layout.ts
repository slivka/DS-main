/** Měření identity · vlastní pořadí ústupu a jediný observer · nesmí znát doménu. */
import { useLayoutEffect, useRef, useState } from "react";

/** Měřené šířky jednotlivých částí identity. */
export interface IdentityWidths {
  /** Dostupná šířka řádku. */
  available: number;
  /** Šířka všech položek bez zkrácení. */
  full: number;
  /** Nejmenší šířka při zkráceném názvu účtu. */
  minimum: number;
  /** Plný text stavu. */
  status: number;
  /** Krátký text stavu; bez krátkého tvaru shodný s plným. */
  short: number;
}

/** Účet → krátký stav → trojtečka stavu; návrat má rezervu proti kmitání. */
export function resolveIdentityLevel(widths: IdentityWidths, previous = 0): number {
  const margin = previous > 0 ? 24 : 0;
  if (widths.available >= widths.full + widths.status + margin) return 0;
  if (widths.available >= widths.minimum + widths.status + margin) return 1;
  if (widths.available >= widths.minimum + widths.short + (previous > 2 ? 24 : 0)) return 2;
  return 3;
}

/** Rozměry se synchronizují s DOM, observer vzniká pouze při připojení řádku. */
export function useIdentityLayout() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(0);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const items = row.querySelector<HTMLElement>('[data-slot="identity-line-items"]');
    const full = row.parentElement?.querySelector<HTMLElement>(
      '[data-slot="identity-measure-full"]',
    );
    const minimum = row.parentElement?.querySelector<HTMLElement>(
      '[data-slot="identity-measure-minimum"]',
    );
    if (!items || !full || !minimum) return;
    const copyItems = () => {
      for (const target of [full, minimum]) {
        const copy = items.cloneNode(true);
        if (!(copy instanceof HTMLElement)) continue;
        for (const node of [copy, ...copy.querySelectorAll<HTMLElement>("*")]) {
          for (const name of node.getAttributeNames())
            if (name === "id" || name.startsWith("aria-") || name.startsWith("data-"))
              node.removeAttribute(name);
          // Měření nemá druhou živou tužku ani identifikátory/formulářové atributy.
          if (node.classList.contains("document-identity-pencil-slot")) {
            node.classList.replace("document-identity-pencil-slot", "ds-identity-pencil-measure");
          }
          if (node.classList.contains("document-identity-account-box")) node.dataset.mode = "read";
        }
        target.replaceChildren(copy);
      }
    };
    copyItems();
    const measure = () => {
      if (!row.clientWidth) return;
      const statusEl = row.querySelector<HTMLElement>('[data-slot="identity-line-number"]');
      if (row.dataset.identityLevel === "3" && statusEl) {
        const gap = parseFloat(getComputedStyle(row).gap) || 0;
        const reserve = statusEl.getBoundingClientRect().width + gap;
        // Krajní zoom: pevné hodnoty nesmíme oříznout ani překrýt; výška zůstává control-h.
        const natural = Math.max(1, items.scrollWidth);
        row.style.setProperty("--identity-emergency-scale", String(Math.min(1, (row.clientWidth - reserve - 2) / natural)));
      } else row.style.removeProperty("--identity-emergency-scale");
      const status = row.parentElement?.querySelector<HTMLElement>(
        '[data-slot="identity-measure-status"]',
      );
      const short = row.parentElement?.querySelector<HTMLElement>(
        '[data-slot="identity-measure-short"]',
      );
      if (!full || !minimum || !status || !short) return;
      setLevel((previous) =>
        resolveIdentityLevel(
          {
            available: row.clientWidth,
            full: full.firstElementChild?.getBoundingClientRect().width ?? 0,
            minimum: minimum.firstElementChild?.getBoundingClientRect().width ?? 0,
            status: status.getBoundingClientRect().width,
            short: short.getBoundingClientRect().width,
          },
          previous,
        ),
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const resize = new ResizeObserver(measure);
    resize.observe(row);
    resize.observe(items);
    for (const child of row.parentElement?.querySelectorAll<HTMLElement>(
      "[data-identity-measure]",
    ) ?? [])
      resize.observe(child);
    const mutation = new MutationObserver(() => {
      copyItems();
      measure();
    });
    mutation.observe(items, { childList: true, subtree: true, characterData: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);
  return { rowRef, level };
}
