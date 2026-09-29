import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { FONT_SCALES, getFontScale, setFontScale } from "../../../lib/font-scale";
import { useDsTexts } from "../../../ds-texts";

/**
 * Nastavení celkové velikosti písma aplikace. Uloží se do prohlížeče.
 */
export interface FontSizeSettingProps {
  placeholder?: string;
  label?: string;
  className?: string;
}

export function FontSizeSetting({
  placeholder,
  label,
  className,
}: FontSizeSettingProps = {}) {
  const texts = useDsTexts();
  const labels = [texts.fontSize.verySmall, texts.fontSize.small, texts.fontSize.smaller, texts.fontSize.standard, texts.fontSize.larger, texts.fontSize.large];
  const [scale, setScale] = useState("1");

  useEffect(() => {
    setScale(getFontScale());
    const onChange = (e: Event) => setScale((e as CustomEvent<string>).detail);
    window.addEventListener("app:font-scale", onChange);
    return () => window.removeEventListener("app:font-scale", onChange);
  }, []);

  return (
    <div className={className ?? "flex flex-wrap items-center gap-3"}>
      <Select value={scale} onValueChange={(v) => setFontScale(v)}>
        <SelectTrigger className="w-[220px]" aria-label={label ?? texts.fontSize.label}>
          <SelectValue placeholder={placeholder ?? texts.fontSize.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {FONT_SCALES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {labels[FONT_SCALES.indexOf(s)] ?? s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
