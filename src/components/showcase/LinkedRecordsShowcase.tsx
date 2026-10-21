/** Ukázky vazeb · vlastní demo akce a data · nesmí se distribuovat. */
import { useState } from "react";
import {
  LinkedRecordsPanel,
  PageHeader,
  OptionSelect,
  type LinkedRecordsMode,
  type LinkedRecordGroup,
  type LinkedRecordItem,
  type LinkedRecordModifiers,
} from "../ds";
import {
  ASSET_GROUPS,
  LINK_CANDIDATES,
  LINK_GROUPS,
  LINK_SETTLEMENT,
  LINK_TYPES,
} from "./linked-record-data";
export function LinkedRecordsDemo({
  readOnly = false,
  initialMode = "list",
  initialGroups = LINK_GROUPS,
}: {
  readOnly?: boolean;
  initialMode?: LinkedRecordsMode;
  initialGroups?: LinkedRecordGroup[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [mode, setMode] = useState(initialMode);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [opened, setOpened] = useState<{
    item: LinkedRecordItem;
    modifiers: LinkedRecordModifiers;
  }>();
  return (
    <div className="min-w-0 space-y-3">
      <LinkedRecordsPanel
        groups={
          readOnly
            ? groups.map((group) => ({
                ...group,
                items: group.items.map((item) => ({
                  ...item,
                  removable: false,
                  removeDisabledReason: "Máte pouze právo číst doklady.",
                })),
              }))
            : groups
        }
        mode={mode}
        onModeChange={setMode}
        collapsedGroups={collapsed}
        onCollapsedGroupsChange={setCollapsed}
        settlement={initialGroups === LINK_GROUPS ? LINK_SETTLEMENT : undefined}
        onOpen={(item, modifiers) => setOpened({ item, modifiers })}
        onRemove={(item) => {
          if (readOnly) return;
          setGroups((values) =>
            values.map((group) => ({
              ...group,
              items: group.items.filter((record) => record.id !== item.id),
            })),
          );
        }}
        unlinkReason={{ required: true }}
        onLink={
          readOnly
            ? undefined
            : (value) =>
                setGroups((values) =>
                  values.map((group) =>
                    group.id === "manual"
                      ? {
                          ...group,
                          items: [
                            ...group.items,
                            {
                              ...value.record,
                              relationType: LINK_TYPES.find(
                                (type) => type.value === value.relationType,
                              )?.label,
                              note: value.note,
                            },
                          ],
                        }
                      : group,
                  ),
                )
        }
        linkDialog={{
          candidates: LINK_CANDIDATES,
          relationTypes: LINK_TYPES,
          onSearch: async (query) =>
            LINK_CANDIDATES.filter((item) =>
              `${item.number} ${item.name} ${item.amount}`
                .toLocaleLowerCase("cs")
                .includes(query.toLocaleLowerCase("cs")),
            ),
        }}
      />
      {opened ? (
        <section className="min-w-0 border-l border-border pl-3" aria-label="Otevřený doklad">
          <PageHeader title={opened.item.number} />
          <p className="truncate text-sm" title={opened.item.name}>
            {opened.item.name}
          </p>
          <p role="status" className="text-xs text-muted-foreground">
            {opened.modifiers.target === "replace"
              ? "Nahrazen obsah panelu"
              : "Otevřeno v sousedním panelu"}
          </p>
        </section>
      ) : null}
    </div>
  );
}
export function LinkedRecordsShowcase() {
  const [scenario, setScenario] = useState("invoice");
  return (
    <section className="min-w-0 space-y-6" data-testid="linked-records-showcase">
      <PageHeader title="Propojené doklady" />
      <div className="max-w-sm">
        <OptionSelect
          ariaLabel="Ukázka propojení"
          value={scenario}
          onChange={setScenario}
          options={[
            { value: "invoice", label: "Částečně uhrazená faktura" },
            { value: "asset", label: "Majetek a storno" },
            { value: "readonly", label: "Bez práva upravovat" },
          ]}
        />
      </div>
      <LinkedRecordsDemo
        key={scenario}
        readOnly={scenario === "readonly"}
        initialGroups={scenario === "asset" ? ASSET_GROUPS : LINK_GROUPS}
      />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 max-w-sm space-y-3">
          <PageHeader title="Úzký panel" />
          <LinkedRecordsDemo />
        </section>
        <section className="min-w-0 space-y-3">
          <PageHeader title="Tok dokladů" />
          <LinkedRecordsDemo initialMode="flow" />
        </section>
      </div>
      <LinkedRecordsDemo initialGroups={[]} />
    </section>
  );
}
