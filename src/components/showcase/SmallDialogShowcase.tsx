/** Ukázka malého dialogu „Nové účetní období“ a přepínače prostoru s dlouhým názvem · jen náhled. */
import { useState } from "react";

import { ContextSwitcher, DateField, Field, FieldGrid, RecordDialog } from "../ds";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const SPACES = [
  { id: "long", label: "Účetní kancelář Slivka a partneři – pobočka Brno-střed" },
  { id: "home", label: "Domácnost" },
];

export function SmallDialogShowcase() {
  const [open, setOpen] = useState(false);
  const [mdOpen, setMdOpen] = useState(false);
  const [space, setSpace] = useState("long");
  const [from, setFrom] = useState<string | null>("2027-01-01");
  const [to, setTo] = useState<string | null>("2027-12-31");
  const fields = (prefix: string) => (
    <FieldGrid>
      <Field label="Kód" htmlFor={`${prefix}-code`} span={2}>
        <Input id={`${prefix}-code`} defaultValue="2027" />
      </Field>
      <Field label="Od" htmlFor={`${prefix}-from`}>
        <DateField id={`${prefix}-from`} value={from} onChange={setFrom} />
      </Field>
      <Field label="Do" htmlFor={`${prefix}-to`}>
        <DateField id={`${prefix}-to`} value={to} onChange={setTo} />
      </Field>
    </FieldGrid>
  );
  return (
    <div data-testid="small-dialog-showcase" className="flex flex-wrap items-start gap-4">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Nové účetní období
      </Button>
      <Button type="button" variant="outline" onClick={() => setMdOpen(true)}>
        Stejná pole ve středním dialogu
      </Button>
      <div className="w-60 rounded-md bg-sidebar p-3" data-testid="context-switcher-long">
        <ContextSwitcher
          label={SPACES.find((item) => item.id === space)?.label ?? ""}
          description="12 firem"
          items={SPACES}
          value={space}
          onValueChange={setSpace}
        />
      </div>
      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Nové účetní období"
        description="Období navazuje na poslední uzavřený rok. Datum Do musí být pozdější než Od."
        onSubmit={() => setOpen(false)}
      >
        {fields("sm")}
      </RecordDialog>
      <RecordDialog
        open={mdOpen}
        onOpenChange={setMdOpen}
        size="md"
        title="Nové účetní období"
        onSubmit={() => setMdOpen(false)}
      >
        {fields("md")}
      </RecordDialog>
    </div>
  );
}
