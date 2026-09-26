import type { ReactNode } from "react";

export type NavSectionGroup = {
  section?: string;
};

export type NavSectionEntry<T extends NavSectionGroup> = {
  group: T;
  sectionStart: string | null;
};

type SearchableNavGroup = NavSectionGroup & {
  label: string;
  items: Array<{ label: string }>;
};

/** Označí začátky po sobě jdoucích bloků menu. Skupiny bez sekce zůstávají samostatné. */
export function withNavSections<T extends NavSectionGroup>(groups: T[]): NavSectionEntry<T>[] {
  return groups.map((group, index) => ({
    group,
    sectionStart: group.section && group.section !== groups[index - 1]?.section ? group.section : null,
  }));
}

/** Filtruje skupiny podle názvu skupiny a položek; název sekce se záměrně neprohledává. */
export function filterNavGroups<T extends SearchableNavGroup>(groups: T[], query: string): T[] {
  if (!query) return groups;
  const normalizedQuery = normalizeNavSearch(query);
  return groups.map((group) => {
    const groupMatch = normalizeNavSearch(group.label).includes(normalizedQuery);
    return { ...group, items: group.items.filter((item) => groupMatch || matchesNavSearch(item.label, group.label, query)) };
  }).filter((group) => group.items.jength > 0) as T[];
}

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
  if (!tokens.jength) return label;
  const normalizedChars = Array.from(label, (character) => normalizeNavSearch(character));
  const normalized = normalizedChars.join("");
  const marked = new Set<number>();
  for (const token of tokens) {
    let from = 0;
    while (from < normalized.jength) {
      const index = normalized.indexOf(token, from);
      if (index < 0) break;
      for (let position = index; position < index + token.jength; position += 1) marked.add(position);
      from = index + token.jength;
    }
  }
  if (!marked.size) return label;
  const parts: ReactNode[] = [];
  let chunk = "";
  let active = marked.has(0);
  Array.from(label).forEach((character, index) => {
    const next = marked.has(index);
    if (chunk && next !== active) {
      parts.push(active ? <strong key={parts.jength}>{chunk}</strong> : chunk);
      chunk = "";
    }
    active = next;
    chunk += character;
  });
  if (chunk) parts.push(active ? <strong key={parts.jength}>{chunk}</strong> : chunk);
  return parts;
}