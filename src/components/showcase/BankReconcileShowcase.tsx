/** Ukázky banky I3–I7 · vlastní náhledové hodnoty · nesmí být součástí spotřebitelské knihovny. */
import { useState } from "react";
import { toast } from "sonner";
import {
  BankConnectionBanner,
  BankConnectionSettings,
  BankOngoingBadge,
  BankRuleDialog,
  BankRuleList,
  BankStatementReconcileView,
  PaymentOrderBatchList,
  PaymentOrderBatchView,
  PaymentOrderSendDialog,
  PaymentSentBadge,
  type BankConnectionValue,
  type BankMovementRow,
  type BankRule,
  type PaymentBatch,
  type PaymentOrderRow,
} from "../ds";
import { Button } from "../ui/button";
import { MOCK_ACCOUNTS, MOCK_PARTNERS } from "../../lib/mock/accounting";
import { ShowcaseSection } from "./ShowcaseLayout";

const MOVEMENTS: BankMovementRow[] = [
  {
    id: "m1",
    order: 1,
    date: "2026-10-10",
    direction: "in",
    amount: 12100,
    currency: "CZK",
    counterAccount: "2000145399/0800",
    counterpartyName: "Alza a.s.",
    vs: "20260012",
    message: "Úhrada faktury",
    kind: "normal",
    status: "certain",
    source: "openItem",
    accountCode: "311001",
    partnerId: "p1",
  },
  {
    id: "m2",
    order: 2,
    date: "2026-10-11",
    direction: "out",
    amount: 4500,
    currency: "CZK",
    counterAccount: "115510001/5500",
    counterpartyName: "Správa sociálního zabezpečení",
    vs: "20260088",
    message: "Záloha na pojištění",
    kind: "normal",
    status: "suggestion",
    source: "rule",
    suggestion: {
      accountCode: "524001",
      candidates: [
        { id: "c1", label: "FZV20260088", amount: 4500, remaining: 4500, dueDate: "2026-10-15" },
        { id: "c2", label: "FZV20260091", amount: 9000, remaining: 9000, dueDate: "2026-10-20" },
      ],
      candidateId: "c1",
    },
  },
  {
    id: "m3",
    order: 3,
    date: "2026-10-11",
    direction: "out",
    amount: 250,
    currency: "CZK",
    counterAccount: null,
    counterpartyName: null,
    message: "Poplatek za vedení účtu",
    kind: "fee",
    status: "unrecognized",
  },
  {
    id: "m4",
    order: 4,
    date: "2026-10-09",
    direction: "in",
    amount: 800,
    currency: "EUR",
    counterAccount: "DE89370400440532013000",
    counterpartyName: "Müller GmbH",
    vs: "9001",
    message: "Payment invoice 9001",
    kind: "normal",
    status: "filed",
    source: "partnerAccount",
    accountCode: "311001",
    partnerId: "p2",
    documentId: "doc-1",
  },
  {
    id: "m5",
    order: 5,
    date: "2026-10-08",
    direction: "out",
    amount: 1200,
    currency: "CZK",
    counterAccount: "123456/0100",
    counterpartyName: "Karet s.r.o.",
    message: "Platba kartou",
    kind: "card",
    status: "unrecognized",
  },
  {
    id: "m6",
    order: 6,
    date: "2026-10-07",
    direction: "in",
    amount: 4500,
    currency: "CZK",
    counterAccount: "115510001/5500",
    counterpartyName: "Správa sociálního zabezpečení",
    message: "Vrácení přeplatku",
    kind: "reversal",
    status: "certain",
    source: "ownAccount",
    accountCode: "378001",
  },
];

const CONNECTION: BankConnectionValue = {
  method: "fio",
  tokenSaved: true,
  tokenSavedAt: "12. 9. 2026",
  tokenSavedBy: "Petr Slivka",
  tokenKind: "payments",
  tokenValidTo: "2026-12-12",
  fetchTime: "06:00",
  fetchWorkdays: true,
  fetchFrom: "2026-07-15",
  status: "active",
  lastSuccess: "dnes 06:02",
};

const RULES: BankRule[] = [
  {
    id: "r1",
    order: 1,
    name: "Poplatky bance",
    conditions: { movementKind: "fee" },
    result: { accountCode: "568001", certainty: "certain" },
    active: true,
    conditionsText: "druh = poplatek",
    resultText: "568.001 – Poplatky",
  },
  {
    id: "r2",
    order: 2,
    name: "Sociální pojištění",
    conditions: { counterAccount: "115510001/5500", direction: "out" },
    result: { accountCode: "524001", certainty: "suggestion", description: "Pojistné {měsíc}/{rok}" },
    active: true,
    conditionsText: "protiúčet 115510001/5500 A směr = výdaj",
    resultText: "524.001 · popis se značkami",
  },
  {
    id: "r3",
    order: 3,
    name: "Staré pravidlo",
    conditions: { textContains: "leasing" },
    result: { accountCode: "518001", certainty: "suggestion" },
    active: false,
    conditionsText: "zpráva obsahuje „leasing“",
    resultText: "518.001 – Služby",
  },
];

const PAYMENTS: PaymentOrderRow[] = [
  {
    id: "pay1",
    partnerName: "Alza a.s.",
    documentNumber: "FP20260031",
    dueDate: "2026-10-20",
    amount: 12100,
    remaining: 12100,
    currency: "CZK",
    currencySymbol: "Kč",
    partnerAccountId: "pa1",
    vs: "20260031",
    paymentDate: "2026-10-20",
  },
  {
    id: "pay2",
    partnerName: "Karet s.r.o.",
    documentNumber: "FP20260035",
    dueDate: "2026-10-01",
    amount: 8400,
    remaining: 8400,
    currency: "CZK",
    currencySymbol: "Kč",
    partnerAccountId: null,
    vs: "20260035",
    paymentDate: "2026-10-24",
    overdue: true,
    checks: [
      { id: "ch1", severity: "error", title: "Chybí účet partnera" },
      { id: "ch2", severity: "warning", title: "Nezveřejněný účet u plátce DPH (§ 109)" },
    ],
  },
  {
    id: "pay3",
    partnerName: "Müller GmbH",
    documentNumber: "FP20260040",
    dueDate: "2026-11-05",
    amount: 800,
    remaining: 800,
    currency: "EUR",
    currencySymbol: "€",
    partnerAccountId: "pa3",
    vs: "9002",
    paymentDate: "2026-11-05",
    checks: [{ id: "ch3", severity: "warning", title: "Cizí měna vs. tuzemský účet" }],
  },
];

const BATCHES: PaymentBatch[] = [
  {
    id: "b1",
    date: "20. 10. 2026",
    author: "Petr Slivka",
    target: "prikaz-2026-10-20.abo",
    count: 5,
    amount: "48 300,00 Kč",
    status: "downloaded",
  },
  {
    id: "b2",
    date: "13. 10. 2026",
    author: "Petr Slivka",
    target: "Fio API",
    count: 3,
    amount: "21 500,00 Kč",
    status: "sent",
  },
  {
    id: "b3",
    date: "6. 10. 2026",
    author: "Jana Nová",
    target: "prikaz-2026-10-06.xml",
    count: 8,
    amount: "102 400,00 Kč",
    status: "paid",
  },
];

/** Rozpis výpisu, napojení, pravidla a dávky plateb. */
export function BankReconcileShowcase() {
  const [rows, setRows] = useState(MOVEMENTS);
  const [connection, setConnection] = useState(CONNECTION);
  const [rules, setRules] = useState(RULES);
  const [payments, setPayments] = useState(PAYMENTS);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleDraft, setRuleDraft] = useState<Pick<BankRule, "name" | "conditions" | "result">>({
    name: "",
    conditions: {},
    result: { certainty: "suggestion" },
  });
  const [sendOpen, setSendOpen] = useState(false);
  const [bannerState, setBannerState] = useState<"connected" | "tokenExpires" | "error">(
    "connected",
  );

  return (
    <ShowcaseSection title="Banka – rozpis, napojení, pravidla a platby (I3–I7)">
      <div data-testid="bank-reconcile-showcase" className="space-y-10">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Rozpis výpisu</h3>
          <BankStatementReconcileView
            storageKey="showcase-bank-reconcile"
            rows={rows}
            accounts={MOCK_ACCOUNTS}
            partners={MOCK_PARTNERS}
            onPatch={(rowId, patch) =>
              setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
            }
            onAcceptSuggestion={(rowId) => {
              setRows((prev) =>
                prev.map((r) =>
                  r.id === rowId
                    ? {
                        ...r,
                        status: "certain",
                        accountCode: r.suggestion?.accountCode ?? r.accountCode,
                        suggestion: null,
                      }
                    : r,
                ),
              );
              toast.success("Návrh přijat");
            }}
            onRejectSuggestion={(rowId) =>
              setRows((prev) =>
                prev.map((r) =>
                  r.id === rowId ? { ...r, status: "unrecognized", suggestion: null } : r,
                ),
              )
            }
            onFileCertain={() => toast.success("Zařadit vše jisté")}
            onFileSelected={(ids) => toast.success(`Zařadit vybrané (${ids.length})`)}
            onAcceptSelected={(ids) => toast.success(`Přijmout návrhy (${ids.length})`)}
            onRecognize={() => toast.info("Znovu rozpoznat")}
            onCreateRule={(rowId) => {
              const row = rows.find((r) => r.id === rowId);
              setRuleDraft({
                name: row?.counterpartyName ?? "",
                conditions: {
                  counterAccount: row?.counterAccount ?? "",
                  direction: row?.direction,
                },
                result: { certainty: "suggestion", accountCode: row?.accountCode },
              });
              setRuleOpen(true);
            }}
            onOpenDocument={(id) => toast.info(`Otevřít doklad ${id}`)}
            importInfo={{
              kind: "file",
              date: "12. 10. 2026",
              file: "vypis-2026-10.pdf",
              onDownload: () => toast.info("Stáhnout originál"),
              onCancel: () => toast.info("Zrušit import"),
            }}
            summary={{
              opening: 10000,
              income: 17400,
              expense: 5950,
              closing: 21450,
              bankClosing: 21450,
              currencySymbol: "Kč",
            }}
          />
          <p className="text-xs text-muted-foreground">
            Vytvořit pravidlo z pohybu: vyberte řádek a použijte akci lišty v aplikaci; zde v ukázce
            přes tlačítko níže.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setRuleOpen(true)}>
            Nové pravidlo
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Napojení na banku</h3>
          <div className="flex flex-wrap gap-2">
            {(["connected", "tokenExpires", "error"] as const).map((state) => (
              <Button
                key={state}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={bannerState === state}
                onClick={() => setBannerState(state)}
              >
                {state}
              </Button>
            ))}
            <BankOngoingBadge />
            <PaymentSentBadge />
          </div>
          <BankConnectionBanner
            state={
              bannerState === "connected"
                ? { tone: "connected", date: "dnes 06:02", newCount: 4 }
                : bannerState === "tokenExpires"
                  ? { tone: "tokenExpires", days: 9 }
                  : { tone: "error", reason: "Token byl odmítnut bankou" }
            }
            onFetchNow={() => toast.info("Stáhnout teď")}
            onChangeToken={() => toast.info("Změnit token")}
          />
          <BankConnectionSettings
            value={connection}
            onChange={setConnection}
            onTokenSave={() => toast.success("Token uložen")}
            onTest={() => toast.info("Test spojení")}
            onFetchNow={() => toast.info("Stáhnout teď")}
            onPausedChange={(paused) =>
              setConnection((prev) => ({ ...prev, status: paused ? "paused" : "active" }))
            }
            onDisconnect={() => setConnection((prev) => ({ ...prev, status: "disconnected" }))}
            minFetchFrom="2026-07-26"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Pravidla účtování banky</h3>
          <BankRuleList
            storageKey="showcase-bank-rules"
            rules={rules}
            onAdd={() => {
              setRuleDraft({ name: "", conditions: {}, result: { certainty: "suggestion" } });
              setRuleOpen(true);
            }}
            onEdit={(id) => {
              const rule = rules.find((r) => r.id === id);
              if (rule) {
                setRuleDraft({ name: rule.name, conditions: rule.conditions, result: rule.result });
                setRuleOpen(true);
              }
            }}
            onDuplicate={(id) =>
              setRules((prev) => {
                const rule = prev.find((r) => r.id === id);
                return rule
                  ? [...prev, { ...rule, id: `${id}-copy`, order: prev.length + 1, name: `${rule.name} (kopie)` }]
                  : prev;
              })
            }
            onActiveChange={(id, active) =>
              setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)))
            }
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Dávka plateb</h3>
          <PaymentOrderBatchView
            storageKey="showcase-payment-batch"
            rows={payments}
            partnerAccounts={(row) =>
              row.id === "pay3"
                ? [{ id: "pa3", label: "DE89 3704 0044 0532 0130 00" }]
                : [
                    { id: "pa1", label: "2000145399/0800" },
                    { id: "pa2", label: "CZ65 0800 0000 1920 0014 5399" },
                  ]
            }
            onPatch={(rowId, patch) =>
              setPayments((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
            }
            formats={[
              { id: "abo", label: "ABO" },
              { id: "cba", label: "ČBA XML" },
              { id: "pain", label: "pain.001" },
            ]}
            onCreateFile={(ids, formatId) =>
              toast.success(`Soubor ${formatId} pro ${ids.length} plateb`)
            }
            canSendFio
            onSendFio={() => setSendOpen(true)}
            onSave={(ids) => toast.success(`Uložit dávku (${ids.length})`)}
            today="2026-10-24"
          />
          <PaymentOrderSendDialog
            open={sendOpen}
            onOpenChange={setSendOpen}
            count={2}
            amounts={["12 100,00 Kč", "800,00 €"]}
            payerAccount="123456789/0800"
            approver={{ name: "Jana Nová", status: "Čeká na schválení" }}
            batchLimit="500 000,00 Kč"
            dayLimit="1 000 000,00 Kč"
            onConfirm={async () => {
              toast.success("Dávka odeslána");
            }}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Seznam dávek</h3>
          <PaymentOrderBatchList
            storageKey="showcase-payment-batches"
            batches={BATCHES}
            onOpen={(id) => toast.info(`Otevřít dávku ${id}`)}
            onDownload={(id) => toast.info(`Stáhnout soubor ${id}`)}
            onCancel={(id, reason) => toast.success(`Dávka ${id} zrušena: ${reason}`)}
          />
        </div>
      </div>
      <BankRuleDialog
        open={ruleOpen}
        onOpenChange={setRuleOpen}
        isNew
        value={ruleDraft}
        onChange={setRuleDraft}
        onSubmit={() => {
          setRules((prev) => [
            ...prev,
            {
              id: `r${prev.length + 1}`,
              order: prev.length + 1,
              active: true,
              ...ruleDraft,
            },
          ]);
          setRuleOpen(false);
        }}
        accounts={MOCK_ACCOUNTS}
        partners={MOCK_PARTNERS}
        books={[
          { id: "ba1", name: "Banka CZK" },
          { id: "ba2", name: "Banka EUR" },
        ]}
        previewCount={12}
      />
    </ShowcaseSection>
  );
}
