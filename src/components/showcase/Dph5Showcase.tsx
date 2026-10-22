/** Ukázka DPH 5 B a Zálohových listů B (2.118.0) · vlastní ukázková data · jen náhled. */
import { useEffect, useRef, useState } from "react";

import { DocumentPostingGrid, JournalLinesEditor, StatusBadge, advanceListVariant, advancePaymentStatusConfig, type AdvancePaymentStatus, type JournalLine, type JournalLinesVat, type JournalVatOverride, type VatCodeOption } from "@/components/ds";
import { useDsTexts } from "@/ds-texts";
import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import { MOCK_ACCOUNTS, MOCK_VAT_CODES_IN, MOCK_VAT_CODES_OUT } from "@/lib/mock/accounting";

const OUTSIDE_IN: VatCodeOption = {
  id: "mimo-in",
  code: "M",
  name: "Mimo DPH",
  direction: "in",
  hasTax: false,
  rate: null,
  selfAssessment: false,
  requiresPdpSubject: false,
  menuGroup: "outside",
};
const CODES_IN = [
  ...MOCK_VAT_CODES_IN.map((code) => ({ ...code, khSection: code.selfAssessment ? "B1" : "B2" })),
  OUTSIDE_IN,
];
const CODES_OUT = MOCK_VAT_CODES_OUT.map((code) => ({ ...code, khSection: "A4" }));

interface ExampleProps {
  id: string;
  title: string;
  initial: JournalLine[];
  mainAccount?: string;
  mainSide?: "MD" | "D";
  vat?: JournalLinesVat;
  currency?: { code: string; rate: number };
  initialRounding?: number;
  advanceDeduction?: number;
  withoutAccounts?: boolean;
  totalAmount?: number;
}

function Example(props: ExampleProps) {
  const [lines, setLines] = useState(props.initial);
  const [overrides, setOverrides] = useState<JournalVatOverride[]>([]);
  const [rounding, setRounding] = useState(props.initialRounding ?? 0);
  const [homeOpen, setHomeOpen] = useState(false);
  return (
    <div data-testid={`dph5-${props.id}`} className="space-y-1">
      <h3 className="text-sm font-medium">{props.title}</h3>
      <JournalLinesEditor
        storageKey={`dph5-${props.id}`}
        lines={lines}
        onChange={setLines}
        recap={{ vatHomeOpen: homeOpen, onVatHomeOpenChange: setHomeOpen }}
        accounts={MOCK_ACCOUNTS}
        mode={props.mainAccount ? "mainAccount" : "internal"}
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
        advanceDeduction={props.advanceDeduction}
        withoutAccounts={props.withoutAccounts}
        vat={props.vat}
        vatOverrides={overrides}
        onVatOverridesChange={setOverrides}
        vatExchangeRate={props.currency?.rate}
      />
    </div>
  );
}

const line = (
  id: string,
  text: string,
  amount: number,
  vatCodeId: string | null,
  side: "in" | "out",
): JournalLine => ({
  id,
  text,
  debitAccount: side === "in" ? "518001" : "311001",
  creditAccount: side === "in" ? "321001" : "602001",
  amount,
  vatCodeId,
});

const PAYMENT_STATES: AdvancePaymentStatus[] = ["unpaid", "partial", "paid", "remainderCancelled"];

/** Varianty zálohových listů – jen konfigurace sdíleného formuláře faktury. */
function AdvanceLists() {
  const texts = useDsTexts().vatFive;
  const status = advancePaymentStatusConfig(texts);
  const variants = [
    { id: "zfv", title: "Vydaný ZL – plátce", type: "ZFV" as const, payer: true },
    { id: "zfv-np", title: "Vydaný ZL – firma neplátce", type: "ZFV" as const, payer: false },
    { id: "zfp", title: "Přijatý ZL – dodavatel plátce", type: "ZFP" as const, payer: true },
    { id: "zfp-np", title: "Přijatý ZL – dodavatel neplátce", type: "ZFP" as const, payer: false },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" data-testid="dph5-payment-states">
        {PAYMENT_STATES.map((state) => (
          <StatusBadge key={state} status={state} config={status} />
        ))}
      </div>
      {variants.map((item) => {
        const variant = advanceListVariant({
          type: item.type,
          vatPayer: item.payer,
          recapNote: texts.notTaxDocument,
        });
        const side = item.type === "ZFV" ? "out" : "in";
        const codes = side === "out" ? CODES_OUT : CODES_IN;
        return (
          <Example
            key={item.id}
            id={item.id}
            title={item.title}
            initial={[
              {
                ...line(
                  `${item.id}1`,
                  "Záloha na dodávku",
                  10000,
                  item.payer ? (codes[0]?.id ?? null) : null,
                  side,
                ),
                debitAccount: null,
                creditAccount: null,
              },
            ]}
            mainAccount={side === "out" ? "311001" : "321001"}
            mainSide={side === "out" ? "MD" : "D"}
            withoutAccounts={variant.withoutAccounts}
            vat={variant.linesVat ? { enabled: true, codes, ...variant.linesVat } : undefined}
          />
        );
      })}
    </div>
  );
}

/** DPH 5 B – grid řádků, výběr kódů, rekapitulace, patička a Zaúčtování; zálohové listy. */
export function Dph5Showcase() {
  // Ukázka se připojí, až se k ní stránka posune – nezdrží načtení ostatních.
  const [mounted, setMounted] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setMounted(true);
      },
      { rootMargin: "400px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <ShowcaseSection
      title="DPH 5 B a zálohové listy (2.118.0)"
      description="Popis · Kód DPH · Částka bez DPH · účty · Zakázka. Enter skáče dál, na konci řádku založí řádek s kódem a účty, Shift+Enter zpět; špendlík zakotví sloupec. Rekapitulace po oddílech s KH, bez nároku a patičkou K úhradě."
    >
      <div ref={sentinel} />
      {mounted ? (
        <div className="space-y-6" data-testid="dph5-showcase">
          <Example
            id="czk"
            title="FP v CZK – KH, bez nároku, mimo DPH a zaokrouhlení"
            initial={[
              {
                ...line("c1", "Služby", 8264.46, "p21", "in"),
                vatDeduction: "partial",
                vatDeductionShare: 60,
              },
              {
                ...line("c2", "Občerstvení", 1000, "p21", "in"),
                vatDeduction: "none",
                khLimitExcluded: true,
              },
              line("c3", "Poplatek", 150, "mimo-in", "in"),
            ]}
            mainAccount="321001"
            mainSide="D"
            initialRounding={0.46}
            vat={{ enabled: true, codes: CODES_IN, nonDeductibleByCode: { p21: 210 } }}
          />
          <Example
            id="locked-detail"
            title="Zaúčtovaný doklad – údaje DPH se zachovanými hodnotami"
            initial={[
              {
                ...line("locked1", "Služby", 1000, "p21", "in"),
                vatDeduction: "partial",
                vatDeductionShare: 60,
                khLimitExcluded: true,
              },
            ]}
            mainAccount="321001"
            mainSide="D"
            vat={{
              enabled: true,
              codes: CODES_IN,
              readOnly: true,
              rowDetails: {
                canEdit: () => false,
                disabledReason: "Zaúčtovaný doklad nelze upravovat",
              },
            }}
          />
          <Example
            id="eur"
            title="FP v EUR – základ a DPH v Kč sbalitelně"
            initial={[{ ...line("e1", "Licence", 2450, "p21", "in"), foreignAmount: 100 }]}
            mainAccount="321001"
            mainSide="D"
            currency={{ code: "EUR", rate: 24.5 }}
            vat={{ enabled: true, codes: CODES_IN }}
          />
          <Example
            id="fv"
            title="FV – odečtená záloha, oprava DPH jen v ⋯"
            initial={[line("v1", "Zboží", 10000, "v21", "out")]}
            mainAccount="311001"
            mainSide="MD"
            advanceDeduction={6050}
            vat={{ enabled: true, codes: CODES_OUT, overrideInMenu: true }}
          />
          <Example
            id="novat"
            title="Doklad mimo DPH – Součet · Zaokrouhlení · K úhradě · Rozdíl"
            initial={[line("n1", "Nájem", 1000, null, "in")]}
            mainAccount="321001"
            mainSide="D"
            initialRounding={0.4}
            totalAmount={1000}
          />
          <Example
            id="internal"
            title="Interní doklad – oba směry, výchozí vstup"
            initial={[line("i1", "Samovyměření", 5000, "rc21", "in")]}
            vat={{
              enabled: true,
              codes: [...CODES_IN, ...CODES_OUT],
              bidirectional: true,
              defaultDirection: "in",
            }}
          />
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Záložka Zaúčtování (jen ke čtení)</h3>
            <DocumentPostingGrid
              accounts={MOCK_ACCOUNTS}
              entries={[
                {
                  id: "1",
                  text: "Služby",
                  debitAccount: "518001",
                  creditAccount: "321001",
                  amount: 8264.46,
                },
                {
                  id: "2",
                  text: "DPH 21 %",
                  debitAccount: "343021",
                  creditAccount: "321001",
                  amount: 1735.54,
                  auto: "vat",
                },
                {
                  id: "3",
                  text: "DPH bez nároku",
                  debitAccount: "518001",
                  creditAccount: "321001",
                  amount: 210,
                  auto: "nonDeductible",
                },
                {
                  id: "4",
                  text: "Odpočet zálohy",
                  debitAccount: "324001",
                  creditAccount: "321001",
                  amount: -6050,
                  auto: "advance",
                },
                {
                  id: "5",
                  text: "Zaokrouhlení",
                  debitAccount: "568001",
                  creditAccount: "321001",
                  amount: 0.46,
                  auto: "rounding",
                },
                {
                  id: "6",
                  text: "Kurzové zaokrouhlení",
                  debitAccount: "563001",
                  creditAccount: "321001",
                  amount: 0.02,
                  auto: "fxRounding",
                },
              ]}
            />
          </div>
          <AdvanceLists />
        </div>
      ) : null}
    </ShowcaseSection>
  );
}
