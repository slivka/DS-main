/** Skupinový seznam · vlastní aktivní a zaškrtnutý výběr · nesmí hodnotit výpisy. */
import { forwardRef, useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { FileSeverityIcon, type CheckSeverity } from "../feedback/file-severity";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Položka skupinového seznamu. */
export interface SelectableGroupItem {
  /** Stabilní klíč napříč skupinami. */ id: string;
  /** Titulek. */ title: string;
  /** Doplňující text. */ subtitle?: string;
  /** Stav APP; chyba blokuje zaškrtnutí. */ severity: CheckSeverity;
  /** Vysvětlení stavu. */ message?: string;
  /** Hodnota formátovaná aplikací. */ value?: ReactNode;
  /** Další zákaz zaškrtnutí. */ disabled?: boolean;
  /** Důvod zakázaného výběru. */ disabledReason?: string;
}
/** Skupina položek. */
export interface SelectableGroup {
  /** Klíč. */ id: string;
  /** Nadpis. */ title: string;
  /** Položky. */ items: readonly SelectableGroupItem[];
}
/** Řízený seznam se dvěma nezávislými výběry. */
export interface SelectableGroupListProps extends ComponentPropsWithoutRef<"div"> {
  /** Skupiny. */ groups: readonly SelectableGroup[];
  /** Aktivní položka pro detail. */ activeId?: string;
  /** Žádost o zobrazení detailu. */ onActiveChange: (id: string) => void;
  /** Zaškrtnuté klíče. */ checkedIds: readonly string[];
  /** Žádost o změnu zaškrtnutí. */ onCheckedChange: (ids: string[]) => void;
  /** Zákaz zaškrtnutí; detail zůstává přístupný. */ disabled?: boolean;
  /** Hustota. */ size?: "sm" | "md";
}
/** Jediná podmínka zaškrtnutí včetně hromadné akce. */
export function isGroupItemSelectable(item: SelectableGroupItem) {
  return item.severity !== "error" && !item.disabled;
}
/** Skupiny s roving fokusem a nezávislým zaškrtnutím. */
export const SelectableGroupList = forwardRef<HTMLDivElement, SelectableGroupListProps>(
  function SelectableGroupList(
    {
      groups,
      activeId,
      onActiveChange,
      checkedIds,
      onCheckedChange,
      disabled,
      size = "md",
      className,
      ...props
    },
    ref,
  ) {
    const texts = useDsTexts();
    const t = texts.fileImport;
    const items = groups.flatMap((group) => group.items);
    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const reasonIdBase = useId();
    const focusId = items.some((item) => item.id === activeId) ? activeId : items[0]?.id;
    const toggle = (item: SelectableGroupItem) => {
      if (disabled || !isGroupItemSelectable(item)) return;
      onCheckedChange(
        checkedIds.includes(item.id)
          ? checkedIds.filter((id) => id !== item.id)
          : [...checkedIds, item.id],
      );
    };
    const move = (index: number, key: string) => {
      const next =
        key === "Home"
          ? 0
          : key === "End"
            ? items.length - 1
            : Math.min(items.length - 1, Math.max(0, index + (key === "ArrowDown" ? 1 : -1)));
      const item = items[next];
      if (item) {
        onActiveChange(item.id);
        buttons.current.get(item.id)?.focus();
      }
    };
    return (
      <div
        ref={ref}
        {...props}
        className={cn("min-w-0 space-y-2", className)}
        data-slot="selectable-group-list"
      >
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !items.some(isGroupItemSelectable)}
          className="max-w-full whitespace-normal"
          onClick={() =>
            onCheckedChange(items.filter(isGroupItemSelectable).map((item) => item.id))
          }
        >
          {t.selectValid}
        </Button>
        {!items.length ? <p className="text-sm text-muted-foreground">{t.empty}</p> : null}
        {groups.map((group) => (
          <section key={group.id} aria-label={group.title}>
            <h3 className="flex items-center justify-between gap-2 bg-muted px-2 py-2 text-xs font-semibold">
              <span className="min-w-0 truncate" title={group.title}>
                {group.title}
              </span>
              <span className="tabular-nums">
                {new Intl.NumberFormat(texts.intlLocale).format(group.items.length)}
              </span>
            </h3>
            <ul
              aria-label={group.title}
              className="divide-y divide-border"
            >
              {group.items.map((item) => {
                const blocked = disabled || !isGroupItemSelectable(item);
                const reason = item.disabledReason ?? item.message ?? t.errorBlocked;
                const reasonId = `${reasonIdBase}-${items.findIndex((entry) => entry.id === item.id)}`;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-start gap-2 rounded-sm px-2",
                      size === "sm" ? "py-2" : "py-3",
                      item.id === activeId && "bg-primary/10",
                    )}
                  >
                    <DisabledReasonTooltip
                      blocked={Boolean(blocked)}
                      content={blocked ? reason : item.title}
                    >
                      <Checkbox
                        aria-label={item.title}
                        aria-disabled={blocked || undefined}
                        aria-describedby={blocked ? reasonId : undefined}
                        checked={checkedIds.includes(item.id)}
                        className="mt-1"
                        onCheckedChange={() => toggle(item)}
                      />
                    </DisabledReasonTooltip>
                    <Button
                      type="button"
                      variant="ghost"
                      ref={(node) => {
                        if (node) buttons.current.set(item.id, node);
                        else buttons.current.delete(item.id);
                      }}
                      tabIndex={item.id === focusId ? 0 : -1}
                      aria-pressed={item.id === activeId}
                      aria-describedby={blocked ? reasonId : undefined}
                      className="h-auto min-w-0 flex-1 justify-start whitespace-normal p-0 text-left"
                      onClick={() => onActiveChange(item.id)}
                      onKeyDown={(event) => {
                        if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
                          event.preventDefault();
                          move(
                            items.findIndex((entry) => entry.id === item.id),
                            event.key,
                          );
                        } else if (event.key === " ") {
                          event.preventDefault();
                          toggle(item);
                        }
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-medium">{item.title}</span>
                        {item.subtitle ? (
                          <span className="block break-words text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                    </Button>
                    {blocked ? <span id={reasonId} className="sr-only">{reason}</span> : null}
                    <div className="flex max-w-32 shrink-0 flex-wrap items-center justify-end gap-2">
                      <FileSeverityIcon severity={item.severity} message={item.message} />
                      {item.value ? (
                        <span className="break-words text-right text-xs tabular-nums">
                          {item.value}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    );
  },
);
