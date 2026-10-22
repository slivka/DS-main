/** Převzatá bankovní pole · fiktivní doklady · nesmí parsovat ani ukládat výpis. */
import { useState } from "react";
import { DocumentForm, type DocumentHeaderValue } from "../ds";
import { ShowcaseSection } from "./ShowcaseLayout";
import { MOCK_BOOKS } from "../../lib/mock/accounting";
import { formatCodeName } from "../../lib/code-format";
import type { useDocumentFormShowcaseState } from "./use-document-form-showcase-state";
export interface ImportedMovementShowcaseProps {
  common: ReturnType<typeof useDocumentFormShowcaseState>["common"];
}
export function ImportedMovementShowcase({ common }: ImportedMovementShowcaseProps) {
  const [bankLocked, setBankLocked] = useState<DocumentHeaderValue>({
    bookId: "b-bv",
    number: "BA/2026/041",
    direction: "in",
    issueDate: "2026-10-20",
    accountingDate: "2026-10-20",
    bankAccount: "19-2000145399",
    bankCode: "0800",
    variableSymbol: "20260123",
    constantSymbol: "0308",
    specificSymbol: "77",
    currency: "CZK",
    amountTotal: 1500,
    totalMode: "entered",
    mainAccountId: "221001",
    description: "Příjem z banky",
  });
  return (
    <>
      <ShowcaseSection
        title="Bankovní pohyb z importu výpisu"
        description="Pole převzatá z banky jsou jen pro čtení se zámkem a důvodem v bublině (fieldLockedReasons)."
      >
        <DocumentForm
          title="Bankovní pohyb"
          identity={{
            variant: "cashBank",
            book: formatCodeName("BV", "Banka"),
            period: "2026",
            account: { side: "DAL", label: formatCodeName("221.001", "Běžný účet") },
            number: bankLocked.number,
          }}
          directionBadge="in"
          value={bankLocked}
          onChange={setBankLocked}
          lines={[]}
          {...common}
          books={MOCK_BOOKS.filter((b) => b.id === "b-bv")}
          documentType="BA"
          mainSide="D"
          mainAccountLocked
          status="draft"
          editableFields={["description"]}
          fieldLockedReasons={{
            issueDate: "Převzato z banky",
            bankAccount: "Převzato z banky",
            bankCode: "Převzato z banky",
            variableSymbol: "Převzato z banky",
            constantSymbol: "Převzato z banky",
            specificSymbol: "Převzato z banky",
            amountTotal: "Převzato z banky",
            currency: "Převzato z banky",
          }}
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Zahraniční bankovní pohyb z importu výpisu"
        description="Pole převzatá z banky jsou jen pro čtení se zámkem a důvodem v bublině (fieldLockedReasons)."
      >
        <DocumentForm
          title="Bankovní pohyb"
          identity={{
            variant: "cashBank",
            book: formatCodeName("BV", "Banka"),
            period: "2026",
            account: { side: "DAL", label: formatCodeName("221.001", "Běžný účet") },
            number: bankLocked.number,
          }}
          directionBadge="in"
          value={{
            ...bankLocked,
            bankAccountKind: "iban",
            bankIban: "DE89370400440532013000",
            bankSwift: "COBADEFFXXX",
            paymentReference: "INV-2026-123",
            currency: "EUR",
            rate: 25,
          }}
          onChange={setBankLocked}
          lines={[]}
          {...common}
          books={MOCK_BOOKS.filter((b) => b.id === "b-bv")}
          documentType="BA"
          mainSide="D"
          mainAccountLocked
          status="draft"
          editableFields={["description"]}
          fieldLockedReasons={{
            issueDate: "Převzato z banky",
            bankAccount: "Převzato z banky",
            bankCode: "Převzato z banky",
            variableSymbol: "Převzato z banky",
            paymentReference: "Převzato z banky",
            bankIban: "IBAN převzat z banky",
            bankSwift: "SWIFT převzat z banky",

            amountTotal: "Převzato z banky",
            currency: "Převzato z banky",
          }}
        />
      </ShowcaseSection>
    </>
  );
}
