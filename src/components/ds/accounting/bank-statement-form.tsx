/**
 * Formulář bankovního výpisu.
 * Vlastní: rozvržení, odvozené zůstatky a prezentaci stavů.
 * Nesmí: ukládat data, kontrolovat výpis ani spravovat položky aplikace.
 */
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useDsTexts, type BankStatementTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { IdentityLine } from "../layout/identity-line";
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
  /** Probíhající ukládání; blokuje další akce. */
  busy?: boolean;
  /** Uloží výpis. */
  onSave?: () => void;
  /** Důvod, proč výpis nelze zkontrolovat; zakáže jen „Zkontrolovat“, ne „Zrušit kontrolu“. */
  checkDisabledReason?: string;
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
      busy,
      onCheckedChange,
      checkDisabledReason,
      onDelete,
      error,
      notices,
      items,
      texts,
      className,
      onKeyDown,
      ...rest
    } = p;
    const ds = useDsTexts();
    const t = { ...ds.bankStatement, ...texts };
    const id = useId();
    const locked = Boolean(readOnly || status !== "open");
    const lockedReason = readOnly
      ? t.lockedReadOnly
      : status === "posted"
        ? t.lockedPosted
        : status === "checked"
          ? t.lockedChecked
          : undefined;
    const checkReason =
      readOnly || status === "posted"
        ? lockedReason
        : status === "open"
          ? checkDisabledReason || undefined
          : undefined;
    const checkBlocked = Boolean(checkReason) || Boolean(busy);
    const patch = (next: Partial<BankStatementValue>) => {
      if (!locked) onChange({ ...value, ...next });
    };
    return (
      <TooltipProvider>
        <div
          {...rest}
          ref={ref}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              !event.defaultPrevented &&
              (event.ctrlKey || event.metaKey) &&
              event.key.toLowerCase() === "s" &&
              onSave &&
              !locked &&
              !busy
            ) {
              event.preventDefault();
              onSave();
            }
          }}
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
              leftContent={
                onCheckedChange ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        aria-disabled={checkBlocked || undefined}
                        aria-describedby={checkReason ? `${id}-check-reason` : undefined}
                        onClick={() => {
                          if (!checkBlocked) onCheckedChange(status === "open");
                        }}
                      >
                        {status === "open" ? t.check : t.uncheck}
                      </Button>
                    </TooltipTrigger>
                    {checkReason ? <TooltipContent>{checkReason}</TooltipContent> : null}
                    {checkReason ? (
                      <span id={`${id}-check-reason`} className="sr-only">
                        {checkReason}
                      </span>
                    ) : null}
                  </Tooltip>
                ) : null
              }
              busy={busy}
              saveAction={onSave ? { onSave, dirty, disabled: locked, busy } : undefined}
              moreActions={
                onDelete
                  ? [
                      {
                        id: "delete",
                        label: t.delete,
                        destructive: true,
                        disabled: hasItems || locked,
                        disabledReason: hasItems ? t.hasItems : locked ? lockedReason : undefined,
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
            <section className="rounded-lg border bg-card p-4">
              <IdentityLine
                data-slot="bank-statement-identity"
                items={[book, currency, period, bankAccount]}
                number={value.number}
              />
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
                  <SectionHeading>
                    {t.home.replace("{currency}", home.currencySymbol)}
                  </SectionHeading>
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
            </section>
            <SectionHeading>{t.items}</SectionHeading>
            <div data-slot="bank-statement-items" className="min-w-0 max-w-full">
              {items}
            </div>
          </PageLayout>
        </div>
      </TooltipProvider>
    );
  },
);
