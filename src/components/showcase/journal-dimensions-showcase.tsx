/** Dimenze faktury a ID · preview-only · hodnoty neodcházejí do skutečné aplikace. */
import { useState } from "react";
import {
  JournalLinesEditor,
  MultiValueCell,
  DimensionFilter,
  type DimensionType,
  type DimensionValue,
  type JournalLine,
  type LoadDimensionOptions,
} from "@/components/ds";
import { normalizeSearchText } from "@/components/ds/form/searchable-option-select";
import { useDsTexts } from "@/ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";
const types: DimensionType[] = [
  { id: "vehicle", label: "Vozidlo", order: 1 },
  { id: "centre", label: "Středisko", order: 2 },
];
const vehicles = [
  { id: "car-a", label: "Octavia · 1AB 2345", kind: "vehicle" as const },
  { id: "car-b", label: "Transporter · 2BC 3456", kind: "vehicle" as const },
  { id: "car-ended", label: "Fabia · 3CD 4567", kind: "vehicle" as const, inactive: true },
];
const loadOptions: LoadDimensionOptions = async (type, query) => {
  const options =
    type === "vehicle"
      ? vehicles
      : [
          { id: "office", label: "Kancelář", code: "100" },
          { id: "workshop", label: "Dílna", code: null },
        ];
  return options.filter((option) =>
    normalizeSearchText(`${option.label} ${"code" in option ? option.code : ""}`).includes(
      normalizeSearchText(query),
    ),
  );
};
const initial: DimensionValue[] = [
  { typeId: "vehicle", valueId: "car-a", label: vehicles[0]?.label ?? "", kind: "vehicle" },
];
const accounts = [
  { code: "518001", name: "Služby", category: "ekonomicka_kategorie" },
  { code: "321001", name: "Dodavatelé" },
];
/** Živá ukázka převzatých dimenzí faktury a dvou stran interního dokladu. */
export function JournalDimensionsShowcase() {
  const t = useDsTexts().dimensions;
  const [header, setHeader] = useState<DimensionValue[]>(initial);
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: "dimensions-invoice",
      debitAccount: "518001",
      creditAccount: "321001",
      text: "Servis vozidla",
      amount: 1200,
    },
  ]);
  const [internalHeader, setInternalHeader] = useState<DimensionValue[]>(initial);
  const [internalLines, setInternalLines] = useState<JournalLine[]>([
    {
      id: "dimensions-internal",
      debitAccount: "518001",
      creditAccount: "321001",
      text: "Přeúčtování",
      amount: 300,
    },
  ]);
  const [filter, setFilter] = useState(new Set<string>());
  return (
    <>
      <ShowcaseSection title={t.invoiceExample}>
        <div data-testid="dimensions-invoice-demo">
          <JournalLinesEditor
            mode="mainAccount"
            mainSide="D"
            mainAccount="321001"
            lines={lines}
            onChange={setLines}
            accounts={accounts}
            dimensionTypes={types}
            dimensions={header}
            onDimensionsChange={setHeader}
            loadDimensionOptions={loadOptions}
            dimensionsBySide={false}
            documentCurrency="EUR"
            homeCurrency="EUR"
            storageKey="showcase-dimensions-invoice"
          />
        </div>
        <div className="flex items-center gap-2 pt-3">
          <MultiValueCell values={header} />
          <DimensionFilter
            options={vehicles}
            selected={filter}
            onSelectionChange={setFilter}
            label={types[0]?.label}
          />
        </div>
      </ShowcaseSection>
      <ShowcaseSection title={t.internalExample}>
        <div data-testid="dimensions-internal-demo">
          <JournalLinesEditor
            mode="internal"
            lines={internalLines}
            onChange={setInternalLines}
            accounts={accounts}
            dimensionTypes={types}
            dimensions={internalHeader}
            onDimensionsChange={setInternalHeader}
            loadDimensionOptions={loadOptions}
            dimensionsBySide
            documentCurrency="EUR"
            homeCurrency="EUR"
            storageKey="showcase-dimensions-internal"
          />
        </div>
      </ShowcaseSection>
    </>
  );
}
