import { ImportedMovementShowcase } from "./ImportedMovementShowcase";
import { DocumentFormSecondaryShowcase } from "./DocumentFormSecondaryShowcase";
import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  DataGrid,
  DocumentForm,
  PanelToggleButton,
  RecordSidePanel,
  DocumentSettingsDialog,
  NoticeBar,
  PaymentScheduleEditor,
  StatusBadge,
  type DataGridColumn,
  type DocumentSettingsValue,
  type DocumentHeaderValue,
  type DocumentIdentity,
  SegmentedField,
  type JournalLine,
  type PaymentScheduleItem,
  type DocumentCounterpartyValue,
  type DocumentPrintValue,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";
import { formatCodeName } from "@/lib/code-format";
import { formatAccountCode } from "@/components/ds/accounting/account-code";

import {
  BANK_ACCOUNT_OPTIONS,
  COMPANY_BANK_ACCOUNT_OPTIONS,
  CONSTANT_SYMBOL_OPTIONS,
  CURRENCIES,
  DocumentHeaderScenarios,
  HIDDEN_GROUP_COLUMNS,
  HIDDEN_GROUP_ROWS,
  INVOICE_HEADER,
  INVOICE_LINES,
  PAYMENT_METHOD_OPTIONS,
  PURCHASE_INVOICE_HEADER,
  PURCHASE_INVOICE_LINES,
  SCHEDULE,
  USERS,
} from "./document-form-showcase-data";

import { useDocumentFormShowcaseState } from "./use-document-form-showcase-state";
import { useRecordPanelContent } from "./record-panel-content";

/** Ukázky DocumentForm 2.7 a PaymentScheduleEditor na stránce Účetní formuláře. */
export function DocumentFormShowcase() {
  const state = useDocumentFormShowcaseState();
  const [panelOpen, setPanelOpen] = useState(false);
  const [incomePanelOpen, setIncomePanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState("attachments");
  const panelContent = useRecordPanelContent("draft", "");
  const {
    cashDateLocked,
    setCashDateLocked,
    courierVatRelevant,
    setCourierVatRelevant,
    invoiceVatRelevant,
    setInvoiceVatRelevant,
    handedSuggestions,
    setHandedSuggestions,
    descriptionSuggestions,
    setDescriptionSuggestions,
    invoice,
    setInvoice,
    invoiceLines,
    setInvoiceLines,
    schedule,
    setSchedule,
    settingsOpen,
    setSettingsOpen,
    formError,
    setFormError,
    lineValidationError,
    setLineValidationError,
    documentSettings,
    setDocumentSettings,
    posted,
    setPosted,
    postedLines,
    setPostedLines,
    postedSchedule,
    setPostedSchedule,
    cash,
    setCash,
    cashLines,
    setCashLines,
    internal,
    setInternal,
    internalLines,
    setInternalLines,
    courierLines,
    setCourierLines,
    courier,
    setCourier,
    cashIn,
    setCashIn,
    cashEur,
    setCashEur,
    fvCzk,
    setFvCzk,
    fvEur,
    setFvEur,
    counterpartyPrint,
    setCounterpartyPrint,
    printData,
    setPrintData,
    fpNonPayer,
    setFpNonPayer,
    idCp,
    setIdCp,
    exchangeDifference,
    setExchangeDifference,
    suggestNames,
    suggestDescriptions,
    common,
    units,
  } = state;
  return (
    <>
      <DocumentHeaderScenarios />
      <ShowcaseSection
        title="Pokladna – výdaj kurýrovi bez partnera"
        description="Protistrana je jen text; ručně zadané IČO a DIČ zůstávají editovatelné a chybné české IČO se jen zvýrazní."
      >
        <RecordSidePanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          activeTab={panelTab}
          onActiveTabChange={setPanelTab}
          tabs={panelContent.tabs}
        >
          <DocumentForm
            title="Pokladní doklad – výdaj"
            panelToggle={
              <PanelToggleButton
                open={panelOpen}
                onToggle={() => setPanelOpen(!panelOpen)}
                indicator
                tooltip="Panel · Přílohy 2 · Poznámky 1"
              />
            }
            identity={{
              variant: "cashBank",
              book: formatCodeName("PO", "Pokladna"),
              period: "2026",
              account: { side: "DAL", label: formatCodeName("211.001", "Pokladna CZK") },
              number: courier.number,
            }}
            currencies={CURRENCIES}
            directionBadge="out"
            value={{ ...courier, vatRelevant: courierVatRelevant }}
            onChange={(next) => {
              setCourier(next);
              setCourierVatRelevant(next.vatRelevant !== false);
            }}
            lines={courierLines}
            {...common}
            onLinesChange={setCourierLines}
            books={MOCK_BOOKS.filter((b) => b.id === "b-pd")}
            documentType="PO"
            isNew
            mainSide="D"
            mainAccountLocked
            status="draft"
            settings={{ onOpen: () => setSettingsOpen(true) }}
            error={
              lineValidationError
                ? { message: lineValidationError, onClose: () => setLineValidationError(undefined) }
                : formError
                  ? {
                      message: "Doplňte účet a částku na řádku dokladu.",
                      onClose: () => setFormError(false),
                    }
                  : undefined
            }
            linesEditorProps={{
              initialEmptyLine: true,
              showQuantityColumns: documentSettings.showQuantityColumns,
              storageKey: "showcase-doc-new-po",
              onValidationChange: (_count, errors) =>
                setLineValidationError(
                  errors[0] ? `Řádek ${errors[0].line}: ${errors[0].message}` : undefined,
                ),
            }}
            accountingDateLink={{
              locked: cashDateLocked,
              onToggle: (locked) => {
                setCashDateLocked(locked);
                if (locked)
                  setCourier((current) => ({ ...current, accountingDate: current.issueDate }));
              },
            }}
            vat={{
              visible: true,
              dateLink: { locked: true, onToggle: () => {} },
              dateLockReadOnly: true,
            }}
            handedOverBySuggest={{
              enabled: handedSuggestions,
              onEnabledChange: setHandedSuggestions,
              load: suggestNames,
            }}
            descriptionSuggest={{
              enabled: descriptionSuggestions,
              onEnabledChange: setDescriptionSuggestions,
              load: suggestDescriptions,
            }}
            onCreatePartner={(seed) => toast.info(`Nový partner: ${seed.name || seed.ico}`)}
          />
        </RecordSidePanel>
        <DocumentSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          value={documentSettings}
          onSave={(next) => {
            setDocumentSettings(next);
            setSettingsOpen(false);
            toast.success("Nastavení uloženo");
          }}
          documentTypeLabel="Pokladní doklad – výdaj"
          allowCounterpartySuggestions
          showVatCalcMode
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Pokladna – příjem s propojeným partnerem"
        description="Propojený partner má štítek „Partner“ a ✕ Zrušit propojení; pod polem IČO a DIČ."
      >
        <RecordSidePanel
          open={incomePanelOpen}
          onOpenChange={setIncomePanelOpen}
          activeTab={panelTab}
          onActiveTabChange={setPanelTab}
          tabs={panelContent.tabs}
        >
          <DocumentForm
            title="Pokladní doklad – příjem"
            panelToggle={
              <PanelToggleButton
                open={incomePanelOpen}
                onToggle={() => setIncomePanelOpen(!incomePanelOpen)}
                tooltip="Panel"
              />
            }
            identity={{
              variant: "cashBank",
              book: formatCodeName("PO", "Pokladna"),
              period: "2026",
              account: { side: "MD", label: formatCodeName("211.001", "Pokladna CZK") },
              number: cashIn.number,
            }}
            currencies={CURRENCIES}
            directionBadge="in"
            value={cashIn}
            onChange={setCashIn}
            lines={[]}
            {...common}
            books={MOCK_BOOKS.filter((b) => b.id === "b-pd")}
            documentType="PO"
            mainSide="MD"
            mainAccountLocked
            status="filed"
          />
        </RecordSidePanel>
      </ShowcaseSection>
      <ImportedMovementShowcase common={common} />
      <DocumentFormSecondaryShowcase state={state} />
    </>
  );
}
