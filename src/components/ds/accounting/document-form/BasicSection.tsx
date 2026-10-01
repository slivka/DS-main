/**
 * Základní údaje formuláře dokladu.
 * Vlastní: protistranu, IČO, DIČ, předání, číslo a popis.
 * Nesmí: spravovat identitu dokladu nebo ostatní sekce.
 */
import type { ReactNode } from "react";
import { Input } from "../../../ui/input";
import { CounterpartyField, type CounterpartySeed } from "../counterparty-field";
import { IcoLink, type IcoLinkTarget } from "../../form/ico-link";
import { SectionHeading } from "../../layout/section-heading";
import { ReadField } from "./document-identity-line";
import type { PartnerOption } from "../partner-select";
import type { DocumentFields } from "../document-fields";
import type {
  DocumentFormTexts,
  DocumentHeaderValue,
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
    field,
    suggestedText,
    handedOverBySuggest,
    descriptionSuggest,
    externalNumberField,
  } = p;
  return (
    <>
      <>
        <SectionHeading>{t.headerSection}</SectionHeading>
        <div className="grid grid-cols-20 gap-3">
          {field(
            "document-partner",
            partnerLabel,
            <CounterpartyField
              id="document-partner"
              partners={partners}
              value={{
                name: value.counterpartyName ?? partner?.name ?? "",
                partnerId: value.partnerId ?? null,
                ico: counterpartyIco,
                dic: counterpartyDic,
              }}
              onChange={(next) =>
                patch({
                  counterpartyName: next.name,
                  partnerId: next.partnerId,
                  counterpartyIco: next.ico ?? null,
                  counterpartyDic: next.dic ?? null,
                })
              }
              onCreatePartner={
                onCreatePartner
                  ? (seed) =>
                      onCreatePartner({
                        ...seed,
                        ico: counterpartyIco || seed.ico,
                        dic: counterpartyDic || seed.dic,
                      })
                  : undefined
              }
              disabled={!can("partnerId")}
            />,
            14,
            false,
            "@min-[40rem]:pr-3",
          )}
          {field(
            "document-partner-ico",
            t.ico,
            linkedPartner ? (
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
                    patch({ counterpartyIco: event.target.value.replace(/\s/g, "") })
                  }
                  disabled={!can("counterpartyIco")}
                  className="h-9 font-mono tabular-nums"
                />
                {icoWarning ? (
                  <p role="alert" className="text-xs font-medium text-warning-strong">
                    {t.invalidIco}
                  </p>
                ) : null}
              </>
            ),
            3,
            true,
          )}
          {field(
            "document-partner-dic",
            t.dic,
            linkedPartner ? (
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
                className="h-9 font-mono uppercase tabular-nums"
              />
            ),
            3,
            true,
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
          {f.externalNumber ? externalNumberField : null}
          {suggestedText("description", t.description, descriptionSuggest, 20)}
        </div>
      </>
    </>
  );
}
