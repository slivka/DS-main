/** Slovenské texty panelu · vlastní překlady · nesmí obsahovat logiku oprávnění. */
import type {
  AttachmentTexts,
  RecordHistoryTexts,
  RecordNotesTexts,
  RecordPanelTexts,
} from "./record-panel-texts";
/** Panel záznamu. */
export const RECORD_PANEL_SK: RecordPanelTexts = {
  close: "Zavrieť panel",
  pin: "Pripnúť k záznamu",
  unpin: "Uvoľniť záznam",
  widen: "Rozšíriť panel",
  narrow: "Zúžiť panel",
  adjacent: "Otvoriť v susednom okne",
  selected: (count) => `Vybraných ${count} dokladov`,
};
/** Poznámky záznamu. */
export const RECORD_NOTES_SK: RecordNotesTexts = {
  placeholder: "Nová poznámka…",
  add: "Pridať",
  save: "Uložiť",
  cancel: "Zrušiť",
  edit: "Upraviť",
  remove: "Odstrániť",
  empty: "Zatiaľ bez poznámok.",
  sortNewest: "Najnovšie navrchu",
  sortOldest: "Najstaršie navrchu",
  confirmRemove: "Naozaj odstrániť poznámku?",
  pin: "Pripnúť",
  unpin: "Odopnúť",
  pinned: "Pripnutá",
  edited: "upravené",
  failed: "Poznámku sa nepodarilo uložiť.",
};
/** Přílohy záznamu. */
export const ATTACHMENTS_SK: AttachmentTexts = {
  source: "Zdroj",
  replace: "Nahradiť",
  add: "Pridať prílohy",
  drop: "Pretiahnuť súbory",
  download: "Stiahnuť",
  open: "Otvoriť",
  delete: "Zmazať",
  remove: "Odobrať",
  confirmDelete: "Naozaj zmazať prílohu?",
  confirmRemove: "Naozaj odobrať prílohu?",
  reason: "Dôvod odobratia (nepovinný)",
  showRemoved: "Zobraziť odobraté",
  removed: "Odobraté",
  empty: "Žiadne prílohy.",
  invalidType: "Nepovolený typ súboru",
  tooLarge: "Súbor prekračuje limit",
  failed: "Operácia s prílohou zlyhala.",
  denied: "Nemáte oprávnenie na túto akciu.",
};
/** História záznamu. */
export const RECORD_HISTORY_SK: RecordHistoryTexts = {
  modeLabel: "Režim histórie",
  basic: "Základný",
  detailed: "Rozšírený",
  filterLabel: "Typy udalostí",
  kinds: {
    status: "Stavy",
    change: "Údaje",
    attachment: "Prílohy",
    note: "Poznámky",
    link: "Väzby",
  },
  today: "Dnes",
  yesterday: "Včera",
  empty: "Zatiaľ bez histórie.",
  emptyFiltered: "Vybraným typom nezodpovedá žiadna udalosť.",
  loading: "Načítavam históriu…",
  field: "Pole",
  before: "Bolo",
  after: "Je",
  system: "Systém",
  changesCount: (count) => `${count} zmien`,
  autoSummary: (count) => `Automatické prepočty (${count})`,
  lineAdded: (label) => `Pridaný ${label}`,
  lineRemoved: (label) => `Odobraný ${label}`,
};
