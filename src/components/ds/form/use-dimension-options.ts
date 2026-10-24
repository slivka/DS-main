/** Načítání dimenzí · vlastní životnost dotazu · nesmí zapisovat vybranou hodnotu. */
import { useEffect, useState } from "react";
import type { DimensionOptionItem, LoadDimensionOptions } from "./dimension-types";
/** Každý dotaz ignoruje opožděné výsledky předchozího typu či hledání. */
export function useDimensionOptions(
  typeId: string | undefined,
  query: string,
  loadOptions: LoadDimensionOptions,
) {
  const [result, setResult] = useState<{
    key: string; options: DimensionOptionItem[]; failed: boolean; loading: boolean;
  }>({ key: "", options: [], failed: false, loading: false });
  const key = `${typeId ?? ""}:${query}`;
  useEffect(() => {
    if (!typeId) return;
    let active = true;
    const timer = setTimeout(() => {
      setResult({ key, options: [], failed: false, loading: true });
      Promise.resolve().then(() => loadOptions(typeId, query)).then(
        (options) => { if (active) setResult({ key, options, failed: false, loading: false }); },
        () => { if (active) setResult({ key, options: [], failed: true, loading: false }); },
      );
    }, 150);
    return () => { active = false; clearTimeout(timer); };
  }, [typeId, query, loadOptions, key]);
  return result.key === key ? result : { options: [], failed: false, loading: Boolean(typeId) };
}
