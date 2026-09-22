# Design System — Guidelines

## Components

The design system exports these components — import them from `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b` and compose them before building anything from scratch:

`AccountCode`, `AccountSelect`, `AddressFieldGrid`, `AmountCell`, `AmountInput`, `AppFontSizeControl`, `AppShell`, `AsOfDateField`, `Breadcrumbs`, `BulkSelectionBar`, `CalendarPicker`, `CategorySelect`, `ChipMultiSelect`, `CollapsibleSection`, `ColumnFilter`, `ColumnPicker`, `ColumnResizeHandle`, `ComboboxResizeHandle`, `CommandPalette`, `ContactSelect`, `CountrySelect`, `DataGrid`, `DateField`, `DateRangeField`, `DecimalInput`, `DocumentStatusBadge`, `EntitySwitcher`, `ErrorBoundary`, `FieldGrid`, `Field`, `FiscalPeriodSelect`, `FontSizeSetting`, `FormSection`, `GridAction`, `GridActions`, `GridBody`, `GridEmptyRow`, `GridErrorRow`, `GridExport`, `GridFilterPanel`, `GridFilterToggle`, `GridGroupRow`, `GridMoreMenu`, `GridPagination`, `GridProgress`, `GridResultCount`, `GridSearch`, `GridSectionToggles`, `GridSelectionToggle`, `GridSkeletonRows`, `GridTitleBar`, `GridToolbarSeparator`, `GridZoomContext`, `GroupBar`, `GroupControl`, `GroupHeaderRow`, `HistoryGridAction`, `HistoryPanel`, `IcoField`, `IcoLink`, `LegalFormField`, `ListError`, `ListSkeleton`, `LoadingOverlay`, `MonthYearSelect`, `MultiSelect`, `NotesCountCell`, `NotesGridAction`, `NotesPanel`, `OptionSelect`, `PageHeader`, `PeriodFilter`, `RecordDialog`, `RecordNotes`, `ResizableCombobox`, `SortHead`, `StatusBadge`, `StatusDot`, `TagPicker`, `ThemeToggle`, `TimeInputRight`, `TreeView`, `TruncatedLink`, `TruncatedText`, `ViewModeToggle`, `VirtualPad`, `WorkspaceCompanySwitcher`, `ZoomControl`, `ZoomGrid`, `ZoomPane`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b/styles.css` (source — preferred import)
- `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

