/** Kategorie interního dokladu · preview-only · bez persistence. */
import { useState } from "react";
import { JournalLinesEditor, type JournalLine, type CategoryOption, useDsTexts } from "@/components/ds";
import { ShowcaseSection } from "./ShowcaseLayout";

const categories: CategoryOption[] = [
  { id: "operations", name: "Provoz", code: null, postable: false },
  { id: "services", parentId: "operations", code: "SL", name: "Služby", postable: true },
  { id: "materials", parentId: "operations", code: null, name: "Materiál", postable: true },
  { id: "sales", name: "Prodej", code: "PR", postable: true },
];
const accounts = [
  { code: "518001", name: "Služby", category: "ekonomicka_kategorie" },
  { code: "602001", name: "Tržby", category: "ekonomicka_kategorie" },
  { code: "211001", name: "Pokladna" },
];
export function JournalCategoriesShowcase() {
  const texts = useDsTexts();
  const [lines, setLines] = useState<JournalLine[]>([
    { id: "category-id", debitAccount: "518001", creditAccount: "602001", amount: 1200 },
  ]);
  return <ShowcaseSection title={texts.economicCategory.title}>
    <div data-testid="journal-categories-demo">
      <JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} categories={categories}
        categoryBySide categoryRequired documentCurrency="EUR" homeCurrency="EUR" documentCurrencySymbol="€" homeCurrencySymbol="€"
        allowedCategories={(code) => code === "518001" ? ["operations"] : null}
        storageKey="showcase-journal-categories" />
    </div>
  </ShowcaseSection>;
}