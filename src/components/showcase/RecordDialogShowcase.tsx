import { useState } from "react";

import {
  AmountInput,
  CheckboxField,
  Field,
  FieldGrid,
  FieldTable,
  FieldValue,
  FormSection,
  MaskInput,
  OptionSelect,
  RecordDialog,
  SectionHeading,
  StatusBadge,
} from "../ds";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type DialogKind = "basic" | "bank" | "series" | "tabs" | null;

const STATUS_CONFIG = {
  active: { label: "Aktivní", tone: "success" as const },
};

/** Čtyři vzorové dialogy ověřující společnou výšku, mřížku, tabulku a záložky. */
export function RecordDialogShowcase() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [amount, setAmount] = useState("12500");
  const [approved, setApproved] = useState(true);
  const [maskIn, setMaskIn] = useState("P-{RRRR}-{###}");
  const [maskOut, setMaskOut] = useState("V-{RRRR}-{###}");
  const gridClass = gridVisible
    ? "[&>*]:outline [&>*]:outline-1 [&>*]:outline-primary/30"
    : undefined;
  const close = () => setDialog(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setDialog("basic")}>Bez záložek</Button>
        <Button onClick={() => setDialog("bank")}>Kniha v období</Button>
        <Button onClick={() => setDialog("series")}>Číselné řady</Button>
        <Button onClick={() => setDialog("tabs")}>Tři záložky</Button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          Ukázat mřížku
          <Switch checked={gridVisible} onCheckedChange={setGridVisible} />
        </label>
      </div>

      <RecordDialog open={dialog === "basic"} onOpenChange={close} title="Vlastnosti knihy">
        <FormSection title="Základní údaje">
          <FieldGrid cols={12} className={gridClass}>
            <Field label="Kód" span={2}>
              <Input defaultValue="FP" />
            </Field>
            <Field label="Název" span={6}>
              <Input defaultValue="Přijaté faktury" />
            </Field>
            <Field label="Typ" span={4}>
              <FieldValue>Přijatá faktura</FieldValue>
            </Field>
            <Field label="Měna" span={2}>
              <FieldValue lockedReason="Měnu knihy nelze po založení změnit.">CZK</FieldValue>
            </Field>
            <Field label="Výchozí částka" span={6}>
              <AmountInput value={amount} onChange={setAmount} />
            </Field>
            <Field span={4}>
              <CheckboxField
                align="input"
                checked={approved}
                onCheckedChange={setApproved}
                label="Vyžaduje schválení"
              />
            </Field>
          </FieldGrid>
        </FormSection>
      </RecordDialog>

      <RecordDialog open={dialog === "bank"} onOpenChange={close} title="Kniha v období">
        <FormSection title="Bankovní účet">
          <FieldGrid cols={12} className={gridClass}>
            <Field label="Účet" span={8}>
              <OptionSelect
                value="main"
                onChange={() => {}}
                options={[{ value: "main", label: "123456789/0100" }]}
              />
            </Field>
            <Field label="Měna" span={4}>
              <FieldValue>CZK</FieldValue>
            </Field>
            <Field label="Protiúčet" span={8}>
              <Input defaultValue="221.001" />
            </Field>
            <Field label="Stav" span={4}>
              <FieldValue>Aktivní</FieldValue>
            </Field>
          </FieldGrid>
        </FormSection>
        <FormSection title="Počáteční stav">
          <FieldGrid cols={12} className={gridClass}>
            {["Datum", "Částka", "Zdroj"].map((label) => (
              <Field key={label} label={label} span={4}>
                <FieldValue>{label === "Částka" ? "25 000,00" : "—"}</FieldValue>
              </Field>
            ))}
          </FieldGrid>
        </FormSection>
      </RecordDialog>

      <RecordDialog
        open={dialog === "series"}
        onOpenChange={close}
        title="Číselné řady knihy"
        size="lg"
        titleBadges={<StatusBadge status="active" config={STATUS_CONFIG} />}
        headerExtra="Číslování dokladů pro účetní období 2026"
      >
        <FormSection title="Číselné řady">
          <FieldTable
            ariaLabel="Číselné řady"
            columns={[
              { key: "series", label: "Řada", span: 2 },
              { key: "mask", label: "Maska", span: 4 },
              { key: "period", label: "Číslovat", span: 2 },
              { key: "from", label: "Od", span: 2, align: "end" },
              { key: "next", label: "Příští", span: 2, align: "end" },
            ]}
            rows={[
              {
                key: "in",
                cells: {
                  series: <FieldValue variant="plain">Příjem</FieldValue>,
                  mask: <MaskInput value={maskIn} onChange={setMaskIn} preview="P-2026-001" />,
                  period: <FieldValue variant="plain">Ročně</FieldValue>,
                  from: <FieldValue variant="plain">1</FieldValue>,
                  next: <FieldValue variant="plain">18</FieldValue>,
                },
              },
              {
                key: "out",
                cells: {
                  series: <FieldValue variant="plain">Výdej</FieldValue>,
                  mask: <MaskInput value={maskOut} onChange={setMaskOut} preview="V-2026-001" />,
                  period: <FieldValue variant="plain">Ročně</FieldValue>,
                  from: <FieldValue variant="plain">1</FieldValue>,
                  next: <FieldValue variant="plain">9</FieldValue>,
                },
              },
            ]}
          />
        </FormSection>
        <FieldGrid cols={12} className={gridClass}>
          <Field label="Účet" span={8}>
            <Input defaultValue="221.001" />
          </Field>
          <Field span={4}>
            <CheckboxField align="input" checked onCheckedChange={() => {}} label="Lze změnit" />
          </Field>
        </FieldGrid>
        <SectionHeading>DPH</SectionHeading>
        <FieldGrid cols={12} className={gridClass}>
          {["Režim", "Kód", "Zaokrouhlení"].map((label) => (
            <Field key={label} label={label} span={4}>
              <FieldValue>{label === "Režim" ? "Automaticky" : "—"}</FieldValue>
            </Field>
          ))}
        </FieldGrid>
      </RecordDialog>

      <RecordDialog
        open={dialog === "tabs"}
        onOpenChange={close}
        title="Dialog se stálou výškou"
        size="md"
        tabs={[
          { value: "one", label: "Základní údaje", content: <Input defaultValue="Krátký obsah" /> },
          {
            value: "two",
            label: "Nastavení",
            content: <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Input key={index} defaultValue={`Řádek ${index + 1}`} />)}</div>,
          },
          {
            value: "three",
            label: "Poznámky",
            content: <FieldValue>Nejkratší obsah</FieldValue>,
          },
        ]}
      />
    </>
  );
}