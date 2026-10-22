/** Lišta kalendáře · skládá sdílené nástroje gridu · nesmí ukládat ani odvozovat platby. */
import { Button } from "../../ui/button";
import { useDsTexts } from "../../../ds-texts";
import { GridAddActions, GridToolbar, GridToolbarCollapsible } from "../grid/grid-toolbar";
import { GridMoreMenu, type GridMoreItem } from "../grid/grid-more-menu";
import { type GridDensity } from "../grid/grid-zoom";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { TooltipProvider } from "../../ui/tooltip";

/** Uložení kalendáře vlastní aplikace; editor nic nepersistuje. */
export interface PaymentScheduleSaveAction {
  /** Text akce; bez něj přeložené Uložit. */
  label?: string;
  /** APP uloží aktuální kalendář. */
  onSave: () => void | Promise<unknown>;
  /** Zakáže uložení. */
  disabled?: boolean;
  /** Probíhající uložení blokuje další kliknutí. */
  busy?: boolean;
  /** Vysvětlení zakázaného uložení. */
  disabledReason?: string;
}

/** Vnitřní kompozice sdílené lišty. */
export interface PaymentScheduleToolbarProps {
  /** Efektivní zoom formuláře/gridu. */
  zoom: number;
  /** Hustota sdílené lišty. */
  density: GridDensity;
  /** Přeložený název přidání. */
  addLabel: string;
  /** Přidání řádku. */
  onAdd: () => void;
  /** Režim čtení blokuje přidání. */
  readOnly: boolean;
  /** Vedlejší akce z editoru. */
  actions: GridMoreItem[];
  /** Volitelné uložení od APP. */
  saveAction?: PaymentScheduleSaveAction;
}

/** Jediná velikost a kaskáda pro Přidat, vedlejší akce i uložení. */
export function PaymentScheduleToolbar({
  zoom,
  density,
  addLabel,
  onAdd,
  readOnly,
  actions,
  saveAction,
}: PaymentScheduleToolbarProps) {
  const texts = useDsTexts();
  const saveDisabled = Boolean(saveAction?.disabled || saveAction?.busy);
  return (
    <GridToolbar
      zoom={zoom}
      density={density}
      className="border-x-0 border-t-0"
      left={
        <>
          <GridAddActions actions={{ label: addLabel, onClick: onAdd, disabled: readOnly }} />
          <GridToolbarCollapsible>
            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                className="grid-toolbar-control shrink-0"
                disabled={action.disabled}
                onClick={() => void action.onSelect?.()}
              >
                {action.label}
              </Button>
            ))}
          </GridToolbarCollapsible>
        </>
      }
      right={
        <>
          <span data-toolbar-measure="menu" data-toolbar-group="menu" className="contents">
            <GridMoreMenu
              items={[]}
              compact={actions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant="outline"
                  className="grid-toolbar-control"
                  disabled={action.disabled}
                  onClick={() => void action.onSelect?.()}
                >
                  {action.label}
                </Button>
              ))}
              zoom={zoom}
              responsiveOverflow
            />
          </span>
          {saveAction ? (
            <span
              data-toolbar-measure="refresh"
              data-toolbar-group="refresh"
              className="inline-flex shrink-0"
            >
              <TooltipProvider>
                <DisabledReasonTooltip
                  blocked={saveDisabled}
                  content={saveDisabled ? saveAction.disabledReason : undefined}
                >
                  <Button
                    type="button"
                    variant={saveDisabled ? "outline" : "default"}
                    className="grid-toolbar-control"
                    disabled={saveDisabled && !saveAction.disabledReason}
                    aria-disabled={saveDisabled || undefined}
                    aria-busy={saveAction.busy || undefined}
                    onClick={() => {
                      if (!saveDisabled) void saveAction.onSave();
                    }}
                  >
                    {saveAction.label ?? texts.common.save}
                  </Button>
                </DisabledReasonTooltip>
              </TooltipProvider>
            </span>
          ) : null}
        </>
      }
    />
  );
}
