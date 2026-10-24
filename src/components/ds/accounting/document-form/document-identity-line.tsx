/**
 * Prezentační prvky identity formuláře dokladu.
 * Vlastní: řádek identity a hodnotu jen pro čtení.
 * Nesmí: měnit hodnotu dokladu mimo předané callbacky.
 */
import { DisabledReasonTooltip } from "../../feedback/disabled-reason-tooltip";
import { useContext, type ReactNode, type RefObject } from "react";
import { IdentityLine } from "../../layout/identity-line";
import { TruncatedText } from "../../data-display/truncated-text";
import { FieldSuggestionContext } from "../../form/field-suggestion-context";
import { FieldFeedbackContext, FieldSuggestionIndicator } from "../../form/field-feedback";
import { useDsTexts } from "../../../../ds-texts";
import { Pencil, Lock } from "lucide-react";
import { Button } from "../../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { AccountSelect, type AccountOption } from "../account-select";
import { DocumentDirectionBadge } from "../document-form";
import { cn } from "../../../../lib/utils";
import { CODE_SEPARATOR } from "../../../../lib/code-format";
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
  lockedReason,
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
  /** Obecný zámek hlavního účtu s důvodem. */
  lockedReason?: string;
}) {
  const number = identity.number || null;
  const dsTexts = useDsTexts();
  // Návrh bez obalu Field: box zůstává šířky textu a tužka stojí hned za ním.
  const suggestion = useContext(FieldSuggestionContext)?.("document-mainAccountId");
  const suggestionState = suggestion
    ? suggestion.uncertain
      ? "uncertain"
      : "suggested"
    : undefined;
  const fullAccountLabel = accountLabel ?? identity.account?.label ?? "";
  const [accountCode, ...accountNameParts] = fullAccountLabel.split(CODE_SEPARATOR);
  const accountName = accountNameParts.join(CODE_SEPARATOR);
  // Interní doklad účet nikdy nezobrazuje, i když jej aplikace pošle.
  const account = identity.variant === "internal" ? undefined : identity.account;
  const items: ReactNode[] = [
    <span key="book" className="ds-identity-book min-w-0">
      <TruncatedText text={identity.book} />
    </span>,
    <span key="period" className="whitespace-nowrap">
      {identity.period}
    </span>,
  ];
  const pencil = lockedReason && account ? (
    <DisabledReasonTooltip content={lockedReason} blocked>
      <Button variant="ghost" size="icon" className="size-4 shrink-0 p-0 text-muted-foreground" aria-label={lockedReason}>
        <Lock className="size-4" aria-hidden="true" />
      </Button>
    </DisabledReasonTooltip>
  ) : !editingAccount && canEditAccount && account ? (
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
        <span className="inline-flex shrink-0 h-[1.5em] items-center rounded-sm border border-border px-1 font-mono text-xs font-semibold uppercase text-muted-foreground">
          {account.side}
        </span>
        <FieldFeedbackContext.Provider value={{ suggestion }}>
          {editingAccount ? (
            <span className="document-identity-account-box" data-suggestion={suggestionState}>
              <span
                aria-hidden="true"
                className="document-identity-account-measure"
                data-label={accountLabel ?? account.label}
              />
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
              <FieldSuggestionIndicator
                suggestion={suggestion}
                defaultMessage={
                  suggestion ? dsTexts.extraction.suggestionUncertain(suggestion.source) : undefined
                }
              />
            </span>
          ) : (
            <span
              id="document-mainAccountId"
              data-slot="document-identity-account"
              data-mode="read"
              data-suggestion={suggestionState}
              className="document-identity-account-box flex items-center border border-transparent rounded-md text-sm font-normal"
            >
              {/* Při čtení má box šířku textu, tužka stojí hned za ním (i za trojtečkou). */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    data-slot="document-identity-account-text"
                    className="flex min-w-0 items-center pl-3 pr-1"
                    tabIndex={0}
                    title={fullAccountLabel}
                  >
                    <span className="shrink-0 font-mono tabular-nums">{accountCode}</span>
                    {accountName ? (
                      <>
                        <span className="ds-identity-account-separator shrink-0 whitespace-pre">
                          {CODE_SEPARATOR}
                        </span>
                        <TruncatedText
                          text={accountName}
                          className="ds-identity-account-name min-w-0"
                        />
                      </>
                    ) : null}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{fullAccountLabel}</TooltipContent>
              </Tooltip>
              <FieldSuggestionIndicator
                suggestion={suggestion}
                defaultMessage={
                  suggestion ? dsTexts.extraction.suggestionUncertain(suggestion.source) : undefined
                }
              />
            </span>
          )}
        </FieldFeedbackContext.Provider>
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
      fallbackShort={identity.fallbackShort ?? dsTexts.documentForm.fallbackShort}
      bookCode={identity.bookCode ?? identity.book.split(/\s|–|-/)[0]}
      fullLabel={[
        identity.book,
        identity.period,
        account?.side,
        fullAccountLabel,
        number ?? identity.numberPending ?? fallback,
      ]
        .filter(Boolean)
        .join(" · ")}
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
