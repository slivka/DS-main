/**
 * Sdílená mřížka formuláře a obal jednoho pole.
 * Vlastní: popisek, chybu, nápovědu, šířku pole a responzivní počet sloupců.
 * Nesmí: řídit hodnotu ovládání ani znát doménu formuláře.
 */
import { createContext, useContext, type ReactNode } from "react";

import { Label } from "../../ui/label";
import { SectionHeading } from "./section-heading";
import {
  FieldFeedbackContext,
  FieldFeedbackIndicator,
  FieldHintIcon,
  FieldSuggestionIndicator,
  type FieldSuggestion,
} from "../form/field-feedback";
import { useDsTexts } from "../../../ds-texts";

const FIELD_SPAN_CLASSES = {
  1: "@min-[40rem]:col-span-1",
  2: "@min-[40rem]:col-span-2",
  3: "@min-[40rem]:col-span-3",
  4: "@min-[40rem]:col-span-4",
  5: "@min-[40rem]:col-span-5",
  6: "@min-[40rem]:col-span-6",
  7: "@min-[40rem]:col-span-7",
  8: "@min-[40rem]:col-span-8",
  9: "@min-[40rem]:col-span-9",
  10: "@min-[40rem]:col-span-10",
  11: "@min-[40rem]:col-span-11",
  12: "@min-[40rem]:col-span-12",
  13: "@min-[40rem]:col-span-13",
  14: "@min-[40rem]:col-span-14",
  15: "@min-[40rem]:col-span-15",
  16: "@min-[40rem]:col-span-16",
  17: "@min-[40rem]:col-span-17",
  18: "@min-[40rem]:col-span-18",
  19: "@min-[40rem]:col-span-19",
  20: "@min-[40rem]:col-span-20",
} as const;

/** Šířky polí pro malý dialog záznamu (sloupce od 24 rem). */
const FIELD_SPAN_CLASSES_COMPACT: Record<keyof typeof FIELD_SPAN_CLASSES, string> = {
  1: "@min-[24rem]:col-span-1",
  2: "@min-[24rem]:col-span-2",
  3: "@min-[24rem]:col-span-3",
  4: "@min-[24rem]:col-span-4",
  5: "@min-[24rem]:col-span-5",
  6: "@min-[24rem]:col-span-6",
  7: "@min-[24rem]:col-span-7",
  8: "@min-[24rem]:col-span-8",
  9: "@min-[24rem]:col-span-9",
  10: "@min-[24rem]:col-span-10",
  11: "@min-[24rem]:col-span-11",
  12: "@min-[24rem]:col-span-12",
  13: "@min-[24rem]:col-span-13",
  14: "@min-[24rem]:col-span-14",
  15: "@min-[24rem]:col-span-15",
  16: "@min-[24rem]:col-span-16",
  17: "@min-[24rem]:col-span-17",
  18: "@min-[24rem]:col-span-18",
  19: "@min-[24rem]:col-span-19",
  20: "@min-[24rem]:col-span-20",
};

/**
 * Podklad navržené hodnoty míří jen na ovládání hodnoty (vstup, výběr, víceřádkový vstup
 * a spouštěč výběru); ikonová tlačítka uvnitř pole (zámek, ARES, kalendář, přepínače) se nemění.
 */
const SUGGESTION_BG_CLASS =
  "[&_input]:bg-suggestion-soft [&_select]:bg-suggestion-soft [&_textarea]:bg-suggestion-soft [&_[role=combobox]]:bg-suggestion-soft [&_[data-slot=select-trigger]]:bg-suggestion-soft";

/** Hranice, od které se mřížka polí řadí do sloupců: výchozí 40 rem, malý dialog 24 rem. */
export type FieldGridBreakpoint = "default" | "compact";

/** Kontext hranice mřížky; nastavuje ho RecordDialog size="sm", jinde zůstává výchozí. */
export const FieldGridBreakpointContext = createContext<FieldGridBreakpoint>("default");

/** Vlastnosti jednoho pole formuláře. */
export interface FieldProps {
  /** Viditelný popisek pole. */
  label?: ReactNode;
  /** Identifikátor ovládání svázaný s popiskem. */
  htmlFor?: string;
  /** Identifikátor popisku hodnoty pouze ke čtení, bez vazby htmlFor. */
  labelId?: string;
  /** Nápověda jako ikona Info v řádku popisku (nikdy text pod polem). */
  hint?: ReactNode;
  /** Chyba pole; má přednost před nápovědou. */
  error?: ReactNode;
  /** Varování uvnitř ovládání; nikdy pod polem. */
  warning?: ReactNode;
  /** Návrh hodnoty z vytěžení; zobrazí se jen bez chyby a varování. Rodič ho zruší při první ruční změně. */
  suggestion?: FieldSuggestion;
  /** Šířka pole v mřížce; pod 40 rem zůstává pole přes celý řádek. */
  span?: keyof typeof FIELD_SPAN_CLASSES;
  /** Doplňující třídy obalu. */
  className?: string;
  /** Ovládací prvek nebo hodnota pole. */
  children: ReactNode;
}

/** Vrátí třídu šířky pole ve formulářové mřížce. */
export function fieldSpanClass(
  span?: keyof typeof FIELD_SPAN_CLASSES,
  breakpoint: FieldGridBreakpoint = "default",
): string {
  if (!span) return "";
  return breakpoint === "compact" ? FIELD_SPAN_CLASSES_COMPACT[span] : FIELD_SPAN_CLASSES[span];
}

/** Pole formuláře s popiskem a jednotným umístěním chyby nebo nápovědy. */
export function Field({
  label,
  htmlFor,
  labelId,
  hint,
  error,
  warning,
  suggestion,
  span,
  className = "",
  children,
}: FieldProps) {
  const breakpoint = useContext(FieldGridBreakpointContext);
  const texts = useDsTexts();
  // Chyba a varování mají přednost; návrh se vykreslí jen u čistého pole.
  const activeSuggestion = !error && !warning ? suggestion : undefined;
  const suggestionClass = activeSuggestion
    ? activeSuggestion.uncertain
      ? "[&_.border-input]:border-warning [&_input]:border-warning [&_select]:border-warning [&_textarea]:border-warning"
      : SUGGESTION_BG_CLASS
    : "";
  return (
    <div
      data-slot="field"
      data-field-has-label={label ? "true" : "false"}
      data-invalid={error ? "true" : undefined}
      data-warning={warning && !error ? "true" : undefined}
      data-suggestion={
        activeSuggestion ? (activeSuggestion.uncertain ? "uncertain" : "suggested") : undefined
      }
      className={`${label ? "flex min-w-0 flex-col gap-1" : ""} ${fieldSpanClass(span, breakpoint)} ${
        error
          ? "[&_.border-input]:border-destructive [&_input]:border-destructive [&_select]:border-destructive [&_textarea]:border-destructive"
          : warning
            ? "[&_.border-input]:border-warning [&_input]:border-warning"
            : suggestionClass
      } ${className}`}
    >
      {label ? (
        <span className="flex min-w-0 items-center gap-1">
          <Label
            id={labelId ?? (htmlFor ? `${htmlFor}-label` : undefined)}
            htmlFor={htmlFor}
            title={typeof label === "string" ? label : undefined}
            className={`min-w-0 truncate whitespace-nowrap ${error ? "text-destructive" : ""}`}
          >
            {label}
          </Label>
          {hint ? <FieldHintIcon hint={hint} /> : null}
        </span>
      ) : null}
      <FieldFeedbackContext.Provider value={{ error, warning, suggestion: activeSuggestion }}>
        <div className="relative min-w-0 ds-field-control">
          {children}
          <FieldFeedbackIndicator error={error} warning={warning} />
          <FieldSuggestionIndicator
            suggestion={activeSuggestion}
            defaultMessage={
              activeSuggestion
                ? texts.extraction.suggestionUncertain(activeSuggestion.source)
                : undefined
            }
          />
        </div>
      </FieldFeedbackContext.Provider>
      {!label && hint ? <span className="sr-only">{hint}</span> : null}
    </div>
  );
}

/** Vlastnosti sdílené mřížky formulářových polí. */
export interface FieldGridProps {
  /** Počet sloupců mřížky na širokém zobrazení. */
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 20;
  /** Volitelný nadpis nad mřížkou. */
  title?: ReactNode;
  /** Jedna vysvětlující věta pod celou mřížkou. */
  hint?: ReactNode;
  /** Doplňující třídy vnitřní mřížky. */
  className?: string;
  /** Pole mřížky. */
  children: ReactNode;
}

/** Mřížka polí formuláře se společnými svislicemi a nápovědou celé skupiny. */
export function FieldGrid({ cols = 2, title, hint, className = "", children }: FieldGridProps) {
  const compact = useContext(FieldGridBreakpointContext) === "compact";
  const cls = (compact ? FIELD_GRID_COLS_COMPACT : FIELD_GRID_COLS)[cols];
  const narrow = compact
    ? "@max-[24rem]:[&>*]:col-span-1 @max-[24rem]:[&>*]:col-start-auto"
    : "@max-[40rem]:[&>*]:col-span-1 @max-[40rem]:[&>*]:col-start-auto";
  return (
    <div className="@container" data-field-grid-breakpoint={compact ? "compact" : undefined}>
      {title ? <SectionHeading>{title}</SectionHeading> : null}
      <div className={`grid grid-cols-1 gap-3 ${narrow} ${cls} ${className}`}>{children}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const FIELD_GRID_COLS: Record<NonNullable<FieldGridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "@min-[40rem]:grid-cols-2",
  3: "@min-[40rem]:grid-cols-3",
  4: "@min-[40rem]:grid-cols-4",
  6: "@min-[40rem]:grid-cols-6",
  12: "@min-[40rem]:grid-cols-12",
  20: "@min-[40rem]:grid-cols-20",
};

const FIELD_GRID_COLS_COMPACT: Record<NonNullable<FieldGridProps["cols"]>, string> = {
  1: "grid-cols-1",
  2: "@min-[24rem]:grid-cols-2",
  3: "@min-[24rem]:grid-cols-3",
  4: "@min-[24rem]:grid-cols-4",
  6: "@min-[24rem]:grid-cols-6",
  12: "@min-[24rem]:grid-cols-12",
  20: "@min-[24rem]:grid-cols-20",
};
