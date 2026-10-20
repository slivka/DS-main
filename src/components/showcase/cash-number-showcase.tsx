/** Pokladní scénáře · vlastní ukázkový stav · nesmí ukládat skutečné doklady. */
import { useState } from "react";
import { DocumentForm, type DocumentHeaderValue } from "../ds/accounting/document-form";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_PARTNERS } from "../../lib/mock/accounting";
import { ShowcaseSection } from "./ShowcaseLayout";
/** Jediný pokladní scénář příjmu nebo výdaje s přepínáním DPH. */
function CashNumberScenario({
  direction,
  vatRelevant,
}: {
  direction: "in" | "out";
  vatRelevant: boolean;
}) {
  const [value, setValue] = useState<DocumentHeaderValue>({
    currency: "CZK",
    amountTotal: 1000,
    totalMode: "entered",
    direction,
    vatRelevant,
    number: "PO2026001",
    externalNumber: "",
    issueDate: "2026-10-20",
    bookId: "b-pd",
    mainAccountId: "211001",
  });
  const title = `Pokladna – ${direction === "in" ? "příjem" : "výdaj"} ${vatRelevant ? "s DPH" : "bez DPH"}`;
  return (
    <ShowcaseSection title={title}>
      <DocumentForm
        title={title}
        documentType="PO"
        value={value}
        onChange={setValue}
        lines={[]}
        onLinesChange={() => {}}
        books={MOCK_BOOKS}
        accounts={MOCK_ACCOUNTS}
        partners={MOCK_PARTNERS}
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        mainSide={direction === "in" ? "MD" : "D"}
        vat={{ visible: true }}
        status="draft"
      />
    </ShowcaseSection>
  );
}
/** Čtyři kombinace směru a DPH; stejné pole čísla a plná šířka popisu. */
export function CashNumberShowcase() {
  return (
    <>
      {(["in", "out"] as const).flatMap((direction) =>
        [false, true].map((vatRelevant) => (
          <CashNumberScenario
            key={`${direction}-${vatRelevant}`}
            direction={direction}
            vatRelevant={vatRelevant}
          />
        )),
      )}
    </>
  );
}
