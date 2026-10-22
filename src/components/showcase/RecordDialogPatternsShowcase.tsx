/** Ukázka vzoru dialogů záznamů · jen náhled DS · nesmí se šířit spotřebitelům. */
import { useMemo, useState } from "react";

import { CheckboxField, DateField, Field, FieldGrid, FieldValue, OptionSelect, RecordDialog, SectionHeading, type RecordDialogSize } from "../ds";
import { PaneApiContext } from "../ds/panes/pane-context-hooks";
import type { PaneApi } from "../ds/panes/pane-context-types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Scenario = "new" | "existing" | "readOnly" | "errors" | "delete";
type Opened = { scenario: Scenario; size: RecordDialogSize; inPane: boolean };

const DEFAULTS = { code: "", name: "", type: "fp", from: "2026-01-01", active: true };
const EXISTING = {
  code: "FP",
  name: "Přijaté faktury",
  type: "fp",
  from: "2026-01-01",
  active: true,
};
const TYPE_OPTIONS = [
  { value: "fp", label: "Přijatá faktura" },
  { value: "fv", label: "Vydaná faktura" },
];
const TITLES: Record<Scenario, string> = {
  new: "Nová kniha",
  existing: "Kniha FP",
  readOnly: "Kniha FP – jen pro čtení",
  errors: "Kniha FP – chyba uložení",
  delete: "Kniha FP – s Odstranit",
};

const noop = () => {};
const DEMO_PANE: PaneApi = {
  paneId: "record-dialog-demo",
  tabId: "record-dialog-demo-tab",
  isActive: true,
  navigate: noop,
  back: noop,
  forward: noop,
  canBack: false,
  canForward: false,
  setTitle: noop,
  close: noop,
};

/** Formulář knihy v jediné dvanáctisloupcové mřížce. */
function BookFields(props: {
  value: typeof DEFAULTS;
  onChange: (next: typeof DEFAULTS) => void;
  locked: boolean;
}) {
  const { value, onChange } = props;
  return (
    <>
      <SectionHeading>Základní údaje</SectionHeading>
      <FieldGrid cols={12} hint="Kód knihy se tiskne na dokladech jako předpona čísla.">
        <Field label="Kód" span={2} htmlFor="book-code">
          {props.locked ? (
            <FieldValue lockedReason="Kód knihy po založení nelze změnit.">{value.code}</FieldValue>
          ) : (
            <Input
              id="book-code"
              value={value.code}
              onChange={(event) => onChange({ ...value, code: event.target.value })}
            />
          )}
        </Field>
        <Field label="Název" span={6} htmlFor="book-name">
          <Input
            id="book-name"
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
          />
        </Field>
        <Field label="Typ" span={4}>
          <OptionSelect
            value={value.type}
            onChange={(type) => onChange({ ...value, type })}
            options={TYPE_OPTIONS}
            allowEmpty={false}
          />
        </Field>
        <Field label="Platí od" span={4}>
          <DateField
            value={value.from}
            onChange={(from) => onChange({ ...value, from: from ?? "" })}
          />
        </Field>
        <Field label="Aktivní" span={8}>
          <CheckboxField
            align="input"
            checked={value.active}
            onCheckedChange={(active) => onChange({ ...value, active })}
            label="Nabízet v nových dokladech"
          />
        </Field>
      </FieldGrid>
    </>
  );
}

/** Jeden dialog podle zvoleného scénáře, velikosti a umístění. */
function ScenarioDialog({ opened, onClose }: { opened: Opened; onClose: () => void }) {
  const initial = opened.scenario === "new" ? DEFAULTS : EXISTING;
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(
    opened.scenario === "errors" ? "Záznam se nepodařilo uložit: kód FP už existuje." : undefined,
  );
  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(initial), [value, initial]);
  const save = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (opened.scenario === "errors") {
        setError("Záznam se nepodařilo uložit: kód FP už existuje.");
        return;
      }
      onClose();
    }, 900);
  };
  return (
    <RecordDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={TITLES[opened.scenario]}
      size={opened.size}
      dirty={dirty}
      busy={busy}
      readOnly={opened.scenario === "readOnly"}
      onSubmit={save}
      error={error}
      fieldErrors={
        opened.scenario === "errors"
          ? [{ fieldId: "book-name", label: "Název", message: "Název je povinný." }]
          : undefined
      }
      {...(opened.scenario === "new" ? {} : { status: { active: value.active } })}
      {...(opened.scenario === "delete"
        ? {
            deleteAction: {
              onClick: onClose,
              confirm: { title: "Odstranit knihu FP?", description: "Akci nelze vrátit." },
            },
          }
        : {})}
    >
      <BookFields value={value} onChange={setValue} locked={opened.scenario !== "new"} />
    </RecordDialog>
  );
}

const SCENARIOS: { scenario: Scenario; label: string }[] = [
  { scenario: "new", label: "Nový" },
  { scenario: "existing", label: "Existující (zkus zavřít po úpravě)" },
  { scenario: "readOnly", label: "Jen pro čtení" },
  { scenario: "errors", label: "S chybou uložení i polí" },
  { scenario: "delete", label: "S Odstranit" },
];

/** Ukázka „Dialogy záznamů“: scénáře, velikosti sm / md / lg v panelu i mimo panel. */
export function RecordDialogPatternsShowcase() {
  const [opened, setOpened] = useState<Opened | null>(null);
  const [size, setSize] = useState<RecordDialogSize>("md");
  const [inPane, setInPane] = useState(false);
  const dialog = opened ? <ScenarioDialog opened={opened} onClose={() => setOpened(null)} /> : null;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <OptionSelect
          ariaLabel="Velikost"
          value={size}
          onChange={(next) => setSize(next as RecordDialogSize)}
          allowEmpty={false}
          options={[
            { value: "sm", label: "sm – 32 rem" },
            { value: "md", label: "md – 48 rem" },
            { value: "lg", label: "lg – 56 rem" },
          ]}
        />
        <OptionSelect
          ariaLabel="Umístění"
          value={inPane ? "pane" : "window"}
          onChange={(next) => setInPane(next === "pane")}
          allowEmpty={false}
          options={[
            { value: "window", label: "Mimo panel" },
            { value: "pane", label: "V panelu" },
          ]}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((item) => (
          <Button
            key={item.scenario}
            variant="outline"
            onClick={() => setOpened({ scenario: item.scenario, size, inPane })}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <PaneApiContext.Provider value={opened?.inPane ? DEMO_PANE : null}>
        <div
          data-pane={DEMO_PANE.paneId}
          data-testid="record-dialog-demo-pane"
          className="relative min-h-[34rem] overflow-hidden rounded-md border bg-muted/30"
        >
          {dialog}
        </div>
      </PaneApiContext.Provider>
    </div>
  );
}
