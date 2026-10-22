/**
 * Pevná paleta sloupců a převody barev.
 * Vlastní: typy, sanitaci formátu a kontrast sRGB.
 * Nesmí: obsahovat doménová data ani číst prohlížeč.
 */
/** Povolené odstíny podkladu sloupce. */
export const COLUMN_HUES = [
  "gray",
  "blue",
  "teal",
  "olive",
  "yellow",
  "orange",
  "pink",
  "purple",
] as const;
/** Odstín sloupce. */
export type ColumnHue = (typeof COLUMN_HUES)[number];
/** Tón podkladu sloupce. */
export type ColumnTone = `${ColumnHue}-${"soft" | "strong"}`;
/** Uložitelný formát sloupce. */
export interface GridColumnStyle {
  /** Tučné hodnoty těla. */
  bold?: boolean;
  /** Tón z pevné palety. */
  tone?: ColumnTone;
}
/** Ověří tón z nedůvěryhodného úložiště. */
export function isColumnTone(value: unknown): value is ColumnTone {
  return (
    typeof value === "string" &&
    COLUMN_HUES.some((hue) => value === `${hue}-soft` || value === `${hue}-strong`)
  );
}
/** Zahodí neznámé vlastnosti a neznámý tón. */
export function sanitizeColumnStyle(value: unknown): GridColumnStyle {
  if (!value || typeof value !== "object") return {};
  const style = value as Record<string, unknown>;
  return {
    ...(style.bold === true ? { bold: true } : {}),
    ...(isColumnTone(style.tone) ? { tone: style.tone } : {}),
  };
}
/** Kanály sRGB v intervalu 0–1. */
export type Srgb = readonly [number, number, number];
/** Převod OKLCH na sRGB s ořezáním mimo gamut. */
export function oklchToSrgb(value: string): Srgb {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  if (!match) throw new Error(`Invalid OKLCH: ${value}`);
  const light = Number(match[1]);
  const chroma = Number(match[2]);
  const hue = (Number(match[3]) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (light + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (light - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (light - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const encode = (v: number) =>
    Math.max(0, Math.min(1, v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
  return [
    encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}
/** Relativní jas dle WCAG. */
export function relativeLuminance(rgb: Srgb): number {
  const linear = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return (linear[0] ?? 0) * 0.2126 + (linear[1] ?? 0) * 0.7152 + (linear[2] ?? 0) * 0.0722;
}
/** Kontrast dvou barev sRGB. */
export function colorContrast(a: Srgb, b: Srgb): number {
  const x = relativeLuminance(a);
  const y = relativeLuminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Vybere čitelný černý nebo bílý text pro OKLCH podklad. */
export function pickReadableText(bg: string): "black" | "white" {
  const rgb = oklchToSrgb(bg);
  return colorContrast(rgb, [0, 0, 0]) >= colorContrast(rgb, [1, 1, 1]) ? "black" : "white";
}
/** ARGB pro Excel, stejné ořezání sRGB jako v kontrastním testu. */
export function colorToArgb(value: string): string {
  return `FF${oklchToSrgb(value)
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}
