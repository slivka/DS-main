/** Ukázka návrhu C · pouze hotové snímky APP a místní soubory nahraných log. */
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  OptionSelect,
  CheckboxField,
  Field,
  FieldGrid,
  BookPrintTemplateFields,
  DocumentPrintTab,
  DocumentCounterpartyTab,
} from "../ds";
import type { DocumentPrintValue, DocumentCounterpartyValue } from "../ds";
import { buildInvoicePdf, InvoicePrintDialog } from "../ds";
import { SourcePreview } from "../ds";
import { useDsTexts } from "../../ds-texts";
import { INVOICE_PRINT_SAMPLES } from "./invoice-print-samples";
import { ShowcaseSection } from "./ShowcaseLayout";
import type { InvoicePrintOptions } from "../ds/print/invoice/invoice-types";
const PDF_OPTIONS = { homeCurrency: { code: "CZK", symbol: "Kč" } };
const EMPTY_PRINT: DocumentPrintValue = {
  options: {
    showPaymentSchedule: true,
    showAdvanceDetail: true,
    showQr: true,
    showSignature: false,
    showIssuedBy: true,
  },
  headerText: "",
  footerText: "",
  note: "",
  issuedByName: "",
  issuedByPhone: "",
  issuedByEmail: "",
};
export function InvoicePrintShowcase() {
  const t = useDsTexts().invoicePrint;
  const [sample, setSample] = useState("0");
  const [logo, setLogo] = useState("none");
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(false);
  const [options, setOptions] = useState<InvoicePrintOptions>(EMPTY_PRINT.options);
  const [pdf, setPdf] = useState<{ url: string; size: number } | null>(null);
  const [pages, setPages] = useState(0);
  const [print, setPrint] = useState(EMPTY_PRINT);
  const [counterparty, setCounterparty] = useState<DocumentCounterpartyValue>({
    name: "Bytové družstvo Lipová",
    ico: "25260111",
    dic: "CZ25260111",
    street: "Lipová",
    house_number: "1180/14",
    zip: "50002",
    city: "Hradec Králové",
    country: "CZ",
    email: "",
    delivery: null,
  });
  const data = useMemo(() => {
    const chosen = INVOICE_PRINT_SAMPLES[Number(sample)] ?? INVOICE_PRINT_SAMPLES[0];
    if (!chosen) throw new Error("Chybí tiskový vzor");
    return {
      ...chosen,
      is_draft: draft,
      number: draft ? null : chosen.number,
      issuer: {
        ...chosen.issuer,
        logo_image: logos[logo] ?? null,
        logo_contains_name: logo === "wide",
      },
      print: { ...chosen.print, options },
    };
  }, [sample, draft, logos, logo, options]);
  useEffect(() => {
    let active = true,
      url: string | undefined;
    void buildInvoicePdf(data, {
      ...PDF_OPTIONS,
      onPageCount: (count) => {
        if (active) setPages(count);
      },
    }).then((blob) => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setPdf({ url, size: blob.size });
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [data]);
  const upload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setLogos((prev) => ({ ...prev, [logo]: result }));
    };
    reader.readAsDataURL(file);
  };
  return (
    <>
      <ShowcaseSection title="Tisk faktury">
        <div data-testid="invoice-print-showcase" data-pages={pages} className="space-y-4">
          <FieldGrid cols={3}>
            <Field label={t.preview}>
              <OptionSelect
                value={sample}
                onChange={setSample}
                options={[t.examplePdp, t.exampleStandard, t.exampleEur, t.exampleCard].map(
                  (label, i) => ({ value: String(i), label }),
                )}
              />
            </Field>
            <Field label={t.logoNone}>
              <OptionSelect
                value={logo}
                onChange={setLogo}
                options={[
                  { value: "none", label: t.logoNone },
                  { value: "square", label: t.logoSquare },
                  { value: "wide", label: t.logoWide },
                ]}
              />
            </Field>
            {logo !== "none" ? (
              <Field label={logo === "wide" ? t.logoWide : t.logoSquare}>
                <Input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => upload(e.target.files?.[0])}
                />
              </Field>
            ) : null}
          </FieldGrid>
          <div className="flex flex-wrap gap-4">
            <CheckboxField checked={draft} onCheckedChange={setDraft} label={t.draft} />
            {(
              [
                "showPaymentSchedule",
                "showAdvanceDetail",
                "showQr",
                "showSignature",
                "showIssuedBy",
              ] as const
            ).map((key) => (
              <CheckboxField
                key={key}
                checked={options[key]}
                onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, [key]: checked }))}
                label={t[key]}
              />
            ))}
          </div>
          <Button onClick={() => setOpen(true)}>{t.preview}</Button>
          <div className="h-[64rem] min-h-0 border" data-testid="invoice-pdf-preview">
            {pdf ? (
              <SourcePreview
                accept={["application/pdf"]}
                maxSize={20_000_000}
                canReplace={false}
                source={{
                  id: "invoice",
                  name: "faktura.pdf",
                  type: "application/pdf",
                  uploadedAt: data.date_issued,
                  size: pdf.size,
                  url: pdf.url,
                }}
              />
            ) : null}
          </div>
          <InvoicePrintDialog data={data} open={open} onOpenChange={setOpen} opts={PDF_OPTIONS} />
        </div>
      </ShowcaseSection>
      <ShowcaseSection title={t.headerText}>
        <DocumentPrintTab
          value={print}
          onChange={setPrint}
          onReloadFromBook={() =>
            setPrint({
              ...EMPTY_PRINT,
              headerText: "Fakturujeme dle objednávky.",
              issuedByName: "Jana Nováková",
            })
          }
        />
      </ShowcaseSection>
      <ShowcaseSection title={t.reload}>
        <BookPrintTemplateFields value={print} onChange={setPrint} />
      </ShowcaseSection>
      <ShowcaseSection title={t.customer}>
        <DocumentCounterpartyTab
          value={counterparty}
          onChange={setCounterparty}
          countries={[
            { code: "CZ", name: "Česko" },
            { code: "SK", name: "Slovensko" },
          ]}
          deliveryMapAction={{ label: t.map, onClick: () => {} }}
        />
      </ShowcaseSection>
    </>
  );
}
