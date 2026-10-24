/** Přepínač stránek ukázek účetních formulářů (preview-only). */
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const PAGES = [
  { to: "/components/vat-reports", label: "DPH a OSS" },
  { to: "/components/accounting-forms", label: "Editor dokladů" },
  { to: "/components/accounting-documents", label: "Další doklady" },
  { to: "/components/accounting-advances", label: "Zálohy" },
  { to: "/components/accounting-controls", label: "Ovládací prvky a hlavičky" },
  { to: "/components/accounting-bank", label: "Bankovní výpis a pohyb" },
  { to: "/components/accounting-lines", label: "Řádky dokladu a DPH" },
  { to: "/components/accounting-journal", label: "Řádky zápisu" },
  { to: "/components/accounting-fields", label: "Pole a sestavy" },
] as const;

export function AccountingFormsNav() {
  // Po hydrataci stránky přepne na "true" – spolehlivý signál pro testy.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <nav
      aria-label="Části účetních formulářů"
      data-testid="accounting-forms-nav"
      data-ready={ready ? "true" : "false"}
      className="mb-6 flex flex-wrap gap-2"
    >
      {PAGES.map((page) => (
        <Link
          key={page.to}
          to={page.to}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          activeProps={{ className: "bg-primary text-primary-foreground border-primary" }}
          activeOptions={{ exact: true }}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
