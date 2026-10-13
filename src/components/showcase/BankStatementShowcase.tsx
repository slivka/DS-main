/** Ukázky výpisů · vlastní náhledové hodnoty · nesmí být součástí spotřebitelské knihovny. */
import { Sigma } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  BankStatementForm,
  FieldToggleButton,
  PaymentOrderAccountField,
  FieldValue,
  CounterpartyInputField,
  SuggestInput,
  NoticeBar,
  PaneLayout,
  PaneTabsProvider,
  createTab,
  type PaneTabsState,
  type BankStatementValue,
  type BankStatementFormProps,
} from "../ds";
import { Button } from "../ui/button";
import { DsTextsProvider, useDsTexts } from "../../ds-texts";
import { MOCK_PARTNERS } from "../../lib/mock/accounting";
import { ShowcaseSection } from "./ShowcaseLayout";

const initial: PaneTabsState = {
  version: 2,
  layout: 1,
  widths: [1],
  active: "bank-1",
  hiddenPanes: null,
  panes: [1, 2, 3]
    .map((index) => {
      const tab = createTab({ route: "/bank-preview", title: String(index) }, index);
      return { id: `bank-${index}`, activeTab: tab.id, tabs: [tab] };
    })
    .slice(0, 1),
};
const subscribe = () => () => {};

/** Jeden živý výpis v panelu. */
function StatementExample({ scenario }: { scenario: string }) {
  const foreign = scenario === "eur";
  const [value, setValue] = useState<BankStatementValue>({
    date: "2026-10-12",
    number: "2026/010",
    note: "Říjen",
    bankClosing: scenario === "empty" ? null : scenario === "difference" ? 12450 : 12500,
  });
  const [status, setStatus] = useState<BankStatementFormProps["status"]>(
    scenario === "checked" ? "checked" : scenario === "posted" ? "posted" : "open",
  );
  const [dirty, setDirty] = useState(false);
  return (
    <BankStatementForm
      value={value}
      onChange={(next) => {
        setValue(next);
        setDirty(true);
      }}
      status={status}
      book="Banka"
      currency={foreign ? "EUR" : "CZK"}
      currencySymbol={foreign ? "€" : "Kč"}
      period="2026"
      bankAccount="123456789/0800"
      balances={{ opening: 10000, income: 5000, expense: 2500 }}
      home={
        foreign
          ? {
              opening: 250000,
              income: 125000,
              expense: 62500,
              currencySymbol: "Kč",
              bankClosing: 312500,
            }
          : undefined
      }
      hasItems={scenario === "items"}
      busy={scenario === "busy"}
      dirty={dirty}
      onSave={() => setDirty(false)}
      onDelete={() => setValue({ ...value, number: "" })}
      onCheckedChange={(checked) => setStatus(checked ? "checked" : "open")}
      notices={
        scenario === "difference" ? (
          <NoticeBar tone="warning">Zůstatek se liší.</NoticeBar>
        ) : undefined
      }
      items={
        scenario === "items" ? (
          <div className="border-b border-border py-2 text-sm">Úhrada faktury · 5 000,00</div>
        ) : null
      }
    />
  );
}

/** Přepínače ve stejném formulářovém kontextu pro ověření geometrie. */
function ToggleExamples() {
  const t = useDsTexts().fieldToggle;
  const [mode, setMode] = useState<"partner" | "manual">("partner");
  const [name, setName] = useState("");
  const [suggest, setSuggest] = useState(true);
  const [description, setDescription] = useState("");
  return (
    <div data-testid="field-toggle-examples" className="grid max-w-xl gap-3">
      <CounterpartyInputField
        mode={mode}
        onModeChange={setMode}
        partnerId="p1"
        partners={MOCK_PARTNERS}
        name={name}
        onNameChange={setName}
        onPartnerChange={() => {}}
        onEditPartner={() => {}}
        replaceManualWarning="Nahradit ruční údaje?"
      />
      <SuggestInput
        value={description}
        onChange={setDescription}
        enabled={suggest}
        onEnabledChange={setSuggest}
        loadSuggestions={async () => ["Doprava zásilky", "Doprava materiálu"]}
        aria-label="Popis"
      />
      <PaymentOrderAccountField
        enabled={false}
        enabledLabel={t.locked}
        disabledLabel={t.locked}
        disabledReason={t.locked}
        lockedReason={t.locked}
      >
        <FieldValue />
      </PaymentOrderAccountField>
      <div className="relative">
        <FieldValue />
        <FieldToggleButton
          icon={Sigma}
          pressed
          disabled
          label={t.locked}
          pressedTooltip={t.locked}
          unpressedTooltip={t.locked}
        />
      </div>
      <SuggestInput
        value=""
        onChange={() => {}}
        enabled
        onEnabledChange={() => {}}
        loadSuggestions={async () => []}
        disabled
      />
      <CounterpartyInputField
        mode="partner"
        partnerId="p1"
        partners={MOCK_PARTNERS}
        name=""
        onNameChange={() => {}}
        onPartnerChange={() => {}}
        onModeChange={() => {}}
        lockedReason="Doklad je zařazen"
        replaceManualWarning="Nahradit ruční údaje?"
      />
    </div>
  );
}

/** Výpisy CZK/EUR, rozdíly a zamčení v jednom až třech skutečných panelech. */
export function BankStatementShowcase() {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [state, setState] = useState(initial);
  const [scenario, setScenario] = useState("empty");
  const [locale, setLocale] = useState<"cs" | "sk">("cs");
  const [narrow, setNarrow] = useState(false);
  return (
    <div data-testid="bank-showcase" data-ready={ready ? "true" : "false"}>
      <ShowcaseSection title="Bankovní výpisy – Edit dokladu 13">
        <DsTextsProvider locale={locale}>
          <ToggleExamples />
          <div className="my-3 flex flex-wrap gap-2">
            {["empty", "equal", "difference", "eur", "checked", "items", "posted", "busy"].map(
              (key) => (
                <Button
                  key={key}
                  variant="outline"
                  aria-pressed={scenario === key}
                  onClick={() => setScenario(key)}
                >
                  {key}
                </Button>
              ),
            )}
            {["cs", "sk"].map((language) => (
              <Button
                key={language}
                variant="outline"
                onClick={() => setLocale(language === "cs" ? "cs" : "sk")}
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
                  const panes = [1, 2, 3].slice(0, count).map((index) => {
                    const tab = createTab({ route: "/bank-preview", title: String(index) }, index);
                    return { id: `bank-${index}`, activeTab: tab.id, tabs: [tab] };
                  });
                  setState({
                    ...initial,
                    layout: count,
                    panes,
                    widths: panes.map(() => 1 / count),
                  });
                }}
              >
                {count} panelů
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                setNarrow(true);
                setState(initial);
              }}
            >
              360 px
            </Button>
          </div>
          <div
            data-testid="bank-panels"
            className={narrow ? "w-[22.5rem] max-w-none" : "w-[120rem] max-w-none"}
          >
            <div className="h-[50rem]">
              <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
                <PaneLayout
                  embedded
                  minPaneWidth={0}
                  renderTab={() => <StatementExample key={scenario} scenario={scenario} />}
                />
              </PaneTabsProvider>
            </div>
          </div>
        </DsTextsProvider>
      </ShowcaseSection>
    </div>
  );
}
