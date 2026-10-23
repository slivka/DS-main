/** České texty panelu · vlastní výchozí texty · nesmí obsahovat logiku oprávnění. */
import type {
  AttachmentTexts,
  RecordHistoryTexts,
  RecordNotesTexts,
  RecordPanelTexts,
  SourcePreviewTexts,
} from "./record-panel-texts";
/** Panel záznamu. */
export const RECORD_PANEL_CS: RecordPanelTexts = {
  panel: "Panel",
  open: "Otevřít panel",
  resize: "Změnit šířku panelu",
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
  add: "Přidat přílohu",
  setSource: "Použít jako zdroj",
  filter: "Filtr příloh",
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
/** Náhled zdroje záznamu. */
export const SOURCE_PREVIEW_CS: SourcePreviewTexts = {
  upload: "Nahrát zdroj",
  noPreview: "Náhled tohoto typu není k dispozici.",
  inherited: "Zděděno z",
  expired: "Adresa náhledu vypršela – načtěte ji znovu.",
};
/** Historie záznamu. */
export const RECORD_HISTORY_CS: RecordHistoryTexts = {
  showAll: "Zobrazit vše",
  modeLabel: "Režim historie",
  basic: "Základní",
  detailed: "Rozšířený",
  filterLabel: "Typy událostí",
  kinds: {
    status: "Stavy",
    change: "Údaje",
    attachment: "Přílohy",
    note: "Poznámky",
    link: "Vazby",
  },
  today: "Dnes",
  yesterday: "Včera",
  empty: "Zatím bez historie.",
  emptyFiltered: "Vybraným typům neodpovídá žádná událost.",
  loading: "Načítám historii…",
  field: "Pole",
  before: "Bylo",
  after: "Je",
  system: "Systém",
  changesCount: (count) =>
    `${count} ${count === 1 ? "změna" : count >= 2 && count <= 4 ? "změny" : "změn"}`,
  autoSummary: (count) => `Automatické přepočty (${count})`,
  lineAdded: (label) => `Přidán ${label}`,
  lineRemoved: (label) => `Odebrán ${label}`,
};
