/** Stav ukázky účetních polí (preview-only). */
import { useState } from "react";
import { AccountingFieldsShowcase } from "./AccountingFieldsShowcase";

export function AccountingFieldsDemo() {
  const [partnerId, setPartnerId] = useState<string>("p2");
  const [bookId, setBookId] = useState<string>("b-fv");
  const [dimensionId, setDimensionId] = useState<string>("d-cz-2");
  const [vs, setVs] = useState("2026000345");
  const [amount, setAmount] = useState(125400.5);
  const [rate, setRate] = useState(24.815);
  const [currency, setCurrency] = useState("EUR");
  return (
    <AccountingFieldsShowcase
      partnerId={partnerId}
      setPartnerId={setPartnerId}
      bookId={bookId}
      setBookId={setBookId}
      dimensionId={dimensionId}
      setDimensionId={setDimensionId}
      vs={vs}
      setVs={setVs}
      amount={amount}
      setAmount={setAmount}
      currency={currency}
      setCurrency={setCurrency}
      rate={rate}
      setRate={setRate}
    />
  );
}
