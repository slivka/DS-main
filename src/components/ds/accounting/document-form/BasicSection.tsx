/**
 * Základní údaje formuláře dokladu.
 * Vlastní: protistranu, IČO, DIČ, předání, číslo a popis.
 * Nesmí: spravovat identitu dokladu nebo ostatní sekce.
 */
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { useDsTexts } from "../../../../ds-texts";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { counterpartyCreateSeed, type CounterpartySeed } from "../counterparty-field";
import { CounterpartyInputField } from "../counterparty-input-field";
import { IcoLink, type IcoLinkTarget } from "../../form/ico-link";
import { SectionHeading } from "../../layout/section-heading";
import { OptionSelect } from "../../form/option-select";
import { FieldValue } from "../../form/field-value";
import { ReadField } from "./document-identity-line";
import type { PartnerOption } from "../partner-select";
import type { DocumentFields } from "../document-fields";
import type {
  DocumentFormTexts,
  DocumentHeaderValue,
  DocumentHeaderField,
  DocumentSuggestConfig,
} from "./document-form-types";

type FieldRenderer = (
  id: string,
  label: ReactNode,
  control: ReactNode,
  span?: number,
  mobileHalf?: boolean,
  className?: string,
) => ReactNode;
export interface DocumentBasicSectionProps {
  f: DocumentFields;
  t: DocumentFormTexts;
  value: DocumentHeaderValue;
  patch: (v: Partial<DocumentHeaderValue>) => void;
  partner?: PartnerOption;
  partners: PartnerOption[];
  partnerLabel: string;
  counterpartyIco: string;
  counterpartyDic: string;
  linkedPartner: boolean;
  icoWarning: boolean;
  icoLinkTarget: IcoLinkTarget;
  can: (key: keyof DocumentHeaderValue) => boolean;
  onCreatePartner?: (seed: CounterpartySeed) => void;
  onEditCounterparty?: (partnerId: string) => void;
  /** Oblíbení partneři nahoře ve výběru protistrany. */
  favoriteIds?: string[];
  /** Přepnutí oblíbeného partnera hvězdičkou. */
  onToggleFavorite?: (partnerId: string) => void;
  readOnly?: boolean;
  field: FieldRenderer;
  suggestedText: (
    key: "handedOverBy" | "description",
    label: string,
    config: DocumentSuggestConfig | undefined,
    span: number,
    className?: string,
  ) => ReactNode;
  handedOverBySuggest?: DocumentSuggestConfig;
  descriptionSuggest?: DocumentSuggestConfig;
  externalNumberField: ReactNode;
  receivedDocument: boolean;
  bankAccountField?: ReactNode;
  /** Způsob platby přijatého dokladu v druhém řádku. */
  paymentMethodOptions?: Array<{ value: string; label: string }>;
  /** Popisek z textů formuláře. */
  paymentMethodLabel?: string;
  counterpartyInput: "partner" | "manual";
  onCounterpartyInputChange?: (mode: "partner" | "manual") => void;
  counterpartyInputLockedReason?: string;
  /** Obecný zámek pole má přednost před důvodem přepnutí režimu. */
  lockReason?: (key: DocumentHeaderField) => string | undefined;
  /** Daňové číslo vedle Popisu. */
  taxNumberField?: ReactNode;
  /** Dobropis: vazba na původní doklad; data a zápis vlastní APP. */
  correctsDocument?: import("./document-form-props").DocumentCorrectsDocumentField;
  /** Interní doklad (2.108.0: partner / ručně, IČO a DIČ jako u faktur, bez adresy). */
  internal?: boolean;
  /** Pokladna drží číslo vedle partnera a Popis přes celou šířku. */
  cashDocument?: boolean;
}
/** Vykreslí základní údaje dokladu. */
export function DocumentBasicSection(p: DocumentBasicSectionProps) {
  const {
    f,
    t,
    value,
    patch,
    partner,
    partners,
    partnerLabel,
    counterpartyIco,
    counterpartyDic,
    linkedPartner,
    icoWarning,
    icoLinkTarget,
    can,
    onCreatePartner,
    onEditCounterparty,
    readOnly,
    field,
    suggestedText,
    handedOverBySuggest,
    descriptionSuggest,
    externalNumberField,
    receivedDocument,
    bankAccountField,
    counterpartyInput,
    onCounterpartyInputChange,
    counterpartyInputLockedReason,
  } = p;
  const printTexts = useDsTexts().invoicePrint;
  const generalPartnerReason =
    (counterpartyInput === "manual" ? p.lockReason?.("counterpartyName") : undefined) ??
    p.lockReason?.("partnerId");
  return (
    <>
      <>
        <SectionHeading>{t.headerSection}</SectionHeading>
        <div className="grid grid-cols-20 gap-3">
          {field(
            "document-partner",
            partnerLabel,
            generalPartnerReason ? (
              <FieldValue
                id="document-partner"
                aria-labelledby="document-partner-label"
                lockedReason={generalPartnerReason}
              >
                {value.counterpartyName ?? partner?.name ?? ""}
              </FieldValue>
            ) : (
              <CounterpartyInputField
                id="document-partner"
                partners={partners}
                mode={counterpartyInput}
                partnerId={value.partnerId}
                name={value.counterpartyName ?? partner?.name ?? ""}
                onPartnerChange={(partnerId) => {
                  const selected = partners.find((item) => item.id === partnerId);
                  patch({
                    partnerId,
                    counterpartyName: selected?.name ?? value.counterpartyName,
                    counterpartyIco: selected?.ico ?? null,
                    counterpartyDic: selected?.dic ?? null,
                  });
                }}
                onNameChange={(counterpartyName) => patch({ counterpartyName })}
                onModeChange={onCounterpartyInputChange}
                lockedReason={counterpartyInputLockedReason}
                partnerModeLabel={t.selectFromDirectory}
                manualModeLabel={t.enterManually}
                replaceManualWarning={t.replaceManualCounterparty}
                hasManualData={Boolean(
                  value.counterpartyName || counterpartyIco || counterpartyDic,
                )}
                disabled={!can("partnerId")}
                readOnly={readOnly}
                onCreatePartner={
                  onCreatePartner
                    ? (query) => onCreatePartner(counterpartyCreateSeed(query))
                    : undefined
                }
                onEditPartner={onEditCounterparty}
                favoriteIds={p.favoriteIds}
                onToggleFavorite={p.onToggleFavorite}
              />
            ),
            14,
            false,
            "@min-[40rem]:pr-3",
          )}
          {field(
            "document-partner-ico",
            t.ico,
            counterpartyInput === "partner" ? (
              <ReadField
                id="document-partner-ico"
                mono
                value={
                  counterpartyIco ? (
                    <IcoLink
                      ico={counterpartyIco}
                      country={partner?.country}
                      kind={partner?.kind}
                      target={icoLinkTarget}
                    />
                  ) : (
                    "—"
                  )
                }
              />
            ) : (
              <>
                <Input
                  id="document-partner-ico"
                  value={counterpartyIco}
                  onChange={(event) =>
                    patch({
                      counterpartyIco: normalizeManualIco(
                        event.target.value,
                        value.counterpartyCountry,
                      ),
                    })
                  }
                  disabled={!can("counterpartyIco")}
                  warning={icoWarning ? t.invalidIco : undefined}
                  className="h-[var(--control-h)] font-mono tabular-nums"
                />
              </>
            ),
            3,
            !receivedDocument,
          )}
          {field(
            "document-partner-dic",
            t.dic,
            counterpartyInput === "partner" ? (
              <ReadField id="document-partner-dic" mono value={counterpartyDic || "—"} />
            ) : (
              <Input
                id="document-partner-dic"
                value={counterpartyDic}
                onChange={(event) =>
                  patch({
                    counterpartyDic: event.target.value.replace(/\s/g, "").toUpperCase(),
                  })
                }
                disabled={!can("counterpartyDic")}
                className="h-[var(--control-h)] font-mono uppercase tabular-nums"
              />
            ),
            3,
            !receivedDocument,
          )}
          {f.handedOverBy
            ? suggestedText(
                "handedOverBy",
                value.direction === "in" ? t.handedOverByIn : t.handedOverByOut,
                handedOverBySuggest,
                14,
                "@min-[40rem]:pr-3",
              )
            : null}
          {/* Pokladna: 2. řádek = Vyplaceno komu / Přijato od | číslo dokladu. */}
          {p.cashDocument ? externalNumberField : null}
          {receivedDocument && f.bankAccount ? bankAccountField : null}
          {receivedDocument && p.paymentMethodOptions
            ? field(
                "document-paymentMethodId",
                p.paymentMethodLabel ?? "",
                <OptionSelect
                  id="document-paymentMethodId"
                  value={value.paymentMethodId}
                  onChange={(paymentMethodId) => patch({ paymentMethodId })}
                  options={p.paymentMethodOptions}
                  searchable
                  disabled={!can("paymentMethodId")}
                />,
                6,
                false,
                "@min-[40rem]:col-start-15",
              )
            : null}
          {!p.cashDocument && !receivedDocument && f.externalNumber ? externalNumberField : null}
          {suggestedText(
            "description",
            t.description,
            descriptionSuggest,
            !p.cashDocument && (receivedDocument || p.taxNumberField) ? 14 : 20,
            receivedDocument ? "@min-[40rem]:col-start-1 @min-[40rem]:pr-3" : undefined,
          )}
          {f.customerOrderRef
            ? field(
                "document-customerOrderRef",
                printTexts.order,
                p.lockReason?.("customerOrderRef") ? (
                  <FieldValue
                    id="document-customerOrderRef"
                    lockedReason={p.lockReason("customerOrderRef")}
                  >
                    {value.customerOrderRef ?? ""}
                  </FieldValue>
                ) : (
                  <Input
                    id="document-customerOrderRef"
                    value={value.customerOrderRef ?? ""}
                    disabled={!can("customerOrderRef")}
                    readOnly={readOnly}
                    onChange={(event) => patch({ customerOrderRef: event.target.value })}
                  />
                ),
                20,
              )
            : null}
          {p.taxNumberField}
          {p.correctsDocument
            ? field(
                "document-correctsDocument",
                t.correctsDocument,
                <CorrectsDocumentControl
                  field={p.correctsDocument}
                  readOnly={readOnly}
                  openLabel={t.correctsDocument}
                />,
                6,
              )
            : null}
          {receivedDocument && f.externalNumber ? externalNumberField : null}
        </div>
      </>
    </>
  );
}

/** Výběr opravovaného dokladu: hledatelný výběr, odkaz na otevření a zrušení vazby. */
function CorrectsDocumentControl({
  field,
  readOnly,
  openLabel,
}: {
  field: import("./document-form-props").DocumentCorrectsDocumentField;
  readOnly?: boolean;
  openLabel: string;
}) {
  const selected = field.options.find((o) => o.value === field.value);
  if (field.lockedReason) {
    return (
      <FieldValue
        id="document-correctsDocument"
        aria-labelledby="document-correctsDocument-label"
        lockedReason={field.lockedReason}
      >
        {selected?.label ?? ""}
      </FieldValue>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <div className="min-w-0 flex-1">
        <OptionSelect
          id="document-correctsDocument"
          value={field.value ?? ""}
          onChange={(v) => field.onChange(v || null)}
          options={field.options}
          searchable
          disabled={readOnly}
        />
      </div>
      {field.value && field.onOpen ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={openLabel}
          title={openLabel}
          className="size-7 shrink-0 [&_svg]:size-4"
          onClick={() => field.onOpen?.(field.value as string)}
        >
          <ExternalLink />
        </Button>
      ) : null}
    </div>
  );
}

/** IČO ručního režimu: u CZ / SK nebo bez země jen číslice, u ciziny i písmena. */
export function normalizeManualIco(input: string, country?: string | null): string {
  const domestic = !country || ["CZ", "SK"].includes(country.toUpperCase());
  return domestic ? input.replace(/\D/g, "") : input.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}
