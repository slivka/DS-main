/** Dialog vazby · vlastní rozpracovaný výběr · hledání i uložení provádí callback aplikace. */
import { forwardRef, useId, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { RecordDialog, Field, FieldGrid } from "../layout/RecordDialog";
import { OptionSelect } from "../form/option-select";
import { LinkedRecordEntry } from "./linked-record-entry";
import type { LinkRecordConfig, LinkRecordValue, LinkedRecordItem } from "./linked-record-types";

export interface LinkRecordDialogProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "onSubmit" | "onChange" | "results"
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates?: LinkedRecordItem[];
  results?: LinkedRecordItem[];
  relationTypes: LinkRecordConfig["relationTypes"];
  onSearch: LinkRecordConfig["onSearch"];
  onSave: (value: LinkRecordValue) => void | Promise<void>;
  title?: string;
}
/** Hledání s ochranou proti opožděným odpovědím a sdílenou ochranou neuložených změn. */
export const LinkRecordDialog = forwardRef<HTMLDivElement, LinkRecordDialogProps>(
  function LinkRecordDialog(
    {
      open,
      onOpenChange,
      candidates = [],
      results = [],
      relationTypes,
      onSearch,
      onSave,
      title,
      className,
      ...props
    },
    ref,
  ) {
    const texts = useDsTexts().linkedRecords;
    const id = useId();
    const request = useRef(0);
    const [query, setQuery] = useState("");
    const [found, setFound] = useState<LinkedRecordItem[] | null>(null);
    const [selected, setSelected] = useState<LinkedRecordItem | null>(null);
    const [relationType, setRelationType] = useState("");
    const [note, setNote] = useState("");
    const [searching, setSearching] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    const dirty = Boolean(selected || relationType || note);
    const changeOpen = (next: boolean) => {
      if (!next) {
        request.current++;
        setQuery("");
        setFound(null);
        setSelected(null);
        setRelationType("");
        setNote("");
        setError(undefined);
        setSearching(false);
      }
      onOpenChange(next);
    };
    const search = async (next: string) => {
      setQuery(next);
      const ticket = ++request.current;
      setError(undefined);
      if (!next.trim()) {
        setFound(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      setFound([]);
      try {
        const matches = await onSearch(next);
        if (ticket === request.current) setFound(matches);
      } catch {
        if (ticket === request.current) setError(texts.searchFailed);
      } finally {
        if (ticket === request.current) setSearching(false);
      }
    };
    const save = async () => {
      if (!selected) {
        setError(texts.selectRequired);
        return;
      }
      if (!relationTypes.some((type) => type.value === relationType)) {
        setError(texts.typeRequired);
        return;
      }
      if (busy) return;
      setBusy(true);
      setError(undefined);
      try {
        await onSave({ record: selected, relationType, note });
        changeOpen(false);
      } catch {
        setError(texts.saveFailed);
      } finally {
        setBusy(false);
      }
    };
    const entries = (items: LinkedRecordItem[], label: string) => (
      <div role="group" aria-label={label} className="min-w-0 space-y-1">
        <h3 className="truncate text-sm font-semibold">{label}</h3>
        {items.map((item) => (
          <LinkedRecordEntry
            key={item.id}
            item={item}
            onOpen={setSelected}
            aria-pressed={selected?.id === item.id}
            disabled={busy}
            className={cn("w-full", selected?.id === item.id && "bg-primary/10")}
          />
        ))}
      </div>
    );
    return (
      <RecordDialog
        open={open}
        onOpenChange={changeOpen}
        size="md"
        title={title ?? texts.link}
        dirty={dirty}
        busy={busy}
        error={error}
        onSubmit={() => void save()}
      >
        <div ref={ref} className={cn("min-w-0 space-y-3", className)} {...props}>
          <FieldGrid cols={12}>
            <Field span={12} label={texts.search} htmlFor={`${id}-search`}>
              <Input
                id={`${id}-search`}
                type="search"
                value={query}
                disabled={busy}
                onChange={(event) => void search(event.target.value)}
              />
            </Field>
          </FieldGrid>
          <FieldGrid cols={12}>
            <Field span={12}>
              {candidates.length ? entries(candidates, texts.suggestions) : null}
              {searching ? (
                <p role="status" aria-busy="true" className="text-sm text-muted-foreground">
                  {texts.searching}
                </p>
              ) : null}
              {!searching && (found ?? results).length
                ? entries(found ?? results, texts.results)
                : null}
              {!searching && query.trim() && !(found ?? results).length ? (
                <p role="status" className="text-sm text-muted-foreground">
                  {texts.noResults}
                </p>
              ) : null}
            </Field>
          </FieldGrid>
          <FieldGrid cols={12}>
            <Field span={12} label={texts.relationType} htmlFor={`${id}-type`}>
              <OptionSelect
                id={`${id}-type`}
                value={relationType}
                onChange={setRelationType}
                options={relationTypes}
                disabled={busy}
              />
            </Field>
            <Field span={12} label={texts.note} htmlFor={`${id}-note`}>
              <Textarea
                id={`${id}-note`}
                value={note}
                disabled={busy}
                onChange={(event) => setNote(event.target.value)}
              />
            </Field>
          </FieldGrid>
        </div>
      </RecordDialog>
    );
  },
);
