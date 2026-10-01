/** Stav DPH partnera zobrazený vedle přepínače v pruhu akcí dokladu. */
import { Switch } from "../../../ui/switch";
import { VatStatusBadge } from "../../data-display/vat-status-badge";
import type { DocumentFormProps, DocumentFormTexts } from "./document-form-types";

export function DocumentVatActionStatus({
  checked,
  readOnly,
  onCheckedChange,
  status,
  texts,
}: {
  checked: boolean;
  readOnly?: boolean;
  onCheckedChange: (value: boolean) => void;
  status?: DocumentFormProps["vatPartnerStatus"];
  texts: DocumentFormTexts & { vatVerified: (date: string) => string };
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium">
        <Switch
          checked={checked}
          disabled={readOnly}
          onCheckedChange={onCheckedChange}
          aria-label={texts.vatRelevant}
        />
        {texts.vatRelevant}
      </label>
      {checked && status ? (
        <span className="flex min-w-0 items-center gap-2 overflow-hidden">
          <VatStatusBadge status={status.status} />
          {status.checkedAt ? (
            <span
              className="hidden truncate text-xs text-muted-foreground @min-[44rem]:inline"
              title={texts.vatVerified(status.checkedAt)}
            >
              {texts.vatVerified(status.checkedAt)}
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}