/** Dimenze editoru · vlastní společnou lištu a detail stran · nesmí načítat doménová data. */
import { Layers } from "lucide-react";
import { DimensionBar } from "../form/dimension-bar";
import { MultiValueCell } from "../data-display/multi-value-cell";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useJournalEditor } from "./journal-editor-context";
import {
  dimensionOverrides,
  effectiveDimensions,
  resetDimension,
} from "./journal-dimensions-model";
import { headerDimensionValues } from "./journal-dimension-inputs";
import type { JournalLine } from "./journal-lines";
import type { DimensionValue } from "../form/dimension-types";

/** Lišta hlavičky nad řádky. */
export function JournalHeaderDimensions() {
  const { editor } = useJournalEditor();
  const { props } = editor;
  if (!props.dimensionTypes || !props.loadDimensionOptions) return null;
  const header = headerDimensionValues(props.dimensions, true) ?? [];
  return (
    <DimensionBar
      types={props.dimensionTypes}
      value={header}
      loadOptions={props.loadDimensionOptions}
      overrides={dimensionOverrides(props.lines, header)}
      readOnly={!props.onDimensionsChange || editor.editable.size === 0}
      onChange={(next) => props.onDimensionsChange?.(next)}
    />
  );
}
/** Lišty MD/DAL v detailu řádku; ostatní doklady mění obě strany společně. */
export function JournalRowDimensions({ line }: { line: JournalLine }) {
  const { editor } = useJournalEditor();
  const { props, dsTexts } = editor;
  if (!props.dimensionTypes || !props.loadDimensionOptions) return null;
  const header = headerDimensionValues(props.dimensions, true) ?? [];
  const dimensions = effectiveDimensions(line, header);
  const split = props.dimensionsBySide ?? editor.mode === "internal";
  const sides: ("MD" | "D" | "both")[] = split ? ["MD", "D"] : ["both"];
  const change = (side: "MD" | "D" | "both", values: DimensionValue[]) =>
    editor.patch(line.id, {
      dimensions: side === "both" ? { MD: values, D: values } : { ...dimensions, [side]: values },
    });
  return (
    <div className="flex min-w-0 basis-full flex-wrap gap-3" data-slot="journal-dimensions-detail">
      {sides.map((side) => {
        const own = side === "D" ? dimensions.D : dimensions.MD;
        const label =
          side === "MD"
            ? dsTexts.dimensions.debit
            : side === "D"
              ? dsTexts.dimensions.credit
              : dsTexts.dimensions.title;
        return (
          <div key={side} className="min-w-0 flex-1 basis-full" data-dimension-side={side}>
            <span className="typo-label text-muted-foreground">{label}</span>
            <DimensionBar
              aria-label={label}
              variant="inline"
              types={props.dimensionTypes ?? []}
              value={own}
              loadOptions={props.loadDimensionOptions ?? (() => Promise.resolve([]))}
              readOnly={editor.editable.size === 0 || Boolean(line.isRounding || line.isFxRounding)}
              onChange={(values) => change(side, values)}
              onReset={(typeId) => change(side, resetDimension(own, header, typeId))}
            />
          </div>
        );
      })}
    </div>
  );
}
/** Ikona ruční dimenze; celý seznam výjimek je v bublině. */
export function JournalDimensionIndicator({ line }: { line: JournalLine }) {
  const t = useJournalEditor().editor.dsTexts.dimensions;
  const values = [...(line.dimensions?.MD ?? []), ...(line.dimensions?.D ?? [])].filter(
    (value) => value.inherited === false,
  );
  if (!values.length) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="img"
          aria-label={t.manual}
          data-slot="journal-dimension-indicator"
          className="inline-flex shrink-0 text-primary focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Layers className="size-3.5" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {t.manual}
        <br />
        {[...new Set(values.map((value) => value.label))].join(", ")}
      </TooltipContent>
    </Tooltip>
  );
}
/** Čtení účinných hodnot dimenzí v nepovinném sloupci. */
export function JournalDimensionCell({
  line,
  side,
}: {
  line: JournalLine;
  side: "MD" | "D" | "both";
}) {
  const { editor } = useJournalEditor();
  let values =
    side === "MD"
      ? (line.dimensions?.MD ?? [])
      : side === "D"
        ? (line.dimensions?.D ?? [])
        : [...(line.dimensions?.MD ?? []), ...(line.dimensions?.D ?? [])];
  if (side === "both") {
    const economic = (code?: string | null) => editor.accountByCode.get(code ?? "")?.category;
    const account = economic(line.debitAccount);
    const credit = economic(line.creditAccount);
    if (account === "ekonomicka_kategorie" || account === "bilance")
      values = line.dimensions?.MD ?? [];
    else if (credit === "ekonomicka_kategorie" || credit === "bilance")
      values = line.dimensions?.D ?? [];
  }
  const unique = values.filter(
    (value, index) =>
      value.valueId &&
      values.findIndex((item) => item.typeId === value.typeId && item.valueId === value.valueId) ===
        index,
  );
  return (
    <MultiValueCell
      values={unique.map((value) => ({
        ...value,
        label: `${editor.props.dimensionTypes?.find((type) => type.id === value.typeId)?.label ?? ""}: ${value.label}`,
      }))}
    />
  );
}
