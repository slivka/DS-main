/** Přeložené ovládání vazeb; hodnoty a doménové popisky vždy pocházejí z aplikace. */
export interface LinkedRecordTexts {
  mode: string;
  list: string;
  flow: string;
  link: string;
  empty: string;
  remove: string;
  removeTitle: string;
  removeDescription: (name: string) => string;
  removeBlocked: string;
  unlinkReason: string;
  unlinkReasonPlaceholder: string;
  count: (count: number) => string;
  of: string;
  remaining: string;
  search: string;
  suggestions: string;
  results: string;
  searching: string;
  noResults: string;
  relationType: string;
  note: string;
  selectRequired: string;
  typeRequired: string;
  searchFailed: string;
  saveFailed: string;
}
