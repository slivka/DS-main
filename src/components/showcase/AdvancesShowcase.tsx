/** Ukázka záloh · vlastní lokální interakce · nikdy nepersistuje doménová data. */
import { useState } from "react";
import { toast } from "sonner";
import { AdvancePaymentBreakdown } from "../ds/accounting/advances/advance-payment-breakdown";
import { AdvanceAllocationDialog } from "../ds/accounting/advances/advance-allocation-dialog";
import { AdvanceCorrectionDialog } from "../ds/accounting/advances/advance-correction-dialog";
import { AdvanceReasonDialog } from "../ds/accounting/advances/advance-reason-dialog";
import { AdvanceRegisterGrid } from "../ds/accounting/advances/advance-register-grid";
import type {
  AdvanceAllocation,
  AdvancePaymentPlane,
} from "../ds/accounting/advances/advance-types";
import { Button } from "../ui/button";
import { useDsTexts } from "../../ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";
import { ADVANCE_CURRENCY, ADVANCE_TOTALS, ADVANCE_REGISTER } from "./advance-showcase-data";
import { AdvanceFormsShowcase } from "./AdvanceFormsShowcase";
export function AdvancesShowcase() {
  const t = useDsTexts().advances;
  const [allocation, setAllocation] = useState<"list" | "taxDocument" | null>(null);
  const [value, setValue] = useState<AdvanceAllocation[]>([]);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState({ reason: "", note: "" });
  const [correction, setCorrection] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [filters, setFilters] = useState({ overdue: false, withoutDD: false });
  const [date, setDate] = useState("2026-10-20");
  const [asOf, setAsOf] = useState(false);
  const plane = (kind: "lists" | "taxDocuments"): AdvancePaymentPlane => ({
    settlement: [
      {
        id: kind,
        label: t[kind],
        settled: kind === "lists" ? "1 815,00" : "1 500,00",
        total: "2 000,00",
        remaining: kind === "lists" ? "185,00" : "500,00",
        currency: ADVANCE_CURRENCY.symbol,
        progress: kind === "lists" ? 90.75 : 75,
      },
    ],
    links: {
      mode: "list",
      onModeChange: () => {},
      collapsedGroups: collapsed,
      onCollapsedGroupsChange: setCollapsed,
      onOpen: (item) => toast(item.number),
      onRemove: (item) => toast(`${t.remove}: ${item.number}`),
      groups: [
        {
          id: kind,
          label: t[kind],
          items:
            kind === "lists"
              ? [
                  {
                    id: "zl1",
                    number: "ZFV 2026001",
                    at: "2026-10-01",
                    amount: "1 000,00",
                    removable: true,
                  },
                  {
                    id: "zl2",
                    number: "ZFV 2026002",
                    at: "2026-10-01",
                    amount: "815,00",
                    removable: false,
                    removeDisabledReason: "Stornovaný zbytek 185,00",
                  },
                ]
              : [
                  {
                    id: "dd1",
                    number: "DDPZ 2026001",
                    at: "2026-10-02",
                    amount: "1 500,00",
                    removable: true,
                  },
                ],
        },
      ],
    },
  });
  const openAllocation = (target: "list" | "taxDocument") => {
    setValue([]);
    setAllocation(target);
  };
  return (
    <>
      <ShowcaseSection title={t.breakdown}>
        <div className="max-w-3xl" data-testid="advance-breakdown-example">
          <AdvancePaymentBreakdown
            totals={ADVANCE_TOTALS}
            currency={ADVANCE_CURRENCY.symbol}
            planes={{ lists: plane("lists"), taxDocuments: plane("taxDocuments") }}
            taxStatus="partial"
            deadline={{ days: 15, label: "16.10.2026", overdue: true }}
            actions={{
              assignList: { can: true, onClick: () => openAllocation("list") },
              cancelRemainder: { can: false, reason: "Zbytek již stornován", onClick: () => {} },
              issueTaxDocument: { can: true, onClick: () => openAllocation("taxDocument") },
              markNoTaxDocument: { can: true, onClick: () => setReasonOpen(true) },
            }}
          />
        </div>
        <Button variant="outline" onClick={() => setCorrection(true)}>
          {t.corrective}
        </Button>
      </ShowcaseSection>
      <AdvanceFormsShowcase />
      <ShowcaseSection title={t.register}>
        <AdvanceRegisterGrid
          storageKey="advance-register-example"
          rows={ADVANCE_REGISTER.filter(
            (row) => (!filters.overdue || row.overdue) && (!filters.withoutDD || row.withoutDD),
          )}
          filters={filters}
          onFiltersChange={setFilters}
          asOf={{ enabled: asOf, onEnabledChange: setAsOf, value: date, onChange: setDate }}
          onOpen={(row) => toast(row.partner)}
        />
      </ShowcaseSection>
      <AdvanceAllocationDialog
        open={allocation !== null}
        onOpenChange={(open) => {
          if (!open) setAllocation(null);
        }}
        target={allocation ?? "list"}
        storageKey="advance-allocation-example"
        remaining={2000}
        currency={ADVANCE_CURRENCY.symbol}
        candidates={[
          { id: "zl1", document: "ZFV 2026001", remaining: 1000, defaultAmount: 1000 },
          { id: "zl2", document: "ZFV 2026002", remaining: 815, defaultAmount: 815 },
        ]}
        value={value}
        onChange={setValue}
        dirty={value.length > 0}
        onAllocate={() => {
          setAllocation(null);
          toast(t.allocate);
        }}
      />
      <AdvanceReasonDialog
        open={reasonOpen}
        onOpenChange={setReasonOpen}
        title={t.markNoTaxDocument}
        reasons={[
          { value: "outside", label: "Platba mimo režim DPH" },
          { value: "other", label: "Jiný důvod" },
        ]}
        value={reason}
        onChange={setReason}
        dirty={Boolean(reason.reason || reason.note)}
        onConfirm={() => {
          setReasonOpen(false);
          toast(t.confirm);
        }}
      />
      <AdvanceCorrectionDialog
        open={correction}
        onOpenChange={setCorrection}
        storageKey="advance-correction-example"
        rows={[{ id: "refund", document: "DDPZ 2026001", base: -413.22, vat: -86.78 }]}
        onDecision={(create) => {
          setCorrection(false);
          toast(create ? t.create : t.doNotCreate);
        }}
      />
    </>
  );
}
