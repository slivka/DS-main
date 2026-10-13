/**
 * Formulář bankovního výpisu.
 * Vlastní: rozvržení, odvozené zůstatky a prezentaci stavů.
 * Nesmí: ukládat data, kontrolovat výpis ani spravovat položky aplikace.
 */
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useDsTexts, type BankStatementTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { BankStatementBasic, BankStatementBalanceSection } from "./bank-statement-sections";
import { PageLayout } from "../layout/page-layout";
import { PageHeader } from "../layout/page-header";
import { SectionHeading } from "../layout/section-heading";
import { RecordActionBar, type RecordActionError } from "../layout/record-action-bar";
import { StatusBadge } from "../data-display/status-badge";

/** Editované údaje výpisu. */
export interface BankStatementValue {
  /** Datum v ISO formátu. */
  date: string;
  /** Číslo výpisu. */
  number: string;
  /** Poznámka výpisu. */
  note: string;
  /** Nepovinný konečný zůstatek podle banky. */
  bankClosing: number | null;
}
/** Částky předané aplikací; konečný zůstatek odvozuje DS. */
export interface BankStatementBalances {
  /** Počáteční zůstatek. */
  opening: number;
  /** Součet příjmů. */
  income: number;
  /** Součet výdajů, kladné číslo. */
  expense: number;
}
/** Vlastnosti formuláře výpisu. */
export interface BankStatementFormProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Údaje výpisu. */
  value: BankStatementValue;
  /** Změna editovaných údajů. */
  onChange: (value: BankStatementValue) => void;
  /** Stav výpisu. */
  status: "open" | "checked" | "posted";
  /** Kniha výpisu. */
  book: ReactNode;
  /** Měna výpisu, kód z aplikace. */
  currency: string;
  /** Značka měny z aplikace. */
  currencySymbol: string;
  /** Období výpisu. */
  period: ReactNode;
  /** Bankovní účet výpisu. */
  bankAccount: ReactNode;
  /** Součty v měně výpisu. */
  balances: BankStatementBalances;
  /** Domácí součty a značka měny u cizoměnového výpisu. */
  home?: BankStatementBalances & { currencySymbol: string; bankClosing: number | null };
  /** Změna domácího zůstatku podle banky, pokud je upravitelný. */
  onHomeBankClosingChange?: (value: number | null) => void;
  /** Výpis má položky; zablokuje číslo a odstranění. */
  hasItems?: boolean;
  /** Všechna pole pouze ke čtení. */
  readOnly?: boolean;
  /** Neuložené změny. */
  dirty?: boolean;
  /** Uloží výpis. */
  onSave?: () => void;
  /** Změní stav kontroly. */
  onCheckedChange?: (checked: boolean) => void;
  /** Odstraní prázdný výpis. */
  onDelete?: () => void;
  /** Chyba ve sdíleném pruhu akcí. */
  error?: RecordActionError;
  /** Upozornění ze společných NoticeBar. */
  notices?: ReactNode;
  /** Grid položek řízený aplikací. */
  items?: ReactNode;
  /** Přepisy textů; jinak DsTexts. */
  texts?: Partial<BankStatementTexts>;
}

/** Výpis se společnými poli, přilepenými akcemi a slotem pohybů. */
export const BankStatementForm = forwardRef<HTMLDivElement, BankStatementFormProps>(
  function BankStatementForm(p, ref) {
    const {
      value,
      onChange,
      status,
      book,
      currency,
      currencySymbol,
      period,
      bankAccount,
      balances,
      home,
      onHomeBankClosingChange,
      hasItems,
      readOnly,
      dirty,
      onSave,
      onCheckedChange,
      onDelete,
      error,
      notices,
      items,
      texts,
      className,
      ...rest
    } = p;
    const ds = useDsTexts();
    const t = { ...ds.bankStatement, ...texts };
    const id = useId();
    const locked = Boolean(readOnly || status !== "open");
    const patch = (next: Partial<BankStatementValue>) => {
      if (!locked) onChange({ ...value, ...next });
    };
    return (
      <div
        {...rest}
        ref={ref}
        data-slot="bank-statement-form"
        className={cn("@container min-w-0", className)}
      >
        <PageLayout variant="form">
          <PageHeader
            title={t.title}
            titleBadge={
              <StatusBadge
                status={status}
                config={{
                  open: { label: t.open },
                  checked: { label: t.checked, tone: "info" },
                  posted: { label: t.posted, tone: "success" },
                }}
              />
            }
          />
          <RecordActionBar
            className={cn(
              "flex-wrap [&>div:last-child]:ml-auto",
              onSave &&
                "[&>div:last-child>button:first-child]:w-auto [&>div:last-child>button:first-child]:px-3 [&>div:last-child>button:first-child>svg]:!hidden [&>div:last-child>button:first-child>span:first-of-type]:!not-sr-only",
            )}
            leftContent={
              onCheckedChange ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={readOnly || status === "posted"}
                  onClick={() => onCheckedChange(status === "open")}
                >
                  {status === "open" ? t.check : t.uncheck}
                </Button>
              ) : null
            }
            saveAction={onSave ? { onSave, dirty, disabled: locked } : undefined}
            moreActions={
              onDelete
                ? [
                    {
                      id: "delete",
                      label: t.delete,
                      destructive: true,
                      disabled: hasItems || locked,
                      disabledReason: hasItems ? t.hasItems : undefined,
                      onClick: () => {
                        if (!hasItems && !locked) onDelete();
                      },
                    },
                  ]
                : []
            }
            error={error}
            notices={notices}
          />
          <div
            data-slot="bank-statement-identity"
            className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm font-semibold"
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {[book, currency, period, bankAccount].map((item, index) => (
                <span key={index} className="flex min-w-0 items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  <span className="truncate">{item}</span>
                </span>
              ))}
            </div>
            <span className="tabular-nums">{value.number}</span>
          </div>
          <SectionHeading>{t.basic}</SectionHeading>
          <BankStatementBasic
            id={id}
            value={value}
            patch={patch}
            locked={locked}
            hasItems={hasItems}
            texts={t}
          />
          <SectionHeading>{t.balances}</SectionHeading>
          <BankStatementBalanceSection
            id={id}
            balances={balances}
            symbol={currencySymbol}
            bankClosing={value.bankClosing}
            onBankClosingChange={(bankClosing) => patch({ bankClosing })}
            locked={locked}
            texts={t}
          />
          {home ? (
            <>
              <SectionHeading>{t.home.replace("{currency}", home.currencySymbol)}</SectionHeading>
              <BankStatementBalanceSection
                id={`${id}-home`}
                balances={home}
                symbol={home.currencySymbol}
                bankClosing={home.bankClosing}
                locked={locked || !onHomeBankClosingChange}
                onBankClosingChange={(next) => {
                  if (!locked) onHomeBankClosingChange?.(next);
                }}
                texts={t}
              />
            </>
          ) : null}
          <SectionHeading>{t.items}</SectionHeading>
          <div data-slot="bank-statement-items" className="min-w-0 max-w-full">
            {items}
          </div>
        </PageLayout>
      </div>
    );
  },
);
