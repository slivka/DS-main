/** Typy vzorů · vlastní kontrakt APP · nesmí počítat období ani načítat data. */
/** Režim vytváření. */
export type DuplicationMode = "single" | "series";
/** Řízené parametry náhledu. */
export interface DuplicationValue {
  /** Režim. */ mode: DuplicationMode;
  /** Datum dodané APP, ISO. */ date: string;
  /** Počet měsíců 1–24. */ months: number;
  /** Den 1–31. */ day: number;
}
/** Již vypočtený řádek náhledu od APP. */
export interface DuplicationPreviewRow {
  /** Identita. */ id: string;
  /** Datum, ISO. */ date: string;
  /** Zmapovaný popisek období. */ period: string;
  /** Popis. */ description: string;
  /** APP rozhoduje, zda řádek vznikne. */ canCreate: boolean;
  /** Důvod nevytvoření. */ problem?: string;
}
/** Oprávnění akce. */
export interface TemplatePermission {
  /** Povolení. */ allowed: boolean;
  /** Důvod zákazu. */ reason?: string;
}
/** Vzor pro nabídku i správu. */
export interface DocumentTemplate {
  /** Identita. */ id: string;
  /** Název. */ name: string;
  /** Autor. */ author: string;
  /** Sdílený ve firmě. */ shared: boolean;
  /** Bez částek. */ withoutAmounts: boolean;
  /** Přejmenovat. */ canRename: TemplatePermission;
  /** Změnit sdílení. */ canShare: TemplatePermission;
  /** Upravit. */ canEdit: TemplatePermission;
  /** Smazat. */ canDelete: TemplatePermission;
}
/** Akce správy; APP řeší zápis. */
export type TemplateAction = "rename" | "share" | "unshare" | "edit" | "delete";
