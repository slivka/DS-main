import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  AccountCode,
  AmountCell,
  AmountInput,
  DecimalInput,
  DocumentStatusBadge,
  OptionSelect,
  PageHeader,
  StatusBadge,
  StatusDot,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Přehled – Slivka Design System" },
      {
        name: "description",
        content: "Barvy, typografie, rozestupy a základní prvky firemního design systému Slivka.",
      },
      { property: "og:title", content: "Přehled – Slivka Design System" },
      {
        property: "og:description",
        content: "Barvy, typografie, rozestupy a základní prvky firemního design systému Slivka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

const TOKENS = [
  { name: "background", label: "Pozadí" },
  { name: "foreground", label: "Text" },
  { name: "card", label: "Karta" },
  { name: "primary", label: "Primární" },
  { name: "secondary", label: "Sekundární" },
  { name: "muted", label: "Tlumené" },
  { name: "accent", label: "Akcent" },
  { name: "destructive", label: "Destruktivní" },
  { name: "border", label: "Ohraničení" },
];

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="size-10 rounded-md border"
        style={{ background: `var(--${token})` }}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{label}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">--{token}</div>
      </div>
    </div>
  );
}

function OverviewPage() {
  const [amount, setAmount] = useState<string>("1234567.89");
  const [decimal, setDecimal] = useState<string>("42.5");
  const [option, setOption] = useState("a");

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Design systém", to: "/" }, { label: "Přehled" }]}>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Slivka Design System</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sdílený základ firemních aplikací: barvy, typografie, mřížky, formuláře a pravidla.
        </p>
      </header>

      <ShowcaseSection title="Barvy" description="Paleta Navy Trust ve světlém i tmavém režimu.">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TOKENS.map((t) => (
            <Swatch key={t.name} token={t.name} label={t.label} />
          ))}
        </div>
        <div className="mt-4 rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Tmavý režim přepnete přepínačem v horní liště – stejné tokeny, jiné hodnoty.
          </p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Typografie">
        <div className="space-y-2 rounded-lg border bg-card p-4">
          <h1 className="text-3xl font-semibold tracking-tight">Nadpis stránky</h1>
          <h2 className="text-lg font-semibold">Nadpis sekce</h2>
          <p className="text-sm">Základní text aplikace ve velikosti 14 px.</p>
          <p className="text-xs text-muted-foreground">Doplňkový popisek a nápověda.</p>
          <p className="tabular-nums">1 234 567,89 — částka ve Work Sans s tabulkovými číslicemi</p>
          <p className="font-mono tabular-nums">221.001 — kód účtu v JetBrains Mono</p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Rozestupy">
        <div className="flex flex-wrap items-end gap-3">
          {[1, 2, 3, 4, 6, 8].map((s) => (
            <div key={s} className="text-center">
              <div className="bg-primary/70" style={{ width: s * 4, height: s * 4 }} />
              <div className="mt-1 text-xs text-muted-foreground">{s * 4} px</div>
            </div>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Tlačítka">
        <div className="flex flex-wrap gap-2">
          <Button>Uložit</Button>
          <Button variant="outline">Zrušit</Button>
          <Button variant="secondary">Sekundární</Button>
          <Button variant="ghost">Nenápadné</Button>
          <Button variant="destructive">Odstranit</Button>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Vstupy a výběry">
        <div className="grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Text</Label>
            <Input placeholder="Zadejte text" />
          </div>
          <div className="space-y-1">
            <Label>Číslo</Label>
            <DecimalInput value={decimal} onChange={setDecimal} />
          </div>
          <div className="space-y-1">
            <Label>Částka</Label>
            <AmountInput value={amount} onChange={setAmount} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Výběr</Label>
            <OptionSelect
              value={option}
              onChange={setOption}
              options={[
                { value: "a", label: "První možnost" },
                { value: "b", label: "Druhá možnost" },
                { value: "c", label: "Třetí možnost" },
              ]}
            />
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Hlavička stránky"
        description="Nadpis, popis a akce vpravo; na úzkých obrazovkách se zalamuje."
      >
        <PageHeader
          title="Přijaté faktury"
          description="Přehled dokladů za vybrané účetní období."
          actions={
            <>
              <Button variant="outline">Exportovat</Button>
              <Button>Nový doklad</Button>
            </>
          }
        />
      </ShowcaseSection>

      <ShowcaseSection title="Stavy a štítky">
        <div className="flex flex-wrap items-center gap-3">
          <DocumentStatusBadge status="draft" />
          <DocumentStatusBadge status="filed" />
          <DocumentStatusBadge status="posted" />
          <DocumentStatusBadge status="locked" />
          <DocumentStatusBadge status="cancelled" />
          <DocumentStatusBadge status="posted" approved />
          <DocumentStatusBadge status="filed" approved />
          <StatusBadge
            status="active"
            config={{ active: { label: "Aktivní", tone: "info" } }}
          />
          <StatusDot active activeLabel="Aktivní" />
          <StatusDot active={false} inactiveLabel="Neaktivní" />
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Čísla a účty">
        <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-card p-4">
          <AmountCell value={1234567.89} className="w-40" />
          <AmountCell value={-4520.5} className="w-40" />
          <AccountCode code="221001" name="Běžný účet CZK" />
          <AccountCode code="518" name="Ostatní služby" />
        </div>
      </ShowcaseSection>
    </ShowcaseLayout>
  );
}
