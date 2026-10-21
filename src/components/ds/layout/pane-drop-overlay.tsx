/** Překryv přetažení · vlastní místní cíl souborů · nesmí zachytávat interní DnD. */
import { forwardRef, useRef, type ComponentPropsWithoutRef } from "react";
import { Upload } from "lucide-react";
import { useFileDrop, type RejectedFile } from "../../../hooks/use-file-drop";
import { cn } from "../../../lib/utils";
/** Obal stránky nebo podokna s přijímáním souborů. */
export interface PaneDropOverlayProps extends ComponentPropsWithoutRef<"div"> {
  /** Výzva dodaná APP. */ label: string;
  /** Přijaté soubory z OS. */ onFiles: (files: File[]) => void;
  /** Zakázaný cíl; vnořený povolený cíl má vždy přednost. */ disabled?: boolean;
  /** Volitelná validace typů. */ accept?: readonly string[];
  /** Volitelná velikost jednoho souboru. */ maxSizeBytes?: number;
  /** Volitelný limit dávky. */ maxFiles?: number;
  /** Odmítnutí podle limitů. */ onReject?: (rejected: RejectedFile[]) => void;
}
/** Bez přetažení ponechává obsah i kliknutí beze změny. */
export const PaneDropOverlay = forwardRef<HTMLDivElement, PaneDropOverlayProps>(
  function PaneDropOverlay({ label, onFiles, disabled, accept = [], maxSizeBytes = Infinity,
    maxFiles, onReject, children, className, ...props }, ref) {
    const host = useRef<HTMLDivElement>(null);
    const { dragging } = useFileDrop(host, { accept, maxSize: maxSizeBytes, maxFiles, disabled,
      onFiles: (files, rejected) => {
        if (files.length) onFiles(files);
        if (rejected.length) onReject?.(rejected);
      },
    });
    return <div ref={ref} {...props} className={cn("min-w-0", className)} data-slot="pane-drop-overlay">
      <div ref={host} className="relative min-w-0">
        {children}
        {dragging && !disabled ? <div role="status" className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-primary bg-card/95 p-4 text-center text-primary">
          <Upload aria-hidden="true" className="size-8" /><span className="text-sm font-semibold">{label}</span>
        </div> : null}
      </div>
    </div>;
  },
);