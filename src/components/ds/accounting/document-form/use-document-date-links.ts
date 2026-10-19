/**
 * Vazby datumů · vlastní paměť ručního DUZP a stav vazby UZ ↔ vystavení · nesmí měnit doklad
 * jen pro čtení ani zapisovat do existujícího dokladu při otevření.
 */
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
  /** Výchozí vazba z nastavení uživatele – jen u nového (neuloženého) dokladu. */
  accountingDateLinked: boolean;
  /** Oznámení změny vazby. */
  onAccountingDateLinkedChange?: (linked: boolean) => void;
  /** Hlášení změny pole (zámek hlásí id pole, ne id vazby) – i u řízené vazby. */
  onFieldChange?: (fieldId: string) => void;
}

/** Změna vystavení přepočítá jen data stále navázaná na vystavení. */
export function useDocumentDateLinks(a: DocumentDateLinksArgs) {
  const received = ["FP", "ZFP", "DDPOZ"].includes(a.code);
  const applicable = ["FV", "ZFV", "FP", "ZFP", "DDPOZ", "ID", "BA"].includes(a.code);
  const isNew = !a.value.id;
  const [ownLinked, setOwnLinked] = useState(() =>
    initialAccountingLinked(a.value, a.code, a.accountingDateLinked),
  );
  const locked = a.accountingDateLink?.locked ?? (applicable && ownLinked);
  const manualTaxDate = (v: DocumentHeaderValue) =>
    Boolean(v.taxDate && v.issueDate && v.taxDate !== v.issueDate);
  const edited = useRef(manualTaxDate(a.value));
  const docId = useRef(a.value.id);
  // Jiný doklad: ručně změněné DUZP se odvodí znovu z jeho dat.
  if (docId.current !== a.value.id) {
    docId.current = a.value.id;
    edited.current = manualTaxDate(a.value);
    // Jiný doklad: stav vazby se odvodí znovu z jeho dat (nový doklad z nastavení).
    setOwnLinked(initialAccountingLinked(a.value, a.code, a.accountingDateLinked));
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
        // Existující doklad ukazuje uložené DUZP; vazba se projeví až akcí uživatele.
        taxDate:
          isNew && received && !edited.current
            ? a.value.issueDate || a.value.taxDate
            : a.value.taxDate,
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
  // Jen nový doklad: úvodní vazby se zapíší rodiči (zobrazené = uložené). Existující doklad
  // se při otevření nikdy nezapisuje – jinak by byl neuložený a změnil období zaúčtování.
  useEffect(() => {
    const { value, onChange, locked: l, taxLinked: tl, readOnly } = latest.current;
    if (readOnly || value.id || !value.issueDate) return;
    const next = { ...value };
    if (l && value.accountingDate !== value.issueDate) next.accountingDate = value.issueDate;
    if (tl && value.taxDate !== value.issueDate) next.taxDate = value.issueDate;
    if (next.accountingDate !== value.accountingDate || next.taxDate !== value.taxDate)
      onChange(next);
  }, [a.value.id]); // Záměrně jen při změně dokladu (ostatní čte latest).
  // Řízená vazba z aplikace se obalí, aby i její přepnutí hlásilo změnu pole.
  const external = a.accountingDateLink;
  const link = external
    ? {
        ...external,
        onToggle: (linked: boolean) => {
          external.onToggle(linked);
          a.onFieldChange?.("document-accountingDate");
        },
      }
    : applicable
      ? {
          locked,
          onToggle: (linked: boolean) => {
            setOwnLinked(linked);
            a.onAccountingDateLinkedChange?.(linked);
            a.onFieldChange?.("document-accountingDate");
            if (linked) patch({ accountingDate: a.value.issueDate });
          },
        }
      : undefined;
  return { patch, effectiveValue, link };
}

/** Stav vazby UZ ↔ vystavení: existující doklad (a BA) z dat, nový doklad z nastavení. */
function initialAccountingLinked(
  value: DocumentHeaderValue,
  code: string,
  preference: boolean,
): boolean {
  const fromData = !value.issueDate || value.accountingDate === value.issueDate;
  if (code === "BA") return !value.accountingDate || fromData;
  return value.id ? fromData : preference;
}
