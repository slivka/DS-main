/** Propojené záznamy · vlastní kompozici seznamu/toku · nic nenačítá ani doménově nepočítá. */
import { forwardRef, useId, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { GridSegmentedToggle } from "../grid/grid-segmented-toggle";
import { TruncatedText } from "./truncated-text";
import { SettlementBar } from "./settlement-bar";
import { LinkedRecordEntry } from "./linked-record-entry";
import { LinkRecordDialog } from "./link-record-dialog";
import type {
  LinkedRecordGroup,
  LinkedRecordItem,
  LinkedRecordModifiers,
  LinkedRecordsMode,
  SettlementRow,
  LinkRecordConfig,
  LinkRecordValue,
} from "./linked-record-types";
export type * from "./linked-record-types";

export interface LinkedRecordsPanelProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  groups: LinkedRecordGroup[];
  settlement?: SettlementRow[];
  mode: LinkedRecordsMode;
  onModeChange: (mode: LinkedRecordsMode) => void;
  collapsedGroups: string[];
  onCollapsedGroupsChange: (ids: string[]) => void;
  onOpen: (item: LinkedRecordItem, modifiers: LinkedRecordModifiers) => void;
  onRemove?: (item: LinkedRecordItem) => void | Promise<void>;
  /** Jediné potvrzení v DS; false předá potvrzení aplikaci. */
  confirmUnlink?: boolean;
  /** Pole důvodu; bez required je výchozí povinné. */
  unlinkReason?: { label?: string; required?: boolean; placeholder?: string };
  /** Odebrání s důvodem; má přednost před onRemove. */
  onUnlink?: (item: LinkedRecordItem, reason: string) => void | Promise<void>;
  onLink?: (value: LinkRecordValue) => void | Promise<void>;
  linkDialog?: LinkRecordConfig;
  emptyText?: string;
}
/** Seznam vazeb a tok uzlů pro záložku RecordSidePanel; skupiny i režim řídí aplikace. */
export const LinkedRecordsPanel = forwardRef<HTMLDivElement, LinkedRecordsPanelProps>(
  function LinkedRecordsPanel(
    {
      groups,
      settlement,
      mode,
      onModeChange,
      collapsedGroups,
      onCollapsedGroupsChange,
      onOpen,
      onRemove,
      onUnlink,
      confirmUnlink = true,
      unlinkReason,
      onLink,
      linkDialog,
      emptyText,
      className,
      ...props
    },
    ref,
  ) {
    const texts = useDsTexts().linkedRecords;
    const id = useId();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { confirm, confirmDialog } = useConfirmDialog();
    const visible = groups.filter((group) => group.items.length);
    const flow = Array.from(
      new Map(visible.flatMap((group) => group.items).map((item) => [item.id, item])).values(),
    ).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    const remove = (item: LinkedRecordItem) => {
      if (!item.removable || (!onRemove && !onUnlink)) return;
      const perform = (reason: string) =>
        void (onUnlink ? onUnlink(item, reason) : onRemove?.(item));
      if (!confirmUnlink) {
        perform("");
        return;
      }
      confirm({
        title: texts.removeTitle,
        description: texts.removeDescription(item.number),
        confirmLabel: texts.remove,
        destructive: true,
        reason: unlinkReason
          ? {
              label: unlinkReason.label ?? texts.unlinkReason,
              required: unlinkReason.required ?? true,
              placeholder: unlinkReason.placeholder ?? texts.unlinkReasonPlaceholder,
            }
          : undefined,
        onConfirm: perform,
      });
    };
    return (
      <div ref={ref} className={cn("min-w-0 space-y-3", className)} {...props}>
        {settlement?.length ? <SettlementBar rows={settlement} /> : null}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <GridSegmentedToggle
            ariaLabel={texts.mode}
            value={mode}
            defaultValue="list"
            onChange={(next) => onModeChange(next as LinkedRecordsMode)}
            options={[
              { value: "list", label: texts.list },
              { value: "flow", label: texts.flow },
            ]}
          />
          {onLink ? (
            <Button type="button" variant="outline" onClick={() => setDialogOpen(true)}>
              {texts.link}
            </Button>
          ) : null}
        </div>
        {!visible.length ? (
          <p role="status" className="text-sm text-muted-foreground">
            {emptyText ?? texts.empty}
          </p>
        ) : mode === "flow" ? (
          <ol aria-label={texts.flow} className="flex min-w-0 flex-wrap gap-2">
            {flow.map((item, index) => (
              <li
                key={item.id}
                className="flex min-w-0 max-w-full flex-[1_1_12rem] items-center gap-2"
              >
                <LinkedRecordEntry item={item} variant="node" onOpen={onOpen} />
                {index < flow.length - 1 ? (
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          visible.map((group, index) => {
            const collapsed = collapsedGroups.includes(group.id);
            const contentId = `${id}-${index}`;
            return (
              <section key={group.id} className="min-w-0 border-t border-border pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full min-w-0 justify-between gap-2 px-2 font-semibold"
                  aria-expanded={!collapsed}
                  aria-controls={contentId}
                  onClick={() =>
                    onCollapsedGroupsChange(
                      collapsed
                        ? collapsedGroups.filter((value) => value !== group.id)
                        : [...collapsedGroups, group.id],
                    )
                  }
                >
                  <TruncatedText text={group.label} className="min-w-0 flex-1 text-left" />
                  <span
                    className="min-w-0 truncate text-xs font-normal text-muted-foreground"
                    title={texts.count(group.items.length)}
                  >
                    {texts.count(group.items.length)}
                  </span>
                  {collapsed ? (
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
                  )}
                </Button>
                <ul id={contentId} hidden={collapsed} className="min-w-0 divide-y divide-border">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex min-w-0 flex-wrap items-center gap-1">
                      <LinkedRecordEntry item={item} onOpen={onOpen} />
                      {onRemove || onUnlink ? (
                        <DisabledReasonTooltip
                          blocked={!item.removable}
                          content={
                            !item.removable
                              ? (item.removeDisabledReason ?? texts.removeBlocked)
                              : undefined
                          }
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-disabled={!item.removable}
                            className="shrink-0 text-destructive"
                            onClick={() => remove(item)}
                          >
                            {texts.remove}
                          </Button>
                        </DisabledReasonTooltip>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
        {confirmDialog}
        {onLink ? (
          <LinkRecordDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            candidates={linkDialog?.candidates}
            results={linkDialog?.results}
            relationTypes={linkDialog?.relationTypes ?? []}
            onSearch={linkDialog?.onSearch ?? (async () => [])}
            onSave={onLink}
          />
        ) : null}
      </div>
    );
  },
);
