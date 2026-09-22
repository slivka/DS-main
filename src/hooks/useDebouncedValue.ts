import { useEffect, useState } from "react";

/**
 * Zpožděná hodnota – u velkých gridů se tak nefiltruje při každém stisku klávesy.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
