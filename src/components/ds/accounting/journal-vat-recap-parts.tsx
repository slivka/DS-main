/**
 * Části řádku rekapitulace DPH (2.118.0): název kódu se štítkem KH a značka ruční opravy.
 * Nesmí: počítat daň.
 */
import { Pencil } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useJournalEditor } from "./journal-editor-context";
import type { VatCodeOption } from "./journal-lines";
import type { VatGroup } from "./journal-vat-groups";
import { vatCodeMenuLabel } from "./vat-code-labels";

const amount = (value: number) => formatAmount(value, 2);

/** Název kódu v rekapitulaci: „Z – Tuzemsko základní (21 %)“ + štítek oddílu KH. */
export function CodeCell({
  code,
  fallback,
}: {
  code: VatCodeOption | undefined;
  fallback: string;
}) {
  const { editor } = useJournalEditor();
  const kh = editor.props.vat?.showKhSection !== false ? code?.khSection : undefined;
  const label = code ? vatCodeMenuLabel(code) : fallback;
  return (
    <td className="max-w-0 px-2 py-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate" title={label}>
          {label}
        </span>
        {kh ? (
          <span
            data-slot="journal-vat-kh"
            className="ds-badge inline-flex shrink-0 items-center rounded-sm border border-border bg-muted px-1.5 text-xs leading-none text-muted-foreground"
          >
            {editor.dsTexts.vatFive.khSection.replace("{section}", kh)}
          </span>
        ) : null}
      </span>
    </td>
  );
}

/** Opravená daň: tužka; bublina ukáže vypočtenou daň a rozdíl, klik opravu zruší. */
export function OverrideMark({ group }: { group: VatGroup }) {
  const { editor } = useJournalEditor();
  const { vatGroups, t } = editor;
  const texts = t.vatGroups;
  const info = `${texts.calculated} ${amount(group.calculatedTax)} · ${texts.difference} ${amount(group.difference)}`;
  const canReset = vatGroups.canOverride && !group.selfAssessment;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot={canReset ? "journal-vat-reset" : "journal-vat-calculated"}
          aria-label={`${texts.calculatedInfo}: ${info}${canReset ? ` – ${editor.dsTexts.vatFive.cancelOverride}` : ""}`}
          onClick={canReset ? () => vatGroups.resetOverride(group) : undefined}
          className="inline-flex text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Pencil className="size-[0.9em]" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {info}
        {canReset ? <div>{editor.dsTexts.vatFive.cancelOverride}</div> : null}
      </TooltipContent>
    </Tooltip>
  );
}
