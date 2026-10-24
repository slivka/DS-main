/** Ukázky DPH · pouze preview data a callbacky · nesmí být součástí knihovny. */
import { useState } from "react";
import {
  VatReturnView,
  VatControlStatementView,
  VatRecapitulativeView,
  VatChecksPanel,
  VatFilingBar,
  VatPeriodPicker,
  type VatFilingKind,
  type VatPeriod,
} from "../ds";
import { useDsTexts } from "../../ds-texts";
const periods: VatPeriod[] = [
  { from: "2026-10-01", to: "2026-10-31", label: "DPH říjen 2026 · KH říjen 2026", kind: "month" },
  { from: "2026-10-01", to: "2026-12-31", label: "DPH 4.Q 2026 · KH říjen 2026", kind: "quarter" },
];
export function VatReportsShowcase() {
  const t = useDsTexts().vatReports;
  const [period, setPeriod] = useState(periods[0]);
  const [kind, setKind] = useState<VatFilingKind>("regular");
  const [status, setStatus] = useState<"open" | "filed" | "changed">("open");
  const [selected, setSelected] = useState("");
  return (
    <div className="space-y-8">
      {/* Hlavní interaktivní ukázka; doplňkové stavy 2.141.0 leží mimo ni. */}
      <div className="space-y-8" data-testid="vat-showcase">
        <VatPeriodPicker periods={periods} value={period} onChange={setPeriod} />
        <VatFilingBar
          form="return"
          status={status}
          kind={kind}
          onKindChange={setKind}
          filedAt={status === "open" ? undefined : "2026-11-20"}
          filedBy="Petra Nováková"
          confirmText="Říjen 2026"
          actions={{
            onCreate: () => setSelected("Podání vytvořeno"),
            onDownloadXml: () => setSelected("XML připravené ke stažení"),
            onMarkFiled: () => setStatus("filed"),
            onCreateCorrection: () => {
              setKind("additional");
              setStatus("changed");
            },
            onUnlock: async (reason) => {
              setStatus("open");
              setSelected(reason);
            },
          }}
        />
        <output aria-live="polite" data-testid="vat-event">
          {selected}
        </output>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t.returnTitle}</h2>
          <VatReturnView
            currency="CZK"
            storageKey="showcase-vat-return"
            rows={[
              {
                key: "1",
                section: "I",
                label: "Dodání zboží a služeb · 21 %",
                base: 100000,
                tax: 21000,
                documentCount: 8,
              },
              {
                key: "10",
                section: "I",
                label: "PDP · přijaté plnění",
                base: 20000,
                tax: 4200,
                documentCount: 1,
              },
              { key: "21", section: "II", label: "Služby do EU", base: 45000, documentCount: 2 },
              {
                key: "40",
                section: "III",
                label: "Nárok na odpočet",
                fullDeduction: 50000,
                reducedDeduction: 12000,
                tax: 10500,
                documentCount: 5,
              },
              { key: "52", section: "IV", label: "Vyrovnání a změna odpočtu", tax: 0 },
              { key: "60", section: "V", label: "Koeficient", base: null },
              { key: "64", section: "VI", label: "Vlastní daňová povinnost", tax: 14700 },
            ]}
            compare={{ "1": { base: 90000, tax: 18900 } }}
            summary={{ liability: 14700, excess: 0 }}
            onRowOpen={(row) => setSelected(`Řádek ${row.key}`)}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t.controlTitle}</h2>
          <VatControlStatementView
            currency="CZK"
            storageKey="showcase-vat-control"
            changed
            onDocumentOpen={(id) => setSelected(`Doklad ${id}`)}
            sections={{
              A1: {
                documents: [
                  {
                    id: "pdp",
                    dic: "CZ12345678",
                    number: "FV2026002",
                    date: "2026-10-10",
                    rates: [
                      { rate: 21, base: 20000, tax: 0 },
                      { rate: 10, base: 5000, tax: 500 },
                    ],
                    unratedBase: 1500,
                    subjectCode: "4",
                    regime: "0",
                  },
                ],
              },
              A2: {
                documents: [
                  {
                    id: "eu",
                    dic: "DE123456789",
                    number: "EU20261",
                    date: "2026-10-12",
                    rates: [{ rate: 21, base: 30000, tax: 6300 }],
                    regime: "0",
                  },
                ],
              },
              A4: {
                documents: [
                  {
                    id: "fv1",
                    dic: "CZ87654321",
                    number: "FV2026001",
                    date: "2026-10-15",
                    rates: [
                      { rate: 21, base: 100000, tax: 21000 },
                      { rate: 12, base: 5000, tax: 600 },
                    ],
                    regime: "0",
                    changed: true,
                  },
                ],
              },
              A5: {
                summary: [
                  { rate: 21, base: 7000, tax: 1470 },
                  { rate: 12, base: 2000, tax: 240 },
                ],
              },
              B1: {
                documents: [
                  {
                    id: "pdp-in",
                    dic: "CZ11223344",
                    number: "PDP-42",
                    date: "2026-10-22",
                    rates: [{ rate: 21, base: 20000, tax: 4200 }],
                    subjectCode: "4",
                  },
                ],
              },
              B2: {
                documents: [
                  {
                    id: "fp1",
                    dic: "CZ22334455",
                    number: "2026-334",
                    date: "2026-10-24",
                    rates: [{ rate: 21, base: 50000, tax: 10500 }],
                  },
                ],
              },
            }}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t.recapitulativeTitle}</h2>
          <VatRecapitulativeView
            currency="CZK"
            rows={[{ id: "sh1", country: "DE", dic: "DE123456789", supplyCode: 3, amount: 45000 }]}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">{t.ossTitle}</h2>
          <VatRecapitulativeView
            variant="oss"
            currency="EUR"
            ossRows={[
              { id: "oss1", country: "DE", rate: 19, base: 2000, tax: 380, supplyLabel: "Zboží" },
              { id: "oss2", country: "AT", rate: 20, base: 1500, tax: 300, supplyLabel: "Služby" },
              {
                id: "oss3",
                country: "DE",
                rate: 19,
                base: -100,
                tax: -19,
                supplyLabel: "Zboží",
                correctionPeriod: "3.Q 2026",
              },
            ]}
          />
        </section>
        <VatChecksPanel
          items={[
            { id: "c1", severity: "error", text: "Chybí evidenční číslo", documentId: "fp1" },
            { id: "c2", severity: "warning", text: "Koncept v období DPH" },
            { id: "c3", severity: "info", text: "Platba na nezveřejněný účet" },
          ]}
          onDocumentOpen={(id) => setSelected(`Doklad ${id}`)}
        />
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Souhrnné hlášení – jen řádné a následné</h2>
        <VatFilingBar
          form="recapitulative"
          status="open"
          kind="regular"
          onKindChange={() => {}}
          confirmText="Říjen 2026"
          allowedKinds={["regular", "subsequent"]}
        />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Stavy přehledu – načítání a chyba</h2>
        <div className="grid gap-4 @min-[40rem]:grid-cols-2">
          <VatChecksPanel items={[]} loading />
          <VatRecapitulativeView
            currency="CZK"
            error="Nepodařilo se načíst souhrnné hlášení"
            exportMeta={{ period: "10/2026", company: "Alfa s.r.o.", filingKind: "Řádné" }}
          />
        </div>
      </section>
    </div>
  );
}
