/** Kontrast palety z tokenů CSS a synchronizace Excelu (výslovný požadavek zadání). */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "bun:test";
import {
  COLUMN_HUES,
  colorContrast,
  colorToArgb,
  oklchToSrgb,
  pickReadableText,
} from "../../src/lib/column-tones";
import { COLUMN_TONE_ARGB } from "../../src/lib/excel-export";
const css = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root {"), css.indexOf("body {"));
const dark = css.slice(css.indexOf(".dark {"), css.indexOf("@layer base"));
function token(source: string, name: string): string {
  const value = source.match(new RegExp(`--${name}:\\s*(oklch\\([^;]+)`))?.[1];
  if (!value) throw new Error(`Chybí token ${name}`);
  return value;
}
for (const [mode, source] of [
  ["světlý", root],
  ["tmavý", dark],
]) {
  describe(`ColumnTone ${mode}`, () => {
    for (const hue of COLUMN_HUES)
      for (const strength of ["soft", "strong"] as const) {
        it(`${hue}-${strength} má kontrast alespoň 4,5:1`, () => {
          const bg = oklchToSrgb(token(source, `col-tone-${hue}-${strength}`));
          const fg = oklchToSrgb(token(source, `col-tone-${hue}-${strength}-fg`));
          expect(colorContrast(bg, fg)).toBeGreaterThanOrEqual(4.5);
        });
        if (strength === "soft")
          it(`${hue}-soft zachová červenou záporných alespoň 3:1`, () => {
            expect(
              colorContrast(
                oklchToSrgb(token(source, `col-tone-${hue}-soft`)),
                oklchToSrgb(token(source, "destructive")),
              ),
            ).toBeGreaterThanOrEqual(3);
          });
      }
  });
}
it("Excel ARGB odpovídá všem světlým tokenům", () => {
  for (const hue of COLUMN_HUES)
    for (const strength of ["soft", "strong"] as const) {
      const tone = `${hue}-${strength}` as const;
      expect(COLUMN_TONE_ARGB[tone].fill).toBe(colorToArgb(token(root, `col-tone-${tone}`)));
      expect(COLUMN_TONE_ARGB[tone].font).toBe(colorToArgb(token(root, `col-tone-${tone}-fg`)));
    }
});
it("pickReadableText volí čitelný text dle jasu", () => {
  expect(pickReadableText("oklch(0.99 0 0)")).toBe("black");
  expect(pickReadableText("oklch(0.2 0 0)")).toBe("white");
});
