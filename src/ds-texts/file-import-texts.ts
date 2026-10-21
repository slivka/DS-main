/** Import souborů · vlastní jazykový kontrakt · nesmí znát bankovní kontroly. */
export interface FileImportTexts {
  /** Výzva přetažení. */ drop: string;
  /** Výběr souborů. */ choose: string;
  /** Přidání souborů. */ add: string;
  /** Odebrání souboru, token {name}. */ remove: string;
  /** Další soubory, token {count}. */ more: string;
  /** Sbalení souborů. */ less: string;
  /** Výchozí názvy stavů. */ severity: Record<"ok" | "info" | "warning" | "error" | "loading", string>;
  /** Souhrn kontrol, tokeny {errors}, {warnings}. */ summary: string;
  /** Prázdné kontroly. */ noChecks: string;
  /** Výběr všech povolených položek. */ selectValid: string;
  /** Výchozí důvod zakázaného zaškrtnutí. */ errorBlocked: string;
  /** Prázdný seznam. */ empty: string;
}