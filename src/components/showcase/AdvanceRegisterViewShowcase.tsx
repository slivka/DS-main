/** Ukázka evidence záloh se záložkami · simuluje APP lokálním stavem · nic nepersistuje. */
import { useState } from "react";
import { toast } from "sonner";
import { AdvanceRegisterView } from "../ds/accounting/advances/advance-register-view";
import type {
  AdvanceRegisterTab,
  AdvanceRegisterViewFilters,
} from "../ds/accounting/advances/advance-register-view-types";
import { Button } from "../ui/button";
import { ShowcaseSection } from "./ShowcaseLayout";
import { advanceAccounts, advanceRegisterData } from "./advance-register-view-data";

function RegisterExample({ side, title }: { side: "provided" | "received"; title: string }) {
  const [tab, setTab] = useState<AdvanceRegisterTab>("balance");
  const [asOf, setAsOf] = useState(true);
  const [date, setDate] = useState("2026-10-20");
  const [vatPayer, setVatPayer] = useState(true);
  const [scope, setScope] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(0);
  const [filters, setFilters] = useState<AdvanceRegisterViewFilters>({
    payments: "all",
    settlements: "all",
    accounts: [],
  });
  const state =
    tab === "payments" ? filters.payments : tab === "settlements" ? filters.settlements : "all";
  return (
    <ShowcaseSection title={title}>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" aria-pressed={!vatPayer} onClick={() => setVatPayer(!vatPayer)}>
          Neplátce DPH
        </Button>
        <Button variant="outline" aria-pressed={scope} onClick={() => setScope(!scope)}>
          Neúplná práva
        </Button>
      </div>
      <AdvanceRegisterView
        data-testid={`advance-register-view-${side}`}
        storageKey={`advance-register-view-${side}`}
        activeTab={tab}
        onTabChange={setTab}
        data={advanceRegisterData(side, tab, filters.accounts, state)}
        homeCurrency="Kč"
        asOf={{ enabled: asOf, onEnabledChange: setAsOf, value: date, onChange: setDate }}
        filters={filters}
        onFiltersChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        accountOptions={advanceAccounts(side)}
        vatPayer={vatPayer}
        {...(scope
          ? {
              scopeIncomplete:
                "Nemáte přístup ke všem střediskům, kontrola proti účtům se nezobrazí.",
            }
          : {})}
        pagination={{ page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
        onOpen={(row) => toast(row.document ?? row.partner ?? row.id)}
      />
    </ShowcaseSection>
  );
}

/** Poskytnuté (314) a přijaté (324) zálohy. */
export function AdvanceRegisterViewShowcase() {
  return (
    <>
      <RegisterExample side="provided" title="Evidence poskytnutých záloh" />
      <RegisterExample side="received" title="Evidence přijatých záloh" />
    </>
  );
}
