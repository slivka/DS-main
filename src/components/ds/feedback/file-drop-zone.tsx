/** Výběr souborů · vlastní vstup a sdílené přetažení · nesmí soubory nahrávat. */
import { forwardRef, useId, useRef, type ComponentPropsWithoutRef } from "react";
import { Upload } from "lucide-react";
import { useFileDrop, validateFiles, type RejectedFile } from "../../../hooks/use-file-drop";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button, buttonVariants } from "../../ui/button";
/** Plocha pro výběr a přetažení stejné dávky souborů. */
export interface FileDropZoneProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Povolené přípony nebo MIME; prázdné = všechny. */ accept: readonly string[];
  /** Maximum přijatých souborů v jedné dávce; zbývající kapacitu určuje APP. */ maxFiles?: number;
  /** Maximum velikosti jednoho souboru v bytech. */ maxSizeBytes: number;
  /** Zakázaný výběr a přetažení. */ disabled?: boolean;
  /** Vysvětlení limitů od APP. */ hint?: string;
  /** Přijaté soubory; není voláno pro prázdnou dávku. */ onFiles: (files: File[]) => void;
  /** Odmítnuté soubory s důvody type/size/count. */ onReject?: (rejected: RejectedFile[]) => void;
  /** Velká plocha nebo kompaktní pruh. */ size?: "sm" | "md";
  /** Vlastní popisek tlačítka. */ chooseLabel?: string;
}
/** Obecná vstupní plocha, která předává obsah bez parsování. */
export const FileDropZone = forwardRef<HTMLDivElement, FileDropZoneProps>(function FileDropZone(
  {
    accept,
    maxFiles,
    maxSizeBytes,
    disabled,
    hint,
    onFiles,
    onReject,
    size = "md",
    chooseLabel,
    children,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const t = useDsTexts().fileImport;
  const receive = (files: File[], rejected: RejectedFile[]) => {
    if (files.length) onFiles(files);
    if (rejected.length) onReject?.(rejected);
  };
  const { dragging } = useFileDrop(host, {
    accept,
    maxSize: maxSizeBytes,
    maxFiles,
    disabled,
    onFiles: receive,
  });
  const label = chooseLabel ?? (size === "sm" ? t.add : t.choose);
  return (
    <div ref={ref} {...props} className={cn("min-w-0", className)} data-slot="file-drop-zone">
      <div
        ref={host}
        role="group"
        aria-label={t.drop}
        aria-disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        data-dragging={dragging || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          "rounded-md border border-dashed border-border bg-muted/30",
          size === "sm"
            ? "flex flex-wrap items-center gap-2 p-2"
            : "flex min-h-48 flex-col items-center justify-center gap-4 p-6 text-center",
          dragging && !disabled && "border-primary bg-primary/10",
          disabled && "text-muted-foreground",
        )}
      >
        {children}
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          role="button"
          aria-label={t.drop}
          aria-describedby={hint ? hintId : undefined}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "h-auto max-w-full whitespace-normal p-0 hover:bg-transparent",
            size === "md" && "flex-col gap-4",
          )}
          onClick={() => input.current?.click()}
        >
          {size === "md" ? (
            <>
              <Upload aria-hidden="true" className="size-8 text-muted-foreground" />
              <span className="text-sm font-semibold">{t.drop}</span>
            </>
          ) : null}
          <span className={buttonVariants({ variant: size === "sm" ? "outline" : "default" })}>
            {label}
          </span>
        </Button>
        {hint ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
        <input
          ref={input}
          type="file"
          multiple
          hidden
          disabled={disabled}
          accept={accept.join(",")}
          aria-label={label}
          onChange={(event) => {
            if (!disabled) {
              const result = validateFiles(
                Array.from(event.currentTarget.files ?? []),
                accept,
                maxSizeBytes,
                maxFiles,
              );
              receive(result.files, result.rejected);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
});
