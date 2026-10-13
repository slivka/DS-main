/**
 * Přepínatelné zadání protistrany.
 * Vlastní: režim adresáře/ruční zadání a potvrzení nahrazení ručních údajů.
 * Nesmí: samo mazat nebo přepisovat údaje protistrany.
 */
import { ContactRound } from "lucide-react";

import { FieldToggleButton } from "../form/field-toggle-button";
import { useDsTexts } from "../../../ds-texts";
import { Input } from "../../ui/input";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { PartnerSelect, type PartnerOption } from "./partner-select";

/** Vlastnosti přepínatelného zadání protistrany. */
export interface CounterpartyInputFieldProps {
  /** Režim zadání. */
  mode: "partner" | "manual";
  /** Identifikátor vybraného partnera. */
  partnerId?: string | null;
  /** Ručně zadaný název. */
  name: string;
  /** Nabídka partnerů. */
  partners: PartnerOption[];
  /** Změna partnera. */
  onPartnerChange: (id: string) => void;
  /** Změna ručního názvu. */
  onNameChange: (name: string) => void;
  /** Změna režimu. */
  onModeChange?: (mode: "partner" | "manual") => void;
  /** Důvod zamčení režimu. */
  lockedReason?: string;
  /** Zakázání pole. */
  disabled?: boolean;
  /** Přístupný popisek. */
  ariaLabel?: string;
  /** Text režimu adresáře. */
  partnerModeLabel: string;
  /** Text ručního režimu. */
  manualModeLabel: string;
  /** Text potvrzení nahrazení ručních údajů. */
  replaceManualWarning: string;
  /** Ruční údaje, které vyžadují potvrzení. */
  hasManualData?: boolean;
  /** Identifikátor pole. */
  id?: string;
  /** Doklad jen pro čtení – režim nejde přepnout. */
  readOnly?: boolean;
  /** Nabídka „Nový partner…“ ve výběru (režim partner). */
  onCreatePartner?: (query: string) => void;
  /** Tužka u vybraného partnera. */
  onEditPartner?: (id: string) => void;
}

/** Pole protistrany s ikonou přepnutí režimu. */
export function CounterpartyInputField(props: CounterpartyInputFieldProps) {
  const { confirm, confirmDialog } = useConfirmDialog();
  const texts = useDsTexts().fieldToggle;
  const targetMode = props.mode === "partner" ? "manual" : "partner";
  const switchMode = () => {
    if (!props.onModeChange || props.lockedReason || props.readOnly) return;
    if (targetMode === "partner" && props.hasManualData) {
      confirm({
        title: props.replaceManualWarning,
        destructive: true,
        onConfirm: () => props.onModeChange?.("partner"),
      });
      return;
    }
    props.onModeChange(targetMode);
  };
  const toggle = (
    <FieldToggleButton
      icon={ContactRound}
      pressed={props.mode === "partner"}
      onPressedChange={switchMode}
      label={texts.directory}
      pressedTooltip={texts.directoryPressed}
      unpressedTooltip={texts.directoryUnpressed}
      lockedReason={props.lockedReason}
      disabled={props.disabled || props.readOnly || !props.onModeChange}
    />
  );
  return (
    <>
      <div
        data-slot="counterparty-input"
        data-mode={props.mode}
        className="relative min-w-0 [&_[data-slot=select-chevron]]:right-[var(--field-toggle-space)] [&_[data-slot=field-inline-actions]]:right-[calc(var(--field-toggle-space)+1.5rem)]"
      >
        {props.mode === "partner" ? (
          <PartnerSelect
            id={props.id}
            partners={props.partners}
            value={props.partnerId}
            onChange={props.onPartnerChange}
            disabled={props.disabled || props.readOnly}
            onCreate={props.onCreatePartner}
            onEditSelected={props.onEditPartner}
            className={
              props.onEditPartner && props.partnerId
                ? "pr-[calc(var(--field-toggle-space)+3.5rem)]"
                : "pr-[calc(var(--field-toggle-space)+1.5rem)]"
            }
          />
        ) : (
          <Input
            id={props.id}
            value={props.name}
            onChange={(event) => props.onNameChange(event.target.value)}
            disabled={props.disabled}
            readOnly={props.readOnly}
            aria-label={props.ariaLabel}
            className="pr-[var(--field-toggle-space)]"
          />
        )}
        {toggle}
      </div>
      {confirmDialog}
    </>
  );
}
