import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, FileText, KeyRound, LayoutGrid, Settings2, Users } from "lucide-react";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  ComingSoon,
  PermissionGate,
  ReadOnlyBanner,
  type NavGroup,
  type NavItem,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/components/navigation")({
  head: () => ({
    meta: [
      { title: "Navigace – Slivka Design System" },
      {
        name: "description",
        content:
          "Boční menu se skupinami, samostatný režim Administrace, oprávnění, režim jen pro čtení a stav Připravujeme.",
      },
      { property: "og:title", content: "Navigace – Slivka Design System" },
      {
        property: "og:description",
        content:
          "Boční menu se skupinami, samostatný režim Administrace, oprávnění, režim jen pro čtení a stav Připravujeme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NavigationPage,
});

const NAV_GROUPS: NavGroup[] = [
  {
    id: "documents",
    label: "Doklady",
    items: [
      { to: "/components/accounting-forms", label: "Přijaté faktury", icon: FileText },
      { to: "/components/grid", label: "Vydané faktury", icon: FileText, badge: "12" },
      { to: "/components/excel-export", label: "Bankovní výpisy", icon: FileText },
    ],
  },
  {
    id: "registers",
    label: "Číselníky",
    items: [
      { to: "/components/forms", label: "Partneři", icon: Users },
      { to: "/components/feedback", label: "Zakázky", icon: LayoutGrid },
      { to: "/components/navigation", label: "Majetek", icon: Building2, disabled: true },
    ],
  },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/components/navigation", label: "Uživatelé", icon: Users },
  { to: "/components/navigation", label: "Role a oprávnění", icon: KeyRound },
  { to: "/components/navigation", label: "Nastavení firmy", icon: Settings2 },
];

function NavigationPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  return (
    <ShowcaseLayout breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Navigace" }]}>
      <ShowcaseSection
        title="Boční menu se skupinami"
        description="Skupiny se sbalují, aktivní položka je zvýrazněná, nedostupné položky nesou štítek Připravujeme. Které položky se zobrazí, určuje aplikace."
      >
        <div className="rounded-lg border bg-card p-3">
          <div className="grid gap-4 md:grid-cols-2">
            {NAV_GROUPS.map((group) => (
              <div key={group.id}>
                <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </div>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li
                      key={item.label}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                        item.disabled ? "text-muted-foreground" : "hover-surface",
                      )}
                    >
                      {item.icon ? <item.icon className="size-4 shrink-0" /> : null}
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto rounded bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                          {item.badge}
                        </span>
                      ) : null}
                      {item.disabled ? (
                        <span className="ml-auto rounded bg-muted px-1.5 text-[11px]">
                          Připravujeme
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Administrace jako samostatný režim"
        description="Ozubené kolo v horní liště otevře panel Administrace, který překryje boční menu. Zpět do aplikace vede tlačítko nebo klávesa Esc."
      >
        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <span className="font-semibold">
              {adminMode ? "Administrace" : "Slivka Accounting"}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setAdminMode((value) => !value)}
            >
              {adminMode ? "Zpět do aplikace" : "Administrace"}
            </Button>
          </div>
          <ul className="space-y-0.5 p-2">
            {(adminMode ? ADMIN_NAV : NAV_GROUPS[0].items).map((item) => (
              <li
                key={item.label}
                className="hover-surface flex items-center gap-2 rounded-md px-3 py-2 text-sm"
              >
                {item.icon ? <item.icon className="size-4 shrink-0" /> : null}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Oprávnění a jen pro čtení"
        description="PermissionGate obsah skryje nebo zakáže, ReadOnlyBanner vysvětlí důvod nad formulářem."
      >
        <div className="space-y-3">
          <Button variant="outline" size="sm" onClick={() => setCanEdit((value) => !value)}>
            {canEdit ? "Odebrat oprávnění k úpravám" : "Přidělit oprávnění k úpravám"}
          </Button>
          <ReadOnlyBanner reason="Účetní období je uzavřené, doklad lze pouze prohlížet." />
          <div className="flex flex-wrap gap-2">
            <PermissionGate allowed={canEdit} mode="disable" reason="Chybí oprávnění k úpravám">
              <Button>Upravit doklad</Button>
            </PermissionGate>
            <PermissionGate allowed={canEdit} mode="hide">
              <Button variant="destructive">Odstranit doklad</Button>
            </PermissionGate>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection title="Připravovaná stránka" description="Jednotný prázdný stav modulu.">
        <ComingSoon description="Evidence majetku bude dostupná v některém z dalších vydání." />
      </ShowcaseSection>
    </ShowcaseLayout>
  );
}
