/**
 * Evidence záloh se záložkami Zůstatek · Platby záloh · Vyúčtování záloh.
 * Vlastní: řízené záložky, společný „Stav k datu“, filtry, seskupení podle pořadí z dat.
 * Nesmí: počítat součty, zůstatky, rozdíly ani párovat – vše dodává APP v obálce rows/totals/total_count.
 */
import { forwardRef, useMemo, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { cn } from "../../../../lib/utils";
import { formatCodeName } from "../../../../lib/code-format";
import { formatAccountCode } from "../account-code";
import { DataGrid } from "../../grid/DataGrid";
import { AsOfDateToggle, type AsOfDateConfig } from "../../grid/grid-toolbar";
import { GridSegmentedToggle } from "../../grid/grid-segmented-toggle";
import { GridPagination } from "../../grid/grid-pagination";
import { PageTabs } from "../../layout/page-tabs";
import { NoticeBar } from "../../feedback/notice-bar";
import { MultiSelect } from "../../form/multi-select";
import {
  advanceRegisterColumns,
  advanceRegisterSegment,
  buildAdvanceRegisterRows,
  hasAdvanceDifference,
  type AdvanceRegisterDisplayRow,
} from "./advance-register-view-columns";
import type {
  AdvancePaymentsFilter,
  AdvanceRegisterAccountOption,
  AdvanceSettlementsFilter,
  AdvanceRegisterData,
  AdvanceRegisterPagination,
  AdvanceRegisterTab,
  AdvanceRegisterViewFilters,
  AdvanceRegisterViewRow,
} from "./advance-register-view-types";

/** Evidence poskytnutých nebo přijatých záloh; všechny hodnoty z APP. */
export interface AdvanceRegisterViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Řízená záložka. */ activeTab: AdvanceRegisterTab;
  /** Požadavek na změnu záložky. */ onTabChange: (tab: AdvanceRegisterTab) => void;
  /** Obálka dat aktivní záložky. */ data: AdvanceRegisterData;
  /** Základ klíče gridů; záložka se připojí. */ storageKey: string;
  /** Značka domácí měny z dat (sloupce v domácí měně). */ homeCurrency: string;
  /** Společný „Stav k datu“ pro všechny záložky; APP přenačte. */ asOf: AsOfDateConfig;
  /** Řízené filtry. */ filters: AdvanceRegisterViewFilters;
  /** APP přenačte data. */ onFiltersChange: (filters: AdvanceRegisterViewFilters) => void;
  /** Účty pro filtr. */ accountOptions: AdvanceRegisterAccountOption[];
  /** Plátce DPH; false skryje Bez daňového dokladu, Po lhůtě a sloupce DD. */ vatPayer?: boolean;
  /** Text neúplných práv; skryje kontrolní řádky účtů. */ scopeIncomplete?: string;
  /** Řízené stránkování podle total_count. */ pagination?: AdvanceRegisterPagination;
  /** Otevření řádku dokladu. */ onOpen?: (row: AdvanceRegisterViewRow) => void;
  /** Načítání. */ loading?: boolean;
  /** Chyba APP. */ error?: string;
}

/** Preset evidence záloh se záložkami; AdvanceRegisterGrid zůstává beze změny. */
export const AdvanceRegisterView = forwardRef<HTMLDivElement, AdvanceRegisterViewProps>(
  function AdvanceRegisterView(
    {
      activeTab,
      onTabChange,
      data,
      storageKey,
      homeCurrency,
      asOf,
      filters,
      onFiltersChange,
      accountOptions,
      vatPayer = true,
      scopeIncomplete,
      pagination,
      onOpen,
      loading,
      error,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const tab = activeTab;
    const rows = useMemo(
      () => buildAdvanceRegisterRows(data.rows, tab, Boolean(scopeIncomplete), data.totals),
      [data.rows, data.totals, tab, scopeIncomplete],
    );
    const columns = useMemo(
      () => advanceRegisterColumns(tab, t, homeCurrency, vatPayer),
      [tab, t, homeCurrency, vatPayer],
    );
    const segment = useMemo(() => advanceRegisterSegment(tab), [tab]);
    const paymentOptions = [
      { value: "all" as const, label: t.filterAll },
      { value: "unsettled" as const, label: t.unsettled },
      ...(vatPayer
        ? [
            { value: "withoutTaxDocument" as const, label: t.withoutTaxDocumentFilter },
            { value: "overdue" as const, label: t.overdue },
          ]
        : []),
    ];
    const pageSize = pagination?.pageSize ?? 0;
    return (
      <div
        ref={ref}
        className={cn("flex min-w-0 flex-col gap-3", className)}
        data-slot="advance-register-view"
        {...props}
      >
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <PageTabs
            className="min-w-0 flex-1"
            value={tab}
            onValueChange={(value) => onTabChange(value as AdvanceRegisterTab)}
            listLabel={t.registerTabs}
            items={[
              { value: "balance", label: t.tabBalance },
              { value: "payments", label: t.tabPayments },
              { value: "settlements", label: t.tabSettlements },
            ]}
          />
          <div className="pb-1" data-slot="advance-register-as-of">
            <AsOfDateToggle {...asOf} />
          </div>
        </div>
        {scopeIncomplete && <NoticeBar tone="info">{scopeIncomplete}</NoticeBar>}
        <div className="min-w-0">
          <DataGrid<AdvanceRegisterDisplayRow>
            key={tab}
            storageKey={`${storageKey}:${tab}`}
            rows={rows}
            columns={columns}
            rowKey={(row) => row.id}
            title={`${t.register} – ${t[tab === "balance" ? "tabBalance" : tab === "payments" ? "tabPayments" : "tabSettlements"]}`}
            defaultSort={null}
            groupable={false}
            columnFilters={false}
            showTotalRow={false}
            paginated={false}
            sortSegment={segment}
            loading={loading}
            error={error}
            onRowClick={(row) => {
              if (row.rowKind === "detail") onOpen?.(row as AdvanceRegisterViewRow);
            }}
            rowClassName={(row) =>
              cn(
                row.rowKind !== "detail" && "font-semibold",
                row.rowKind === "account_header" && "bg-muted",
                (row.rowKind === "partner_total" || row.rowKind === "account_total") &&
                  "bg-muted/40",
                row.rowKind === "grand_total" && "bg-muted font-bold",
                hasAdvanceDifference(row) && "text-warning-foreground",
              )
            }
            toolbarLeft={
              <>
                {tab === "payments" && (
                  <GridSegmentedToggle
                    ariaLabel={t.filterState}
                    options={paymentOptions}
                    value={filters.payments}
                    defaultValue="all"
                    onChange={(value) =>
                      onFiltersChange({ ...filters, payments: value as AdvancePaymentsFilter })
                    }
                  />
                )}
                {tab === "settlements" && (
                  <GridSegmentedToggle
                    ariaLabel={t.filterState}
                    options={[
                      { value: "all" as const, label: t.filterAll },
                      { value: "unmatched" as const, label: t.unmatchedFilter },
                    ]}
                    value={filters.settlements}
                    defaultValue="all"
                    onChange={(value) =>
                      onFiltersChange({
                        ...filters,
                        settlements: value as AdvanceSettlementsFilter,
                      })
                    }
                  />
                )}
                <MultiSelect
                  aria-label={t.account}
                  className="w-48"
                  options={accountOptions.map((option) => ({
                    value: option.value,
                    label: formatCodeName(formatAccountCode(option.value), option.name),
                  }))}
                  selected={filters.accounts}
                  onChange={(accounts) => onFiltersChange({ ...filters, accounts })}
                  allLabel={t.allAccounts}
                  itemsLabel={t.accountsItems}
                />
              </>
            }
          />
          {pagination && (
            <GridPagination
              page={pagination.page}
              pageSize={pageSize}
              pageCount={pageSize === 0 ? 1 : Math.max(1, Math.ceil(data.total_count / pageSize))}
              total={data.total_count}
              setPage={pagination.onPageChange}
              setPageSize={pagination.onPageSizeChange}
            />
          )}
        </div>
      </div>
    );
  },
);
