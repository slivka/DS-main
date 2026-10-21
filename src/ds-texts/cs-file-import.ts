/** Import souborů · vlastní české texty · nesmí řídit import. */
import type { FileImportTexts } from "./file-import-texts";
/** České texty importních prvků. */
export const FILE_IMPORT_CS: FileImportTexts = {
  drop: "Přetáhněte soubory sem",
  choose: "Vybrat soubory…",
  add: "Přidat soubory…",
  remove: "Odebrat {name}",
  more: "+{count} dalších",
  less: "Zobrazit méně",
  severity: {
    ok: "V pořádku",
    info: "Informace",
    warning: "Upozornění",
    error: "Chyba",
    loading: "Načítá se",
  },
  summary: "{errors} · {warnings}",
  errorForms: ["chyba", "chyby", "chyb"],
  warningForms: ["upozornění", "upozornění", "upozornění"],
  noChecks: "Žádné kontroly",
  selectValid: "Vybrat vše bez chyb",
  errorBlocked: "Položku s chybou nelze vybrat",
  empty: "Žádné položky",
};
