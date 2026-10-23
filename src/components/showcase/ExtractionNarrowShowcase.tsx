/** Ukázka úzkého formuláře s vytěžením · vlastní přepínač ukázky · nesmí se distribuovat APP. */
import { useState } from "react";
import { Button, PageHeader } from "../ds";
import { ExtractionDocumentShowcase } from "./ExtractionDocumentShowcase";

/** Úzký formulář (jako s otevřeným panelem Zdroj) s nejistým Dodavatelem a akcí v bublině. */
export function ExtractionNarrowShowcase() {
  // Na vyžádání, aby F8 ostatních ukázek neobcházel i tento formulář.
  const [open, setOpen] = useState(false);
  return (
    <section data-testid="extraction-narrow-section" className="space-y-3">
      <PageHeader title="Úzký formulář s návrhem" />
      <Button variant="outline" aria-pressed={open} onClick={() => setOpen(!open)}>
        Zobrazit úzký formulář
      </Button>
      {open ? <ExtractionDocumentShowcase narrow /> : null}
    </section>
  );
}
