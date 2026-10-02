import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AccountCode,
  DataGrid,
  Field,
  FieldGrid,
  FieldValue,
  GridAmountEditor,
  GridRowMenu,
  GridSegmentedToggle,
  GridToggleButton,
  PageLayout,
  PageTabs,
  RecordDialog,
  StatusBadge,
  exceedsMax,
  vsColumn,
  type DataGridColumn,
  type StatusConfig,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fmtAmount, formatDate } from "@/lib/format";
import {
  HOME_CURRENCY_SYMBOL,
  MATCHING_TODAY,
  MOCK_COUNTER_ITEMS,
  MOCK_MATCH_HISTORY,
  MOCK_OPEN_ITEMS,
  daysOverdue,
  remaining,
  type MatchHistoryRow,
  type OpenItem,
  type OpenItemStatus,
} from "@/lib/mock/matching";

const STATUS: StatusConfig<OpenItemStatus> = {
  open: { label: "Otevřená", tone: "info" },
  partial: { label: "Částečně spárovaná", tone: "warning" },
  overdue: { label: "Po splatnosti", tone: "danger" },
};
const statusOf = (item: OpenItem): OpenItemStatus =>
  daysOverdue(item) > 0 ? "overdue" : item.matched > 0 ? "partial" : "open";
const money = (value: number, symbol: string) => `${fmtAmount(value, 2)} ${symbol}`;

type Kind = "receivable" | "payable" | "advance" | "all";
const KIND_OPTIONS = [
  { value: "receivable", label: "Pohledávky" },
  { value: "payable", label: "Závazky" },
  { value: "advance", label: "Zálohy" },
  { value: "all", label: "Saldokonto" },
];
const AGING = [
  { id: "notDue", label: "Do splatnosti", test: (d: number) => d === 0 },
  { id: "d30", label: "1–30", test: (d: number) => d >= 1 && d <= 30 },
  { id: "d90", label: "31–90", test: (d: number) => d >= 31 && d <= 90 },
  { id: "d180", label: "91–180", test: (d: number) => d >= 91 && d <= 180 },
  { id: "d365", label: "181–365", test: (d: number) => d >= 181 && d <= 365 },
  { id: "over", label: "Nad 365", test: (d: number) => d > 365 },
];

/** Ukázka Saldokonta a Párování (preview, do knihovny se nekopíruje). */
export function MatchingShowcase() {
  const [page, setPage] = useState("ledger");
  const [selected, setSelected] = useState<OpenItem>(MOCK_OPEN_ITEMS[1]!);
  const [matchTab, setMatchTab] = useState("counter");
  const open = (item: OpenItem, tab: "counter" | "history") => {
    setSelected(item);
    setMatchTab(tab);
    setPage("matching");
  };
  return (
    <div className="space-y-3">
      <PageTabs
        value={page}
        onValueChange={setPage}
        listLabel="Saldokonto a párování"
        items={[
          { value: "ledger", label: "Saldokonto" },
          { value: "matching", label: "Párování" },
        ]}
      />
      {page === "ledger" ? (
        <LedgerView onOpen={open} />
      ) : (
        <MatchingView item={selected} tab={matchTab} onTabChange={setMatchTab} />
      )}
    </div>
  );
}

function LedgerView({ onOpen }: { onOpen: (item: OpenItem, tab: "counter" | "history") => void }) {
  const [kind, setKind] = useState<Kind>("receivable");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [view, setView] = useState("items");
  const [asOfEnabled, setAsOfEnabled] = useState(true);
  const [asOf, setAsOf] = useState(MATCHING_TODAY);
  const rows = useMemo(
    () =>
      MOCK_OPEN_ITEMS.filter(
        (item) => (kind === "all" || item.kind === kind) && (!overdueOnly || daysOverdue(item) > 0),
      ),
    [kind, overdueOnly],
  );

  const columns = useMemo<DataGridColumn<OpenItem>[]>(
    () => [
      { id: "partner", label: "Partner", width: 220, value: (r) => r.partner },
      {
        id: "account",
        label: "Účet",
        value: (r) => r.account,
        render: (r) => <AccountCode code={r.account} />,
      },
      vsColumn((r) => r.vs, "VS"),
      { id: "document", label: "Doklad", width: 130, value: (r) => r.document },
      {
        id: "date",
        label: "Datum",
        exportType: "date",
        value: (r) => r.date,
        render: (r) => formatDate(r.date),
      },
      {
        id: "due",
        label: "Splatnost",
        exportType: "date",
        value: (r) => r.due,
        render: (r) => formatDate(r.due),
      },
      {
        id: "overdue",
        label: "Dní po splatnosti",
        numeric: true,
        decimals: 0,
        total: "none",
        value: (r) => daysOverdue(r),
      },
      { id: "currency", label: "Měna", value: (r) => r.currency },
      {
        id: "amount",
        label: "Částka",
        numeric: true,
        decimals: 2,
        total: "none",
        value: (r) => r.amount,
      },
      {
        id: "matched",
        label: "Spárováno",
        numeric: true,
        decimals: 2,
        total: "none",
        value: (r) => r.matched,
      },
      {
        id: "remaining",
        label: "Zbývá",
        numeric: true,
        decimals: 2,
        total: "none",
        value: (r) => remaining(r),
      },
      {
        id: "remainingHome",
        label: `Zbývá v ${HOME_CURRENCY_SYMBOL}`,
        numeric: true,
        decimals: 2,
        value: (r) => Math.round(remaining(r) * r.rate * 100) / 100,
      },
      {
        id: "status",
        label: "Stav",
        value: (r) => STATUS[statusOf(r)].label,
        render: (r) => <StatusBadge status={statusOf(r)} config={STATUS} />,
      },
    ],
    [],
  );

  type AgingRow = { partner: string } & Record<string, number | string>;
  const agingRows = useMemo<AgingRow[]>(() => {
    const map = new Map<string, AgingRow>();
    for (const item of rows) {
      const row = map.get(item.partner) ?? {
        partner: item.partner,
        ...Object.fromEntries(AGING.map((a) => [a.id, 0])),
        total: 0,
      };
      const home = remaining(item) * item.rate;
      const bucket = AGING.find((a) => a.test(daysOverdue(item)))!;
      row[bucket.id] = (row[bucket.id] as number) + home;
      row.total = (row.total as number) + home;
      map.set(item.partner, row);
    }
    return [...map.values()];
  }, [rows]);
  const agingColumns = useMemo<DataGridColumn<AgingRow>[]>(
    () => [
      { id: "partner", label: "Partner", width: 260, value: (r) => r.partner },
      ...AGING.map((a) => ({
        id: a.id,
        label: a.label,
        numeric: true,
        decimals: 2,
        value: (r: AgingRow) => r[a.id] as number,
      })),
      { id: "total", label: "Celkem", numeric: true, decimals: 2, value: (r) => r.total as number },
    ],
    [],
  );

  const context = (
    <div className="flex flex-wrap items-center gap-2">
      <GridSegmentedToggle
        label="Druh:"
        options={KIND_OPTIONS}
        value={kind}
        onChange={(v) => setKind(v as Kind)}
        defaultValue="receivable"
        ariaLabel="Druh saldokonta"
      />
      <GridToggleButton
        tone="grouping"
        pressed={overdueOnly}
        onClick={() => setOverdueOnly((v) => !v)}
      >
        Jen po splatnosti
      </GridToggleButton>
      <GridSegmentedToggle
        options={[
          { value: "items", label: "Položky" },
          { value: "aging", label: "Věková struktura" },
        ]}
        value={view}
        onChange={setView}
        defaultValue="items"
        ariaLabel="Pohled saldokonta"
      />
    </div>
  );
  const asOfConfig = {
    enabled: asOfEnabled,
    onEnabledChange: setAsOfEnabled,
    value: asOf,
    onChange: setAsOf,
    defaultDate: MATCHING_TODAY,
    texts: { label: "Stav k datu" },
  };

  return (
    <div className="h-[44rem]">
      <PageLayout variant="list">
        {view === "items" ? (
          <DataGrid<OpenItem>
            storageKey="ds-showcase-ledger"
            title="Saldokonto"
            exportName="saldokonto"
            rows={rows}
            columns={columns}
            rowKey={(r) => r.id}
            defaultGroupBy="partner"
            groupTotals="row"
            paginated={false}
            contextRight={context}
            asOf={asOfConfig}
            toolbarLeft={
              <Button
                size="sm"
                variant="outline"
                className="grid-toolbar-control"
                onClick={() => toast.success("Automatické párování dokončeno: 2 páry")}
              >
                Spárovat automaticky
              </Button>
            }
            rowActions={(r) => (
              <GridRowMenu
                items={[
                  { id: "match", label: "Párovat…", onSelect: () => onOpen(r, "counter") },
                  {
                    id: "history",
                    label: "Historie párování",
                    onSelect: () => onOpen(r, "history"),
                  },
                ]}
              />
            )}
            onRowClick={(r) => onOpen(r, "counter")}
          />
        ) : (
          <DataGrid<AgingRow>
            storageKey="ds-showcase-aging"
            title="Věková struktura"
            exportName="vekova-struktura"
            rows={agingRows}
            columns={agingColumns}
            rowKey={(r) => r.partner}
            groupable={false}
            paginated={false}
            contextRight={context}
            asOf={asOfConfig}
          />
        )}
      </PageLayout>
    </div>
  );
}

function MatchingView({
  item,
  tab,
  onTabChange,
}: {
  item: OpenItem;
  tab: string;
  onTabChange: (tab: string) => void;
}) {
  const [sameVs, setSameVs] = useState(false);
  const [samePartner, setSamePartner] = useState(true);
  const [sameAmount, setSameAmount] = useState(false);
  const [sameAccount, setSameAccount] = useState(false);
  const [type, setType] = useState("all");
  const [keys, setKeys] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number | null>>({});
  const [history, setHistory] = useState<MatchHistoryRow[]>(MOCK_MATCH_HISTORY);
  const [cancelGroup, setCancelGroup] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const itemRemaining = remaining(item);
  const symbol = item.currencySymbol;

  const counterRows = useMemo(
    () =>
      MOCK_COUNTER_ITEMS.filter(
        (c) =>
          (!sameVs || c.vs === item.vs) &&
          (!samePartner || c.partner === item.partner) &&
          (!sameAmount || remaining(c) === itemRemaining) &&
          (!sameAccount || c.account === item.account) &&
          (type === "all" ||
            (type === "payments" ? c.source === "payment" : c.source === "document")),
      ),
    [sameVs, samePartner, sameAmount, sameAccount, type, item, itemRemaining],
  );

  const amountOf = (row: OpenItem) => amounts[row.id] ?? Math.min(remaining(row), itemRemaining);
  const errorOf = (row: OpenItem) =>
    exceedsMax(amountOf(row), remaining(row))
      ? `Částka převyšuje zbývající ${money(remaining(row), row.currencySymbol)}`
      : undefined;
  const changeKeys = (next: string[]) => {
    setKeys(next);
    setAmounts((cur) =>
      Object.fromEntries(Object.entries(cur).filter(([id]) => next.includes(id))),
    );
  };

  const columns = useMemo<DataGridColumn<OpenItem>[]>(
    () => [
      { id: "document", label: "Doklad", width: 130, value: (r) => r.document },
      {
        id: "date",
        label: "Datum",
        exportType: "date",
        value: (r) => r.date,
        render: (r) => formatDate(r.date),
      },
      { id: "partner", label: "Partner", width: 220, value: (r) => r.partner },
      vsColumn((r) => r.vs, "VS"),
      {
        id: "account",
        label: "Účet",
        value: (r) => r.account,
        render: (r) => <AccountCode code={r.account} />,
      },
      {
        id: "remaining",
        label: "Zbývá",
        numeric: true,
        decimals: 2,
        total: "none",
        value: (r) => remaining(r),
      },
      {
        id: "matchAmount",
        label: "Párovat částkou",
        numeric: true,
        decimals: 2,
        width: 160,
        total: "sumSelected",
        value: (r) => (keys.includes(r.id) ? amountOf(r) : null),
        editor: (r) => (
          <GridAmountEditor
            value={amountOf(r)}
            max={remaining(r)}
            onChange={(value) => setAmounts((cur) => ({ ...cur, [r.id]: value }))}
            invalid={Boolean(errorOf(r))}
            invalidMessage={errorOf(r)}
            ariaLabel={`Párovat částkou ${r.document}`}
          />
        ),
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [keys, amounts, itemRemaining],
  );

  const selectedRows = MOCK_COUNTER_ITEMS.filter((r) => keys.includes(r.id));
  const total = selectedRows.reduce((sum, r) => sum + (amountOf(r) ?? 0), 0);
  const hasError = selectedRows.some((r) => errorOf(r)) || exceedsMax(total, itemRemaining);

  const historyColumns = useMemo<DataGridColumn<MatchHistoryRow>[]>(
    () => [
      { id: "group", label: "Párování", value: (r) => r.group },
      {
        id: "date",
        label: "Datum",
        exportType: "date",
        value: (r) => r.date,
        render: (r) => (
          <span className={r.cancelled ? "text-muted-foreground line-through" : undefined}>
            {formatDate(r.date)}
          </span>
        ),
      },
      {
        id: "document",
        label: "Doklad",
        value: (r) => r.document,
        render: (r) => (
          <span className={r.cancelled ? "text-muted-foreground" : undefined}>{r.document}</span>
        ),
      },
      vsColumn((r) => r.vs, "VS"),
      {
        id: "amount",
        label: "Částka",
        numeric: true,
        decimals: 2,
        total: "none",
        value: (r) => r.amount,
        render: (r) => (
          <span className={r.cancelled ? "text-muted-foreground" : undefined}>
            {money(r.amount, r.currencySymbol)}
          </span>
        ),
      },
      { id: "user", label: "Uživatel", value: (r) => r.user },
      {
        id: "state",
        label: "Stav",
        value: (r) => (r.cancelled ? `Zrušeno – ${r.reason ?? ""}` : "Platné"),
        render: (r) => (
          <StatusBadge
            status={r.cancelled ? "cancelled" : "active"}
            config={{
              active: { label: "Platné", tone: "success" },
              cancelled: { label: "Zrušeno", tone: "neutral" },
            }}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="h-[48rem]">
      <PageLayout variant="list">
        <FieldGrid cols={4} title="Vybraná položka">
          <Field label="Doklad">
            <FieldValue>{item.document}</FieldValue>
          </Field>
          <Field label="Partner">
            <FieldValue>{item.partner}</FieldValue>
          </Field>
          <Field label="VS">
            <FieldValue>{item.vs || "—"}</FieldValue>
          </Field>
          <Field label="Účet">
            <FieldValue>
              <AccountCode code={item.account} />
            </FieldValue>
          </Field>
          <Field label="Měna">
            <FieldValue>{item.currency}</FieldValue>
          </Field>
          <Field label="Částka">
            <FieldValue className="num">{money(item.amount, symbol)}</FieldValue>
          </Field>
          <Field label="Spárováno">
            <FieldValue className="num">{money(item.matched, symbol)}</FieldValue>
          </Field>
          <Field label="Zbývá">
            <FieldValue className="num font-semibold">{money(itemRemaining, symbol)}</FieldValue>
          </Field>
        </FieldGrid>
        <PageTabs
          value={tab}
          onValueChange={onTabChange}
          listLabel="Párování"
          items={[
            { value: "counter", label: "Protipoložky" },
            { value: "history", label: "Historie párování" },
          ]}
        />
        {tab === "counter" ? (
          <DataGrid<OpenItem>
            storageKey="ds-showcase-matching-counter"
            title="Protipoložky"
            rows={counterRows}
            columns={columns}
            rowKey={(r) => r.id}
            selectMode
            selectedKeys={keys}
            onSelectedKeysChange={changeKeys}
            groupable={false}
            paginated={false}
            contextRight={
              <div className="flex flex-wrap items-center gap-2">
                <GridToggleButton
                  tone="grouping"
                  pressed={sameVs}
                  onClick={() => setSameVs((v) => !v)}
                >
                  Stejný VS
                </GridToggleButton>
                <GridToggleButton
                  tone="grouping"
                  pressed={samePartner}
                  onClick={() => setSamePartner((v) => !v)}
                >
                  Stejný partner
                </GridToggleButton>
                <GridToggleButton
                  tone="grouping"
                  pressed={sameAmount}
                  onClick={() => setSameAmount((v) => !v)}
                >
                  Stejná částka
                </GridToggleButton>
                <GridToggleButton
                  tone="grouping"
                  pressed={sameAccount}
                  onClick={() => setSameAccount((v) => !v)}
                >
                  Stejný účet
                </GridToggleButton>
                <GridSegmentedToggle
                  label="Typ:"
                  options={[
                    { value: "documents", label: "Doklady" },
                    { value: "payments", label: "Platby" },
                    { value: "all", label: "Vše" },
                  ]}
                  value={type}
                  onChange={setType}
                  defaultValue="all"
                  ariaLabel="Typ protipoložky"
                />
              </div>
            }
            selectionActions={() => (
              <Button
                size="sm"
                disabled={hasError || keys.length === 0}
                onClick={() => {
                  toast.success(`Spárováno ${money(total, symbol)}`);
                  changeKeys([]);
                }}
              >
                Spárovat
              </Button>
            )}
            selectionSummary={(rows) => (
              <span className={hasError ? "text-destructive" : "text-muted-foreground"}>
                Vybráno {fmtAmount(rows.length, 0)} · Páruje se{" "}
                <span className="num font-semibold text-foreground">{money(total, symbol)}</span> ·
                Zbude{" "}
                <span className="num font-semibold text-foreground">
                  {money(itemRemaining - total, symbol)}
                </span>
              </span>
            )}
          />
        ) : (
          <DataGrid<MatchHistoryRow>
            storageKey="ds-showcase-matching-history"
            title="Historie párování"
            rows={history}
            columns={historyColumns}
            rowKey={(r) => r.id}
            defaultGroupBy="group"
            paginated={false}
            rowActions={(r) =>
              r.cancelled ? null : (
                <GridRowMenu
                  items={[
                    {
                      id: "cancel",
                      label: "Zrušit párování",
                      destructive: true,
                      onSelect: () => {
                        setReason("");
                        setCancelGroup(r.group);
                      },
                    },
                  ]}
                />
              )
            }
          />
        )}
        <RecordDialog
          open={cancelGroup !== null}
          onOpenChange={(o) => {
            if (!o) setCancelGroup(null);
          }}
          title={`Zrušit párování ${cancelGroup ?? ""}`}
          submitLabel="Zrušit párování"
          onSubmit={() => {
            if (!reason.trim()) {
              toast.error("Vyplňte důvod zrušení");
              return;
            }
            setHistory((cur) =>
              cur.map((h) =>
                h.group === cancelGroup ? { ...h, cancelled: true, reason: reason.trim() } : h,
              ),
            );
            toast.success("Párování bylo zrušeno");
            setCancelGroup(null);
          }}
        >
          <Field label="Důvod zrušení" error={reason.trim() ? undefined : "Důvod je povinný"}>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </Field>
        </RecordDialog>
      </PageLayout>
    </div>
  );
}
