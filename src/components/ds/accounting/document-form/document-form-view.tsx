/** Zobrazení dokladu · vlastní skládání sekcí · nesmí odvozovat data. */
import { TooltipProvider } from "../../../ui/tooltip";
import { cn } from "../../../../lib/utils";
import { formatAccountCode } from "../account-code";
import { formatCodeName } from "../../../../lib/code-format";
import { partnerLabelForType } from "../document-fields";
import { TemplateEditBanner } from "../../templates/template-edit-banner";
import { DocumentSections } from "./document-sections";
import { DocumentFormTabs } from "./Tabs";
import { DocumentIdentityLine } from "./document-identity-line";
import { DocumentChangeMeta } from "./document-change-meta";
import { DocumentFormTop, handleDocumentSaveShortcut } from "./document-form-top";
import type { DocumentFormProps } from "./document-form-types";
import type { useDocumentFormModel } from "./use-document-form-model";
export interface DocumentFormViewProps {
  props: DocumentFormProps;
  model: ReturnType<typeof useDocumentFormModel>;
}
export function DocumentFormView({ props, model }: DocumentFormViewProps) {
  const {
    formRef,
    className,
    bankMovement,
    dsTexts,
    title,
    actionMenu,
    formIssueList,
    combinedNotices,
    vatRelevant,
    receivedDocument,
    counterpartyInput,
    patch,
    code,
    t,
    effectiveIdentity,
    identityAccount,
    value,
    canEditIdentityAccount,
    allowedMainAccounts,
    sameAccount,
    companyAccountField,
    f,
    partner,
    partners,
    texts,
    documentType,
    counterpartyIco,
    counterpartyDic,
    icoWarning,
    icoLinkTarget,
    can,
    onCreatePartner,
    onEditCounterparty,
    readOnly,
    field,
    suggestedText,
    handedOverBySuggest,
    descriptionSuggest,
    externalNumberField,
    bankAccountField,
    paymentMethodOptions,
    onCounterpartyInputChange,
    taxNumberField,
    internal,
    counterpartyInputLockedReason,
    showVatFields,
    vat,
    filedVatDateWarning,
    dateWarnings,
    date,
    lockReason,
    issueFieldErrors,
    issueFieldWarnings,
    issuedDocument,
    issuedBankAccountAbove,
    symbolsDisabledReason,
    constantSymbolOptions,
    vsLink,
    foreign,
    total,
    totalMode,
    forcedSum,
    currencySymbol,
    homeCurrency,
    homeCurrencySymbol,
    rateAmount,
    vatRateField,
    currencyControl,
    allTabs,
    tab,
    setTab,
    changedBy,
    changedAt,
  } = model;
  return (
    <TooltipProvider>
      <div
        ref={formRef}
        className={cn("@container space-y-4", className)}
        onKeyDown={(event) =>
          handleDocumentSaveShortcut(event, props.saveAction, props.onSaveAndClose)
        }
      >
        <DocumentFormTop
          props={props}
          title={bankMovement ? dsTexts.documentEdit.movementTitle : title}
          moreActions={actionMenu}
          issues={formIssueList}
          notices={combinedNotices}
          vatRelevant={vatRelevant}
          manualSupplier={receivedDocument && counterpartyInput === "manual"}
          onVatRelevantChange={(next) =>
            patch({
              vatRelevant: next,
              ...(code === "PO" && value.direction === "in" && next
                ? { taxDocumentNumberLinked: !value.externalNumber }
                : {}),
            })
          }
          t={t}
        />
        <section className="rounded-lg border bg-card p-4">
          {props.templateEdit ? <TemplateEditBanner template={props.templateEdit} /> : null}
          <DocumentIdentityLine
            identity={effectiveIdentity}
            direction={props.directionBadge}
            fallback={t.numberPending}
            texts={t}
            accountLabel={identityAccount.identityAccountLabel}
            accountValue={value.mainAccountId}
            editingAccount={identityAccount.editingIdentityAccount}
            canEditAccount={canEditIdentityAccount}
            pencilRef={identityAccount.pencilRef}
            onStartAccountEdit={identityAccount.startAccountEdit}
            onAccountChange={(mainAccountId) => {
              const selected = allowedMainAccounts.find((item) =>
                sameAccount(item.code, mainAccountId),
              );
              if (!selected) return;
              identityAccount.selectIdentityAccount({
                code: mainAccountId,
                label: formatCodeName(formatAccountCode(selected.code), selected.name),
                sourceLabel: effectiveIdentity.account?.label,
              });
              patch({ mainAccountId });
              identityAccount.closeIdentityAccount();
            }}
            onAccountClose={identityAccount.closeIdentityAccount}
            accountOptions={allowedMainAccounts}
          />
          <DocumentSections
            companyAccountField={companyAccountField}
            basic={
              f.partner
                ? {
                    f,
                    t,
                    value,
                    patch,
                    partner,
                    partners,
                    partnerLabel:
                      texts?.partner ?? partnerLabelForType(documentType, value.direction),
                    counterpartyIco,
                    counterpartyDic,
                    linkedPartner: Boolean(value.partnerId),
                    icoWarning,
                    icoLinkTarget,
                    can,
                    onCreatePartner,
                    onEditCounterparty,
                    readOnly,
                    field,
                    suggestedText,
                    handedOverBySuggest,
                    descriptionSuggest,
                    externalNumberField,
                    receivedDocument,
                    bankAccountField,
                    paymentMethodOptions:
                      receivedDocument && code !== "DDPOZ" ? paymentMethodOptions : undefined,
                    paymentMethodLabel: t.paymentMethod,
                    counterpartyInput,
                    onCounterpartyInputChange,
                    taxNumberField,
                    internal,
                    cashDocument: code === "PO",
                    counterpartyInputLockedReason,
                  }
                : undefined
            }
            dates={{
              t: bankMovement ? { ...t, issueDate: dsTexts.documentEdit.movementDate } : t,
              bankMovement,
              f,
              showVatFields,
              vat,
              filedVatDateWarning,
              dateWarnings,
              date,
            }}
            description={
              !f.partner ? (
                <>
                  {suggestedText(
                    "description",
                    t.description,
                    descriptionSuggest,
                    taxNumberField ? 14 : 20,
                  )}
                  {taxNumberField}
                </>
              ) : undefined
            }
            bank={
              bankMovement
                ? {
                    value,
                    patch,
                    bankCodes: props.bankCodes,
                    bankCodeOptions: props.bankCodeOptions,
                    disabled: !can("bankAccount"),
                    lockReason,
                    // Projekce chyb a varování do polí protiúčtu (Druh účtu, Číslo/IBAN, Kód/SWIFT).
                    fieldErrors: issueFieldErrors,
                    fieldWarnings: issueFieldWarnings,
                  }
                : undefined
            }
            payment={{
              f: bankMovement ? { ...f, bankAccount: false } : f,
              t: bankMovement ? { ...t, paymentSection: "" } : t,
              value,
              patch,
              can,
              issuedDocument,
              receivedDocument,
              issuedBankAccountAbove,
              symbolsDisabledReason,
              constantSymbolOptions,
              paymentMethodOptions:
                companyAccountField || receivedDocument ? undefined : paymentMethodOptions,
              companyBankAccountOptions: props.companyBankAccountOptions,
              bankAccountField,
              field,
              vsLink,
              lockReason,
              layout: bankMovement ? "grid20" : "flex",
              // „Přidělí se při zařazení“ jen u vydaných dokladů ve stavu koncept.
              vsPendingText:
                ["FV", "ZFV", "DDPZ"].includes(code) && (props.status ?? "draft") === "draft"
                  ? dsTexts.documentEdit.numberPending
                  : undefined,
            }}
            amount={{
              t,
              value,
              patch,
              can,
              foreign,
              total,
              totalMode,
              forcedSum,
              currencySymbol,
              homeCurrency,
              homeCurrencySymbol,
              rateAmount,
              vatRateField,
              readOnly,
              currencyControl,
              field,
              lockReason,
            }}
          />
        </section>
        <DocumentFormTabs
          tabs={allTabs}
          value={tab}
          onValueChange={setTab}
          linesLabel={t.linesTab}
        />
        <DocumentChangeMeta
          changedBy={changedBy}
          changedAt={changedAt}
          changedByLabel={t.changedBy}
          changedAtLabel={t.changedAt}
        />
      </div>
    </TooltipProvider>
  );
}
