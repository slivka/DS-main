/** Přepínač bočního panelu dialogu záznamu v pravém horním rohu · nesmí řídit obsah panelu. */
import type { ReactNode } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";

/** Vlastnosti přepínače bočního panelu. */
export interface RecordDialogPanelToggleProps {
  /** Panel je zobrazený. */
  visible: boolean;
  /** Název panelu pro bublinu. */
  label: string;
  /** Vlastní text tlačítka; výchozí je název panelu. */
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
  const texts = useDsTexts().recordDialog;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-12 top-3 gap-1.5"
      onClick={onToggle}
      title={visible ? texts.hidePanel(label.toLowerCase()) : label}
    >
      {visible ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
      {title ?? label}
    </Button>
  );
}
