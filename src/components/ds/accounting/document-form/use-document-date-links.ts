/** Vazby datumů · vlastní paměť ručního DUZP · nesmí synchronizovat props efektem. */
import { useRef, useState } from "react";
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
  const applicable = ["FV", "ZFV", "FP", "ZFP", "DDPOZ", "ID"].includes(a.code);
  const [ownLinked, setOwnLinked] = useState(true);
  const locked =
    a.accountingDateLink?.locked ?? (applicable && a.accountingDateLinked && ownLinked);
  const edited = useRef(Boolean(a.value.taxDate && a.value.taxDate !== a.value.issueDate));
  const patch = (next: Partial<DocumentHeaderValue>) => {
    if (next.taxDate !== undefined) edited.current = true;
    a.onChange(applyDocumentDateLinks(a.value, next, locked, received && !edited.current));
  };
  const effectiveValue = {
    ...a.value,
    accountingDate: locked ? a.value.issueDate : a.value.accountingDate,
    taxDate: received && !edited.current ? a.value.issueDate || a.value.taxDate : a.value.taxDate,
  };
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
