/** Ukázka Design 3 · pouze paměťová data · nesmí se distribuovat s knihovnou. */
import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import {
  Button,
  Calendar,
  DateField,
  DocumentStatusBadge,
  Field,
  FieldGrid,
  Input,
  PageHeader,
  PaneLayout,
  PaneTabsProvider,
  RecordActionBar,
  SectionHeading,
  createTab,
  type PaneLayoutCount,
  type PaneTabsState,
} from "../ds";
import { DocumentIdentityLine } from "../ds/accounting/document-form/document-identity-line";
import { useRef } from "react";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../ds/accounting/document-form/document-form-types";

const ACCOUNTS = [
  { code: "221001", name: "Běžný bankovní účet" },
  { code: "221002", name: "Devizový bankovní účet" },
];
function paneState(count: PaneLayoutCount): PaneTabsState {
  const panes = Array.from({ length: count }, (_, i) => {
    const tabs = ["Faktury", "Partneři", "Účetní deník"].map((title, j) => ({
      ...createTab({ route: `/demo-${i}-${j}`, title }, j),
      id: `demo-${i}-${j}`,
    }));
    return { id: `pane-${i}`, tabs, activeTab: tabs[0]?.id ?? null };
  });
  return { version: 2, layout: count, active: "pane-0", panes };
}
export function DesignThreeShowcase() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [count, setCount] = useState<PaneLayoutCount>(1);
  const [state, setState] = useState(() => paneState(1));
  const [dirty, setDirty] = useState(false);
  const [value, setValue] = useState("2026-10-19");
  const [account, setAccount] = useState("221001");
  const [editing, setEditing] = useState(false);
  const pencil = useRef<HTMLButtonElement>(null);
  return (
    <div className="space-y-6" data-testid="design-three" data-ready={ready}>
      <PageHeader
        title="Design 3"
        titleBadge={<DocumentStatusBadge status="posted" approved size="md" />}
      />
      <SectionHeading>Záložky panelů</SectionHeading>
      <div className="flex gap-2">
        {([1, 2, 3] as const).map((n) => (
          <Button
            key={n}
            variant={count === n ? "default" : "outline"}
            onClick={() => {
              setCount(n);
              setState(paneState(n));
            }}
          >
            {n} {n === 1 ? "panel" : "panely"}
          </Button>
        ))}
      </div>
      <div className="design-three-panes h-48">
        <PaneTabsProvider state={state} onChange={setState}>
          <PaneLayout
            embedded
            minPaneWidth={160}
            getTabIcon={() => FileText}
            renderTab={(tab) => (
              <PageHeader title={tab.title} titleBadge={<DocumentStatusBadge status="draft" />} />
            )}
          />
        </PaneTabsProvider>
      </div>
      <SectionHeading>Akce dokladu</SectionHeading>
      <RecordActionBar
        primaryAction={{ label: "Zařadit", onClick: () => undefined, disabled: true }}
        saveAction={{ onSave: () => setDirty(false), dirty }}
        moreActions={[{ id: "copy", label: "Kopírovat", onClick: () => undefined }]}
      />
      <FieldGrid>
        <Field label="Popis">
          <Input
            aria-label="Popis ukázky"
            value={dirty ? "Upravený doklad" : ""}
            onChange={() => setDirty(true)}
          />
        </Field>
        <Field label="Datum splatnosti">
          <DateField value={value} onChange={setValue} baseDate="2026-10-19" />
        </Field>
      </FieldGrid>
      <SectionHeading>Výběr data</SectionHeading>
      <div className="flex flex-wrap gap-4">
        <Calendar
          mode="single"
          selected={new Date(2026, 9, 19)}
          onSelect={() => undefined}
          onToday={() => undefined}
        />
      </div>
      <SectionHeading>Identifikace dokladu</SectionHeading>
      <div className="@container" data-testid="identity-demo">
        <DocumentIdentityLine
          identity={{
            variant: "cashBank",
            book: "Banka",
            period: "2026",
            number: "BA2026000019",
            account: { side: "MD", label: "221.001 – Běžný bankovní účet" },
          }}
          fallback=""
          texts={DEFAULT_DOCUMENT_FORM_TEXTS}
          accountLabel={
            account === "221001"
              ? "221.001 – Běžný bankovní účet"
              : "221.002 – Devizový bankovní účet"
          }
          accountValue={account}
          editingAccount={editing}
          canEditAccount
          pencilRef={pencil}
          onStartAccountEdit={() => setEditing(true)}
          onAccountChange={(code) => {
            setAccount(code);
            setEditing(false);
          }}
          onAccountClose={() => setEditing(false)}
          accountOptions={ACCOUNTS}
        />
        <FieldGrid>
          <Field label="První pole">
            <Input aria-label="První pole" />
          </Field>
        </FieldGrid>
      </div>
    </div>
  );
}
