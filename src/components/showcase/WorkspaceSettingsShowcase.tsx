import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Building2, History, KeyRound, Landmark, Library, ListTree, Plus, Settings, Users, Globe2, LayoutList } from "lucide-react";

import {
  ConfirmByTypingDialog,
  ContextSwitcher,
  DangerZone,
  DataGrid,
  NoticeBar,
  PageHeader,
  SectionHeading,
  SegmentedField,
  StandaloneNav,
  StandaloneShell,
  UserMenu,
  type DataGridColumn,
  type NavGroup,
} from "@/components/ds";
import { Button } from "@/components/ui/button";

const SPACES = [
  { id: "slivka", label: "Slivka Group", trailing: "5 firem", current: true },
  { id: "test", label: "Test", trailing: "2 firmy" },
  { id: "audit", label: "Auditní prostor s velmi dlouhým názvem pro zkrácení", trailing: "1 firma" },
];

const GROUPS: NavGroup[] = [
  { id: "space", label: "", section: "Prostor", items: [
    { to: "/workspace-settings/udaje", label: "Údaje prostoru", icon: Settings },
    { to: "/workspace-settings/firmy", label: "Firmy", icon: Building2 },
    { to: "/workspace-settings/historie", label: "Historie změn", icon: History },
  ] },
  { id: "users", label: "", section: "Uživatelé", items: [
    { to: "/workspace-settings/uzivatele", label: "Uživatelé a role", icon: Users },
    { to: "/workspace-settings/opravneni", label: "Oprávnění ke knihám", icon: KeyRound },
  ] },
  { id: "templates", label: "", section: "Vzory číselníků", items: [
    { to: "/workspace-settings/meny", label: "Měny", icon: Landmark },
    { to: "/workspace-settings/zeme", label: "Země", icon: Globe2 },
    { to: "/workspace-settings/osnova", label: "Účtová osnova", icon: ListTree },
  ] },
];

type CompanyRow = { id: string; name: string; ico: string; periods: number };
const COMPANIES: CompanyRow[] = [
  { id: "1", name: "Slivka s.r.o.", ico: "12345678", periods: 3 },
  { id: "2", name: "Slivka Reality a.s.", ico: "87654321", periods: 2 },
  { id: "3", name: "Test Servis s.r.o.", ico: "11223344", periods: 1 },
];
const COLUMNS: DataGridColumn<CompanyRow>[] = [
  { id: "name", label: "Název", value: (row) => row.name },
  { id: "ico", label: "IČO", value: (row) => row.ico },
  { id: "periods", label: "Účetní období", numeric: true, decimals: 0, exportType: "integer", value: (row) => row.periods },
];

/** Ukázka nastavení prostoru mimo AppShell. */
export function WorkspaceSettingsShowcase() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [space, setSpace] = useState<string | null>("test");
  const [role, setRole] = useState("admin");
  const [confirmOpen, setConfirmOpen] = useState<null | "delete" | "reset">(null);
  const selected = SPACES.find((item) => item.id === space);
  const member = role === "member";
  const groups = member ? [{ ...GROUPS[0]!, items: [GROUPS[0]!.items[0]!] }] : GROUPS;
  const page = GROUPS.flatMap((group) => group.items).find((item) => pathname.startsWith(item.to)) ?? GROUPS[0]!.items[0]!;
  const close = () => void navigate({ to: "/components/navigation" });

  return (
    <StandaloneShell
      brand={<span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">S</span>}
      title="Nastavení prostoru"
      userMenu={<UserMenu name="Petr Slivka" email="petr@slivka.cz" onSignOut={() => undefined} />}
      onClose={selected ? close : undefined}
      sidebar={selected ? (
        <>
          <ContextSwitcher
            label={selected.label}
            description={selected.trailing}
            items={SPACES}
            value={space}
            onValueChange={setSpace}
            actions={[
              { id: "new", label: "Nový prostor…", icon: Plus, onSelect: () => undefined },
              { id: "all", label: "Všechny prostory…", icon: LayoutList, onSelect: () => setSpace(null) },
            ]}
          />
          <StandaloneNav groups={groups} />
        </>
      ) : undefined}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedField label="Role v ukázce" value={role} onChange={setRole} options={[{ value: "admin", label: "Správce" }, { value: "member", label: "Člen" }]} />
        <Button type="button" variant="outline" onClick={() => setSpace(space ? null : "test")}>{space ? "Stav bez prostoru" : "Vybrat prostor"}</Button>
      </div>
      {!selected ? (
        <PageHeader title="Vyberte prostor" />
      ) : (
        <div className="flex flex-col gap-4">
          <PageHeader title={member ? "Údaje prostoru" : page.label} />
          {!selected.current ? (
            <NoticeBar tone="neutral" actions={<Button type="button" variant="outline" size="sm" onClick={() => setSpace("slivka")}>Pracovat v tomto prostoru</Button>}>
              Upravujete prostor {selected.label}. Aplikace pracuje v prostoru Slivka Group.
            </NoticeBar>
          ) : null}
          <SectionHeading>Firmy v prostoru</SectionHeading>
          <DataGrid<CompanyRow> storageKey="ds-workspace-companies" rows={COMPANIES} columns={COLUMNS} rowKey={(row) => row.id} paginated={false} />
          {!member ? (
            <DangerZone
              items={[
                { title: "Obnovit vzory číselníků", description: "Přepíše měny, země a účtovou osnovu výchozími hodnotami.", action: <Button type="button" variant="outline" onClick={() => setConfirmOpen("reset")}>Obnovit vzory</Button> },
                { title: "Odstranit prostor", description: "Nevratně odstraní prostor, jeho firmy a všechny doklady.", action: <Button type="button" variant="destructive" onClick={() => setConfirmOpen("delete")}>Odstranit prostor</Button> },
              ]}
            />
          ) : null}
        </div>
      )}
      <ConfirmByTypingDialog
        open={confirmOpen === "delete"}
        onOpenChange={(open) => setConfirmOpen(open ? "delete" : null)}
        title="Odstranit prostor"
        description="Tato akce je nevratná."
        summary={<ul className="list-disc pl-5"><li>Firmy: 2</li><li>Doklady: 1 284</li><li>Uživatelé: 5</li></ul>}
        confirmText={selected?.label ?? ""}
        acknowledgement="Rozumím, že data nelze obnovit."
        confirmLabel="Odstranit prostor"
        onConfirm={() => new Promise((resolve, reject) => setTimeout(() => (Math.random() < 0.5 ? resolve() : reject(new Error("Prostor se nepodařilo odstranit – zkuste to znovu."))), 800))}
      />
      <ConfirmByTypingDialog
        open={confirmOpen === "reset"}
        onOpenChange={(open) => setConfirmOpen(open ? "reset" : null)}
        title="Obnovit vzory číselníků"
        description="Vlastní úpravy vzorů budou ztraceny."
        confirmText="obnovit"
        confirmLabel="Obnovit vzory"
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 600))}
      />
    </StandaloneShell>
  );
}
