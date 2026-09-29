import { useDsTexts } from "../../../ds-texts";
import type { ReactNode } from "react";
import { useResizableWidth } from "../../../hooks/use-resizable-width";
import type { PointerEvent as ReactPointerEvent } from "react";

/** Úchyt v pravém okraji comboboxu pro změnu šířky tažením. */
export function ComboboxResizeHandle({
  onPointerDown,
}: {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
}) {
  const texts = useDsTexts();
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label="Změnit šířku tažením"
      title="Změnit šířku tažením"
      onPointerDown={onPointerDown}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize touch-none"
    />
  );
}

/**
 * Obal pro Select combobox – přidá úchyt v pravém okraji pro změnu šířky
 * tažením. Šířka se ukládá do localStorage pod `combo-width:<storageKey>`
 * a pamatuje se uživateli napříč relacemi.
 * Vnitřní trigger by měl mít `w-full`.
 */
export function ResizableCombobox({
  storageKey,
  children,
  className = "",
  min = 160,
  max = 900,
}: {
  storageKey: string;
  children: ReactNode;
  className?: string;
  min?: number;
  max?: number;
}) {
  const resize = useResizableWidth(storageKey, { min, max });
  return (
    <div
      className={`relative inline-flex max-w-full shrink-0 ${className}`}
      style={resize.width ? { width: resize.width } : undefined}
    >
      {children}
      <ComboboxResizeHandle onPointerDown={resize.onHandlePointerDown} />
    </div>
  );
}
