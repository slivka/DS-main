import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { FONT_SCALES, getFontScale, setFontScale } from "../../../lib/font-scale";

/**
 * Nastavenie celkovej veľkosti písma aplikácie. Uloží sa do prehliadača.
 */
export interface FontSizeSettingProps {
  placeholder?: string;
  label?: string;
  className?: string;
}

export function FontSizeSetting({
  placeholder = "Vyberte velikost písma",
  label = "Velikost písma",
  className,
}: FontSizeSettingProps = {}) {
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
        <SelectTrigger className="w-[220px]" aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {FONT_SCALES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
