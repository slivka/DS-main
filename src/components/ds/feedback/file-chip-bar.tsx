/** Pruh souborů · vlastní prezentaci a odebrání · nesmí zpracovávat soubory. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { X } from "lucide-react";
import { FileDropZone, type FileDropZoneProps } from "./file-drop-zone";
import { FileSeverityIcon, type FileSeverity } from "./file-severity";
import { useDsTexts } from "../../../ds-texts";
import { formatFileSize } from "../../../lib/file-size";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
/** Soubor a jeho stav dodaný APP. */
export interface FileChip {
  /** Stabilní klíč. */ id: string;
  /** Soubor. */ file: File;
  /** Stav zpracování. */ severity?: FileSeverity;
  /** Vysvětlení stavu. */ message?: string;
}
/** Řízený seznam souborů; limity platí pro další dávku. */
export interface FileChipBarProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Vybrané soubory. */ files: readonly FileChip[];
  /** Odebrání podle stabilního klíče. */ onRemove: (id: string) => void;
  /** Povolené typy. */ accept: FileDropZoneProps["accept"];
  /** Zbývající počet pro další dávku. */ maxFiles?: number;
  /** Limit jednoho souboru. */ maxSizeBytes: number;
  /** Zákaz změn. */ disabled?: boolean;
  /** Další přijaté soubory. */ onFiles: FileDropZoneProps["onFiles"];
  /** Odmítnuté soubory. */ onReject?: FileDropZoneProps["onReject"];
  /** Počet čipů před odkazem +N; bez hodnoty všechny zalomené. */ maxVisible?: number;
}
/** Kompaktní plocha přijímá přetažení i při sbalení dlouhého seznamu. */
export const FileChipBar = forwardRef<HTMLDivElement, FileChipBarProps>(
  function FileChipBar({ files, onRemove, accept, maxFiles, maxSizeBytes, disabled, onFiles,
    onReject, maxVisible, className, ...props }, ref) {
    const [expanded, setExpanded] = useState(false);
    const texts = useDsTexts();
    const t = texts.fileImport;
    const limit = maxVisible === undefined ? files.length : Math.max(0, Math.floor(maxVisible));
    const visible = expanded ? files : files.slice(0, limit);
    return <div ref={ref} {...props} className={cn("min-w-0", className)} data-slot="file-chip-bar">
      <FileDropZone size="sm" accept={accept} maxFiles={maxFiles} maxSizeBytes={maxSizeBytes}
        disabled={disabled} onFiles={onFiles} onReject={onReject}>
        {visible.map(({ id, file, severity = "ok", message }) => <div key={id}
          className="flex max-w-full items-center gap-2 rounded-sm border bg-card px-2 py-1 text-xs">
          <FileSeverityIcon severity={severity} message={message} />
          <span className="min-w-0 max-w-48 truncate" title={file.name}>{file.name}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">{formatFileSize(file.size, texts.intlLocale)}</span>
          <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon"
            disabled={disabled} aria-label={t.remove.replace("{name}", file.name)} onClick={() => onRemove(id)}>
            <X aria-hidden="true" className="size-3" /></Button></TooltipTrigger>
            <TooltipContent>{t.remove.replace("{name}", file.name)}</TooltipContent></Tooltip>
        </div>)}
        {files.length > limit ? <Button type="button" variant="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? t.less : t.more.replace("{count}", new Intl.NumberFormat(texts.intlLocale).format(files.length - visible.length))}
        </Button> : null}
      </FileDropZone>
    </div>;
  },
);