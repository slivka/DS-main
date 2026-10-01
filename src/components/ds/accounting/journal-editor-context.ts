/**
 * Sdílený kontext částí editoru řádků.
 * Vlastní: předání stavu a klávesnice z `JournalLinesEditor` do řádků, buněk a patičky.
 * Nesmí: být použit mimo editor řádků; není součástí veřejného API.
 */
import * as React from "react";

import type { JournalEditorState } from "./useJournalEditorState";
import type { JournalKeyboard } from "./useJournalKeyboard";

/** Hodnota kontextu editoru. */
export interface JournalEditorContextValue {
  /** Stav a akce editoru. */
  editor: JournalEditorState;
  /** Klávesové akce. */
  keyboard: JournalKeyboard;
}

/** Kontext částí editoru; hodnotu dodává `JournalLinesEditor`. */
export const JournalEditorContext = React.createContext<JournalEditorContextValue | null>(null);

/** Stav editoru pro jeho části; mimo editor vyhodí chybu. */
export function useJournalEditor(): JournalEditorContextValue {
  const value = React.useContext(JournalEditorContext);
  if (!value) throw new Error("Části editoru řádků musí být uvnitř JournalLinesEditor.");
  return value;
}
