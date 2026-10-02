/**
 * Přepínatelné zadání protistrany.
 * Vlastní: režim adresáře/ruční zadání a potvrzení nahrazení ručních údajů.
 * Nesmí: samo mazat nebo přepisovat údaje protistrany.
 */
import { ContactRound, PenLine } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
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
  const targetMode = props.mode === "partner" ? "manual" : "partner";
  const label = targetMode === "partner" ? props.partnerModeLabel : props.manualModeLabel;
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={props.mode === "partner" ? "default" : "outline"}
          size="icon"
          aria-label={props.lockedReason ?? label}
          aria-pressed={props.mode === "manual"}
          disabled={!props.onModeChange || props.readOnly}
          aria-disabled={Boolean(props.lockedReason) || undefined}
          onClick={switchMode}
          className="absolute right-1 top-1 size-[calc(var(--control-h)-0.5rem)]"
        >
          {props.mode === "partner" ? (
            <ContactRound className="size-4" />
          ) : (
            <PenLine className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{props.lockedReason ?? label}</TooltipContent>
    </Tooltip>
  );
  return (
    <>
      <div data-slot="counterparty-input" data-mode={props.mode} className="relative min-w-0">
        {props.mode === "partner" ? (
          <PartnerSelect
            id={props.id}
            partners={props.partners}
            value={props.partnerId}
            onChange={props.onPartnerChange}
            disabled={props.disabled || props.readOnly}
            onCreate={props.onCreatePartner}
            onEditSelected={props.onEditPartner}
            className={props.onEditPartner && props.partnerId ? "pr-20" : "pr-10"}
          />
        ) : (
          <Input
            id={props.id}
            value={props.name}
            onChange={(event) => props.onNameChange(event.target.value)}
            disabled={props.disabled}
            readOnly={props.readOnly}
            aria-label={props.ariaLabel}
            className="pr-10"
          />
        )}
        {toggle}
      </div>
      {confirmDialog}
    </>
  );
}
