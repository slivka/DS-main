/** Drobná API 2.141.0: vazba účetního data, DDPZ daňové číslo, oblíbení, menu a štítky. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");
const { DocumentSettingsDialog } =
  await import("../../src/components/ds/accounting/document-settings-dialog");
const { PartnerSelect } = await import("../../src/components/ds/accounting/partner-select");
const { BankMovementAccount } =
  await import("../../src/components/ds/accounting/document-form/bank-movement-account");
const { NavItemContent } = await import("../../src/components/ds/layout/nav-items");
const { PageHeader } = await import("../../src/components/ds/layout/page-header");

afterEach(cleanup);

const noop = () => {};

const SETTINGS_VALUE = {
  suggestDescription: false,
  descriptionScope: "company" as const,
  suggestCounterparty: false,
  counterpartyScope: "company" as const,
  amountFromLines: "book" as const,
  showQuantityColumns: false,
  offerPrintAfterSave: false,
  printTwoPerPage: false,
  printDocumentNumber: false,
  copies: 1,
};

describe("DocumentSettingsDialog – datum účetního případu podle vystavení", () => {
  it("bez onChange se přepínač nezobrazí", () => {
    const view = render(
      <DocumentSettingsDialog
        open
        onOpenChange={noop}
        value={SETTINGS_VALUE}
        onSave={noop}
        documentTypeLabel="FV"
      />,
    );
    expect(view.queryByText("Datum účetního případu podle data vystavení")).toBeNull();
  });
  it("Uložit zavolá onAccountingDateFollowsIssueChange s přepnutou hodnotou", () => {
    const onFollows = mock(noop);
    const view = render(
      <DocumentSettingsDialog
        open
        onOpenChange={noop}
        value={SETTINGS_VALUE}
        onSave={noop}
        documentTypeLabel="FV"
        accountingDateFollowsIssue={false}
        onAccountingDateFollowsIssueChange={onFollows}
      />,
    );
    const toggle = view.getByText("Datum účetního případu podle data vystavení");
    fireEvent.click(toggle);
    fireEvent.click(view.getByRole("button", { name: "Uložit" }));
    expect(onFollows).toHaveBeenCalledWith(true);
  });
  it("důvod zakázání přepínač vypne a vysvětlí v bublině", () => {
    const view = render(
      <DocumentSettingsDialog
        open
        onOpenChange={noop}
        value={SETTINGS_VALUE}
        onSave={noop}
        documentTypeLabel="FV"
        accountingDateFollowsIssue
        onAccountingDateFollowsIssueChange={noop}
        accountingDateFollowsIssueDisabled="Knihy s pevným datem"
      />,
    );
    const label = view.getByText("Datum účetního případu podle data vystavení");
    const checkbox = label.parentElement?.querySelector("[role=checkbox], button, input");
    expect(checkbox?.getAttribute("aria-disabled") ?? checkbox?.getAttribute("disabled")).not.toBeNull();
    expect(label.closest("span[title]")?.getAttribute("title")).toBe("Knihy s pevným datem");
  });
});

function DocForm(props: Partial<React.ComponentProps<typeof DocumentForm>>) {
  const [value, setValue] = React.useState({
    currency: "CZK",
    amountTotal: 0,
    totalMode: "entered" as const,
  });
  return (
    <DocumentForm
      title="Doklad"
      status="draft"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={noop}
      books={[]}
      accounts={[]}
      homeCurrency="CZK"
      {...props}
    />
  );
}

describe("DDPZ – číslo daňového dokladu", () => {
  it("DDPZ zobrazí pole Číslo daňového dokladu se zámkem vazby", () => {
    const view = render(<DocForm documentType="DDPZ" />);
    expect(view.getByLabelText("Číslo daňového dokladu")).toBeTruthy();
    expect(view.getByLabelText("Svázat s číslem dokladu")).toBeTruthy();
  });
  it("ID bez DPH pole nezobrazí", () => {
    const view = render(<DocForm documentType="ID" />);
    expect(view.queryByLabelText("Číslo daňového dokladu")).toBeNull();
  });
});

const PARTNERS = [
  { id: "a", name: "Alfa s.r.o.", ico: "11111111" },
  { id: "b", name: "Beta a.s.", ico: "22222222" },
  { id: "c", name: "Ceta s.r.o.", ico: "33333333" },
];

describe("Oblíbení partneři", () => {
  it("oblíbený je první a hvězdička přepíná", () => {
    const onToggle = mock(noop);
    const view = render(
      <PartnerSelect
        partners={PARTNERS}
        value={null}
        onChange={noop}
        defaultOpen
        favoriteIds={["c"]}
        onToggleFavorite={onToggle}
      />,
    );
    const options = view.getAllByRole("option");
    expect(options[0].textContent).toContain("Ceta s.r.o.");
    const star = view.getByLabelText("Odebrat z oblíbených");
    fireEvent.click(star);
    expect(onToggle).toHaveBeenCalledWith("c");
  });
  it("bez oblíbených se hvězdička nezobrazí", () => {
    const view = render(
      <PartnerSelect partners={PARTNERS} value={null} onChange={noop} defaultOpen />,
    );
    expect(view.queryByLabelText("Přidat do oblíbených")).toBeNull();
  });
  it("DocumentForm předá oblíbené do výběru protistrany", () => {
    const view = render(
      <DocForm documentType="FV" partners={PARTNERS} favoriteIds={["c"]} onToggleFavorite={noop} />,
    );
    fireEvent.click(view.getByRole("combobox", { name: /Odběratel|partner/i }) ??
      view.container.querySelector("#document-partner")!);
    const options = view.getAllByRole("option");
    expect(options[0].textContent).toContain("Ceta s.r.o.");
  });
});

describe("Interní doklad – nový partner z hlavičky", () => {
  it("výběr partnera interního dokladu nabízí založení partnera", () => {
    const view = render(<DocForm documentType="ID" partners={PARTNERS} onCreatePartner={noop} />);
    const field = view.container.querySelector("#document-partner");
    expect(field).toBeTruthy();
    fireEvent.click(field!);
    expect(view.getByLabelText("Nový partner")).toBeTruthy();
  });
});

describe("Bankovní pohyb – protiúčet", () => {
  const value = {
    currency: "CZK",
    amountTotal: 0,
    totalMode: "entered" as const,
    bankAccount: "19-2000145399",
    bankCode: "0100",
  };
  it("mřížka protiúčtu má stejný rozestup pod nadpisem jako ostatní sekce", () => {
    const view = render(<BankMovementAccount value={value} patch={noop} bankCodes={["0100"]} />);
    const grid = view.container.querySelector('[data-slot="bank-movement-account"]');
    expect(grid?.className).toContain("mt-3");
    expect(grid?.className).toContain("gap-3");
  });
  it("kód banky se zobrazí jako „kód – název banky“ z dat aplikace", () => {
    const view = render(
      <BankMovementAccount
        value={value}
        patch={noop}
        bankCodeOptions={[{ code: "0100", name: "Komerční banka" }]}
      />,
    );
    expect(view.getByLabelText("Kód banky").textContent).toContain("0100");
    expect(view.getByLabelText("Kód banky").textContent).toContain("Komerční banka");
  });
});

describe("Menu a štítky záhlaví", () => {
  it("textový odznak menu se zmenší na ikonu s bublinou a název zůstane celý", () => {
    const view = render(
      <NavItemContent item={{ to: "/zalohy", label: "Zálohové listy", badge: "Připravujeme" }} active={false} />,
    );
    const badge = view.getByRole("img", { name: "Připravujeme" });
    expect(badge.getAttribute("title")).toBe("Připravujeme");
    expect(view.getByText("Zálohové listy")).toBeTruthy();
  });
  it("textový štítek záhlaví stránky nese celý text v bublině", () => {
    const view = render(<PageHeader title="Faktura" titleBadge="Zamčeno do 31. 10. 2026" />);
    expect(view.getByTitle("Zamčeno do 31. 10. 2026")).toBeTruthy();
  });
});
