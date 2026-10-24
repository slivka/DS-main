/** Dimenze řádků · vlastní propsání a DB tvar · nesmí načítat data ani měnit kategorie. */
import type { DimensionValue } from "../form/dimension-types";
import type { JournalLine } from "./journal-lines";
/** Hodnoty dimenzí obou stran. */
export interface JournalDimensions {
  /** Strana MD. */
  MD: DimensionValue[];
  /** Strana DAL. */
  D: DimensionValue[];
}
/** DB hodnota dimenze; APP určuje zdroj, DS nepátrá v číselnících. */
export interface JournalDimensionRowValue {
  /** Typ dimenze. */
  type_id: string;
  /** Vlastní hodnota. */
  value_id?: string;
  /** Vozidlo. */
  vehicle_id?: string;
  /** Popisek při čtení, pokud ho APP připojí. */
  label?: string;
  /** Převzaté hodnoty při čtení. */
  inherited?: boolean;
}
/** DB dimenze. */
export interface JournalDimensionsRow {
  /** Strana MD. */
  MD: JournalDimensionRowValue[];
  /** Strana DAL. */
  D: JournalDimensionRowValue[];
}
/** Nejvýše jedna hodnota na typ; první hodnota má přednost. */
export function uniqueDimensions(values: DimensionValue[]): DimensionValue[] {
  return values.filter(
    (value, index) => values.findIndex((item) => item.typeId === value.typeId) === index,
  );
}
/** Hlavička přepíše pouze převzaté hodnoty, včetně odebrání typu. */
export function inheritDimensions(
  own: DimensionValue[],
  header: DimensionValue[],
): DimensionValue[] {
  const manual = uniqueDimensions(own).filter((item) => item.inherited === false);
  return [
    ...manual,
    ...uniqueDimensions(header)
      .filter((item) => !manual.some((value) => value.typeId === item.typeId))
      .map((item) => ({ ...item, inherited: true })),
  ];
}
/** Účinné dimenze obou stran; bez hlavičky ponechá načtené převzaté hodnoty. */
export function effectiveDimensions(
  line: JournalLine,
  header?: DimensionValue[],
): JournalDimensions {
  const own = line.dimensions ?? { MD: [], D: [] };
  return header === undefined
    ? own
    : { MD: inheritDimensions(own.MD, header), D: inheritDimensions(own.D, header) };
}
/** Propsání hlavičky na všechny řádky bez mutace vstupu. */
export function applyHeaderDimensions(
  lines: JournalLine[],
  header?: DimensionValue[],
): JournalLine[] {
  if (header === undefined) return lines;
  return lines.map((line) => ({ ...line, dimensions: effectiveDimensions(line, header) }));
}
/** Vrácení typu na hlavičku; bez hlavičky odstraní ruční výjimku. */
export function resetDimension(own: DimensionValue[], header: DimensionValue[], typeId: string) {
  return inheritDimensions(
    own.filter((item) => item.typeId !== typeId),
    header,
  );
}
/** Počet řádků s ruční odlišnou hodnotou; řádek se počítá jen jednou. */
export function dimensionOverrides(
  lines: JournalLine[],
  header: DimensionValue[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const line of lines) {
    const types = new Set<string>();
    for (const item of [...(line.dimensions?.MD ?? []), ...(line.dimensions?.D ?? [])]) {
      if (item.inherited !== false) continue;
      const inherited = header.find((value) => value.typeId === item.typeId);
      if (item.valueId !== inherited?.valueId || item.kind !== inherited?.kind)
        types.add(item.typeId);
    }
    for (const typeId of types) result[typeId] = (result[typeId] ?? 0) + 1;
  }
  return result;
}
/** Jen ruční neprázdné hodnoty odcházejí do DB. */
export function dimensionsToRow(dimensions: JournalDimensions): JournalDimensionsRow {
  const convert = (values: DimensionValue[]) =>
    uniqueDimensions(values).flatMap((item) =>
      item.inherited === false && item.valueId
        ? [
            {
              type_id: item.typeId,
              ...(item.kind === "vehicle"
                ? { vehicle_id: item.valueId }
                : { value_id: item.valueId }),
            },
          ]
        : [],
    );
  return { MD: convert(dimensions.MD), D: convert(dimensions.D) };
}
/** Načtení DB dimenzí; popisky lze následně doplnit aplikací. */
export function dimensionsFromRow(row: JournalDimensionsRow): JournalDimensions {
  const convert = (values: JournalDimensionRowValue[]): DimensionValue[] =>
    values.map((item) => ({
      typeId: item.type_id,
      valueId: item.vehicle_id ?? item.value_id ?? null,
      label: item.label ?? "",
      inherited: item.inherited ?? false,
      kind: item.vehicle_id ? "vehicle" : "value",
    }));
  return { MD: uniqueDimensions(convert(row.MD)), D: uniqueDimensions(convert(row.D)) };
}
