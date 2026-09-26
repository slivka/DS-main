import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CashReceiptPrintDialog, DataGrid, TreeGrid, gridPeriodRange, type DataGridColumn, type TreeGridColumn, type GridPeriodValue, PrintPreviewDialog, buildCashReceiptPdf, buildReportPdf, companyMonogramSvg, type CashReceiptPdfInput, type PrintContext } from "@/components/ds";
import { ShowcaseSection } from "./ShowcaseLayout";

const COMPANY = { name: "Slivka Accounting s.r.o.", ico: "12345678", dic: "CZ12345678", address: "Vinohradská 12, 120 00 Praha 2" };
const ROWS = Array.from({ length: 96 }, (_, index) => ({ account: `${index % 2 ? "518" : "602"}.${String(index + 1).padStart(3, "0")}`, name: index % 2 ? "Ostatní služby" : "Tržby za služby", opening: index * 1250.25, debit: index * 832.7, credit: index * 917.4, balance: index * 1165.55 }));
const CONTEXT: PrintContext = { company: COMPANY, settings: { showPrintedBy: true, footerLogo: true, footerName: true, footerIco: true }, printedBy: "Petr Slivka", printedAt: new Date("2026-09-25T13:54:00") };
const RECEIPT_LINES = Array.from({ length: 8 }, (_, index) => ({ debit: index % 2 ? "211.001" : "311.001", credit: index % 2 ? "602.001" : "211.001", amount: 154_320.98625, text: `Zaúčtování položky ${index + 1}` }));
const RECEIPT: Omit<CashReceiptPdfInput, "copies"> = { direction: "in", number: "PPD2026000118", bookName: "Pokladna CZK", company: COMPANY, counterparty: { name: "Alfa stavební společnost, s.r.o.", ico: "87654321", dic: "CZ87654321", address: "Hlavní 18, Brno" }, purpose: "Úhrada souhrnného pokladního dokladu", amount: 1_234_567.89, currency: "CZK", currencySymbol: "Kč", homeCurrency: "CZK", homeCurrencySymbol: "Kč", dateIssued: "2026-09-25", dateAccounting: "2026-09-25", dateTax: "2026-09-25", lines: RECEIPT_LINES, issuedBy: "Petr Slivka", approvedBy: "Jana Nováková", status: "filed" };

type TurnoverNode = { id: string; parentId: string | null; code: string; name: string; opening: number; debit: number; credit: number };
const CLASS_NAMES = ["Dlouhodobý majetek", "Zásoby", "Finanční účty", "Zúčtovací vztahy"];
const TURNOVER: TurnoverNode[] = CLASS_NAMES.flatMap((name, c) => {
  const classCode = String(c);
  const classNode: TurnoverNode = { id: classCode, parentId: null, code: classCode, name, opening: 0, debit: 0, credit: 0 };
  return [classNode, ...Array.from({ length: 5 }, (_, g) => {
    const groupCode = `${c}${g + 1}`;
    return [{ id: groupCode, parentId: classCode, code: groupCode, name: `Skupina ${groupCode}`, opening: 0, debit: 0, credit: 0 }, ...Array.from({ length: 5 }, (_, a) => {
      const seed = (c + 1) * 97 + (g + 1) * 31 + a * 17;
      return { id: `${groupCode}${a + 1}`, parentId: groupCode, code: `${groupCode}${a + 1}00${a + 1}`, name: `Analytický účet ${a + 1}`, opening: seed * 1234.5, debit: seed * 842.35, credit: seed * (a % 2 ? 1190.1 : 610.4) };
    })];
  }).flat()];
});
const leaf = (row: TurnoverNode) => row.code.length > 2;
const TURNOVER_COLUMNS: TreeGridColumn<TurnoverNode>[] = [
  { id: "account", label: "Účet", width: 320, value: (row) => `${row.code.length > 3 ? `${row.code.slice(0, 3)}.${row.code.slice(3)}` : row.code} – ${row.name}` },
  { id: "opening", label: "Počáteční stav", numeric: true, width: 150, value: (row) => leaf(row) ? row.opening : null },
  { id: "debit", label: "Obrat MD", numeric: true, width: 150, value: (row) => leaf(row) ? row.debit : null },
  { id: "credit", label: "Obrat DAL", numeric: true, width: 150, value: (row) => leaf(row) ? row.credit : null },
  { id: "balance", label: "Konečný stav", numeric: true, width: 150, value: (row) => leaf(row) ? row.opening + row.debit - row.credit : null },
];
type DocRow = { id: string; number: string; date: string; partner: string; account: string; text: string; amount: number };
const PARTNERS = ["Alfa stavební s.r.o.", "Beta servis a.s.", "Gama logistika s.r.o.", "Delta obchod s.r.o."];
const DOCS: DocRow[] = Array.from({ length: 48 }, (_, index) => ({ id: `d${index}`, number: `FP2026${String(index + 1).padStart(5, "0")}`, date: `2026-${String((index % 3) + 7).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`, partner: PARTNERS[index % PARTNERS.length]!, account: index % 2 ? "518001" : "501002", text: index % 2 ? "Služby" : "Materiál", amount: (index % 5 === 0 ? -1 : 1) * (1250.5 + index * 3715.25) }));
const DOC_COLUMNS: DataGridColumn<DocRow>[] = [
  { id: "number", label: "Číslo dokladu", value: (row) => row.number },
  { id: "date", label: "Datum", exportType: "date", value: (row) => row.date },
  { id: "partner", label: "Partner", value: (row) => row.partner },
  { id: "account", label: "Účet MD", value: (row) => row.account, render: (row) => `${row.account.slice(0, 3)}.${row.account.slice(3)}` },
  { id: "text", label: "Text", value: (row) => row.text },
  { id: "amount", label: "Částka", numeric: true, value: (row) => row.amount },
];
const PRINT_BOOKS = [{ id: "fp", code: "FP", name: "Faktury přijaté" }, { id: "fv", code: "FV", name: "Faktury vydané" }];

function GridPrintShowcase() {
  const [period, setPeriod] = useState<GridPeriodValue>(() => gridPeriodRange("2026-01-01", "2026-12-31", "all"));
  const [bookId, setBookId] = useState<string | "all">("fp");
  return <>
    <ShowcaseSection title="Tisk stromu – obratová sestava" description="Menu Stáhnout → Tisk (PDF)…: tiskne jen rozbajené uzly, uzly tučně s odsazením, součty a parametry z kontextového řádku.">
      <TreeGrid rows={TURNOVER} columns={TURNOVER_COLUMNS} title="Obratová sestava" exportName="obratova-sestava" expandLevels={[{ id: "classes", label: "Třídy", depth: 0 }, { id: "groups", label: "Skupiny", depth: 1 }, { id: "all", label: "Vše", depth: 99 }]} period={{ fiscalFrom: "2026-01-01", fiscalTo: "2026-12-31", value: period, onChange: setPeriod }} printContext={CONTEXT} printParams={[{ label: "Účty", value: "S pohybem" }]} />
    </ShowcaseSection>
    <ShowcaseSection title="Tisk seznamu dokladů se seskupením" description="Seskupení podle partnera s mezisoučty; tisknou se jen viditelné sloupce bez akcí a výběru.">
      <DataGrid storageKey="print-showcase-docs" exportTitle="Seznam dokladů" exportName="seznam-dokladu" rows={DOCS} columns={DOC_COLUMNS} rowKey={(row) => row.id} defaultGroupBy="partner" selectable onEditRow={() => undefined} book={{ books: PRINT_BOOKS, value: bookId, onChange: setBookId }} period={{ fiscalFrom: "2026-01-01", fiscalTo: "2026-12-31", value: period, onChange: setPeriod }} printContext={CONTEXT} />
    </ShowcaseSection>
  </>;
}

export function PrintShowcase() {
  const [reportOpen, setReportOpen] = useState(false); const [reportBlob, setReportBlob] = useState<Blob | null>(null);
  const [cashOpen, setCashOpen] = useState(false); const [cashValue, setCashValue] = useState(RECEIPT);
  const context = useMemo(() => CONTEXT, []);
  const openReport = async (logo: boolean) => {
    const nextContext = { ...context, company: { ...context.company, logoUrl: logo ? companyMonogramSvg(context.company.name) : null }, settings: { ...context.settings, footerLogo: logo } };
    setReportBlob(await buildReportPdf({ title: "Obratová sestava", subtitle: "Syntetické a analytické účty", params: [{ label: "Období", value: "1. 1. – 31. 12. 2026" }, { label: "Kniha", value: "Všechny knihy" }, { label: "Filtr", value: "Účty s pohybem" }], context: nextContext, sections: [{ type: "table", columns: [{ key: "account", label: "Účet", format: "code", width: 22 }, { key: "name", label: "Název účtu", width: 48 }, { key: "opening", label: "Počáteční stav", format: "amount", align: "right" }, { key: "debit", label: "Obrat MD", format: "amount", align: "right" }, { key: "credit", label: "Obrat DAL", format: "amount", align: "right" }, { key: "balance", label: "Konečný stav", format: "amount", align: "right" }], rows: ROWS, totals: { name: "Celkem", opening: ROWS.reduce((sum, row) => sum + row.opening, 0), debit: ROWS.reduce((sum, row) => sum + row.debit, 0), credit: ROWS.reduce((sum, row) => sum + row.credit, 0), balance: ROWS.reduce((sum, row) => sum + row.balance, 0) } }] }));
    setReportOpen(true);
  };
  const openCash = (variant: "in" | "courier" | "draft" | "eur") => {
    setCashValue(variant === "courier" ? { ...RECEIPT, direction: "out", counterparty: { name: "Kurýr – Jan Veselý" }, purpose: "Doprava zásilky", amount: 350, number: "VPD2026000091" } : variant === "draft" ? { ...RECEIPT, status: "draft", number: null } : variant === "eur" ? { ...RECEIPT, direction: "out", counterparty: { name: "Hotel Alpenhof" }, purpose: "Ubytování – služební cesta", amount: 180, currency: "EUR", rate: 24.38, rateAmount: 1, amountHome: 4388.4, number: "VPD2026000092" } : RECEIPT);
    setCashOpen(true);
  };
  return <>
    <GridPrintShowcase />
    <ShowcaseSection title="Obratová sestava" description="Vícestránková sestava s opakovaným záhlavím tabulky, součty a střídmou hlavičkou dalších stran."><div className="flex flex-wrap gap-2"><Button onClick={() => void openReport(true)}>Náhled s monogramem</Button><Button variant="outline" onClick={() => void openReport(false)}>Náhled bez loga</Button></div></ShowcaseSection>
    <ShowcaseSection title="Pokladní doklady" description="Příjem, výdej bez partnera, koncept s vodoznakem a doklad v cizí měně."><div className="flex flex-wrap gap-2"><Button onClick={() => openCash("in")}>Příjem</Button><Button variant="outline" onClick={() => openCash("courier")}>Výdej kurýrovi</Button><Button variant="outline" onClick={() => openCash("draft")}>Koncept</Button><Button variant="outline" onClick={() => openCash("eur")}>Doklad v EUR</Button></div></ShowcaseSection>
    <PrintPreviewDialog open={reportOpen} onOpenChange={setReportOpen} blob={reportBlob} title="Obratová sestava" companyName={COMPANY.name} />
    <CashReceiptPrintDialog open={cashOpen} onOpenChange={setCashOpen} value={cashValue} context={context} />
  </>;
}