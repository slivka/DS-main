import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import { PartnerShowcase } from "@/components/showcase/PartnerShowcase";
import { RecordDialogShowcase } from "@/components/showcase/RecordDialogShowcase";
import {
  AccountSelect,
  AmountInput,
  CalendarPicker,
  DateField,
  DateRangeField,
  Field,
  FieldGrid,
  FormSection,
  MonthYearSelect,
  OptionSelect,
  RecordDialog,
  TagPicker,
  type TagOption,
  type DateRangeValue,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounting";
import { useConfirmDialog } from "@/components/ds/feedback/confirm-dialog";

export const Route = createFileRoute("/components/forms")({
  head: () => ({
    meta: [
      { title: "Formuláře – Slivka Design System" },
      {
        name: "description",
        content: "Editační dialog dokladu se všemi sdílenými vstupy design systému.",
      },
      { property: "og:title", content: "Formuláře – Slivka Design System" },
      {
        property: "og:description",
        content: "Editační dialog dokladu se všemi sdílenými vstupy design systému.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FormsPage,
});

const TAGS: TagOption[] = [
  { id: "t1", name: "Priorita" },
  { id: "t2", name: "Ke kontrole" },
  { id: "t3", name: "Opakované" },
];

function FormsPage() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("2026-03-14");
  const [document, setDocument] = useState("FP2026014");
  const [debit, setDebit] = useState("518001");
  const [credit, setCredit] = useState("321001");
  const [amount, setAmount] = useState("12500");
  const [symbol, setSymbol] = useState("500014");
  const [kind, setKind] = useState("invoice");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>(["t2"]);
  const [range, setRange] = useState<DateRangeValue>({ from: null, to: null });
  const [calendarDate, setCalendarDate] = useState("");
  const [monthYear, setMonthYear] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirmDialog();

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Formuláře" }]}>
      <ShowcaseSection
        title="Dialog záznamu"
        description="Společná mřížka, stejné výšky polí, číselné řady a stálá výška záložek."
      >
        <RecordDialogShowcase />
      </ShowcaseSection>

      <ShowcaseSection
        title="Editační dialog dokladu"
        description="Stejný dialog používají všechny editace: tlačítko Odstranit vlevo, Zrušit a Uložit vpravo."
      >
        <Button onClick={() => setOpen(true)}>Otevřít doklad</Button>
      </ShowcaseSection>

      <ShowcaseSection
        title="Výběr data"
        description="Tři samostatné komponenty: rozsah Od–Do v jednom ovládání, kalendář vybíraný jen kliknutím a výběr měsíce a roku."
      >
        <FieldGrid cols={3}>
          <Field label="Rozsah dat">
            <DateRangeField value={range} onChange={setRange} />
          </Field>
          <Field label="Datum (kalendář)">
            <CalendarPicker value={calendarDate} onChange={setCalendarDate} />
          </Field>
          <Field label="Měsíc a rok">
            <MonthYearSelect value={monthYear} onChange={setMonthYear} />
          </Field>
        </FieldGrid>
      </ShowcaseSection>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Účetní doklad"
        wide
        onSubmit={() => {
          setOpen(false);
          toast.success("Doklad uložen");
        }}
        extraActions={
          <Button
            type="button"
            variant="destructive"
            onClick={() =>
              confirm({
                title: "Odstranit doklad?",
                description: "Akci nelze vzít zpět.",
                destructive: true,
                onConfirm: () => {
                  setOpen(false);
                  toast.success("Doklad odstraněn");
                },
              })
            }
          >
            Odstranit
          </Button>
        }
      >
        <FormSection title="Hlavička">
          <FieldGrid cols={3}>
            <Field label="Datum">
              <DateField value={date} onChange={setDate} />
            </Field>
            <Field label="Doklad">
              <Input value={document} onChange={(e) => setDocument(e.target.value)} />
            </Field>
            <Field label="Druh">
              <OptionSelect
                value={kind}
                onChange={setKind}
                options={[
                  { value: "invoice", label: "Přijatá faktura" },
                  { value: "bank", label: "Bankovní výpis" },
                  { value: "cash", label: "Pokladní doklad" },
                  { value: "internal", label: "Interní doklad" },
                ]}
              />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection title="Zaúčtování">
          <FieldGrid cols={2}>
            <Field label="Účet MD">
              <AccountSelect accounts={MOCK_ACCOUNTS} value={debit} onChange={setDebit} />
            </Field>
            <Field label="Účet Dal">
              <AccountSelect accounts={MOCK_ACCOUNTS} value={credit} onChange={setCredit} />
            </Field>
            <Field label="Částka">
              <AmountInput value={amount} onChange={setAmount} />
            </Field>
            <Field label="Variabilní symbol">
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </Field>
          </FieldGrid>
        </FormSection>

        <FormSection title="Doplňující údaje">
          <Field label="Štítky">
            <TagPicker tags={TAGS} value={tags} onChange={setTags} />
          </Field>
          <Field label="Poznámka">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </Field>
        </FormSection>
      </RecordDialog>
      {confirmDialog}
      <PartnerShowcase />
    </ShowcaseLayout>
  );
}
