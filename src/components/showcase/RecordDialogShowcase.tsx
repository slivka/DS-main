import { useState } from "react";

import {
  AccountSelect,
  AmountInput,
  BankAccountField,
  CheckboxField,
  DateField,
  DecimalInput,
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
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

type DialogKind = "basic" | "bank" | "series" | "tabs" | null;

const STATUS_CONFIG = {
  active: { label: "Aktivní", tone: "success" as const },
};

const ACCOUNT_OPTIONS = [{ code: "221001", name: "Bankovní účet", postable: true }];
const YEAR_OPTIONS = [{ value: "year", label: "Ročně" }];
const DEFAULT_OPTIONS = [{ value: "default", label: "Výchozí" }];

/** Čtyři vzorové dialogy ověřující společnou výšku, mřížku, tabulku a záložky. */
export function RecordDialogShowcase() {
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [amount, setAmount] = useState("12500");
  const [approved, setApproved] = useState(true);
  const [bankAccount, setBankAccount] = useState("123456789/0100");
  const [openingDate, setOpeningDate] = useState("2026-01-01");
  const [account, setAccount] = useState("221001");
  const [sequenceFrom, setSequenceFrom] = useState("1");
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

      <RecordDialog
        open={dialog === "basic"}
        onOpenChange={close}
        title="Vlastnosti knihy"
        size="md"
      >
        <FormSection title="Základní údaje">
          <FieldGrid cols={12} className={gridClass}>
            <Field label="Kód" span={2}>
              <Input defaultValue="FP" />
            </Field>
            <Field label="Název" span={6}>
              <Input defaultValue="Přijaté faktury" />
            </Field>
            <Field label="Typ" span={4}>
              <FieldValue lockedReason="Typ knihy po založení nelze změnit.">
                Přijatá faktura
              </FieldValue>
            </Field>
            <Field label="Měna" span={2}>
              <FieldValue>CZK</FieldValue>
            </Field>
            <Field label="Výchozí částka" span={6}>
              <OptionSelect
                value={amount}
                onChange={setAmount}
                options={[
                  { value: "12500", label: "12 500,00" },
                  { value: "25000", label: "25 000,00" },
                ]}
              />
            </Field>
            <Field label="Schválení" span={4}>
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

      <RecordDialog
        open={dialog === "bank"}
        onOpenChange={close}
        title="Kniha v období"
        size="md"
      >
        <SectionHeading aside="Hlavní účet">Bankovní účet</SectionHeading>
        <FieldGrid cols={12} className={gridClass}>
          <Field label="Bankovní účet" span={8}>
            <BankAccountField
              value={bankAccount}
              onChange={setBankAccount}
              options={[{ number: "123456789", bankCode: "0100", label: "Hlavní účet" }]}
            />
          </Field>
          <Field label="Banka" span={4}>
            <FieldValue>Komerční banka</FieldValue>
          </Field>
          <Field label="IBAN" span={8}>
            <FieldValue>CZ65 0100 0000 0012 3456 7890</FieldValue>
          </Field>
          <Field label="BIC" span={4}>
            <FieldValue>KOMBCZPP</FieldValue>
          </Field>
        </FieldGrid>
        <SectionHeading aside={<Badge variant="outline">K 1. 1. 2026</Badge>}>
          Počáteční stav
        </SectionHeading>
        <FieldGrid cols={12} className={gridClass}>
          <Field label="Datum" span={4}>
            <DateField value={openingDate} onChange={setOpeningDate} />
          </Field>
          <Field label="Částka" span={4}>
            <AmountInput value={amount} onChange={setAmount} />
          </Field>
          <Field label="Rozdíl" span={4}>
            <FieldValue>0,00</FieldValue>
          </Field>
        </FieldGrid>
      </RecordDialog>

      <RecordDialog
        open={dialog === "series"}
        onOpenChange={close}
        title="Číselné řady knihy"
        size="lg"
        titleBadges={<StatusBadge status="active" config={STATUS_CONFIG} />}
        headerExtra="Číslování dokladů pro účetní období 2026"
      >
        <FormSection title="Číslování">
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
                  series: <Badge variant="outline">Příjem</Badge>,
                  mask: <MaskInput value={maskIn} onChange={setMaskIn} preview="P-2026-001" />,
                  period: (
                    <OptionSelect value="year" onChange={() => {}} options={YEAR_OPTIONS} />
                  ),
                  from: (
                    <DecimalInput
                      value={sequenceFrom}
                      onChange={setSequenceFrom}
                      decimals={0}
                    />
                  ),
                  next: (
                    <FieldValue variant="plain" className="font-mono tabular-nums">
                      18
                    </FieldValue>
                  ),
                },
              },
              {
                key: "out",
                cells: {
                  series: <Badge variant="outline">Výdej</Badge>,
                  mask: <MaskInput value={maskOut} onChange={setMaskOut} preview="V-2026-001" />,
                  period: (
                    <OptionSelect value="year" onChange={() => {}} options={YEAR_OPTIONS} />
                  ),
                  from: <DecimalInput value="1" onChange={() => {}} decimals={0} />,
                  next: (
                    <FieldValue variant="plain" className="font-mono tabular-nums">
                      9
                    </FieldValue>
                  ),
                },
              },
            ]}
          />
        </FormSection>
        <SectionHeading>Účet</SectionHeading>
        <FieldGrid cols={12} className={gridClass}>
          <Field label="Účet" span={8}>
            <AccountSelect
              accounts={ACCOUNT_OPTIONS}
              value={account}
              onChange={setAccount}
            />
          </Field>
          <Field label="Na dokladu" span={4}>
            <CheckboxField align="input" checked onCheckedChange={() => {}} label="Lze změnit" />
          </Field>
        </FieldGrid>
        <SectionHeading>DPH</SectionHeading>
        <FieldGrid
          cols={12}
          className={gridClass}
          hint="Nastavení DPH se použije jako výchozí hodnota nových dokladů."
        >
          {["Režim", "Členění", "Zaokrouhlení"].map((label) => (
            <Field key={label} label={label} span={4}>
              <OptionSelect value="default" onChange={() => {}} options={DEFAULT_OPTIONS} />
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
            content: (
              <div className="space-y-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <Input key={index} defaultValue={`Řádek ${index + 1}`} />
                ))}
              </div>
            ),
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