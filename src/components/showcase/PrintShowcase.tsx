import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CashReceiptPrintDialog, PrintPreviewDialog, buildCashReceiptPdf, buildReportPdf, companyMonogramSvg, type CashReceiptPdfInput, type PrintContext } from "@/components/ds";
import { ShowcaseSection } from "./ShowcaseLayout";

const COMPANY = { name: "Slivka Accounting s.r.o.", ico: "12345678", dic: "CZ12345678", address: "Vinohradská 12, 120 00 Praha 2" };
const ROWS = Array.from({ length: 128 }, (_, index) => ({ account: `${index % 2 ? "518" : "602"}.${String(index + 1).padStart(3, "0")}`, name: index % 2 ? "Ostatní služby" : "Tržby za služby", opening: index * 1250.25, debit: index * 832.7, credit: index * 917.4, balance: index * 1165.55 }));
const CONTEXT: PrintContext = { company: COMPANY, settings: { showPrintedBy: true, footerLogo: true, footerName: true, footerIco: true }, printedBy: "Petr Slivka", printedAt: new Date("2026-09-25T13:54:00") };
const RECEIPT: Omit<CashReceiptPdfInput, "copies"> = { direction: "in", number: "PPD2026000118", bookName: "Pokladna CZK", company: COMPANY, counterparty: { name: "Alfa stavební společnost, s.r.o.", ico: "87654321", dic: "CZ87654321", address: "Hlavní 18, Brno" }, purpose: "Úhrada faktury v hotovosti", amount: 5000, currency: "CZK", homeCurrency: "CZK", dateIssued: "2026-09-25", dateAccounting: "2026-09-25", dateTax: "2026-09-25", lines: [{ debit: "211.001", credit: "311.001", amount: 5000, text: "Úhrada faktury" }], issuedBy: "Petr Slivka", approvedBy: "Jana Nováková", status: "filed" };

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
    <ShowcaseSection title="Obratová sestava" description="Vícestránková sestava s opakovaným záhlavím tabulky, součty a střídmou hlavičkou dalších stran."><div className="flex flex-wrap gap-2"><Button onClick={() => void openReport(true)}><FileText />Náhled s monogramem</Button><Button variant="outline" onClick={() => void openReport(false)}>Náhled bez loga</Button></div></ShowcaseSection>
    <ShowcaseSection title="Pokladní doklady" description="Příjem, výdej bez partnera, koncept s vodoznakem a doklad v cizí měně."><div className="flex flex-wrap gap-2"><Button onClick={() => openCash("in")}>Příjem</Button><Button variant="outline" onClick={() => openCash("courier")}>Výdej kurýrovi</Button><Button variant="outline" onClick={() => openCash("draft")}>Koncept</Button><Button variant="outline" onClick={() => openCash("eur")}>Doklad v EUR</Button></div></ShowcaseSection>
    <PrintPreviewDialog open={reportOpen} onOpenChange={setReportOpen} blob={reportBlob} title="Obratová sestava" companyName={COMPANY.name} />
    <CashReceiptPrintDialog open={cashOpen} onOpenChange={setCashOpen} value={cashValue} context={context} />
  </>;
}