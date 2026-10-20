/** České texty panelu · vlastní výchozí texty · nesmí obsahovat logiku oprávnění. */
import type { AttachmentTexts, RecordNotesTexts, RecordPanelTexts } from "./record-panel-texts";
/** Panel záznamu. */
export const RECORD_PANEL_CS: RecordPanelTexts = {
  close: "Zavřít panel",
  pin: "Připnout k záznamu",
  unpin: "Uvolnit záznam",
  widen: "Rozšířit panel",
  narrow: "Zúžit panel",
  adjacent: "Otevřít v sousedním okně",
  selected: (count) => `Vybráno ${count} dokladů`,
};
/** Poznámky záznamu. */
export const RECORD_NOTES_CS: RecordNotesTexts = {
  placeholder: "Nová poznámka…",
  add: "Přidat",
  save: "Uložit",
  cancel: "Zrušit",
  edit: "Upravit",
  remove: "Odstranit",
  empty: "Zatím bez poznámek.",
  sortNewest: "Nejnovější nahoře",
  sortOldest: "Nejstarší nahoře",
  confirmRemove: "Opravdu odstranit poznámku?",
  pin: "Připnout",
  unpin: "Odepnout",
  pinned: "Připnutá",
  edited: "upraveno",
  failed: "Poznámku se nepodařilo uložit.",
};
/** Přílohy záznamu. */
export const ATTACHMENTS_CS: AttachmentTexts = {
  source: "Zdroj",
  replace: "Nahradit",
  add: "Přidat přílohy",
  drop: "Přetáhnout soubory",
  download: "Stáhnout",
  open: "Otevřít",
  delete: "Smazat",
  remove: "Odebrat",
  confirmDelete: "Opravdu smazat přílohu?",
  confirmRemove: "Opravdu odebrat přílohu?",
  reason: "Důvod odebrání (nepovinný)",
  showRemoved: "Zobrazit odebrané",
  removed: "Odebráno",
  empty: "Žádné přílohy.",
  invalidType: "Nepovolený typ souboru",
  tooLarge: "Soubor překračuje limit",
  failed: "Operace s přílohou se nezdařila.",
  denied: "Nemáte oprávnění k této akci.",
};
