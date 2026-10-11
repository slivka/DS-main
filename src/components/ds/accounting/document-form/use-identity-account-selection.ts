/** Výběr identity · vlastní návrat fokusu a dočasný popisek · nesmí měnit doklad. */
import { useEffect, useRef, useState } from "react";

/** Dočasný popisek zvoleného účtu. */
interface SelectedAccount {
  /** Kód účtu. */
  code: string;
  /** Popisek z číselníku. */
  label: string;
  /** Původní popisek identity. */
  sourceLabel?: string;
}

/** Zachová výběr identity a návrat fokusu bez změny veřejného kontraktu. */
export function useIdentityAccountSelection(
  accountId: string | null | undefined,
  sourceLabel: string | undefined,
  sameAccount: (a?: string | null, b?: string | null) => boolean,
) {
  const [editingIdentityAccount, setEditing] = useState(false);
  const [selected, setSelected] = useState<SelectedAccount | null>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  useEffect(() => {
    if (editingIdentityAccount || !returnFocus.current) return;
    returnFocus.current = false;
    pencilRef.current?.focus();
  }, [editingIdentityAccount]);
  useEffect(() => {
    if (
      selected &&
      (!sameAccount(selected.code, accountId) || sourceLabel !== selected.sourceLabel)
    )
      setSelected(null);
  }, [accountId, sourceLabel, sameAccount, selected]);
  return {
    editingIdentityAccount,
    pencilRef,
    identityAccountLabel:
      selected && sameAccount(selected.code, accountId) ? selected.label : sourceLabel,
    startAccountEdit: () => setEditing(true),
    selectIdentityAccount: setSelected,
    closeIdentityAccount: () => {
      returnFocus.current = true;
      setEditing(false);
    },
  };
}
