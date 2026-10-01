/**
 * Stavové prvky a samostatný pruh akcí dokladu.
 * Vlastní: směr dokladu a kompatibilní veřejný DocumentActionBar.
 * Nesmí: ukládat data formuláře ani měnit pořadí akcí RecordActionBar.
 */
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Switch } from "../../../ui/switch";
import { RecordActionBar } from "../../layout/record-action-bar";
import { cn } from "../../../../lib/utils";
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  type DocumentDirection,
  type DocumentFormTexts,
  type DocumentMoreAction,
  type DocumentPrimaryAction,
  type DocumentSaveAction,
  type DocumentVatConfig,
} from "./document-form-types";

export function DocumentDirectionBadge({
  direction,
  inLabel = "Příjem",
  outLabel = "Výdej",
}: {
  direction: DocumentDirection;
  inLabel?: string;
  outLabel?: string;
}) {
  const Icon = direction === "in" ? ArrowDownLeft : ArrowUpRight;
  return (
    <span
      data-slot="document-direction-badge"
      className={cn(
        "inline-flex h-[1.625rem] items-center gap-1 rounded-md px-2 text-sm font-semibold",
        direction === "in"
          ? "bg-success-soft text-success-strong"
          : "bg-destructive-soft text-destructive-strong",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {direction === "in" ? inLabel : outLabel}
    </span>
  );
}

export function DocumentActionBar({
  vat,
  vatRelevant,
  onVatRelevantChange,
  saveAction,
  primaryAction,
  moreActions = [],
  texts = DEFAULT_DOCUMENT_FORM_TEXTS,
}: {
  vat?: DocumentVatConfig;
  vatRelevant: boolean;
  onVatRelevantChange: (value: boolean) => void;
  saveAction?: DocumentSaveAction;
  primaryAction?: DocumentPrimaryAction;
  moreActions?: DocumentMoreAction[];
  texts?: DocumentFormTexts;
}) {
  // Disabled reason rendering remains delegated unchanged: action.disabled && action.disabledReason.
  return (
    <RecordActionBar
      leftContent={
        vat?.visible ? (
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch
              checked={vatRelevant}
              disabled={vat.relevantReadOnly}
              onCheckedChange={onVatRelevantChange}
              aria-label={texts.vatRelevant}
            />
            {texts.vatRelevant}
          </label>
        ) : null
      }
      saveAction={saveAction}
      primaryAction={primaryAction}
      moreActions={moreActions}
      saveLabel="Uložit"
      moreActionsLabel="Další akce"
      dataSlot="document-action-bar"
    />
  );
}
