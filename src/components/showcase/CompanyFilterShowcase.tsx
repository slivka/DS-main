/** Ukázka filtrování firmy · fiktivní data · zůstává mimo spotřebitelskou knihovnu. */
import { useState } from "react";
import { DataGrid } from "../ds/grid/DataGrid";
import { MultiSelect } from "../ds/form/multi-select";
const companies = [
  { value: "alfa", label: "Alfa Trading s.r.o." },
  { value: "beta", label: "Beta Servis a.s." },
];
const rows = [
  { id: "alfa", company: companies[0]?.label, document: "FV-001" },
  { id: "beta", company: companies[1]?.label, document: "FV-002" },
];
export function CompanyFilterShowcase() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <section aria-label="Filtr firem" data-testid="company-filter-showcase">
      <DataGrid<(typeof rows)[number]>
        storageKey="showcase-company-keyboard"
        title="Doklady podle firmy"
        rows={rows.filter((row) => !selected.length || selected.includes(row.id))}
        rowKey={(row) => row.id}
        columns={[
          { id: "company", label: "Firma", value: (row) => row.company },
          { id: "document", label: "Doklad", value: (row) => row.document },
        ]}
        defaultFiltersOpen
        filters={
          <label>
            Firma
            <MultiSelect
              options={companies}
              selected={selected}
              onChange={setSelected}
              allLabel="Všechny firmy"
              itemsLabel="firmy"
            />
          </label>
        }
      />
    </section>
  );
}
