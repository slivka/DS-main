/** Sekce dokladu · vlastní skládání polí · nesmí odvozovat ani ukládat hlavičku. */
import type { ComponentProps, ReactNode } from "react";
import { DocumentBasicSection } from "./BasicSection";
import { DocumentDatesSection } from "./DatesSection";
import { DocumentPaymentSection } from "./PaymentSection";
import { DocumentAmountSection } from "./AmountSection";
import { BankMovementAccount } from "./bank-movement-account";

/** Hotové vstupy jednotlivých sekcí. */
export interface DocumentSectionsProps {
  /** Horní účet vydaného dokladu. */
  companyAccountField?: ReactNode;
  /** Vstupy základní sekce, pokud se používá. */
  basic?: ComponentProps<typeof DocumentBasicSection>;
  /** Vstupy datumů. */
  dates: ComponentProps<typeof DocumentDatesSection>;
  /** Protiúčet pohybu. */
  bank?: ComponentProps<typeof BankMovementAccount>;
  /** Vstupy symbolů a platby. */
  payment: ComponentProps<typeof DocumentPaymentSection>;
  /** Vstupy částky. */
  amount: ComponentProps<typeof DocumentAmountSection>;
  /** Popis dokladu bez partnera. */
  description?: ReactNode;
}

/** Jednotlivé sekce nemají vlastní stav. */
export function DocumentSections(p: DocumentSectionsProps) {
  return (
    <>
      {p.companyAccountField ? (
        <div
          data-slot="company-bank-account-above"
          className="grid grid-cols-1 gap-3 @min-[40rem]:grid-cols-20"
        >
          {p.companyAccountField}
        </div>
      ) : null}
      {p.basic ? <DocumentBasicSection {...p.basic} /> : null}
      <DocumentDatesSection {...p.dates} />
      {p.description ? <div className="mt-3 grid grid-cols-20 gap-3">{p.description}</div> : null}
      {p.bank ? <BankMovementAccount {...p.bank} /> : null}
      <DocumentPaymentSection {...p.payment} />
      <DocumentAmountSection {...p.amount} />
    </>
  );
}
