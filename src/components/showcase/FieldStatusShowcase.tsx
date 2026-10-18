/**
 * Ukázka „Chyby a varování v polích“ (jen náhled, vyloučeno přes .dsignore).
 * Řádek všech typů polí ve stavech ok / varování / chyba / nápověda, ve formuláři
 * i v detailu řádku mřížky, s přepínačem zoomu mřížky a hustoty.
 */
import type * as React from "react";
import { useState, type ReactNode } from "react";
import { Field } from "@/components/ds/layout/form-field-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DecimalInput } from "@/components/ds/form/decimal-input";
import { OptionSelect } from "@/components/ds/form/option-select";
import { DateField } from "@/components/ds/form/date-field";
import { SegmentedField } from "@/components/ds/form/segmented-field";
import { CheckboxField } from "@/components/ds/form/checkbox-field";
import { UnitSelect } from "@/components/ds/accounting/unit-select";
import { TooltipProvider } from "@/components/ui/tooltip";

type State = "ok" | "warning" | "error" | "hint";
const STATES: State[] = ["ok", "warning", "error", "hint"];
const STATE_LABEL: Record<State, string> = {
  ok: "Bez chyby",
  warning: "Varování",
  error: "Chyba",
  hint: "Nápověda",
};
const UNITS = [{ id: "ks", code: "ks", name: "kus", isActive: true }];
const OPTIONS = [
  { value: "a", label: "Faktura" },
  { value: "b", label: "Dobropis" },
];

function statusProps(state: State) {
  if (state === "error") return { error: "Hodnota je povinná" };
  if (state === "warning") return { warning: "Hodnota se liší od návrhu" };
  if (state === "hint") return { hint: "Vysvětlení pole" };
  return {};
}

/** Jeden řádek všech typů polí ve zvoleném stavu. */
function FieldRow({ state, prefix }: { state: State; prefix: string }) {
  const props = statusProps(state);
  const [amount, setAmount] = useState("1250");
  const [kind, setKind] = useState("a");
  const [date, setDate] = useState("2026-10-18");
  const [unit, setUnit] = useState<string>("ks");
  const [seg, setSeg] = useState("full");
  const id = (name: string) => `${prefix}-${state}-${name}`;
  const cell = (name: string, label: string, control: ReactNode, width = "w-[9rem]") => (
    <div className={`flex-none ${width}`}>
      <Field label={label} htmlFor={id(name)} {...props}>
        {control}
      </Field>
    </div>
  );
  return (
    <div data-slot="field-status-row" data-state={state} className="flex flex-wrap items-start gap-3">
      {cell("text", "Text", <Input id={id("text")} defaultValue="Popis" />)}
      {cell("amount", "Částka", <DecimalInput value={amount} onChange={setAmount} decimals={2} />)}
      {cell(
        "select",
        "Druh",
        <OptionSelect id={id("select")} value={kind} onChange={setKind} options={OPTIONS} />,
      )}
      {cell("date", "Datum", <DateField id={id("date")} value={date} onChange={setDate} />, "w-max")}
      {cell(
        "unit",
        "MJ",
        <UnitSelect options={UNITS} value={unit} onChange={setUnit} />,
        "w-[6rem]",
      )}
      {cell(
        "segmented",
        "Nárok",
        <SegmentedField
          ariaLabel="Nárok"
          value={seg}
          onChange={setSeg}
          options={[
            { value: "full", label: "Plný" },
            { value: "none", label: "Žádný" },
          ]}
        />,
        "w-max",
      )}
      <div className="flex-none w-max">
        <CheckboxField
          align="input"
          checked
          onCheckedChange={() => {}}
          label="Schváleno"
          {...props}
        />
      </div>
      <div className="flex-none w-max pt-[calc(1.25rem+0.25rem)]">
        <Button size="control" variant="outline">
          Mapa
        </Button>
      </div>
    </div>
  );
}

/** Ukázka stavů polí ve formuláři i v detailu řádku mřížky. */
export function FieldStatusShowcase() {
  const [zoom, setZoom] = useState(100);
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  return (
    <TooltipProvider>
      <div data-slot="field-status-showcase" className="space-y-6">
        <section data-slot="field-status-form" className="space-y-4">
          {STATES.map((state) => (
            <div key={state} className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">{STATE_LABEL[state]}</p>
              <FieldRow state={state} prefix="form" />
            </div>
          ))}
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedField
            label="Zoom mřížky"
            value={String(zoom)}
            onChange={(value) => setZoom(Number(value))}
            options={[60, 100, 140].map((value) => ({ value: String(value), label: `${value} %` }))}
          />
          <SegmentedField
            label="Hustota"
            value={density}
            onChange={(value) => setDensity(value as "normal" | "compact")}
            options={[
              { value: "normal", label: "Běžná" },
              { value: "compact", label: "Kompaktní" },
            ]}
          />
        </div>
        <section
          data-slot="field-status-grid"
          data-density={density}
          className="journal-line-detail-grid space-y-4 rounded-md bg-muted/30 p-3"
          style={
            {
              fontSize: `${(zoom / 100) * (density === "compact" ? 0.875 : 1)}rem`,
              "--control-h": `${2.25 * (zoom / 100) * (density === "compact" ? 0.875 : 1)}rem`,
            } as React.CSSProperties
          }
        >
          {STATES.map((state) => (
            <FieldRow key={state} state={state} prefix="grid" />
          ))}
        </section>
      </div>
    </TooltipProvider>
  );
}
