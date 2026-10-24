/**
 * Rozpis výpisu s rozpoznáním (I3).
 * Vlastní: grid pohybů, řádek návrhu, filtr stavu, akce lišty, pruh importu a souhrn.
 * Nesmí: rozpoznávat, párovat ani ukládat – data a akce dodává aplikace přes props.
 */
import { useMemo, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { NoticeBar } from "../feedback/notice-bar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { AccountSelect, type AccountOption } from "../accounting/account-select";
import { PartnerSelect } from "../accounting/partner-select";
import { MultiValueCell } from "../data-display/multi-value-cell";
import { BankReconcileSuggestionRow } from "./bank-reconcile-suggestion";
import { useDsTexts } from "../../../ds-texts";
import { amountClass, formatAmount, formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type {
  BankImportInfo,
  BankMovementRow,
  BankReconcileStatus,
  BankReconcileSummary,
} from "./bank-types";
import type { BookkeepingMode } from "../tax-records/tax-record-types";

/** Položka filtru stavu s počtem. */
export interface BankReconcileStatusFilter {
  /** Klíč stavu; null = vše. */
  status: BankReconcileStatus | null;
  /** Počet pohybů. */
  count: number;
}

/** Props rozpisu výpisu. */
export interface BankStatementReconcileViewProps {
  /** Klíč uložení nastavení gridu. */
  storageKey: string;
  /** Pohyby výpisu. */
  rows: BankMovementRow[];
  /** Účty / položky pro výběr v buňce. */
  accounts: AccountOption[];
  /** Partneři pro výběr v buňce. */
  partners: { id: string; name: string; ico?: string; active?: boolean }[];
  /** Změna doplněných údajů pohybu. */
  onPatch: (rowId: string, patch: Partial<BankMovementRow>) => void;
  /** Přijetí návrhu. */
  onAcceptSuggestion: (rowId: string, candidateId?: string) => void;
  /** Odmítnutí návrhu. */
  onRejectSuggestion: (rowId: string) => void;
  /** Zařadit vše jisté. */
  onFileCertain: () => void;
  /** Zařadit vybrané. */
  onFileSelected: (ids: string[]) => void;
  /** Přijmout návrhy vybraných. */
  onAcceptSelected?: (ids: string[]) => void;
  /** Znovu rozpoznat. */
  onRecognize: () => void;
  /** Vytvořit pravidlo z pohybu. */
  onCreateRule: (rowId: string) => void;
  /** Otevřít doklad zařazeného pohybu. */
  onOpenDocument: (id: string) => void;
  /** Pruh importu. */
  importInfo?: BankImportInfo;
  /** Souhrn ve spodní liště. */
  summary: BankReconcileSummary;
  /** Režim evidence (účet / položka DE). */
  bookkeepingMode?: BookkeepingMode;
  /** Zobrazit sloupec kategorie. */
  categoriesEnabled?: boolean;
  /** Výběr kategorie v buňce. */
  categorySelect?: (row: BankMovementRow) => ReactNode;
  /** Popisky dimenzí řádku (MultiValueCell). */
  dimensionValues?: (row: BankMovementRow) => { label: string; inactive?: boolean }[];
  /** Zdroj rozpoznání – popisek bubliny. */
  sourceLabel?: (row: BankMovementRow) => string | null;
  /** Probíhá operace. */
  busy?: boolean;
  /** Jen pro čtení. */
  readOnly?: boolean;
}

/** Rozpis výpisu nad DataGrid s návrhy a akcemi zařazení. */
export function BankStatementReconcileView(props: BankStatementReconcileViewProps) {
  const {
    storageKey,
    rows,
    accounts,
    partners,
    onPatch,
    onAcceptSuggestion,
    onRejectSuggestion,
    onFileCertain,
    onFileSelected,
    onAcceptSelected,
    onRecognize,
    onCreateRule,
    onOpenDocument,
    importInfo,
    summary,
    bookkeepingMode = "accrual",
    categoriesEnabled = true,
    categorySelect,
    dimensionValues,
    sourceLabel,
    busy,
    readOnly,
  } = props;
  const t = useDsTexts().bankReconcile;
  const [statusFilter, setStatusFilter] = useState<BankReconcileStatus | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeRow, setActiveRow] = useState<string | null>(null);

  const counts = useMemo(() => {
    const map = new Map<BankReconcileStatus, number>();
    for (const row of rows) map.set(row.status, (map.get(row.status) ?? 0) + 1);
    return map;
  }, [rows]);
  const filtered = statusFilter ? rows.filter((r) => r.status === statusFilter) : rows;
  const certainCount = counts.get("certain") ?? 0;
  const editable = (row: BankMovementRow) => !readOnly && row.status !== "filed";

  const statusLabels: Record<BankReconcileStatus, string> = {
    certain: t.statusCertain,
    suggestion: t.statusSuggestion,
    unrecognized: t.statusUnrecognized,
    filed: t.statusFiled,
  };
  const filters: BankReconcileStatusFilter[] = [
    { status: null, count: rows.length },
    { status: "certain", count: certainCount },
    { status: "suggestion", count: counts.get("suggestion") ?? 0 },
    { status: "unrecognized", count: counts.get("unrecognized") ?? 0 },
    { status: "filed", count: counts.get("filed") ?? 0 },
  ];
  const filterLabels = [t.filterAll, t.filterCertain, t.filterSuggestions, t.filterUnrecognized, t.filterFiled];

  const columns: DataGridColumn<BankMovementRow>[] = [
    { id: "order", label: t.order, value: (r) => r.order, numeric: true, width: 64 },
    { id: "date", label: t.date, value: (r) => formatDate(r.date), sortValue: (r) => r.date, fitContent: true },
    {
      id: "direction",
      label: t.direction,
      value: (r) => (r.direction === "in" ? t.directionIn : t.directionOut),
      render: (r) =>
        r.direction === "in" ? (
          <ArrowDownLeft className="size-4 text-success" aria-label={t.directionIn} />
        ) : (
          <ArrowUpRight className="size-4 text-destructive" aria-label={t.directionOut} />
        ),
      width: 56,
    },
    {
      id: "amount",
      label: t.amount,
      numeric: true,
      value: (r) => r.amount,
      render: (r) => (
        <span className={cn("tabular-nums", r.direction === "out" && "text-destructive")}>
          {r.direction === "out" ? "−" : ""}
          {formatAmount(r.amount)}
        </span>
      ),
    },
    {
      id: "counterparty",
      label: t.counterparty,
      value: (r) => `${r.counterAccount ?? ""} ${r.counterpartyName ?? ""}`.trim() || null,
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate font-mono tabular-nums">{r.counterAccount}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {r.counterpartyName}
          </span>
        </span>
      ),
    },
    {
      id: "symbols",
      label: t.symbols,
      value: (r) => [r.vs, r.ks, r.ss].filter(Boolean).join(" / ") || null,
      render: (r) => (
        <span className="font-mono tabular-nums">
          {[r.vs, r.ks, r.ss].filter(Boolean).join(" / ")}
        </span>
      ),
      defaultVisible: false,
    },
    { id: "message", label: t.message, value: (r) => r.message ?? null },
    {
      id: "account",
      label: t.account,
      value: (r) => r.accountCode ?? null,
      render: (r) =>
        editable(r) ? (
          <AccountSelect
            accounts={accounts}
            value={r.accountCode}
            onChange={(code) => onPatch(r.id, { accountCode: code })}
            bookkeepingMode={bookkeepingMode}
            ariaLabel={t.account}
          />
        ) : (
          (r.accountCode ?? "")
        ),
    },
    {
      id: "partner",
      label: t.partner,
      value: (r) => partners.find((p) => p.id === r.partnerId)?.name ?? null,
      render: (r) =>
        editable(r) ? (
          <PartnerSelect
            partners={partners}
            value={r.partnerId ?? null}
            onChange={(id) => onPatch(r.id, { partnerId: id })}
          />
        ) : (
          (partners.find((p) => p.id === r.partnerId)?.name ?? "")
        ),
    },
    ...(categoriesEnabled && categorySelect
      ? [
          {
            id: "category",
            label: t.category,
            value: (r: BankMovementRow) => r.categoryId ?? null,
            render: (r: BankMovementRow) => categorySelect(r),
          } satisfies DataGridColumn<BankMovementRow>,
        ]
      : []),
    ...(dimensionValues
      ? [
          {
            id: "dimensions",
            label: t.dimensions,
            value: (r: BankMovementRow) =>
              dimensionValues(r)
                .map((v) => v.label)
                .join(", ") || null,
            render: (r: BankMovementRow) => <MultiValueCell values={dimensionValues(r)} />,
            defaultVisible: false,
          } satisfies DataGridColumn<BankMovementRow>,
        ]
      : []),
    {
      id: "description",
      label: t.description,
      value: (r) => r.description ?? null,
      defaultVisible: false,
    },
    {
      id: "status",
      label: t.status,
      value: (r) => statusLabels[r.status],
      render: (r) => (
        <Badge
          variant={
            r.status === "certain" ? "default" : r.status === "filed" ? "secondary" : "outline"
          }
        >
          {statusLabels[r.status]}
        </Badge>
      ),
    },
    {
      id: "source",
      label: t.source,
      value: (r) => sourceLabel?.(r) ?? null,
      render: (r) => {
        const label = sourceLabel?.(r);
        if (!label) return null;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-4 text-muted-foreground" aria-label={label} />
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      },
      width: 48,
    },
  ];

  const difference = summary.bankClosing - summary.closing;
  const summaryItems: [string, number, boolean][] = [
    [t.summaryOpening, summary.opening, false],
    [t.summaryIncome, summary.income, false],
    [t.summaryExpense, summary.expense, false],
    [t.summaryClosing, summary.closing, false],
    [t.summaryBankClosing, summary.bankClosing, false],
    [t.summaryDifference, difference, true],
  ];

  return (
    <div
      data-slot="bank-statement-reconcile-view"
      className="min-w-0 space-y-3"
      onKeyDown={(event) => {
        if (event.defaultPrevented || !(event.ctrlKey || event.metaKey)) return;
        if (event.key !== "Enter" || !activeRow) return;
        const row = rows.find((r) => r.id === activeRow);
        if (row?.suggestion && editable(row)) {
          event.preventDefault();
          onAcceptSuggestion(row.id, row.suggestion.candidateId ?? undefined);
        }
      }}
    >
      {importInfo ? (
        <NoticeBar tone="info">
          <span className="flex flex-wrap items-center gap-2">
            {importInfo.kind === "file"
              ? t.importFile.replace("{date}", importInfo.date).replace("{file}", importInfo.file)
              : t.importApi
                  .replace("{date}", importInfo.date)
                  .replace("{count}", String(importInfo.newCount))}
            {importInfo.kind === "file" && importInfo.onDownload ? (
              <Button type="button" variant="link" className="h-auto p-0" onClick={importInfo.onDownload}>
                {t.downloadOriginal}
              </Button>
            ) : null}
            {importInfo.kind === "file" && importInfo.onCancel ? (
              <Button type="button" variant="link" className="h-auto p-0" onClick={importInfo.onCancel}>
                {t.cancelImport}
              </Button>
            ) : null}
          </span>
        </NoticeBar>
      ) : null}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.status}>
        {filters.map((f, i) => (
          <Button
            key={f.status ?? "all"}
            type="button"
            size="sm"
            variant={statusFilter === f.status ? "default" : "outline"}
            aria-pressed={statusFilter === f.status}
            onClick={() => setStatusFilter(f.status)}
          >
            {filterLabels[i]} ({f.count})
          </Button>
        ))}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" disabled={!certainCount || busy || readOnly} onClick={onFileCertain}>
            {t.fileAllCertain.replace("{count}", String(certainCount))}
          </Button>
          {onAcceptSelected ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!selected.length || busy || readOnly}
              onClick={() => onAcceptSelected(selected)}
            >
              {t.acceptSelected}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!selected.length || busy || readOnly}
            onClick={() => onFileSelected(selected)}
          >
            {t.fileSelected}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={busy || readOnly} onClick={onRecognize}>
            {t.recognizeAgain}
          </Button>
        </span>
      </div>
      <DataGrid
        storageKey={storageKey}
        title={t.title}
        rows={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        onRowClick={(r) => setActiveRow(r.id)}
        onRowOpen={(r) => {
          if (r.status === "filed" && r.documentId) onOpenDocument(r.documentId);
        }}
        emptyTitle={t.empty}
        rowClassName={(r) => (r.status === "filed" ? "text-muted-foreground" : undefined)}
        searchText={(r) => `${r.message ?? ""} ${r.counterpartyName ?? ""} ${r.vs ?? ""}`}
      />
      {activeRow
        ? (() => {
            const row = rows.find((r) => r.id === activeRow);
            if (!row?.suggestion || row.status === "filed") return null;
            return (
              <BankReconcileSuggestionRow
                row={row}
                currencySymbol={summary.currencySymbol}
                readOnly={readOnly}
                onAccept={onAcceptSuggestion}
                onReject={onRejectSuggestion}
                onCandidateChange={(rowId, candidateId) =>
                  onPatch(rowId, { suggestion: { ...row.suggestion!, candidateId } })
                }
              />
            );
          })()
        : null}
      <div
        data-slot="bank-reconcile-summary"
        className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg border bg-muted/40 px-4 py-2 text-sm"
      >
        {summaryItems.map(([label, value, isDifference]) => (
          <span key={label} className="flex items-baseline gap-1">
            <span className="text-muted-foreground">{label}</span>
            <span
              className={cn(
                "font-mono tabular-nums",
                isDifference && value !== 0 ? "font-semibold text-destructive" : amountClass(value),
              )}
            >
              {formatAmount(value)} {summary.currencySymbol}
            </span>
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t.acceptShortcut}</p>
    </div>
  );
}
