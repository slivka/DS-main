/** Filtr dimenze · vlastní adaptaci na sdílený ColumnFilter · bez doménového filtrování. */
import * as React from "react";
import { ColumnFilter } from "../grid/ColumnFilter";
import { formatCodeName } from "../../../lib/code-format";
import { useDsTexts } from "../../../ds-texts";
import type { DimensionOptionItem } from "./dimension-types";
/** Props filtru dimenze seznamu dokladů. */
export interface DimensionFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aktivní nabídka dodaná APP. */
  options: DimensionOptionItem[];
  /** Vybrané identity; prázdný set je bez filtru. */
  selected: Set<string>;
  /** Řízená změna filtru. */
  onSelectionChange: (value: Set<string>) => void;
  /** Přístupný název typu dimenze. */
  label?: string;
}
/** Hledání dimenzí sdílí stejný checklist a význam prázdného filtru jako grid. */
export const DimensionFilter = React.forwardRef<HTMLDivElement, DimensionFilterProps>(
  function DimensionFilter({ options, selected, onSelectionChange, label, ...props }, ref) {
    const t = useDsTexts().dimensions;
    return (
      <div ref={ref} {...props}>
        <ColumnFilter
          label={label ?? t.title}
          selected={selected}
          onChange={onSelectionChange}
          options={options
            .filter((option) => !option.inactive && !option.disabled)
            .map((option) => ({
              value: option.id,
              label: formatCodeName(option.code, option.label),
            }))}
        />
      </div>
    );
  },
);
