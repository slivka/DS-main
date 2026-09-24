import type { ReactNode } from "react";

/** Text pro hledání v menu bez rozdílů diakritiky a velikosti písmen. */
export function normalizeNavSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("cs-CZ").trim();
}

export function navSearchTokens(value: string) {
  return normalizeNavSearch(value).split(/\s+/).filter(Boolean);
}

export function matchesNavSearch(itemLabel: string, groupLabel: string, query: string) {
  const haystack = normalizeNavSearch(`${itemLabel} ${groupLabel}`);
  return navSearchTokens(query).every((token) => haystack.includes(token));
}

/** Zvýrazní části popisku odpovídající jednotlivým slovům hledání. */
export function highlightNavMatch(label: string, query: string): ReactNode {
  const tokens = navSearchTokens(query);
  if (!tokens.length) return label;
  const normalizedChars = Array.from(label, (character) => normalizeNavSearch(character));
  const normalized = normalizedChars.join("");
  const marked = new Set<number>();
  for (const token of tokens) {
    let from = 0;
    while (from < normalized.length) {
      const index = normalized.indexOf(token, from);
      if (index < 0) break;
      for (let position = index; position < index + token.length; position += 1) marked.add(position);
      from = index + token.length;
    }
  }
  if (!marked.size) return label;
  const parts: ReactNode[] = [];
  let chunk = "";
  let active = marked.has(0);
  Array.from(label).forEach((character, index) => {
    const next = marked.has(index);
    if (chunk && next !== active) {
      parts.push(active ? <strong key={parts.length}>{chunk}</strong> : chunk);
      chunk = "";
    }
    active = next;
    chunk += character;
  });
  if (chunk) parts.push(active ? <strong key={parts.length}>{chunk}</strong> : chunk);
  return parts;
}