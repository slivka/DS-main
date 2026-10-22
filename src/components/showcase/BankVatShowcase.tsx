/** Ukázka BA s DPH · vlastní náhledová data · nesmí být součástí knihovny. */
import { useState } from "react";
import { DocumentForm, type DocumentHeaderValue } from "../ds";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_DIMENSIONS,
  MOCK_PARTNERS,
} from "../../lib/mock/accounting";
import { formatCodeName } from "../../lib/code-format";
import { CURRENCIES } from "./document-form-showcase-data";
import { ShowcaseSection } from "./ShowcaseLayout";

/** BA výdaj v EUR s DPH, odemykatelnou vazbou Datum DPH a jiným DUZP (Kurz DPH). */
export function BankVatShowcase() {
  const [locked, setLocked] = useState(false);
  const [value, setValue] = useState<DocumentHeaderValue>({
    bookId: "b-bv",
    number: "BV2026000031",
    direction: "out",
    accountingDate: "2026-10-12",
    issueDate: "2026-10-12",
    taxDate: "2026-10-05",
    vatDate: "2026-10-12",
    vatRelevant: true,
    description: "Licence software – platba kartou",
    currency: "EUR",
    rate: 24.38,
    rateInfo: "ČNB 12. 10. 2026",
    amountTotal: 121,
    totalMode: "entered",
    mainAccountId: "221002",
  });
  return (
    <ShowcaseSection
      title="Banka – výdaj v EUR s DPH a jiným DUZP"
      description="BA s DPH: DUZP, Datum DPH s vazbou na DUZP (výdaj lze odemknout) a Kurz DPH."
    >
      <div data-testid="bank-vat-example">
        <DocumentForm
          title="Bankovní doklad – výdaj"
          identity={{
            variant: "cashBank",
            book: formatCodeName("BV", "Banka EUR"),
            period: "2026",
            account: { side: "DAL", label: formatCodeName("221.002", "Běžný účet EUR") },
            number: value.number,
          }}
          directionBadge="out"
          value={value}
          onChange={setValue}
          lines={[]}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          onLinesChange={() => {}}
          currencies={CURRENCIES}
          currencyLocked
          books={MOCK_BOOKS.filter((b) => b.id === "b-bv")}
          documentType="BA"
          bankCodeOptions={[
            { code: "0100", name: "Komerční banka" },
            { code: "0800", name: "Česká spořitelna" },
          ]}
          mainSide="D"
          mainAccountLocked
          status="draft"
          vat={{
            visible: true,
            dateLink: {
              locked,
              onToggle: (next) => {
                setLocked(next);
                if (next) setValue((current) => ({ ...current, vatDate: current.taxDate }));
              },
            },
          }}
          vatRateField={{
            value: 24.41,
            onChange: () => {},
            sameAsDocument: value.taxDate === value.accountingDate,
            suggestedRate: 24.41,
            suggestedInfo: "ČNB k DUZP 5. 10. 2026",
          }}
        />
      </div>
    </ShowcaseSection>
  );
}
