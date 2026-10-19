/** Ukázka skupin DPH 2.109.0 · vlastní ukázková data · jen náhled, nesmí do knihovny. */
import { useEffect, useState } from "react";

import {
  JournalLinesEditor,
  type JournalLine,
  type JournalVatOverride,
  type VatCodeOption,
} from "@/components/ds";
import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import { MOCK_ACCOUNTS, MOCK_VAT_CODES_IN, MOCK_VAT_CODES_OUT } from "@/lib/mock/accounting";

interface GroupsExampleProps {
  id: string;
  title: string;
  initial: JournalLine[];
  codes: VatCodeOption[];
  mainAccount: string;
  mainSide: "MD" | "D";
  totalAmount?: number;
  vatEnabled?: boolean;
  currency?: { code: string; rate: number; vatRate: number };
  initialOverrides?: JournalVatOverride[];
}

function GroupsExample(props: GroupsExampleProps) {
  const [lines, setLines] = useState(props.initial);
  const [overrides, setOverrides] = useState<JournalVatOverride[]>(props.initialOverrides ?? []);
  const [rounding, setRounding] = useState(0);
  return (
    <div data-testid={`vat-groups-${props.id}`} className="space-y-1">
      <h3 className="text-sm font-medium">{props.title}</h3>
      <JournalLinesEditor
        storageKey={`vat-groups-${props.id}`}
        lines={lines}
        onChange={setLines}
        accounts={MOCK_ACCOUNTS}
        mode="mainAccount"
        mainAccount={props.mainAccount}
        mainSide={props.mainSide}
        documentCurrency={props.currency?.code ?? "CZK"}
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        rate={props.currency?.rate}
        totalAmount={props.totalAmount}
        totalMode={props.totalAmount === undefined ? "computed" : "entered"}
        rounding={{ value: rounding, onChange: setRounding }}
        roundingLimit={1}
        onRoundingChange={setRounding}
        vat={props.vatEnabled === false ? undefined : { enabled: true, codes: props.codes }}
        vatOverrides={overrides}
        onVatOverridesChange={setOverrides}
        vatExchangeRate={props.currency?.vatRate}
      />
      <p className="text-xs text-muted-foreground" data-testid={`vat-groups-${props.id}-overrides`}>
        {JSON.stringify(overrides)}
      </p>
    </div>
  );
}

const base = (
  id: string,
  text: string,
  amount: number,
  vatCodeId: string | null,
  side: "in" | "out",
) => ({
  id,
  text,
  debitAccount: side === "in" ? "518001" : "311001",
  creditAccount: side === "in" ? "321001" : "602001",
  amount,
  vatCodeId,
});

/** Skupiny DPH, pomocník Cena s DPH a patička Součet · Zaokrouhlení · Rozdíl. */
export function VatGroupsShowcase() {
  // Ukázka se připojí až po hydrataci stránky, aby nezpomalila ostatní ukázky.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <ShowcaseSection
      title="Skupiny DPH (2.109.0)"
      description="Řádky vždy bez DPH; daň po skupinách kód × sazba stejně jako databáze. Úpravy „dle dokladu“, pomocník Cena s DPH a dorovnání Rozdílu."
    >
      {mounted ? (
        <div className="space-y-6" data-testid="vat-groups-showcase">
          <GroupsExample
            id="fp"
            title="FP – pomocník Cena s DPH a haléřový rozdíl (doklad 100,00)"
            initial={[base("fp1", "Služba", 82.64, "p21", "in")]}
            codes={MOCK_VAT_CODES_IN}
            mainAccount="321001"
            mainSide="D"
            totalAmount={100}
          />
          <GroupsExample
            id="fv"
            title="FV – dvě sazby 21 % a 12 %"
            initial={[
              base("fv1", "Zboží", 1000, "v21", "out"),
              base("fv2", "Knihy", 500, "v12", "out"),
              base("fv3", "Doprava", 12.5, "v21", "out"),
            ]}
            codes={MOCK_VAT_CODES_OUT}
            mainAccount="311001"
            mainSide="MD"
          />
          <GroupsExample
            id="eur"
            title="FP v EUR – kurz DPH 24,50"
            initial={[{ ...base("eur1", "Licence", 2450, "p21", "in"), foreignAmount: 100 }]}
            codes={MOCK_VAT_CODES_IN}
            mainAccount="321001"
            mainSide="D"
            currency={{ code: "EUR", rate: 24.5, vatRate: 24.5 }}
            initialOverrides={[{ vatCodeId: "p21", vatRate: 21, taxAmount: 21.05 }]}
          />
          <GroupsExample
            id="rc"
            title="Samovyměření – bez pomocníka a bez úprav"
            initial={[base("rc1", "Stavební práce", 10000, "rc21", "in")]}
            codes={MOCK_VAT_CODES_IN}
            mainAccount="321001"
            mainSide="D"
          />
          <GroupsExample
            id="novat"
            title="Doklad nevstupuje do DPH"
            initial={[base("nv1", "Nájem", 1000, null, "in")]}
            codes={MOCK_VAT_CODES_IN}
            mainAccount="321001"
            mainSide="D"
            totalAmount={1000.4}
            vatEnabled={false}
          />
        </div>
      ) : null}
    </ShowcaseSection>
  );
}
