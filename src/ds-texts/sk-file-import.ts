/** Import souborů · vlastní slovenské texty · nesmí řídit import. */
import type { FileImportTexts } from "./file-import-texts";
/** Slovenské texty importních prvků. */
export const FILE_IMPORT_SK: FileImportTexts = {
  drop: "Presuňte súbory sem",
  choose: "Vybrať súbory…",
  add: "Pridať súbory…",
  remove: "Odobrať {name}",
  more: "+{count} ďalších",
  less: "Zobraziť menej",
  severity: {
    ok: "V poriadku",
    info: "Informácia",
    warning: "Upozornenie",
    error: "Chyba",
    loading: "Načítava sa",
  },
  summary: "{errors} chýb · {warnings} upozornení",
  noChecks: "Žiadne kontroly",
  selectValid: "Vybrať všetko bez chýb",
  errorBlocked: "Položku s chybou nemožno vybrať",
  empty: "Žiadne položky",
};
