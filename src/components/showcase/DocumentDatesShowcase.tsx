/** Datumový řádek ve skutečných panelech; vlastní pouze náhledový stav. */
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { DocumentForm, PaneLayout, PaneTabsProvider, createTab, type PaneTabsState } from "../ds";
import { useFormDesignTwoTexts } from "../../ds-texts/form-design-two-showcase";
import { DsTextsProvider } from "../../ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";
const initialState: PaneTabsState = {
  version: 2,
  layout: 3,
  widths: [1 / 3, 1 / 3, 1 / 3],
  active: "dates-1",
  hiddenPanes: null,
  panes: [1, 2, 3].map((index) => {
    const tab = createTab({ route: "/date-measurement", title: String(index) }, index);
    return { id: `dates-${index}`, activeTab: tab.id, tabs: [tab] };
  }),
};
export function DocumentDatesShowcase() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const t = useFormDesignTwoTexts();
  const [state, setState] = useState(initialState);
  const [narrow, setNarrow] = useState(false);
  const [locale, setLocale] = useState<"cs" | "sk">("cs");
  return (
    <ShowcaseSection title={t.datesTitle}>
      <div
        data-testid="date-panels"
        data-ready={ready ? "true" : "false"}
        className={narrow ? "w-[22.5rem] max-w-none" : "w-[120rem] max-w-none"}
      >
        <div className="flex gap-3">
          {(["cs", "sk"] as const).map((language) => (
            <Button
              key={language}
              variant="outline"
              aria-pressed={locale === language}
              onClick={() => setLocale(language)}
            >
              {language.toUpperCase()}
            </Button>
          ))}
          {([1, 2, 3] as const).map((count) => (
            <Button
              key={count}
              variant="outline"
              onClick={() => {
                setNarrow(false);
                setState({
                  ...initialState,
                  layout: count,
                  panes: initialState.panes.slice(0, count),
                  widths: Array.from({ length: count }, () => 1 / count),
                });
              }}
            >
              {t.panels.replace("{count}", String(count))}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => {
              setNarrow(true);
              setState({
                ...initialState,
                layout: 1,
                panes: initialState.panes.slice(0, 1),
                widths: [1],
              });
            }}
          >
            {t.narrowPanel}
          </Button>
        </div>
        <div className="h-[40rem]">
          <DsTextsProvider locale={locale}>
            <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
              <PaneLayout
                embedded
                minPaneWidth={0}
                renderTab={() => (
                  <DocumentForm
                    title={t.received}
                    documentType="FP"
                    status="draft"
                    value={{
                      currency: "EUR",
                      amountTotal: 0,
                      totalMode: "entered",
                      issueDate: "2026-10-12",
                      accountingDate: "2026-10-12",
                      dueDate: "2026-10-24",
                      taxDate: "2026-10-12",
                      vatDate: "2026-10-12",
                    }}
                    onChange={() => {}}
                    lines={[]}
                    onLinesChange={() => {}}
                    books={[]}
                    accounts={[]}
                    homeCurrency="EUR"
                    fields={{
                      partner: false,
                      symbols: false,
                      bankAccount: false,
                      paymentOrders: false,
                    }}
                    accountingDateLink={{ locked: false, onToggle: () => {} }}
                    dateWarnings={{ accountingDate: t.dateWarning, vatDate: t.dateWarning }}
                    vat={{ visible: true, dateLink: { locked: false, onToggle: () => {} } }}
                  />
                )}
              />
            </PaneTabsProvider>
          </DsTextsProvider>
        </div>
      </div>
    </ShowcaseSection>
  );
}
