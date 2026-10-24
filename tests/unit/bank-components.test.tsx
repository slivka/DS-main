/** Banka I3–I7 · vlastní chování komponent · nesmí testovat doménu aplikace. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { BankConnectionSettings } from "../../src/components/ds/bank/bank-connection-settings";
import {
  BankConnectionBanner,
  BankOngoingBadge,
} from "../../src/components/ds/bank/bank-connection-banner";
import { BankRuleList } from "../../src/components/ds/bank/bank-rule-list";
import { BankRuleDialog } from "../../src/components/ds/bank/bank-rule-dialog";
import { BankReconcileSuggestionRow } from "../../src/components/ds/bank/bank-reconcile-suggestion";
import {
  PaymentOrderBatchList,
  PaymentSentBadge,
} from "../../src/components/ds/bank/payment-order-batch-list";
import { PaymentOrderSendDialog } from "../../src/components/ds/bank/payment-order-send-dialog";
import type {
  BankConnectionValue,
  BankMovementRow,
  BankRule,
} from "../../src/components/ds/bank/bank-types";
import { DS_TEXTS_CS } from "../../src/ds-texts";

afterEach(cleanup);

const connection: BankConnectionValue = {
  method: "fio",
  tokenSaved: true,
  tokenSavedAt: "12. 9. 2026",
  tokenSavedBy: "Petr Slivka",
  tokenKind: "read",
  tokenValidTo: "2026-12-12",
  fetchTime: "06:00",
  fetchWorkdays: false,
  fetchFrom: "2026-10-01",
  status: "active",
};

const movement: BankMovementRow = {
  id: "m1",
  order: 1,
  date: "2026-10-10",
  direction: "in",
  amount: 100,
  currency: "CZK",
  status: "suggestion",
  suggestion: {
    accountCode: "311001",
    candidates: [
      { id: "c1", label: "FV1", amount: 100, remaining: 100 },
      { id: "c2", label: "FV2", amount: 200, remaining: 200 },
    ],
    candidateId: "c1",
  },
};

const rule: BankRule = {
  id: "r1",
  order: 1,
  name: "Poplatky",
  conditions: { movementKind: "fee" },
  result: { accountCode: "568001", certainty: "certain" },
  active: true,
  conditionsText: "druh = poplatek",
  resultText: "568.001",
};

describe("BankConnectionSettings", () => {
  it("token se nikdy nezobrazí, jen stav uložení", () => {
    const view = render(
      <BankConnectionSettings value={connection} onChange={() => {}} onTokenSave={() => {}} />,
    );
    expect(view.queryByDisplayValue(/secret/i)).toBeNull();
    expect(view.getByText(/Uložen 12\. 9\. 2026 · Petr Slivka/)).toBeTruthy();
    expect(view.container.textContent).not.toContain("fio-token-value");
  });

  it("dialog tokenu má pole typu password a hodnotu nevrací", () => {
    const view = render(
      <BankConnectionSettings value={connection} onChange={() => {}} onTokenSave={() => {}} />,
    );
    fireEvent.click(view.getByRole("button", { name: /Změnit token/ }));
    const input = view.getByLabelText("Nový token");
    expect(input.getAttribute("type")).toBe("password");
  });

  it("Stáhnout teď blokuje odpočet z nextAvailableAt", () => {
    const next = new Date(Date.now() + 23_000).toISOString();
    const view = render(
      <BankConnectionSettings
        value={connection}
        onChange={() => {}}
        onTokenSave={() => {}}
        onFetchNow={() => {}}
        nextAvailableAt={next}
      />,
    );
    const button = view.getByRole("button", { name: /Další dotaz na Fio za/ });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("Stahovat od starší než minFetchFrom zobrazí chybu", () => {
    const view = render(
      <BankConnectionSettings
        value={{ ...connection, fetchFrom: "2026-01-01" }}
        onChange={() => {}}
        onTokenSave={() => {}}
        minFetchFrom="2026-07-26"
      />,
    );
    expect(view.getAllByText(/nejvýš 90 dní zpět/).length).toBeGreaterThan(0);
  });

  it("Jiná banka je zakázaná volba", () => {
    const view = render(
      <BankConnectionSettings value={connection} onChange={() => {}} onTokenSave={() => {}} />,
    );
    expect(view.getByRole("combobox", { name: "Způsob" })).toBeTruthy();
  });
});

describe("BankConnectionBanner", () => {
  it("zelený pruh s akcí Stáhnout teď", () => {
    const fetchNow = mock();
    const view = render(
      <BankConnectionBanner
        state={{ tone: "connected", date: "dnes 06:02", newCount: 4 }}
        onFetchNow={fetchNow}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Stáhnout teď" }));
    expect(fetchNow).toHaveBeenCalledTimes(1);
  });

  it("červený pruh s důvodem a akcí Změnit token", () => {
    const change = mock();
    const view = render(
      <BankConnectionBanner
        state={{ tone: "error", reason: "Token odmítnut" }}
        onChangeToken={change}
      />,
    );
    expect(view.getByText(/Token odmítnut/)).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: /Změnit token/ }));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("štítek Průběžný má vysvětlení v bublině", () => {
    const view = render(<BankOngoingBadge />);
    expect(view.getByText("Průběžný")).toBeTruthy();
  });
});

describe("BankReconcileSuggestionRow", () => {
  it("přijetí návrhu předá vybraného kandidáta", () => {
    const accept = mock();
    const view = render(
      <BankReconcileSuggestionRow
        row={movement}
        currencySymbol="Kč"
        onAccept={accept}
        onReject={() => {}}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Přijmout" }));
    expect(accept).toHaveBeenCalledWith("m1", "c1");
  });

  it("odmítnutí návrhu volá onReject", () => {
    const reject = mock();
    const view = render(
      <BankReconcileSuggestionRow
        row={movement}
        currencySymbol="Kč"
        onAccept={() => {}}
        onReject={reject}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Odmítnout" }));
    expect(reject).toHaveBeenCalledWith("m1");
  });

  it("výběr kandidáta hlásí změnu", () => {
    const change = mock();
    const view = render(
      <BankReconcileSuggestionRow
        row={movement}
        currencySymbol="Kč"
        onAccept={() => {}}
        onReject={() => {}}
        onCandidateChange={change}
      />,
    );
    expect(view.getByRole("combobox", { name: "Kandidát úhrady" })).toBeTruthy();
  });
});

describe("BankRuleList", () => {
  it("zobrazí pravidla s jistotou a stavem", () => {
    const view = render(<BankRuleList storageKey="test-rules" rules={[rule]} />);
    expect(view.getByText("Poplatky")).toBeTruthy();
    expect(view.getByText("Jisté")).toBeTruthy();
  });

  it("akce duplikace a deaktivace volají callbacky", () => {
    const duplicate = mock();
    const activeChange = mock();
    const view = render(
      <BankRuleList
        storageKey="test-rules-2"
        rules={[rule]}
        onDuplicate={duplicate}
        onActiveChange={activeChange}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Duplikovat" }));
    expect(duplicate).toHaveBeenCalledWith("r1");
    fireEvent.click(view.getByRole("button", { name: "Deaktivovat" }));
    expect(activeChange).toHaveBeenCalledWith("r1", false);
  });
});

describe("BankRuleDialog", () => {
  it("zobrazí podmínky, výsledek a náhled použití", () => {
    const view = render(
      <BankRuleDialog
        open
        onOpenChange={() => {}}
        isNew
        value={{ name: "", conditions: {}, result: { certainty: "suggestion" } }}
        onChange={() => {}}
        onSubmit={() => {}}
        accounts={[]}
        partners={[]}
        books={[{ id: "ba1", name: "Banka" }]}
        previewCount={12}
      />,
    );
    expect(view.getByText("Podmínky")).toBeTruthy();
    expect(view.getByText("Výsledek")).toBeTruthy();
    expect(view.getByText(/12 pohybů za posledních 90 dní/)).toBeTruthy();
    expect(view.getByText(/\{měsíc\}/)).toBeTruthy();
  });
});

describe("PaymentOrderBatchList", () => {
  const batches = [
    {
      id: "b1",
      date: "20. 10. 2026",
      author: "Petr",
      target: "soubor.abo",
      count: 5,
      amount: "48 300,00 Kč",
      status: "downloaded" as const,
    },
  ];

  it("zobrazí dávku se stavem", () => {
    const view = render(<PaymentOrderBatchList storageKey="test-batches" batches={batches} />);
    expect(view.getByText("Staženo")).toBeTruthy();
  });

  it("zrušení dávky vyžaduje důvod", async () => {
    const cancel = mock();
    const view = render(
      <PaymentOrderBatchList storageKey="test-batches-2" batches={batches} onCancel={cancel} />,
    );
    fireEvent.click(view.getByRole("button", { name: "Zrušit dávku" }));
    const confirm = await view.findByRole("button", { name: "Zrušit dávku" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(view.getByLabelText("Důvod zrušení"), { target: { value: "Chyba" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(cancel).toHaveBeenCalledWith("b1", "Chyba"));
  });
});

describe("PaymentOrderSendDialog", () => {
  it("potvrzení vyžaduje opsání textu a zobrazí souhrn", async () => {
    const confirmSend = mock(() => Promise.resolve());
    const view = render(
      <PaymentOrderSendDialog
        open
        onOpenChange={() => {}}
        count={2}
        amounts={["12 100,00 Kč"]}
        payerAccount="123456789/0800"
        onConfirm={confirmSend}
      />,
    );
    expect(view.getByText(/2 plateb/)).toBeTruthy();
    expect(view.getByText(/Platby se odešlou přímo do banky/)).toBeTruthy();
    const submit = view.getByRole("button", { name: "Odeslat do banky" });
    expect((submit as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(view.getByRole("textbox"), { target: { value: "ODESLAT" } });
    fireEvent.click(submit);
    await waitFor(() => expect(confirmSend).toHaveBeenCalledTimes(1));
  });
});

describe("PaymentSentBadge", () => {
  it("zobrazí štítek Odesláno do banky", () => {
    const view = render(<PaymentSentBadge />);
    expect(view.getByText(DS_TEXTS_CS.bankPayments.sentBadge)).toBeTruthy();
  });
});
