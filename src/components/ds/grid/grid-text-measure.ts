/**
 * Měření textu pro automatickou šířku.
 * Vlastní: skutečnou metriku písma při 100 %, včetně tučného řezu.
 * Nesmí: počítat částky ani měnit ruční šířky.
 */
let canvas: HTMLCanvasElement | undefined;
/** Šířka textu v px při kořeni 16 px; SSR má stabilní odhad. */
export function gridTextWidthAt100(text: string, bold = false): number {
  if (typeof document === "undefined") return text.length * (bold ? 7.5 : 7);
  canvas ??= document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return text.length * (bold ? 7.5 : 7);
  context.font = `${bold ? 600 : 400} 13px ${getComputedStyle(document.body).fontFamily}`;
  return context.measureText(text).width;
}
