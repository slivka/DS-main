/**
 * Prezentační prvky identity formuláře dokladu.
 * Vlastní: řádek identity a hodnotu jen pro čtení.
 * Nesmí: měnit hodnotu dokladu mimo předané callbacky.
 */
import { DisabledReasonTooltip } from "../../feedback/disabled-reason-tooltip";
import type { ReactNode, RefObject } from "react";
import { IdentityLine } from "../../layout/identity-line";
import { Pencil } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { AccountSelect, type AccountOption } from "../account-select";
import { DocumentDirectionBadge } from "../document-form";
import { cn } from "../../../../lib/utils";
import type { DocumentDirection, DocumentFormTexts, DocumentIdentity } from "./document-form-types";

export const ReadField = ({
  id,
  value,
  muted,
  mono,
}: {
  id: string;
  value: ReactNode;
  muted?: boolean;
  mono?: boolean;
}) => (
  <div
    id={id}
    aria-readonly="true"
    className={cn(
      "flex min-h-[var(--control-h)] items-center text-sm",
      muted && "italic text-muted-foreground",
      mono && "font-mono tabular-nums",
    )}
  >
    {value}
  </div>
);

export function DocumentIdentityLine({
  identity,
  direction,
  fallback,
  texts,
  accountLabel,
  accountValue,
  editingAccount,
  canEditAccount,
  pencilRef,
  onStartAccountEdit,
  onAccountChange,
  onAccountClose,
  accountOptions,
}: {
  identity: DocumentIdentity;
  direction?: DocumentDirection;
  fallback: string;
  texts: DocumentFormTexts;
  accountLabel?: string;
  accountValue?: string | null;
  editingAccount: boolean;
  canEditAccount: boolean;
  pencilRef: RefObject<HTMLButtonElement | null>;
  onStartAccountEdit: () => void;
  onAccountChange: (code: string) => void;
  onAccountClose: () => void;
  accountOptions: AccountOption[];
}) {
  const number = identity.number || null;
  // Interní doklad účet nikdy nezobrazuje, i když jej aplikace pošle.
  const account = identity.variant === "internal" ? undefined : identity.account;
  const items: ReactNode[] = [
    <span key="book" className="whitespace-nowrap">
      {identity.book}
    </span>,
    <span key="period" className="whitespace-nowrap">
      {identity.period}
    </span>,
  ];
  const pencil =
    !editingAccount && canEditAccount && account ? (
      account.disabledReason ? (
        <DisabledReasonTooltip content={account.disabledReason} blocked>
          <span
            tabIndex={0}
            aria-label={`${texts.changeAccount}: ${account.disabledReason}`}
            data-slot="document-identity-account-locked"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={texts.changeAccount}
              tabIndex={-1}
              disabled
            >
              <Pencil className="size-3.5" />
            </Button>
          </span>
        </DisabledReasonTooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={pencilRef}
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={texts.changeAccount}
              onClick={onStartAccountEdit}
            >
              <Pencil className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{texts.changeAccount}</TooltipContent>
        </Tooltip>
      )
    ) : null;
  if (account)
    items.push(
      <span
        key="account"
        className="document-identity-account inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap"
      >
        <span className="inline-flex h-[1.5em] items-center rounded-sm border border-border px-1 font-mono text-xs font-semibold uppercase text-muted-foreground">
          {account.side}
        </span>
        {editingAccount ? (
          <span className="document-identity-account-box">
            <span aria-hidden="true" className="document-identity-account-measure">
              {accountLabel ?? account.label}
            </span>
            <AccountSelect
              id="document-mainAccountId"
              ariaLabel={texts.mainAccountSelect}
              accounts={accountOptions}
              value={accountValue}
              onChange={onAccountChange}
              defaultOpen
              onOpenChange={(open) => {
                if (!open) onAccountClose();
              }}
            />
          </span>
        ) : (
          <span
            id="document-mainAccountId"
            data-slot="document-identity-account"
            className="document-identity-account-box flex items-center truncate border border-transparent rounded-md px-3 text-sm font-normal"
          >
            <span className="truncate">{accountLabel ?? account.label}</span>
          </span>
        )}
        <span className="document-identity-pencil-slot">{pencil}</span>
      </span>,
    );
  return (
    <IdentityLine
      id="document-identity"
      data-slot="document-identity"
      items={items}
      number={number}
      numberId="document-number"
      fallback={identity.numberPending ?? fallback}
      leading={
        direction ? (
          <span id="document-direction" className="inline-flex">
            <DocumentDirectionBadge
              direction={direction}
              inLabel={texts.directionIn}
              outLabel={texts.directionOut}
            />
          </span>
        ) : undefined
      }
    />
  );
}
