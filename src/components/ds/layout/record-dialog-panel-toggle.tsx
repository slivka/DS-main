/** Přepínač bočního panelu dialogu záznamu v pravém horním rohu · nesmí řídit obsah panelu. */
import type { ReactNode } from "react";
import { PanelToggleButton } from "./panel-toggle-button";

/** Vlastnosti přepínače bočního panelu. */
export interface RecordDialogPanelToggleProps {
  /** Panel je zobrazený. */
  visible: boolean;
  /** Název panelu pro bublinu. */
  label: string;
  /** Doplňující název panelu; textová hodnota se zobrazí v bublině. */
  title?: ReactNode;
  /** Přepnutí panelu. */
  onToggle: () => void;
}

/** Tlačítko zobrazení / skrytí bočního panelu dialogu. */
export function RecordDialogPanelToggle({
  visible,
  label,
  title,
  onToggle,
}: RecordDialogPanelToggleProps) {
  return (
    <PanelToggleButton
      open={visible}
      tooltip={typeof title === "string" ? title : label}
      className="absolute right-12 top-3"
      onToggle={onToggle}
    />
  );
}
