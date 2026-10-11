/**
 * Sekce částky formuláře dokladu.
 * Vlastní: částku, měnu, kurzy a související důvody.
 * Nesmí: počítat účetní součty ani spravovat stav dokladu.
 */
import { Fragment, type ReactNode } from "react";
import { Sigma } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { DecimalInput } from "../../form/decimal-input";
import { RateField } from "../../form/rate-field";
import { SectionHeading } from "../../layout/section-heading";
import { cn } from "../../../../lib/utils";
import type {
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
  DocumentVatRateField,
} from "./document-form-types";

type FieldRenderer = (
  id: string,
  label: ReactNode,
  control: ReactNode,
  span?: number,
  mobileHalf?: boolean,
  className?: string,
) => ReactNode;
export interface DocumentAmountSectionProps {
  t: DocumentFormTexts;
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  can: (k: DocumentHeaderField) => boolean;
  foreign: boolean;
  total: number;
  totalMode: "entered" | "sum";
  forcedSum: boolean;
  currencySymbol?: string;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  rateAmount: number;
  vatRateField?: DocumentVatRateField;
  readOnly: boolean;
  currencyControl: ReactNode;
  field: FieldRenderer;
}

/** Vykreslí poslední sekci částky dokladu. */
export function DocumentAmountSection(p: DocumentAmountSectionProps) {
  const {
    t,
    value,
    patch,
    can,
    foreign,
    total,
    totalMode,
    forcedSum,
    currencySymbol,
    homeCurrency,
    homeCurrencySymbol,
    rateAmount,
    vatRateField,
    readOnly,
    currencyControl,
    field,
  } = p;
  return (
    <Fragment>
      <SectionHeading>{t.amountOnlySection}</SectionHeading>
      <div
        data-slot="document-amount-currency"
        data-section="document-amount-section"
        className="flex max-w-full flex-wrap items-start justify-between min-w-0 gap-3"
      >
        {foreign ? (
          <div
            data-slot="document-foreign-amounts"
            className="order-2 grid basis-full grid-cols-[9rem_9rem] items-start justify-start gap-3 @min-[48rem]:order-1 @min-[48rem]:basis-auto"
          >
            <div className="w-[9rem] max-w-full min-w-0">
              {field(
                "document-rate",
                t.rate,
                <RateField
                  id="document-rate"
                  value={value.rate ?? null}
                  currency={value.currency}
                  currencySymbol={currencySymbol}
                  homeCurrency={homeCurrency}
                  homeCurrencySymbol={homeCurrencySymbol}
                  rateAmount={rateAmount}
                  suggestedRate={value.suggestedRate}
                  suggestedInfo={value.suggestedRateInfo ?? value.rateInfo ?? undefined}
                  manual={!!value.rateManual}
                  note={value.rateNote ?? ""}
                  showNote={false}
                  noteLabel={t.rateNote}
                  manualSourceLabel={t.manualRate}
                  requiredMessage={t.rateNoteRequired}
                  disabled={!can("rate")}
                  readOnly={!can("rate") && !can("rateNote")}
                  onChange={(rate) => patch({ rate, rateManual: true })}
                  onNoteChange={(rateNote) => patch({ rateNote })}
                  onUseSuggested={() =>
                    patch({ rate: value.suggestedRate, rateManual: false, rateNote: null })
                  }
                  className="w-full"
                  inputClassName="h-11"
                />,
                3,
                false,
                "",
              )}
            </div>
            {vatRateField && !vatRateField.sameAsDocument ? (
              <div className="w-[9rem] max-w-full min-w-0">
                {field(
                  "document-vat-rate",
                  t.vatRate,
                  <>
                    <RateField
                      id="document-vat-rate"
                      value={vatRateField.value ?? null}
                      currency={value.currency}
                      currencySymbol={currencySymbol}
                      homeCurrency={homeCurrency}
                      homeCurrencySymbol={homeCurrencySymbol}
                      rateAmount={vatRateField.rateAmount ?? rateAmount}
                      suggestedRate={vatRateField.suggestedRate}
                      suggestedInfo={vatRateField.suggestedInfo}
                      manual={!!vatRateField.manual}
                      note={vatRateField.note ?? ""}
                      showNote={false}
                      noteLabel={t.vatRateNote}
                      manualSourceLabel={t.manualRate}
                      requiredMessage={t.rateNoteRequired}
                      disabled={readOnly || vatRateField.readOnly}
                      readOnly={readOnly || vatRateField.readOnly}
                      onChange={(rate) => vatRateField.onChange({ rate, manual: true })}
                      onUseSuggested={() =>
                        vatRateField.onChange({
                          rate: vatRateField.suggestedRate ?? null,
                          manual: false,
                          note: null,
                        })
                      }
                      className="w-full"
                      inputClassName="h-11"
                    />
                    {!vatRateField.manual &&
                    vatRateField.suggestedRate == null &&
                    !(readOnly || vatRateField.readOnly) ? (
                      <p
                        role="status"
                        data-slot="document-vat-rate-missing"
                        className="mt-3 text-xs font-medium text-destructive"
                      >
                        {t.vatRateMissing}
                      </p>
                    ) : null}
                  </>,
                  3,
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          data-slot="document-total-currency-pair"
          className="order-1 ml-auto flex min-w-0 max-w-full shrink-0 items-start gap-3 @min-[48rem]:order-2"
        >
          <div
            data-slot="document-amount-total"
            className="min-w-[9rem] flex-[0_1_18rem] @min-[30rem]:min-w-[11.5rem]"
          >
            {field(
              "document-amountTotal",
              <span className="flex min-w-0 items-center justify-between gap-2 whitespace-nowrap">
                <span>{t.amountTotal}</span>
                {totalMode === "sum" ? (
                  <span
                    className="shrink-0 whitespace-nowrap text-xs font-normal text-muted-foreground"
                    title={t.sumFromLines}
                  >
                    {t.sumFromLines}
                  </span>
                ) : null}
              </span>,
              <>
                <div className="relative">
                  <DecimalInput
                    id="document-amountTotal"
                    value={total}
                    onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })}
                    readOnly={totalMode === "sum" || !can("amountTotal")}
                    className={cn(
                      "h-11 pr-12 text-right text-xl font-bold tabular-nums",
                      totalMode === "sum" && "bg-muted",
                    )}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={totalMode === "sum" ? "default" : "outline"}
                        size="icon"
                        aria-label={t.sumFromLines}
                        aria-pressed={totalMode === "sum"}
                        disabled={forcedSum || !can("totalMode")}
                        onClick={() =>
                          patch({ totalMode: totalMode === "sum" ? "entered" : "sum" })
                        }
                        className="absolute right-1 top-1 size-9"
                      >
                        <span className="relative">
                          <Sigma className="size-4" />
                          {totalMode !== "sum" ? (
                            <span
                              aria-hidden
                              className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current"
                            />
                          ) : null}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {totalMode === "sum" ? t.sumFromLines : t.amountTotal}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>,
              6,
            )}
          </div>
          <div data-slot="document-currency-cell" className="w-[6.5rem] shrink-0">
            {field("document-currency", t.currency, currencyControl, 3)}
          </div>
        </div>
      </div>
      {foreign && (value.rateManual || (vatRateField?.manual && !vatRateField.sameAsDocument)) ? (
        <div data-slot="document-rate-details" className="mt-3 grid grid-cols-20 gap-3">
          {value.rateManual
            ? field(
                "document-rate-note",
                t.rateNote,
                <>
                  <Input
                    id="document-rate-note"
                    value={value.rateNote ?? ""}
                    maxLength={200}
                    required
                    aria-invalid={!value.rateNote?.trim()}
                    disabled={!can("rateNote")}
                    onChange={(event) => patch({ rateNote: event.target.value })}
                  />
                  {!value.rateNote?.trim() ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {t.rateNoteRequired}
                    </p>
                  ) : null}
                </>,
                14,
              )
            : null}
          {foreign && vatRateField && !vatRateField.sameAsDocument && vatRateField.manual
            ? field(
                "document-vat-rate-note",
                t.vatRateNote,
                <>
                  <Input
                    id="document-vat-rate-note"
                    value={vatRateField.note ?? ""}
                    maxLength={200}
                    required
                    aria-invalid={!vatRateField.note?.trim()}
                    disabled={readOnly || vatRateField.readOnly}
                    onChange={(event) => vatRateField.onChange({ note: event.target.value })}
                  />
                  {!vatRateField.note?.trim() ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {t.rateNoteRequired}
                    </p>
                  ) : null}
                </>,
                14,
              )
            : null}
        </div>
      ) : null}
    </Fragment>
  );
}
