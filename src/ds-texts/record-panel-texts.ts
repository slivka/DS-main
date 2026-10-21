/** Texty panelu záznamu · vlastní kontrakt překladů · nesmí obsahovat data záznamu. */
export interface RecordPanelTexts {
  /** Přístupný název tlačítka a panelu. */
  panel: string;
  /** Přístupný název táhla. */
  resize: string;
  /** Zavření panelu. */
  close: string;
  /** Připnutí záznamu. */
  pin: string;
  /** Uvolnění záznamu. */
  unpin: string;
  /** Rozšíření panelu. */
  widen: string;
  /** Zúžení panelu. */
  narrow: string;
  /** Otevření vedle. */
  adjacent: string;
  /** Souhrn více vybraných záznamů. */
  selected: (count: string) => string;
}
/** Texty existujících poznámek a připnutí. */
export interface RecordNotesTexts {
  /** Výzva nového textu. */
  placeholder: string;
  /** Přidání. */
  add: string;
  /** Uložení. */
  save: string;
  /** Zrušení. */
  cancel: string;
  /** Úprava. */
  edit: string;
  /** Odstranění. */
  remove: string;
  /** Prázdný seznam. */
  empty: string;
  /** Řazení od nejnovějších. */
  sortNewest: string;
  /** Řazení od nejstarších. */
  sortOldest: string;
  /** Potvrzení odstranění. */
  confirmRemove: string;
  /** Připnutí. */
  pin: string;
  /** Odepnutí. */
  unpin: string;
  /** Štítek připnutí. */
  pinned: string;
  /** Označení úpravy. */
  edited: string;
  /** Selhání operace. */
  failed: string;
}
/** Texty příloh bez doménových pravidel. */
export interface AttachmentTexts {
  /** Použití souboru jako zdroje. */
  setSource: string;
  /** Filtr příloh. */
  filter: string;
  /** Zdroj záznamu. */
  source: string;
  /** Náhrada zdroje. */
  replace: string;
  /** Přidání souborů. */
  add: string;
  /** Přetažení souborů. */
  drop: string;
  /** Stažení souboru. */
  download: string;
  /** Otevření souboru. */
  open: string;
  /** Fyzické smazání. */
  delete: string;
  /** Logické odebrání. */
  remove: string;
  /** Potvrzení smazání. */
  confirmDelete: string;
  /** Potvrzení odebrání. */
  confirmRemove: string;
  /** Volitelný důvod. */
  reason: string;
  /** Přepínač odebraných. */
  showRemoved: string;
  /** Záznam odebrání. */
  removed: string;
  /** Prázdný seznam. */
  empty: string;
  /** Nepovolený typ. */
  invalidType: string;
  /** Nadlimitní soubor. */
  tooLarge: string;
  /** Selhání operace. */
  failed: string;
  /** Chybějící oprávnění. */
  denied: string;
}
/** Texty časové osy historie záznamu. */
export interface RecordHistoryTexts {
  /** Zrušení filtru. */
  showAll: string;
  /** Název přepínače režimu. */
  modeLabel: string;
  /** Základní režim. */
  basic: string;
  /** Rozšířený režim. */
  detailed: string;
  /** Název filtru typů. */
  filterLabel: string;
  /** Popisky typů událostí. */
  kinds: { status: string; change: string; attachment: string; note: string; link: string };
  /** Skupina dnešních událostí. */
  today: string;
  /** Skupina včerejších událostí. */
  yesterday: string;
  /** Prázdná historie. */
  empty: string;
  /** Prázdný výsledek filtru. */
  emptyFiltered: string;
  /** Načítání. */
  loading: string;
  /** Hlavička sloupce pole. */
  field: string;
  /** Hlavička původní hodnoty. */
  before: string;
  /** Hlavička nové hodnoty. */
  after: string;
  /** Autor bez jména. */
  system: string;
  /** Souhrn počtu změn se správným tvarem slova podle čísla. */
  changesCount: (count: number) => string;
  /** Řádek automatických přepočtů. */
  autoSummary: (count: string) => string;
  /** Přidaný řádek. */
  lineAdded: (label: string) => string;
  /** Odebraný řádek. */
  lineRemoved: (label: string) => string;
}
