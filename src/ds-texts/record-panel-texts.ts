/** Texty panelu záznamu · vlastní kontrakt překladů · nesmí obsahovat data záznamu. */
export interface RecordPanelTexts {
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
