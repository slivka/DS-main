/**
 * Sdílené vykreslení formátů v tabulce.
 * Vlastní: tokenové vrstvy buněk a proužek záhlaví podle finální pozice sloupce.
 * Nesmí: formátovat skupiny, výběr, akce ani přepisovat barvy odznaků/odkazů.
 */
import { sanitizeColumnStyle, type GridColumnStyle } from "../../../lib/column-tones";

/** Pozice datového sloupce v hotové tabulce. */
export interface ColumnFormatPosition {
  /** Klíč sloupce. */
  id: string;
  /** Formátovatelný sloupec. */
  styleable?: boolean;
}
/** CSS omezené na jednu tabulku a její vlastní buňky, ne vnořené detaily. */
export function columnFormatCss(
  gridId: string,
  columns: readonly ColumnFormatPosition[],
  styles: Record<string, GridColumnStyle>,
  offset = 0,
): string {
  return columns
    .map((column, index) => {
      if (
        column.styleable === false ||
        ["actions", "select", "selection", "__select"].includes(column.id)
      )
        return "";
      const { bold, tone } = sanitizeColumnStyle(styles[column.id]);
      if (!bold && !tone) return "";
      const cell = ` #${gridId} table:not(table table) > :is(tbody,tfoot) > tr:not([data-column-group="true"]) > :is(th,td):nth-child(${index + offset + 1}):not([colspan])`;
      const body = ` #${gridId} table:not(table table) > tbody > tr:not([data-column-group="true"]) > :is(th,td):nth-child(${index + offset + 1}):not([colspan])`;
      const head = ` #${gridId} table:not(table table) > thead > tr:not(.grid-group-row) > :is(th,td):nth-child(${index + offset + 1}):not([colspan])`;
      let css = bold
        ? `${body}{font-weight:600}${body} :is(span,div,input):not([data-slot="badge"]):not([data-slot="badge"] *):not(a *):not(button *){font-weight:600}`
        : "";
      if (!tone) return css;
      const prefix = `--col-tone-${tone}`;
      const hue = tone.replace(/-(soft|strong)$/, "");
      css += `${cell}{background-color:var(${prefix})!important;color:var(${prefix}-fg)!important;background-image:linear-gradient(var(--col-state-layer,transparent),var(--col-state-layer,transparent))!important}`;
      css += `${cell} :is(span,div,input,output):not([data-slot="badge"]):not([data-slot="badge"] *):not(.badge):not(.badge *):not(a):not(a *):not(button *):not(.text-destructive):not(.text-warning-strong){color:inherit}`;
      css += `${head}::before{content:"";position:absolute;inset:auto 0 0;height:var(--col-format-strip);background:var(--col-tone-${hue}-mark);pointer-events:none;z-index:1}`;
      css += `${cell}:is(tr:hover > *){--col-state-layer:color-mix(in oklab,var(--foreground) 8%,transparent)}`;
      css += `${cell}:is(tr[data-state="selected"] > *,tr[aria-selected="true"] > *,tr[aria-current="true"] > *){--col-state-layer:color-mix(in oklab,var(--primary) 20%,transparent)}`;
      css += `${cell}:is([data-invalid="true"],:has([data-invalid="true"]),:has([aria-invalid="true"])){background-color:var(--destructive-soft)!important;color:var(--destructive-strong)!important;--col-state-layer:transparent}`;
      css += `${cell}:is([data-warning="true"]):not([data-invalid="true"]){background-color:var(--warning-bg,var(--warning))!important;color:var(--warning-foreground)!important;--col-state-layer:transparent}`;
      if (tone.endsWith("soft"))
        css += `${cell}[data-negative="true"]{color:var(--destructive)!important}`;
      if (tone.endsWith("strong"))
        css += `${cell}.text-destructive,${cell} .text-destructive:not(a):not(a *):not(button *):not([data-slot="badge"]):not([data-slot="badge"] *){color:var(${prefix}-fg)!important}`;
      return css;
    })
    .join("\n");
}
