/** Ukázka vytěžování · vlastní demo stav · nesmí se distribuovat aplikacím. */
import { useState } from "react";
import {
  Button,
  ExtractedItemsTable,
  ExtractionOverwriteDialog,
  ExtractionStatus,
  Field,
  FieldGrid,
  Input,
  OptionSelect,
  PageHeader,
  SuggestionSummary,
  type ExtractionState,
  type ExtractedItem,
  type FieldSuggestion,
} from "../ds";

const ITEMS: ExtractedItem[] = [
  {
    id: "i1",
    text: "Kancelářské potřeby",
    quantity: 2,
    unit: "bal",
    unitPrice: 1250,
    vatRate: "21 %",
    base: 2500,
    tax: 525,
  },
  {
    id: "i2",
    text: "Doprava",
    quantity: null,
    unit: null,
    unitPrice: null,
    vatRate: "21 %",
    base: 150,
    tax: 31.5,
  },
  {
    id: "i3",
    text: "Tiskové služby",
    quantity: 12.5,
    unit: "hod",
    unitPrice: 480,
    vatRate: "21 %",
    base: 6000,
    tax: 1260,
  },
];

const STATES: { value: ExtractionState; label: string }[] = [
  { value: "extracting", label: "Vytěžuji…" },
  { value: "done", label: "Hotovo" },
  { value: "failed", label: "Nepodařilo se" },
  { value: "duplicate", label: "Duplicitní soubor" },
];

/** Ukázka stavů vytěžení: navržená a nejistá pole, pruhy stavu, souhrn a tabulka položek. */
export function ExtractionShowcase() {
  const [state, setState] = useState<ExtractionState>("done");
  const [partner, setPartner] = useState("Kancelářské potřeby s.r.o.");
  const [amount, setAmount] = useState("12 100,00");
  const [partnerSuggestion, setPartnerSuggestion] = useState<FieldSuggestion | undefined>({
    source: "Faktura-2026-0142.pdf",
  });
  const [amountSuggestion, setAmountSuggestion] = useState<FieldSuggestion | undefined>({
    source: "Faktura-2026-0142.pdf",
    uncertain: true,
  });
  const [summaryVisible, setSummaryVisible] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogResult, setDialogResult] = useState("");
  return (
    <section data-testid="extraction-showcase" className="space-y-6">
      <PageHeader title="Vytěžování souboru" />
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-56">
          <OptionSelect
            value={state}
            onChange={(next) => setState(next as ExtractionState)}
            options={STATES}
            aria-label="Stav vytěžení"
          />
        </div>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>
          Vytěžit do rozepsaného dokladu
        </Button>
        {dialogResult ? <span className="text-sm text-muted-foreground">{dialogResult}</span> : null}
      </div>
      <ExtractionStatus
        state={state}
        method="AI návrh"
        onCancel={() => setState("done")}
        onRetry={() => setState("extracting")}
        onOpenOriginal={() => undefined}
      />
      {summaryVisible ? (
        <SuggestionSummary
          method="AI návrh"
          uncertainCount={amountSuggestion?.uncertain ? 1 : 0}
          linesReference={{ label: "řádky 1–3", onOpen: () => undefined }}
          onDiscard={() => {
            setSummaryVisible(false);
            setPartnerSuggestion(undefined);
            setAmountSuggestion(undefined);
          }}
        />
      ) : null}
      <FieldGrid cols={12}>
        <Field label="Odběratel" htmlFor="extraction-partner" span={6} suggestion={partnerSuggestion}>
          <Input
            id="extraction-partner"
            value={partner}
            onChange={(event) => {
              setPartner(event.target.value);
              setPartnerSuggestion(undefined);
            }}
          />
        </Field>
        <Field label="Částka" htmlFor="extraction-amount" span={3} suggestion={amountSuggestion}>
          <Input
            id="extraction-amount"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountSuggestion(undefined);
            }}
          />
        </Field>
        <Field label="Číslo dokladu" htmlFor="extraction-number" span={3}>
          <Input id="extraction-number" defaultValue="2026/0142" />
        </Field>
      </FieldGrid>
      <ExtractedItemsTable items={ITEMS} totals={{ base: 8650, tax: 1816.5 }} />
      <ExtractionOverwriteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onOverwriteAll={() => setDialogResult("Zvoleno: Přepsat vše")}
        onFillEmpty={() => setDialogResult("Zvoleno: Doplnit jen prázdná pole")}
      />
    </section>
  );
}
