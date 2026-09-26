import { useState } from "react";
import { toast } from "sonner";
import {
  AddressFieldGrid,
  CheckboxField,
  CheckboxGroup,
  DataGrid,
  Field,
  FieldGrid,
  FormSection,
  GridRowMenu,
  IcoField,
  LookupField,
  OptionSelect,
  RecordDialog,
  SettingsSection,
  ShowInactiveToggle,
  SwitchField,
  VatStatusBadge,
  activeStatusColumn,
  activeToggleMenuItem,
  czIban,
  filterInactiveRows,
  formatIban,
  isValidCzAccount,
  parseCzAccount,
  type AddressValue,
  type DataGridColumn,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShowcaseSection } from "./ShowcaseLayout";

type Partner = { id: string; name: string; ico: string; city: string; active: boolean };

const INITIAL: Partner[] = [
  { id: "1", name: "ALFA servis Praha s.r.o.", ico: "12345678", city: "Praha", active: true },
  { id: "2", name: "BETA obchod a.s.", ico: "87654321", city: "Brno", active: true },
  { id: "3", name: "Gama stavby s.r.o.", ico: "11223344", city: "Ostrava", active: false },
];

/** Ukázka Partneři 2.46.0: dialog partnera, adresa s mapou, nastavení a stav záznamu. */
export function PartnerShowcase() {
  const [partners, setPartners] = useState(INITIAL);
  const [showInactive, setShowInactive] = useState(false);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("company");
  const [ico, setIco] = useState("12345678");
  const [name, setName] = useState("ALFA servis Praha s.r.o.");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [active, setActive] = useState(true);
  const [address, setAddress] = useState<AddressValue>({ street: "Vodičkova", house_number: "12", zip: "110 00", city: "Praha", country: "CZ" });
  const [flags, setFlags] = useState({ customer: true, supplier: false, excludeOrders: false });
  const [settings, setSettings] = useState({ reminders: true, ares: false });
  const [account, setAccount] = useState("19-2000145399");

  const parsed = parseCzAccount(account);
  const accountOk = parsed ? isValidCzAccount(parsed.prefix, parsed.number) : false;

  const lookup = async () => {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setBusy(false);
    setName("ALFA servis Praha s.r.o.");
    toast.success("Údaje doplněny z rejstříku");
    return true;
  };

  const columns: DataGridColumn<Partner>[] = [
    { id: "name", label: "Název", value: (r) => r.name },
    { id: "ico", label: "IČO", value: (r) => r.ico, format: "ico" },
    { id: "city", label: "Město", value: (r) => r.city },
    activeStatusColumn<Partner>((r) => r.active),
  ];

  return (
    <ShowcaseSection title="Partneři" description="LookupField, CheckboxField, SwitchField, stav DPH, adresa s mapou a stav záznamu Aktivní / Neaktivní.">
      <div className="space-y-6">
        <DataGrid<Partner>
          storageKey="showcase-partners-246"
          title="Partneři"
          rows={filterInactiveRows(partners, showInactive, (r) => r.active)}
          rowKey={(r) => r.id}
          columns={columns}
          toolbarExtra={<ShowInactiveToggle pressed={showInactive} onPressedChange={setShowInactive} />}
          rowActions={(row) => (
            <GridRowMenu items={[activeToggleMenuItem(row.active, (next) => setPartners((list) => list.map((p) => (p.id === row.id ? { ...p, active: next } : p))))]} />
          )}
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpen(true)}>Otevřít partnera</Button>
        </div>

        <div className="max-w-xl space-y-6 rounded-md border p-4">
          <SettingsSection title="Nastavení firmy">
            <SwitchField label="Připomínat splatnost" hint="Upozornění den před splatností faktur." checked={settings.reminders} onCheckedChange={(v) => setSettings((s) => ({ ...s, reminders: v }))} />
            <SwitchField label="Ověřovat partnery v ARES" checked={settings.ares} onCheckedChange={(v) => setSettings((s) => ({ ...s, ares: v }))} />
          </SettingsSection>
          <FormSection title="Bankovní účet">
            <FieldGrid cols={2}>
              <Field label="Číslo účtu" hint={accountOk && parsed ? `IBAN ${formatIban(czIban(parsed.prefix, parsed.number, "0800"))}` : undefined} error={account && !accountOk ? "Číslo účtu neprošlo kontrolou" : undefined}>
                <Input value={account} onChange={(e) => setAccount(e.target.value)} />
              </Field>
              <Field label="Stav DPH">
                <div className="flex min-h-9 items-center"><VatStatusBadge status="payer" unreliableSince="2026-03-01" checkedAt="2026-09-26" /></div>
              </Field>
            </FieldGrid>
          </FormSection>
        </div>
      </div>

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title="Partner"
        wide
        status={{ active }}
        dirty={dirty}
        onSubmit={() => { setDirty(false); setOpen(false); toast.success("Uloženo"); }}
        extraActions={<Button type="button" variant="destructive">Odstranit</Button>}
        lifecycleAction={{
          label: active ? "Deaktivovat" : "Aktivovat",
          confirm: active ? { title: "Deaktivovat partnera?", description: "Partner se přestane nabízet ve výběrech." } : undefined,
          onClick: ({ saveFirst }) => { if (saveFirst) setDirty(false); setActive((v) => !v); },
        }}
      >
        <FormSection title="Základní údaje">
          <FieldGrid cols={4}>
            <Field label="Typ" className="@min-[40rem]:col-span-1">
              <OptionSelect value={kind} onChange={setKind} allowEmpty={false} options={[{ value: "company", label: "Firma" }, { value: "person", label: "Osoba" }]} />
            </Field>
            <Field label="IČO" className="@min-[40rem]:col-span-1">
              <IcoField value={ico} onChange={(v) => { setIco(v); setDirty(true); }} onLookup={lookup} busy={busy} />
            </Field>
            <Field label={kind === "company" ? "Název" : "Jméno a příjmení"} className="@min-[40rem]:col-span-2">
              <LookupField value={name} onChange={(v) => { setName(v); setDirty(true); }} onAction={lookup} busy={busy} searchLabel="Vyhledat podle názvu" refreshLabel="Aktualizovat z rejstříku" />
            </Field>
            <Field label="Stav DPH" className="@min-[40rem]:col-span-3">
              <div className="flex min-h-9 items-center"><VatStatusBadge status={kind === "company" ? "payer" : "non_payer"} checkedAt="2026-09-26" /></div>
            </Field>
            <CheckboxField align="input" label="Plátce DPH" checked={kind === "company"} onCheckedChange={() => setDirty(true)} />
          </FieldGrid>
          <CheckboxGroup direction="horizontal" title="Role partnera">
            <CheckboxField label="Odběratel" checked={flags.customer} onCheckedChange={(v) => { setFlags((f) => ({ ...f, customer: v })); setDirty(true); }} />
            <CheckboxField label="Dodavatel" checked={flags.supplier} onCheckedChange={(v) => { setFlags((f) => ({ ...f, supplier: v })); setDirty(true); }} />
            <CheckboxField label="Nezahrnovat do platebních příkazů" hint="Platí pro nové doklady." checked={flags.excludeOrders} onCheckedChange={(v) => { setFlags((f) => ({ ...f, excludeOrders: v })); setDirty(true); }} />
          </CheckboxGroup>
        </FormSection>
        <FormSection title="Adresa">
          <AddressFieldGrid
            value={address}
            onChange={(patch) => { setAddress((a) => ({ ...a, ...patch })); setDirty(true); }}
            countries={[{ code: "CZ", name: "Česko" }, { code: "SK", name: "Slovensko" }]}
            defaultCountry="CZ"
            mapAction={{ onClick: () => toast.info("Otevřela by se mapa") }}
          />
        </FormSection>
      </RecordDialog>
    </ShowcaseSection>
  );
}
