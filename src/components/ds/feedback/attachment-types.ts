/** Přílohy · vlastní datové kontrakty · nesmí obsahovat doménu ani ukládání. */
import type { ComponentPropsWithoutRef } from "react";
import type { AttachmentTexts } from "../../../ds-texts";
import type { RejectedFile } from "../../../hooks/use-file-drop";
/** Jedna příloha dodaná aplikací. */
export interface RecordAttachment {
  /** Klíč přílohy. */
  id: string;
  /** Název souboru. */
  name: string;
  /** MIME typ. */
  type: string;
  /** Velikost v bytech. */
  size: number;
  /** URL pro otevření či stažení. */
  url?: string;
  /** URL PDF nebo obrázku; aplikace je autoritou pro přístup. */
  previewUrl?: string;
  /** Autor nahrání. */
  uploadedBy?: string | null;
  /** Čas nahrání. */
  uploadedAt: string;
  /** Čas odebrání. */
  removedAt?: string | null;
  /** Autor odebrání. */
  removedBy?: string | null;
  /** Důvod odebrání. */
  removalReason?: string | null;
  /** Procenta probíhajícího nahrávání. */
  progress?: number;
  /** Chyba konkrétního souboru. */
  error?: string | null;
}
/** Props seznamu příloh; aplikace dodává data, URL i všechny operace. */
export interface AttachmentListProps extends ComponentPropsWithoutRef<"div"> {
  /** Ostatní přílohy. */
  attachments: readonly RecordAttachment[];
  /** Zdroj oddělený od ostatních příloh. */
  source?: RecordAttachment | null;
  /** Povolené MIME typy a přípony. */
  accept: readonly string[];
  /** Limit jednoho souboru v bytech. */
  maxSize: number;
  /** Právo přidat; false ponechá zablokovanou akci s důvodem. */
  canAdd?: boolean;
  /** Důvod zákazu přidání. */
  addDisabledReason?: string;
  /** Přijaté a odmítnuté soubory z výběru i drop zóny. */
  onFiles?: (files: File[], rejected: RejectedFile[]) => void;
  /** Oprávnění odebrat konkrétní přílohu. */
  canRemove?: (attachment: RecordAttachment) => boolean;
  /** Důvod zákazu odebrání. */
  removeDisabledReason?: (attachment: RecordAttachment) => string | undefined;
  /** Rozlišení fyzického smazání a logického odebrání; null bez akce. */
  removeKind?: (attachment: RecordAttachment) => "delete" | "remove" | null;
  /** Potvrzená operace; důvod pouze u odebrání. */
  onRemove?: (
    attachment: RecordAttachment,
    kind: "delete" | "remove",
    reason?: string,
  ) => void | Promise<void>;
  /** Nabídnout volitelný důvod odebrání. */
  allowRemovalReason?: boolean;
  /** Náhrada zdroje. */
  onReplaceSource?: (source: RecordAttachment) => void | Promise<void>;
  /** Právo nahradit zdroj. */
  canReplaceSource?: boolean;
  /** Důvod zákazu náhrady. */
  replaceDisabledReason?: string;
  /** Stažení přes aplikaci; jinak odkaz z url. */
  onDownload?: (attachment: RecordAttachment) => void;
  /** Otevření přes aplikaci; jinak odkaz z url. */
  onOpen?: (attachment: RecordAttachment) => void;
  /** Lokální texty mají přednost před DsTexts. */
  texts?: Partial<AttachmentTexts>;
}
