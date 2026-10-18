/** Ovládání formulářů · vlastní živou ukázku · nesmí být součástí knihovny. */
import { useState } from "react";
import { StepperInput } from "../ds/form/stepper-input";
import { Field, FieldGrid } from "../ds/layout/form-field-layout";
import { RecordActionBar } from "../ds/layout/record-action-bar";
import { OptionSelect } from "../ds/form/option-select";
import { DateField } from "../ds/form/date-field";
import { RateField } from "../ds/form/rate-field";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { shiftDocumentDate } from "../../lib/date-quick-options";
import { useDsTexts } from "../../ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";

/** Měřitelná ukázka polí, výstrah, radio, akcí a výběru. */
export function DocumentControlsShowcase() {
  const ds = useDsTexts();
  const [copies, setCopies] = useState(1);
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState("");
  const [created, setCreated] = useState("");
  const [feedback, setFeedback] = useState(true);
  const [saved, setSaved] = useState(0);
  return (
    <ShowcaseSection title="Ovládání formuláře">
      <div data-testid="document-controls" className="@container min-w-0 max-w-full space-y-4">
        <Button variant="outline" onClick={() => setFeedback(!feedback)}>Výstrahy</Button>
        <FieldGrid cols={12}>
          <Field htmlFor="controls-input" label="Popis" span={3} error={feedback ? "Popis je povinný" : undefined}>
            <Input id="controls-input" defaultValue="" />
          </Field>
          <Field htmlFor="controls-copies" label="Počet kopií" span={3}>
            <StepperInput id="controls-copies" value={copies} min={1} max={5} onChange={setCopies} />
          </Field>
          <Field htmlFor="controls-date" label="Splatnost" span={3}>
            <DateField id="controls-date" value={date} onChange={setDate} baseDate="2026-01-31"
              warning={feedback ? "Datum leží mimo období" : undefined}
              quickOptions={[
                { label: ds.dateQuick.sevenDays, compute: (base) => shiftDocumentDate(base, 7) },
                { label: ds.dateQuick.fourteenDays, compute: (base) => shiftDocumentDate(base, 14) },
                { label: ds.dateQuick.oneMonth, compute: (base) => shiftDocumentDate(base, 1, "months") },
              ]} />
          </Field>
          <Field htmlFor="controls-rate" label="Kurz" span={3}>
            <RateField id="controls-rate" value={25} onChange={() => {}} currency="EUR"
              homeCurrency="CZK" manual={false} rateAmount={1}
              warning={feedback ? "Kurz nebyl ověřen" : undefined} />
          </Field>
        </FieldGrid>
        <RadioGroup defaultValue="a" aria-label="Volba">
          <RadioGroupItem value="a" aria-label="První" />
          <RadioGroupItem value="b" aria-label="Druhá" />
        </RadioGroup>
        <div data-testid="action-width" className="max-w-full">
          <RecordActionBar saveAction={{ dirty: true, onSave: () => setSaved((count) => count + 1) }}
            primaryAction={{ label: "Zařadit doklad", onClick: () => {} }}
            moreActions={[{ id: "delete", label: "Odstranit", onClick: () => {} }]} />
        </div>
        <output aria-label="Uloženo">{saved}</output>
        <div className="w-48 max-w-full">
          <OptionSelect id="controls-select" ariaLabel="Partner" value={selected} onChange={setSelected}
            searchable onCreate={setCreated} createLabel={ds.selectCreate.partner}
            options={[
              { value: "a", label: "Krátký název" },
              { value: "b", label: "Velmi dlouhý obchodní název partnera pro měření celé nabídky bez zalamování" },
            ]} />
        </div>
        <output aria-label="Nový partner">{created}</output>
      </div>
    </ShowcaseSection>
  );
}