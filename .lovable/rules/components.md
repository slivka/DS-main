# Components

Component catalog for **Design System**. Import all components from `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b`.

### AccountCode

```ts
import { AccountCode } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccountSelect

```ts
import { AccountSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AddressFieldGrid

```ts
import { AddressFieldGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `countries` | object | `—` |
| `showCountry` | boolean | `true` |
| `countryClassName` | string | `sm:col-span-1` |
| `className` | string | `sm:col-span-3` |
| `children` | any | `—` |
| `labels` | any | `—` |
| `defaultCountry` | string | `SK` |

### AmountCell

```ts
import { AmountCell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AmountInput

```ts
import { AmountInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AppFontSizeControl

```ts
import { AppFontSizeControl } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AppShell

```ts
import { AppShell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AsOfDateField

```ts
import { AsOfDateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Breadcrumbs

```ts
import { Breadcrumbs } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BulkSelectionBar

```ts
import { BulkSelectionBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `count` | number | `—` |
| `total` | number | `—` |
| `onSelectAll` | function | `—` |
| `onClear` | function | `—` |
| `className` | string | `whitespace-nowrap` |
| `entity` | object | `—` |
| `showZero` | boolean | `—` |
| `clearLabel` | string | `Zrušit` |
| `texts` | any | `—` |

### CalendarPicker

```ts
import { CalendarPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CategorySelect

```ts
import { CategorySelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChipMultiSelect

```ts
import { ChipMultiSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CollapsibleSection

```ts
import { CollapsibleSection } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | any | `—` |
| `children` | any | `—` |
| `defaultOpen` | boolean | `true` |
| `className` | string | `group flex h-12 cursor-pointer flex-row items-center justify-between gap-3 bg-card px-4 py-0 transition-colors hover:bg-muted/40` |
| `right` | any | `—` |

### ColumnFilter

```ts
import { ColumnFilter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Použijte jako automatický filtr v záhlaví DataGridu; podporuje seskupené volby a přepisovatelné české texty.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `selected` | any | `—` |
| `onChange` | function | `—` |
| `label` | string | `—` |
| `children` | any | `—` |
| `texts` | any | `—` |

**Examples:**

_Filtr hodnot_
```tsx
<ColumnFilter options={options} selected={selected} onChange={setSelected} label="Datum" />
```

**Avoid:**

- Nevkládejte pevné uživatelské texty; předejte je přes texts.

### ColumnPicker

```ts
import { ColumnPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ColumnResizeHandle

```ts
import { ColumnResizeHandle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ComboboxResizeHandle

```ts
import { ComboboxResizeHandle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandPalette

```ts
import { CommandPalette } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContactSelect

```ts
import { ContactSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CountrySelect

```ts
import { CountrySelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `id` | string | `—` |
| `countries` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `disabled` | boolean | `—` |
| `placeholder` | string | `Vyberte stát` |
| `className` | string | `truncate` |

### DataGrid

```ts
import { DataGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Použijte pro tabulkové přehledy s řazením, filtrováním, součty a exportem. Datumové sloupce označené exportType date nebo datetime automaticky nabízejí filtr podle roku, čtvrtletí, měsíce i jednotlivého data.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `storageKey` | string | `—` |
| `title` | any | `—` |
| `hideTitleMark` | boolean | `—` |
| `exportTitle` | string | `—` |
| `rows` | any | `—` |
| `columns` | any | `—` |
| `rowKey` | function | `—` |
| `loading` | boolean | `—` |
| `error` | any | `—` |
| `onRetry` | function | `—` |
| `onRowClick` | function | `—` |
| `actions` | any | `—` |
| `toolbarLeft` | any | `—` |
| `filters` | any | `—` |
| `filterChips` | any | `—` |
| `onClearFilters` | function | `—` |
| `emptyTitle` | string | `—` |
| `emptyDescription` | string | `—` |
| `emptyActionLabel` | string | `—` |
| `onEmptyAction` | function | `—` |
| `exportName` | string | `—` |
| `exportMeta` | any | `—` |
| `defaultSort` | string | `—` |
| `onEditRow` | function | `—` |
| `onDeleteRow` | function | `—` |
| `deleteConfirm` | function | `—` |
| `rowActions` | function | `—` |
| `actionsLabel` | string | `—` |
| `columnFilters` | boolean | `true` |
| `groupable` | boolean | `true` |
| `defaultGroupBy` | string | `—` |
| `paginated` | boolean | `true` |
| `plain` | boolean | `—` |
| `hideToolbar` | boolean | `—` |
| `hideDefaultActions` | boolean | `—` |
| `canEditRow` | function | `—` |
| `canDeleteRow` | function | `—` |
| `selectable` | boolean | `—` |
| `selectionActions` | function | `—` |
| `selectMode` | boolean | `—` |
| `onSelectedRowsChange` | function | `—` |
| `hideSelectionToggle` | boolean | `—` |
| `sidePanel` | any | `—` |
| `activeRowKey` | string | `—` |
| `showTotalRow` | boolean | `true` |
| `onColumnFiltersChange` | function | `—` |
| `onSearchChange` | function | `—` |
| `className` | string | `ml-auto flex min-w-0 shrink-0 items-center gap-2` |
| `texts` | any | `—` |

**Examples:**

_Datumový filtr_
```tsx
<DataGrid rows={rows} columns={[{ id: "date", label: "Datum", value: (row) => row.date, exportType: "date" }]} rowKey={(row) => row.id} storageKey="documents" />
```

**Avoid:**

- Nevytvářejte vlastní filtr roku nebo měsíce vedle gridu pro datumový sloupec.
- Neoznačujte datumový sloupec pouze textovým typem, pokud má nabízet datumové skupiny.

### DateField

```ts
import { DateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `id` | string | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `Vyberte datum` |
| `disabled` | boolean | `—` |
| `className` | string | `date-field-trigger absolute right-[0.3em] top-1/2 size-[1.7em] -translate-y-1/2 rounded-[0.35em] !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground` |
| `inputClassName` | string | `—` |
| `maxDate` | any | `—` |
| `minDate` | any | `—` |
| `gridZoom` | number | `—` |
| `onValidityChange` | function | `—` |

### DateRangeField

```ts
import { DateRangeField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DecimalInput

```ts
import { DecimalInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DocumentStatusBadge

```ts
import { DocumentStatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### EntitySwitcher

```ts
import { EntitySwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ErrorBoundary

```ts
import { ErrorBoundary } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `children` | any | `—` |
| `fallback` | any | `—` |
| `onCatch` | function | `—` |
| `resetKey` | any | `—` |

### ExcelExportButton

```ts
import { ExcelExportButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `getData` | function | `—` |
| `exportName` | string | `—` |
| `title` | string | `—` |
| `meta` | any | `—` |
| `label` | string | `Stáhnout vzorový export` |
| `className` | string | `—` |

### Field

```ts
import { Field } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FieldGrid

```ts
import { FieldGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FiscalPeriodSelect

```ts
import { FiscalPeriodSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FontSizeSetting

```ts
import { FontSizeSetting } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormSection

```ts
import { FormSection } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridAction

```ts
import { GridAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridActions

```ts
import { GridActions } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridBody

```ts
import { GridBody } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridEmptyRow

```ts
import { GridEmptyRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridErrorRow

```ts
import { GridErrorRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridExport

```ts
import { GridExport } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridFilterPanel

```ts
import { GridFilterPanel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridFilterToggle

```ts
import { GridFilterToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridGroupRow

```ts
import { GridGroupRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridMoreMenu

```ts
import { GridMoreMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridPagination

```ts
import { GridPagination } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `page` | number | `—` |
| `pageCount` | number | `—` |
| `pageSize` | number | `—` |
| `total` | number | `—` |
| `setPage` | function | `—` |
| `setPageSize` | function | `—` |
| `zoom` | number | `1` |
| `attached` | boolean | `true` |
| `className` | string | `—` |
| `texts` | any | `—` |

### GridProgress

```ts
import { GridProgress } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridResultCount

```ts
import { GridResultCount } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSearch

```ts
import { GridSearch } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSectionToggles

```ts
import { GridSectionToggles } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSelectionToggle

```ts
import { GridSelectionToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSkeletonRows

```ts
import { GridSkeletonRows } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridTitleBar

```ts
import { GridTitleBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridToolbarSeparator

```ts
import { GridToolbarSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridZoomContext

```ts
import { GridZoomContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GroupBar

```ts
import { GroupBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GroupControl

```ts
import { GroupControl } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GroupHeaderRow

```ts
import { GroupHeaderRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HistoryGridAction

```ts
import { HistoryGridAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HistoryPanel

```ts
import { HistoryPanel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### IcoField

```ts
import { IcoField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `onLookup` | function | `—` |
| `busy` | boolean | `false` |
| `disabled` | boolean | `false` |
| `placeholder` | string | `Zadejte IČO nebo název firmy` |
| `className` | string | `pr-9` |
| `resetKey` | any | `—` |
| `lookupLabel` | string | `Vyhledat v rejstříku` |
| `refreshLabel` | string | `Aktualizovat z rejstříku` |

### IcoLink

```ts
import { IcoLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### LegalFormField

```ts
import { LegalFormField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `__clear__` |
| `onChange` | function | `—` |
| `disabled` | boolean | `—` |
| `className` | string | `ml-2 size-4 shrink-0 opacity-50` |
| `placeholder` | string | `Vyberte právní formu` |
| `searchPlaceholder` | string | `Hledat právní formu…` |
| `noResultsText` | string | `Nebyla nalezena žádná právní forma.` |
| `clearLabel` | string | `Zrušit výběr` |

### ListError

```ts
import { ListError } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ListSkeleton

```ts
import { ListSkeleton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### LoadingOverlay

```ts
import { LoadingOverlay } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MonthYearSelect

```ts
import { MonthYearSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MultiSelect

```ts
import { MultiSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NotesCountCell

```ts
import { NotesCountCell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NotesGridAction

```ts
import { NotesGridAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NotesPanel

```ts
import { NotesPanel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### OptionSelect

```ts
import { OptionSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PageHeader

```ts
import { PageHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PeriodFilter

```ts
import { PeriodFilter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### RecordDialog

```ts
import { RecordDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### RecordNotes

```ts
import { RecordNotes } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ResizableCombobox

```ts
import { ResizableCombobox } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SortHead

```ts
import { SortHead } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `id` | any | `—` |
| `label` | string | `—` |
| `sort` | function | `—` |
| `align` | left · right · center | `left` |
| `className` | string | `—` |
| `pin` | boolean | `false` |
| `pinRight` | boolean | `false` |
| `dragProps` | any | `—` |
| `style` | any | `—` |
| `children` | any | `—` |
| `texts` | any | `—` |

### StatusBadge

```ts
import { StatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### StatusDot

```ts
import { StatusDot } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TagPicker

```ts
import { TagPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ThemeToggle

```ts
import { ThemeToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TimeInputRight

```ts
import { TimeInputRight } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `wrapperClassName` | string | `—` |

### TreeView

```ts
import { TreeView } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TruncatedLink

```ts
import { TruncatedLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TruncatedText

```ts
import { TruncatedText } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ViewModeToggle

```ts
import { ViewModeToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### VirtualPad

```ts
import { VirtualPad } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### WorkspaceCompanySwitcher

```ts
import { WorkspaceCompanySwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ZoomControl

```ts
import { ZoomControl } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ZoomGrid

```ts
import { ZoomGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ZoomPane

```ts
import { ZoomPane } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

