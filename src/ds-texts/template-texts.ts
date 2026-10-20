/** Texty vzorů · vlastní veřejné klíče · nesmí obsahovat data dokladů. */
export interface TemplateTexts {
  /** Nový doklad. */ newDocument: string;
  /** Prázdný doklad. */ blank: string;
  /** Nabídka vzorů. */ fromTemplate: string;
  /** Důvod prázdné nabídky. */ noTemplates: string;
  /** Vytvoření. */ create: string;
  /** Série. */ createSeries: string;
  /** Správa. */ manage: string;
  /** Dialog. */ duplicate: string;
  /** Režim. */ mode: string;
  /** Jeden doklad. */ single: string;
  /** Série dokladů. */ series: string;
  /** Datum. */ date: string;
  /** První datum. */ firstDate: string;
  /** Počet měsíců. */ months: string;
  /** Den. */ day: string;
  /** Období. */ period: string;
  /** Popis. */ description: string;
  /** Problém. */ problem: string;
  /** Souhrn. */ summary: (created: number, total: number) => string;
  /** Načítání. */ loading: string;
  /** Název. */ name: string;
  /** Autor. */ author: string;
  /** Sdílení. */ sharing: string;
  /** Soukromý vzor. */ private: string;
  /** Firemní vzor. */ company: string;
  /** Bez částek. */ withoutAmounts: string;
  /** Přejmenování. */ rename: string;
  /** Sdílet. */ share: string;
  /** Nesdílet. */ unshare: string;
  /** Úprava. */ edit: string;
  /** Smazání. */ remove: string;
  /** Potvrzení. */ removeConfirm: (name: string) => string;
  /** Pruh. */ editing: (name: string) => string;
  /** Uložení vzoru. */ saveTemplate: string;
  /** Zahození. */ discard: string;
}
