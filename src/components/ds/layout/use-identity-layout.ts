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
  /** Šířky ústupu stavu, knihy, kódů a ikony včetně levé části. */
  compact?: number[];
}

/** Účet → krátký stav → trojtečka stavu; návrat má rezervu proti kmitání. */
export function resolveIdentityLevel(widths: IdentityWidths, previous = 0): number {
  const margin = previous > 0 ? 24 : 0;
  if (widths.available >= widths.full + widths.status + margin) return 0;
  if (widths.available >= widths.minimum + widths.status + margin) return 1;
  if (widths.available >= widths.minimum + widths.short + (previous > 2 ? 24 : 0)) return 2;
  for (const [index, required] of (widths.compact ?? []).entries()) {
    const next = index + 3;
    if (widths.available >= required + (previous > next ? 24 : 0)) return next;
  }
  return widths.compact ? 8 : 3;
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
    if (!row.clientWidth) return;
    copyItems();
    const measure = () => {
      if (!row.clientWidth) return;
      const status = row.parentElement?.querySelector<HTMLElement>(
        '[data-slot="identity-measure-status"]',
      );
      const short = row.parentElement?.querySelector<HTMLElement>(
        '[data-slot="identity-measure-short"]',
      );
      if (!full || !minimum || !status || !short) return;
      const left = minimum.firstElementChild;
      const book = left?.querySelector<HTMLElement>(".ds-identity-book-full");
      const code = left?.querySelector<HTMLElement>(".ds-identity-book-code");
      const base = left?.getBoundingClientRect().width ?? 0;
      const bookWidth = book?.getBoundingClientRect().width ?? 0;
      const codeWidth = code?.scrollWidth || 0;
      const unit = parseFloat(getComputedStyle(row).fontSize);
      const compactBook = Math.max(0, base - bookWidth + (codeWidth || unit * 2));
      const compactAccount = Math.max(0, compactBook - unit);
      const realNumber = row.dataset.pending !== "true";
      const right = realNumber ? status.getBoundingClientRect().width : unit;
      setLevel((previous) =>
        resolveIdentityLevel(
          {
            available: row.clientWidth,
            full: full.firstElementChild?.getBoundingClientRect().width ?? 0,
            minimum: minimum.firstElementChild?.getBoundingClientRect().width ?? 0,
            status: status.getBoundingClientRect().width,
            short: short.getBoundingClientRect().width,
            compact: [
              base + right,
              base - bookWidth + unit * 3 + right,
              compactBook + right,
              compactAccount + right,
              compactAccount + (realNumber ? right : unit),
            ],
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
