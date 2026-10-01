/**
 * Prezentační prvky identity formuláře dokladu.
 * Vlastní: řádek identity a hodnotu jen pro čtení.
 * Nesmí: měnit hodnotu dokladu mimo předané callbacky.
 */
import type { ReactNode, RefObject } from "react";
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
      "flex min-h-9 items-center text-sm",
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
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>{account.disabledReason}</TooltipContent>
        </Tooltip>
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
      <span key="account" className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        <span className="inline-flex h-[1.5em] items-center rounded-sm border border-border px-1 font-mono text-xs font-semibold uppercase text-muted-foreground">
          {account.side}
        </span>
        {editingAccount ? (
          <span className="w-[18rem] max-w-full">
            <AccountSelect
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
          <span data-slot="document-identity-account" className="truncate">
            {accountLabel ?? account.label}
          </span>
        )}
        {pencil}
      </span>,
    );
  return (
    <div data-slot="document-identity" className="mb-3 border-b border-border pb-3">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-y-1 text-[0.9375rem] font-semibold text-foreground">
          {direction ? (
            <DocumentDirectionBadge
              direction={direction}
              inLabel={texts.directionIn}
              outLabel={texts.directionOut}
            />
          ) : null}
          {items[0] != null ? (
            <span className="flex min-w-0 items-center">
              {direction ? <span aria-hidden="true" className="mx-2 h-4 w-px bg-border" /> : null}
              {items[0]}
            </span>
          ) : null}
          {items.length > 1 ? (
            <span className="flex min-w-0 flex-wrap items-center @max-[40rem]:basis-full">
              {items.slice(1).map((item, index) => (
                <span key={index} className="flex min-w-0 items-center">
                  <span
                    aria-hidden="true"
                    className={cn("mx-2 h-4 w-px bg-border", index === 0 && "@max-[40rem]:hidden")}
                  />
                  {item}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        {identity ? (
          <span
            className={cn(
              "self-center shrink-0 text-right font-mono text-xl font-bold tabular-nums",
              !number &&
                "max-w-48 font-sans text-sm font-normal italic leading-tight text-muted-foreground",
            )}
          >
            {number ?? identity.numberPending ?? fallback}
          </span>
        ) : null}
      </div>
    </div>
  );
}
