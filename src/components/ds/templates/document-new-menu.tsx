/** Nabídka Nový · vlastní kompozici sdíleného menu · nesmí vytvářet doklady. */
import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { ChevronDown } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
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
    return (
      <DropdownMenu>
        <div className="inline-flex shrink-0">
          {onPrimary ? (
            <Button
              {...props}
              ref={ref}
              type="button"
              size="sm"
              className={cn("grid-toolbar-control grid-toolbar-primary rounded-r-none", className)}
              onClick={onPrimary}
            >
              {icon}
              {label ?? children ?? t.newDocument}
            </Button>
          ) : null}
          <DropdownMenuTrigger asChild>
            <Button
              {...props}
              ref={onPrimary ? undefined : ref}
              type="button"
              size="sm"
              aria-label={onPrimary ? `${label ?? t.newDocument} – ${t.menu}` : props["aria-label"]}
              className={cn(
                "grid-toolbar-control grid-toolbar-primary shrink-0",
                onPrimary && "rounded-l-none border-l border-primary-foreground/30 px-2",
                className,
              )}
            >
              {onPrimary ? (
                <ChevronDown aria-hidden="true" className="size-4" />
              ) : (
                <>
                  {icon}
                  {label ?? children ?? t.newDocument}
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent align="start">
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
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
