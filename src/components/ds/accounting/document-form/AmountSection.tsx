/**
 * Sekce částky formuláře dokladu.
 * Vlastní: částku, měnu, kurzy a související důvody.
 * Nesmí: počítat účetní součty ani spravovat stav dokladu.
 */
import { Fragment, type ReactNode } from "react";
import { Sigma } from "lucide-react";
import { FieldToggleButton } from "../../form/field-toggle-button";
import { useDsTexts } from "../../../../ds-texts";
import { Input } from "../../../ui/input";
import { DecimalInput } from "../../form/decimal-input";
import { FieldValue } from "../../form/field-value";
import { RateField } from "../../form/rate-field";
import { SectionHeading } from "../../layout/section-heading";
import { cn } from "../../../../lib/utils";
import { formatCurrency } from "../../../../lib/format";
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
  /** Obecný důvod uzamčení pole (2.128.0); pole se vykreslí jen pro čtení se zámkem. */
  lockReason?: (key: DocumentHeaderField) => string | undefined;
}

/** Vykreslí poslední sekci částky dokladu. */
export function DocumentAmountSection(p: DocumentAmountSectionProps) {
  const toggleTexts = useDsTexts().fieldToggle;
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
    lockReason,
  } = p;
  const amountLocked = lockReason?.("amountTotal");
  return (
    <Fragment>
      <SectionHeading>{t.amountOnlySection}</SectionHeading>
      <div
        data-slot="document-amount-currency"
        data-section="document-amount-section"
        className="flex min-w-0 max-w-full flex-wrap items-start justify-between gap-3"
      >
        {foreign ? (
          <div
            data-slot="document-foreign-amounts"
            className="order-2 grid w-full basis-full shrink-0 grid-cols-[minmax(0,9rem)_minmax(0,9rem)] items-start justify-start gap-3 @min-[50rem]:order-1 @min-[50rem]:w-[18.75rem] @min-[50rem]:basis-auto"
          >
            <div className="w-full max-w-[9rem] min-w-0">
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
                  sourceAttention={value.rateSourceAttention}
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
                />,
                3,
                false,
                "",
              )}
            </div>
            {vatRateField && !vatRateField.sameAsDocument ? (
              <div className="w-full max-w-[9rem] min-w-0">
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
                      sourceAttention={value.vatRateSourceAttention}
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
                      error={
                        !vatRateField.manual && vatRateField.suggestedRate == null && !readOnly
                          ? t.vatRateMissing
                          : undefined
                      }
                      className="w-full"
                    />
                  </>,
                  3,
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          data-slot="document-total-currency-pair"
          className="order-1 ml-auto flex min-w-0 max-w-full shrink-0 items-start gap-3 @min-[50rem]:order-2"
        >
          <div data-slot="document-amount-total" className="w-[11.5rem] min-w-0 shrink">
            {field(
              "document-amountTotal",
              t.amountTotal,
              amountLocked ? (
                <FieldValue
                  id="document-amountTotal"
                  aria-labelledby="document-amountTotal-label"
                  lockedReason={amountLocked}
                  className="justify-end font-sans font-bold tabular-nums"
                >
                  {formatCurrency(total, currencySymbol)}
                </FieldValue>
              ) : (
                <>
                  <div className="relative">
                    <DecimalInput
                      id="document-amountTotal"
                      value={total}
                      onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })}
                      readOnly={totalMode === "sum" || !can("amountTotal")}
                      className={cn(
                        "h-[var(--control-h)] pr-[var(--field-toggle-space)] text-right text-sm font-sans font-bold tabular-nums",
                        totalMode === "sum" && "bg-muted",
                        !can("amountTotal") && "bg-muted/40 text-muted-foreground opacity-100",
                      )}
                    />
                    <FieldToggleButton
                      icon={Sigma}
                      pressed={totalMode === "sum"}
                      label={toggleTexts.sum}
                      pressedTooltip={toggleTexts.sumPressed}
                      unpressedTooltip={toggleTexts.sumUnpressed}
                      lockedReason={forcedSum ? toggleTexts.sumLocked : undefined}
                      disabled={!can("totalMode")}
                      onPressedChange={(pressed) =>
                        patch({ totalMode: pressed ? "sum" : "entered" })
                      }
                    />
                  </div>
                </>
              ),
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
                    error={!value.rateNote?.trim() ? t.rateNoteRequired : undefined}
                    disabled={!can("rateNote")}
                    onChange={(event) => patch({ rateNote: event.target.value })}
                  />
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
                    error={!vatRateField.note?.trim() ? t.rateNoteRequired : undefined}
                    disabled={readOnly || vatRateField.readOnly}
                    onChange={(event) => vatRateField.onChange({ note: event.target.value })}
                  />
                </>,
                14,
              )
            : null}
        </div>
      ) : null}
    </Fragment>
  );
}
