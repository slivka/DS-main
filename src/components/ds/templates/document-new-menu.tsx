/** Nabídka Nový · vlastní kompozici sdíleného menu · nesmí vytvářet doklady. */
import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { SplitButton } from "../form/split-button";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { DisabledReasonMenuItem } from "../feedback/disabled-reason-menu-item";
import type { DocumentTemplate, DuplicationMode } from "./template-types";
/** Vlastnosti tlačítka Nový na liště GridFrame (toolbarLeft). */
export interface DocumentNewMenuProps extends Omit<
  ComponentPropsWithoutRef<typeof Button>,
  "onSelect"
> {
  /** Vzory od APP. */ templates: Pick<DocumentTemplate, "id" | "name">[];
  /** Prázdný doklad. */ onBlank: () => void;
  /** Vybraný vzor a režim. */ onTemplate: (id: string, mode: DuplicationMode) => void;
  /** Správa. */ onManage: () => void;
  /** Vlastní popisek. */ label?: string;
  /** Ikona z APP. */ icon?: ReactNode;
  /** Hlavní klik; přítomnost zapíná split-button. */ onPrimary?: () => void;
}
/** Vlastnosti sdílených položek nabídky Nový. */
export interface DocumentNewMenuItemsProps {
  /** Vzory od APP. */ templates: Pick<DocumentTemplate, "id" | "name">[];
  /** Prázdný doklad. */ onBlank: () => void;
  /** Vybraný vzor a režim. */ onTemplate: (id: string, mode: DuplicationMode) => void;
  /** Správa. */ onManage: () => void;
}
/**
 * Položky nabídky Nový – používá je DocumentNewMenu i split režim primární akce
 * lišty gridu (GridAddAction.menu), aby obě cesty nabízely stejné volby.
 */
export function DocumentNewMenuItems({
  templates,
  onBlank,
  onTemplate,
  onManage,
}: DocumentNewMenuItemsProps) {
  const t = useDsTexts().templates;
  return (
    <>
      <DisabledReasonMenuItem onSelect={onBlank}>{t.blank}</DisabledReasonMenuItem>
      {templates.length ? (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t.fromTemplate}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {templates.map((template) => (
              <DropdownMenuSub key={template.id}>
                <DropdownMenuSubTrigger title={template.name}>
                  <span className="max-w-72 truncate">{template.name}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DisabledReasonMenuItem onSelect={() => onTemplate(template.id, "single")}>
                    {t.create}
                  </DisabledReasonMenuItem>
                  <DisabledReasonMenuItem onSelect={() => onTemplate(template.id, "series")}>
                    {t.createSeries}
                  </DisabledReasonMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ) : (
        <DisabledReasonMenuItem disabled disabledReason={t.noTemplates} onSelect={() => {}}>
          {t.fromTemplate}
        </DisabledReasonMenuItem>
      )}
      <DropdownMenuSeparator />
      <DisabledReasonMenuItem onSelect={onManage}>{t.manage}</DisabledReasonMenuItem>
    </>
  );
}
/** Nabídka nového dokladu; faktura a ZL používají stejný kontrakt. */
export const DocumentNewMenu = forwardRef<HTMLButtonElement, DocumentNewMenuProps>(
  function DocumentNewMenu(
    {
      templates,
      onBlank,
      onTemplate,
      onManage,
      label,
      icon,
      onPrimary,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().templates;
    const items = (
      <DocumentNewMenuItems
        templates={templates}
        onBlank={onBlank}
        onTemplate={onTemplate}
        onManage={onManage}
      />
    );
    if (onPrimary)
      return (
        <SplitButton
          ref={ref}
          icon={icon}
          label={label ?? children ?? t.newDocument}
          actionName={label ?? t.newDocument}
          onClick={() => onPrimary()}
          disabled={props.disabled}
          mainProps={{
            ...props,
            className: cn("grid-toolbar-control grid-toolbar-primary", className),
          }}
          menuProps={{ className: "grid-toolbar-control grid-toolbar-primary" }}
          menu={items}
        />
      );
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            {...props}
            ref={ref}
            type="button"
            size="sm"
            className={cn("grid-toolbar-control grid-toolbar-primary shrink-0", className)}
          >
            {icon}
            {label ?? children ?? t.newDocument}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{items}</DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
