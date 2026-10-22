/**
 * Formulář bankovního výpisu.
 * Vlastní: rozvržení, odvozené zůstatky a prezentaci stavů.
 * Nesmí: ukládat data, kontrolovat výpis ani spravovat položky aplikace.
 */
import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useDsTexts, type BankStatementTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { TooltipProvider } from "../../ui/tooltip";
import {
  BankStatementIdentity,
  BankStatementBasic,
  statementDifference,
} from "./bank-statement-sections";
import { formatAmount } from "../../../lib/format";
import { PageLayout } from "../layout/page-layout";
import { PageHeader } from "../layout/page-header";
import { SectionHeading } from "../layout/section-heading";
import {
  RecordActionBar,
  type RecordActionError,
  type RecordMoreAction,
} from "../layout/record-action-bar";

/** Editované údaje výpisu. */
export interface BankStatementValue {
  /** Datum v ISO formátu. */
  date: string;
  /** Číslo výpisu. */
  number: string;
  /** Zůstatek na výpise zadaný z banky; null = Σ, počítá se z pohybů. */
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
  /** Stav výpisu. Hodnota „checked“ je @deprecated 2.108.0 – kontrola výpisu je zrušená. */
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
  /** @deprecated 2.108.0 – zůstatky v domácí měně se nezobrazují; ignorováno. */
  home?: BankStatementBalances & { currencySymbol: string; bankClosing: number | null };
  /** @deprecated 2.108.0 – ignorováno. */
  onHomeBankClosingChange?: (value: number | null) => void;
  /** Výpis má položky; zablokuje číslo a odstranění. */
  hasItems?: boolean;
  /** @deprecated 2.108.0 – pohyby se zobrazují vždy přes `items`; ignorováno. */
  isNew?: boolean;
  /** @deprecated 2.108.0 – přidání řeší addAction gridu v `items`; ignorováno. */
  onSaveThenAdd?: (direction: "in" | "out") => void | Promise<void>;
  /** Všechna pole pouze ke čtení. */
  readOnly?: boolean;
  /** Neuložené změny. */
  dirty?: boolean;
  /** Probíhající ukládání; blokuje další akce. */
  busy?: boolean;
  /** Uloží výpis. */
  onSave?: () => void;
  /**
   * Ctrl/Cmd+Enter = Uložit a zavřít (bez tlačítka). Aplikace zavře výpis až po úspěšném
   * uložení; při chybě zůstává otevřený.
   */
  onSaveAndClose?: () => void;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená; ignorováno. */
  checkDisabledReason?: string;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená; ignorováno. */
  onCheckedChange?: (checked: boolean) => void;
  /** Odstraní prázdný výpis. */
  onDelete?: () => void;
  /** Chyba ve sdíleném pruhu akcí. */
  error?: RecordActionError;
  /** Upozornění ze společných NoticeBar. */
  notices?: ReactNode;
  /** Grid pohybů řízený aplikací (lišta, addAction Nový příjem / Nový výdaj); i pro neuložený výpis. */
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
      currency: _currency,
      currencySymbol,
      period,
      bankAccount,
      balances,
      home: _home,
      onHomeBankClosingChange: _onHomeBankClosingChange,
      hasItems,
      isNew: _isNew,
      onSaveThenAdd: _onSaveThenAdd,
      readOnly,
      dirty,
      onSave,
      onSaveAndClose,
      busy,
      onCheckedChange: _onCheckedChange,
      checkDisabledReason: _checkDisabledReason,
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
        : // Zastaralý stav `checked` zůstává zamčený s obecným důvodem.
          status === "checked"
          ? t.locked
          : undefined;
    const difference = statementDifference(value.bankClosing, balances);
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
            if (event.defaultPrevented || !(event.ctrlKey || event.metaKey)) return;
            if (locked || busy) return;
            if (event.key.toLowerCase() === "s" && onSave && dirty !== false) {
              event.preventDefault();
              onSave();
            } else if (event.key === "Enter" && onSaveAndClose) {
              event.preventDefault();
              onSaveAndClose();
            }
          }}
          data-slot="bank-statement-form"
          className={cn("@container min-w-0", className)}
        >
          <PageLayout variant="form">
            <PageHeader title={t.title} />
            <RecordActionBar
              busy={busy}
              saveAction={
                onSave
                  ? { onSave, dirty, disabled: locked, disabledReason: lockedReason, busy }
                  : undefined
              }
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
              issues={
                difference !== null
                  ? [
                      {
                        fieldId: `${id}-bankClosing`,
                        label: t.bankClosing,
                        message: t.differenceWarning.replace(
                          "{amount}",
                          `${formatAmount(difference)} ${currencySymbol}`,
                        ),
                        severity: "warning",
                        source: "client",
                      },
                    ]
                  : undefined
              }
              notices={notices}
            />
            <section className="rounded-lg border bg-card p-4">
              <BankStatementIdentity
                id={id}
                items={[book, period, bankAccount]}
                number={value.number}
                lockedReason={lockedReason ?? (hasItems ? t.hasItems : undefined)}
                onNumberChange={(number) => patch({ number })}
                label={t.number}
              />
              <SectionHeading>{t.basic}</SectionHeading>
              <BankStatementBasic
                id={id}
                value={value}
                patch={patch}
                locked={locked}
                balances={balances}
                symbol={currencySymbol}
                texts={t}
              />
            </section>
            <SectionHeading>{t.items}</SectionHeading>
            <div data-slot="bank-statement-items" className="min-w-0 max-w-full">
              {items ?? (
                <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
                  {t.emptyItems}
                </div>
              )}
            </div>
          </PageLayout>
        </div>
      </TooltipProvider>
    );
  },
);
