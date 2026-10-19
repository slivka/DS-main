/** Vazby datumů · vlastní paměť ručního DUZP a úvodní zápis vazeb přes efekt · nesmí měnit doklad jen pro čtení. */
import { useEffect, useRef, useState } from "react";
import { applyDocumentDateLinks } from "./document-date-linking";
import type { DocumentAccountingDateLink, DocumentHeaderValue } from "./document-form-types";

/** Vstupy vazeb datumů dokladu. */
export interface DocumentDateLinksArgs {
  /** Typ dokladu. */
  code: string;
  /** Řízená hlavička. */
  value: DocumentHeaderValue;
  /** Změna hlavičky. */
  onChange: (next: DocumentHeaderValue) => void;
  /** Doklad jen pro čtení se při otevření ani změně vazby nezapisuje. */
  readOnly?: boolean;
  /** Existující řízená vazba má přednost. */
  accountingDateLink?: DocumentAccountingDateLink;
  /** Povolit výchozí vazbu. */
  accountingDateLinked: boolean;
  /** Oznámení změny vazby. */
  onAccountingDateLinkedChange?: (linked: boolean) => void;
}

/** Změna vystavení přepočítá jen data stále navázaná na vystavení. */
export function useDocumentDateLinks(a: DocumentDateLinksArgs) {
  const received = ["FP", "ZFP", "DDPOZ"].includes(a.code);
  const applicable = ["FV", "ZFV", "FP", "ZFP", "DDPOZ", "ID", "BA"].includes(a.code);
  // Bankovní pohyb: výchozí stav vazby z rovnosti Data pohybu a Data účetního případu.
  const [ownLinked, setOwnLinked] = useState(
    a.code !== "BA" || !a.value.accountingDate || a.value.accountingDate === a.value.issueDate,
  );
  const locked =
    a.accountingDateLink?.locked ?? (applicable && a.accountingDateLinked && ownLinked);
  const manualTaxDate = (v: DocumentHeaderValue) =>
    Boolean(v.taxDate && v.issueDate && v.taxDate !== v.issueDate);
  const edited = useRef(manualTaxDate(a.value));
  const docId = useRef(a.value.id);
  // Jiný doklad: ručně změněné DUZP se odvodí znovu z jeho dat.
  if (docId.current !== a.value.id) {
    docId.current = a.value.id;
    edited.current = manualTaxDate(a.value);
    // Bankovní pohyb: stav vazby se při změně dokladu přepočítá z rovnosti dat.
    if (a.code === "BA")
      setOwnLinked(!a.value.accountingDate || a.value.accountingDate === a.value.issueDate);
  }
  const patch = (next: Partial<DocumentHeaderValue>) => {
    if (a.readOnly) return;
    if (next.taxDate !== undefined) edited.current = true;
    a.onChange(applyDocumentDateLinks(a.value, next, locked, received && !edited.current));
  };
  const effectiveValue = a.readOnly
    ? a.value
    : {
        ...a.value,
        accountingDate: locked ? a.value.issueDate : a.value.accountingDate,
        taxDate:
          received && !edited.current ? a.value.issueDate || a.value.taxDate : a.value.taxDate,
      };
  const taxLinked = received && !edited.current;
  const latest = useRef({
    value: a.value,
    onChange: a.onChange,
    locked,
    taxLinked,
    readOnly: a.readOnly,
  });
  latest.current = {
    value: a.value,
    onChange: a.onChange,
    locked,
    taxLinked,
    readOnly: a.readOnly,
  };
  // Synchronizace s rodičem jednou při otevření dokladu: zobrazené = uložené.
  // Změny vystavení zapisuje přímo patch, efekt proto závisí jen na id dokladu.
  useEffect(() => {
    const { value, onChange, locked: l, taxLinked: tl, readOnly } = latest.current;
    if (readOnly || !value.issueDate) return;
    const next = { ...value };
    if (l && value.accountingDate !== value.issueDate) next.accountingDate = value.issueDate;
    if (tl && value.taxDate !== value.issueDate) next.taxDate = value.issueDate;
    if (next.accountingDate !== value.accountingDate || next.taxDate !== value.taxDate)
      onChange(next);
  }, [a.value.id]); // Záměrně jen při změně dokladu (ostatní čte latest).
  const link =
    a.accountingDateLink ??
    (applicable
      ? {
          locked,
          onToggle: (linked: boolean) => {
            setOwnLinked(linked);
            a.onAccountingDateLinkedChange?.(linked);
            if (linked) patch({ accountingDate: a.value.issueDate });
          },
        }
      : undefined);
  return { patch, effectiveValue, link };
}
