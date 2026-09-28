import { useState } from "react";

import { JournalLinesEditor, type JournalLine, type VatCalcMode, type VatCodeOption } from "@/components/ds";
import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  MOCK_ACCOUNTS,
  MOCK_DIMENSIONS,
  MOCK_PARTNERS,
  MOCK_PDP_SUBJECTS,
  MOCK_VAT_CODES_IN,
  MOCK_VAT_CODES_OUT,
} from "@/lib/mock/accounting";

type ExampleProps = {
  title: string;
  description: string;
  initial: JournalLine[];
  codes: VatCodeOption[];
  mainAccount: string;
  mainSide: "MD" | "D";
  totalAmount?: number;
  initialMode?: VatCalcMode;
  enabled?: boolean;
  currency?: { code: string; symbol: string; rate: number; vatRate: number };
  storageKey: string;
};

function VatExample({ title, description, initial, codes, mainAccount, mainSide, totalAmount, initialMode = "net", enabled = true, currency, storageKey }: ExampleProps) {
  const [lines, setLines] = useState<JournalLine[]>(initial);
  const [mode, setMode] = useState<VatCalcMode>(initialMode);
  return (
    <ShowcaseSection title={title} description={description}>
      <JournalLinesEditor
        lines={lines}
        onChange={setLines}
        accounts={MOCK_ACCOUNTS}
        dimensions={MOCK_DIMENSIONS}
        partners={MOCK_PARTNERS}
        mode="mainAccount"
        mainSide={mainSide}
        mainAccount={mainAccount}
        totalAmount={totalAmount}
        totalMode={totalAmount === undefined ? "computed" : "entered"}
        documentCurrency={currency?.code ?? "CZK"}
        documentCurrencySymbol={currency?.symbol}
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        rate={currency?.rate ?? 1}
        storageKey={storageKey}
        vat={{
          enabled,
          codes,
          calcMode: mode,
          onCalcModeChange: setMode,
          defaultCodeId: codes[0]?.id,
          pdpSubjects: MOCK_PDP_SUBJECTS,
          vatRate: currency?.vatRate,
        }}
      />
    </ShowcaseSection>
  );
}

/** Ukázky editoru řádků s DPH – předběžný výpočet daně před uložením. */
export function VatJournalShowcase() {
  return (
    <>
      <VatExample
        title="Faktura vydaná – dvě sazby DPH"
        description="21V 1 000 + 12V 500 → celkem 1 770. Řádky daně se počítají předběžně; po uložení je vytvoří databáze."
        storageKey="showcase-vat-fv"
        codes={MOCK_VAT_CODES_OUT}
        mainAccount="311001"
        mainSide="MD"
        totalAmount={1770}
        initial={[
          { id: "fv1", debitAccount: "311001", creditAccount: "602001", amount: 1000, text: "Servisní služby", vatCodeId: "v21", vs: "2026000801", partnerId: "p1" },
          { id: "fv2", debitAccount: "311001", creditAccount: "604001", amount: 500, text: "Prodej zboží", vatCodeId: "v12", vs: "2026000801", partnerId: "p1" },
        ]}
      />
      <VatExample
        title="Faktura přijatá – ruční daň a poměrný nárok"
        description="Ruční daň 210,40 se od vypočtené liší o 0,40 → žluté varování. Druhý řádek má poměrný nárok 60 % (126 + 84)."
        storageKey="showcase-vat-fp"
        codes={MOCK_VAT_CODES_IN}
        mainAccount="321001"
        mainSide="D"
        initial={[
          { id: "fp1", debitAccount: "518001", creditAccount: "321001", amount: 1000, text: "Licence", vatCodeId: "p21", vatManual: true, vatAmount: 210.4, vs: "2026000901", partnerId: "p2" },
          { id: "fp2", debitAccount: "513001", creditAccount: "321001", amount: 1000, text: "Pohoštění", vatCodeId: "p21", vatDeduction: "partial", vatDeductionShare: 60, vs: "2026000901", partnerId: "p2" },
        ]}
      />
      <VatExample
        title="Faktura přijatá – přenesení daňové povinnosti"
        description="RC-P21 1 000: daň na výstupu i odpočet (343 / 343), celek dokladu zůstává 1 000."
        storageKey="showcase-vat-rc"
        codes={MOCK_VAT_CODES_IN}
        mainAccount="321001"
        mainSide="D"
        totalAmount={1000}
        initial={[
          { id: "rc1", debitAccount: "518001", creditAccount: "321001", amount: 1000, text: "Stavební práce", vatCodeId: "rc21", pdpSubjectCode: "4", vs: "2026000902", partnerId: "p3" },
        ]}
      />
      <VatExample
        title="Pokladní doklad – zadání s DPH"
        description="V režimu „S DPH“ se píše do Celkem s DPH; Částka (základ) je jen ke čtení. 121 → 100 + 21."
        storageKey="showcase-vat-po"
        codes={MOCK_VAT_CODES_IN}
        mainAccount="211001"
        mainSide="D"
        initialMode="gross"
        initial={[
          { id: "po1", debitAccount: "518001", creditAccount: "211001", amount: 100, grossAmount: 121, text: "Kancelářské potřeby", vatCodeId: "p21" },
        ]}
      />
      <VatExample
        title="Faktura přijatá v EUR s kurzem DPH"
        description="Daň v měně dokladu; v detailu řádku základ a DPH v Kč kurzem DPH. Rozdíl kurzů dorovná po uložení databáze."
        storageKey="showcase-vat-eur"
        codes={MOCK_VAT_CODES_IN}
        mainAccount="321001"
        mainSide="D"
        currency={{ code: "EUR", symbol: "€", rate: 25.12, vatRate: 25.05 }}
        initial={[
          { id: "eur1", debitAccount: "518001", creditAccount: "321001", currency: "EUR", foreignAmount: 1000, rate: 25.12, amount: 25120, text: "Software", vatCodeId: "p21", vs: "2026000903", partnerId: "p1" },
        ]}
      />
      <VatExample
        title="Doklad mimo DPH"
        description="Při vypnutém „Vstupuje do DPH“ se nic z DPH nezobrazí."
        storageKey="showcase-vat-off"
        codes={MOCK_VAT_CODES_IN}
        mainAccount="321001"
        mainSide="D"
        enabled={false}
        initial={[{ id: "off1", debitAccount: "518001", creditAccount: "321001", amount: 1000, text: "Služba neplátce" }]}
      />
    </>
  );
}
