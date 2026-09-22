import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_SCALES, getFontScale, setFontScale } from "@/lib/font-scale";

/**
 * Nastavenie celkovej veľkosti písma aplikácie. Uloží sa do prehliadača.
 */
export function FontSizeSetting() {
  const [scale, setScale] = useState("1");

  useEffect(() => {
    setScale(getFontScale());
    const onChange = (e: Event) => setScale((e as CustomEvent<string>).detail);
    window.addEventListener("app:font-scale", onChange);
    return () => window.removeEventListener("app:font-scale", onChange);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={scale} onValueChange={(v) => setFontScale(v)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Vyberte velikost písma" />
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
