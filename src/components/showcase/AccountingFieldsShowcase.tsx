/** Ukázka samostatných účetních polí; vlastní stav dodává rodič, nesmí měnit DS. */
import { toast } from "sonner";
import { BookSelect, CurrencyAmount, DimensionSelect, PartnerSelect, VsField } from "../ds";
import { Label } from "../ui/label";
import { MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "../../lib/mock/accounting";
import { ShowcaseSection } from "./ShowcaseLayout";
const CURRENCIES = [
  { code: "CZK", label: "Česká koruna", symbol: "Kč" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Americký dolar" },
];
interface AccountingFieldsShowcaseProps {
  partnerId: string;
  setPartnerId: (v: string) => void;
  bookId: string;
  setBookId: (v: string) => void;
  dimensionId: string;
  setDimensionId: (v: string) => void;
  vs: string;
  setVs: (v: string) => void;
  amount: number;
  setAmount: (v: number) => void;
  currency: string;
  setCurrency: (v: string) => void;
  rate: number;
  setRate: (v: number) => void;
}
/** Zachovaná ukázka jednotlivých prvků účetních formulářů. */
export function AccountingFieldsShowcase({
  partnerId,
  setPartnerId,
  bookId,
  setBookId,
  dimensionId,
  setDimensionId,
  vs,
  setVs,
  amount,
  setAmount,
  currency,
  setCurrency,
  rate,
  setRate,
}: AccountingFieldsShowcaseProps) {
  return (
    <ShowcaseSection
      title="Jednotlivé prvky"
      description="Výběr partnera, knihy a zakázky, variabilní symbol a částka v měně dokladu."
    >
      <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-partner">Partner</Label>
          <PartnerSelect
            id="demo-partner"
            partners={MOCK_PARTNERS}
            value={partnerId}
            onChange={setPartnerId}
            onCreate={() => toast.info("Otevře se formulář nového partnera")}
            onLoadFromAres={() => toast.info("Načtení údajů z ARES")}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-book">Kniha</Label>
          <BookSelect id="demo-book" books={MOCK_BOOKS} value={bookId} onChange={setBookId} />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-single-book">Jediná dostupná kniha</Label>
          <BookSelect
            id="demo-single-book"
            books={MOCK_BOOKS.slice(0, 1)}
            value={bookId}
            onChange={setBookId}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-dimension">Zakázka</Label>
          <DimensionSelect
            id="demo-dimension"
            options={MOCK_DIMENSIONS}
            value={dimensionId}
            onChange={setDimensionId}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="demo-vs">Variabilní symbol</Label>
          <VsField id="demo-vs" value={vs} onChange={setVs} />
        </div>
      </div>

      <CurrencyAmount
        className="mt-4 rounded-lg border bg-card p-4"
        amount={amount}
        onAmountChange={setAmount}
        currency={currency}
        onCurrencyChange={setCurrency}
        currencies={CURRENCIES}
        baseCurrency="CZK"
        homeCurrencySymbol="Kč"
        rate={rate}
        onRateChange={setRate}
        idPrefix="demo-currency"
      />
    </ShowcaseSection>
  );
}
