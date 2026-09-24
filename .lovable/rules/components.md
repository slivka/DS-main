# Components

Component catalog for **Design System**. Import all components from `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b`.

### Accordion

```ts
import { Accordion } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccordionContent

```ts
import { AccordionContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccordionItem

```ts
import { AccordionItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccordionTrigger

```ts
import { AccordionTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccountCode

```ts
import { AccountCode } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AccountSelect

```ts
import { AccountSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr účtu z osnovy; s allowLevels a catalog i výběr třídy / skupiny jako prefix pro výkazy.

**Examples:**

_Třída nebo skupina_
```tsx
<AccountSelect accounts={accounts} catalog={classesAndGroups} allowLevels={["class","group"]} value={prefix} onChange={setPrefix} />
```

**Avoid:**

- Nativní select pro účty
- Doplňování tečky do uloženého kódu

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

### Alert

```ts
import { Alert } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · destructive | `default` |

### AlertDescription

```ts
import { AlertDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialog

```ts
import { AlertDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogAction

```ts
import { AlertDialogAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogCancel

```ts
import { AlertDialogCancel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogContent

```ts
import { AlertDialogContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogDescription

```ts
import { AlertDialogDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogFooter

```ts
import { AlertDialogFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogHeader

```ts
import { AlertDialogHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogOverlay

```ts
import { AlertDialogOverlay } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogPortal

```ts
import { AlertDialogPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogTitle

```ts
import { AlertDialogTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertDialogTrigger

```ts
import { AlertDialogTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AlertTitle

```ts
import { AlertTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

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

Společný rám aplikace s tmavým skupinovým menu, volitelnými bloky přes NavGroup.section, hledáním bez diakritiky, uloženým sbalením skupin a podporou panelů a záložek.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `children` | any | `—` |
| `navGroups` | any | `—` |
| `bottomItems` | any | `—` |
| `appName` | string | `Aplikace` |
| `logo` | any | `—` |
| `showBrand` | boolean | `false` |
| `breadcrumbs` | any | `—` |
| `contextLeft` | any | `—` |
| `subHeader` | any | `—` |
| `actions` | any | `—` |
| `notificationBell` | any | `—` |
| `themeToggleButton` | any | `—` |
| `userMenu` | any | `—` |
| `panels` | any | `—` |
| `activePanel` | string | `—` |
| `onActivePanelChange` | function | `—` |
| `closeLabel` | string | `Zavřít` |
| `collapsed` | boolean | `—` |
| `onCollapsedChange` | function | `—` |
| `menuLabel` | string | `Menu` |
| `collapseLabel` | string | `Sbalit menu` |
| `expandLabel` | string | `Rozbalit menu` |
| `disabledHint` | string | `—` |
| `navStateKey` | string | `—` |
| `navSearch` | boolean | `true` |
| `navSearchPlaceholder` | string | `Hledat v menu…` |
| `navSearchEmptyText` | string | `Nic nenalezeno` |
| `navSearchMenu` | any | `—` |
| `items` | any | `—` |
| `adminNav` | any | `—` |
| `adminMode` | boolean | `—` |
| `adminTitle` | string | `Administrace` |
| `adminButtonLabel` | string | `Administrace` |
| `adminBackLabel` | string | `—` |
| `adminBasePath` | string | `—` |
| `onAdminModeChange` | function | `—` |
| `showLegacyToolbar` | boolean | `—` |

**Examples:**

_Skupiny a hledání_
```tsx
const groups = [{ id: 'invoices', label: 'Faktury', section: 'Doklady', items }];
<AppShell navGroups={groups} navStateKey="accounting" navSearch>{children}</AppShell>
```

**Avoid:**

- Nepoužívejte stejné navStateKey pro nesouvisející aplikace.
- Nenahrazujte hledání v menu globální CommandPalette.
- Nemanipulujte stavem záložek při filtrování menu.

### AsOfDateField

```ts
import { AsOfDateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AsOfDateToggle

```ts
import { AsOfDateToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Modrý přepínač režimu Stav k datu s navazujícím DateField.

**Avoid:**

- AsOfDateField v nových gridových obrazovkách

### AspectRatio

```ts
import { AspectRatio } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Avatar

```ts
import { Avatar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AvatarFallback

```ts
import { AvatarFallback } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### AvatarImage

```ts
import { AvatarImage } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Badge

```ts
import { Badge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · secondary · destructive · outline · success · warning · info | `default` |

### BarBreakdownChart

```ts
import { BarBreakdownChart } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Rozbor nákladů / výnosů po skupinách – vodorovné pruhy s hodnotou a podílem, klik na pruh = filtr.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `selectedId` | string | `—` |
| `onSelect` | function | `—` |
| `total` | number | `—` |
| `decimals` | number | `2` |
| `variant` | primary · cost · revenue | `primary` |
| `showTotal` | boolean | `true` |
| `texts` | any | `—` |

**Examples:**

_Rozbor nákladů_
```tsx
<BarBreakdownChart items={groups} variant="cost" selectedId={group} onSelect={(id) => setGroup(id)} />
```

**Avoid:**

- Graf z externí knihovny pro jednoduchý rozbor
- Barvy natvrdo místo variant

### BookSelect

```ts
import { BookSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr účetní knihy ve formuláři. Jedinou aktivní knihu výchozí displayWhenSingle zobrazí jako hodnotu jen pro čtení a automaticky doplní její id.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `books` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `typeLabels` | object | `—` |
| `placeholder` | string | `Vyberte knihu` |
| `allowEmpty` | boolean | `false` |
| `disabled` | boolean | `—` |
| `displayWhenSingle` | boolean | `true` |
| `id` | string | `—` |
| `className` | string | `—` |

**Examples:**

_Jediná dostupná kniha_
```tsx
<BookSelect books={books} value={bookId} onChange={setBookId} />
```

**Avoid:**

- Nevykreslujte jedinou dostupnou knihu jako zakázaný select.

### Breadcrumb

```ts
import { Breadcrumb } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbEllipsis

```ts
import { BreadcrumbEllipsis } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbItem

```ts
import { BreadcrumbItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbLink

```ts
import { BreadcrumbLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbList

```ts
import { BreadcrumbList } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbPage

```ts
import { BreadcrumbPage } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### BreadcrumbSeparator

```ts
import { BreadcrumbSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### Button

```ts
import { Button } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · destructive · outline · outline-destructive · secondary · ghost · link | `default` |
| `size` | default · sm · lg · icon | `default` |
| `asChild` | boolean | `false` |

### Calendar

```ts
import { Calendar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CalendarDayButton

```ts
import { CalendarDayButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CalendarPicker

```ts
import { CalendarPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Card

```ts
import { Card } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CardContent

```ts
import { CardContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CardDescription

```ts
import { CardDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CardFooter

```ts
import { CardFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CardHeader

```ts
import { CardHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CardTitle

```ts
import { CardTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Carousel

```ts
import { Carousel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `opts` | any | `—` |
| `plugins` | any | `—` |
| `orientation` | horizontal · vertical | `horizontal` |
| `setApi` | function | `—` |

### CarouselContent

```ts
import { CarouselContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CarouselItem

```ts
import { CarouselItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CarouselNext

```ts
import { CarouselNext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CarouselPrevious

```ts
import { CarouselPrevious } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CategorySelect

```ts
import { CategorySelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartContainer

```ts
import { ChartContainer } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartLegend

```ts
import { ChartLegend } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartLegendContent

```ts
import { ChartLegendContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartStyle

```ts
import { ChartStyle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartTooltip

```ts
import { ChartTooltip } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChartTooltipContent

```ts
import { ChartTooltipContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Checkbox

```ts
import { Checkbox } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ChipMultiSelect

```ts
import { ChipMultiSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Collapsible

```ts
import { Collapsible } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CollapsibleContent

```ts
import { CollapsibleContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### CollapsibleTrigger

```ts
import { CollapsibleTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

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

### ComingSoon

```ts
import { ComingSoon } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Command

```ts
import { Command } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandDialog

```ts
import { CommandDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandEmpty

```ts
import { CommandEmpty } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandGroup

```ts
import { CommandGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandInput

```ts
import { CommandInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandItem

```ts
import { CommandItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandList

```ts
import { CommandList } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandPalette

```ts
import { CommandPalette } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `targets` | any | `—` |
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `placeholder` | string | `Hledat stránku…` |
| `emptyText` | string | `Nic nenalezeno.` |

### CommandSeparator

```ts
import { CommandSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CommandShortcut

```ts
import { CommandShortcut } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CompanySwitcher

```ts
import { CompanySwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednořádkový výrazný výběr firmy s hledáním, IČO v nápovědě a posledními položkami.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `recentIds` | any | `—` |
| `label` | string | `Firma` |
| `searchPlaceholder` | string | `Hledat firmu…` |
| `recentLabel` | string | `Poslední` |
| `allLabel` | string | `Všechny firmy` |
| `emptyText` | string | `Žádná firma nebyla nalezena.` |
| `createLabel` | string | `Nová firma` |
| `onCreate` | function | `—` |
| `className` | string | `min-w-0 flex-1` |

**Examples:**

_Základní použití_
```tsx
<CompanySwitcher items={companies} value={companyId} onChange={setCompanyId} />
```

**Avoid:**

- Nenahrazujte nativním selectem.

### ContactSelect

```ts
import { ContactSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenu

```ts
import { ContextMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuCheckboxItem

```ts
import { ContextMenuCheckboxItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuContent

```ts
import { ContextMenuContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuGroup

```ts
import { ContextMenuGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuItem

```ts
import { ContextMenuItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuLabel

```ts
import { ContextMenuLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuPortal

```ts
import { ContextMenuPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuRadioGroup

```ts
import { ContextMenuRadioGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuRadioItem

```ts
import { ContextMenuRadioItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuSeparator

```ts
import { ContextMenuSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuShortcut

```ts
import { ContextMenuShortcut } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuSub

```ts
import { ContextMenuSub } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuSubContent

```ts
import { ContextMenuSubContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuSubTrigger

```ts
import { ContextMenuSubTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextMenuTrigger

```ts
import { ContextMenuTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ContextPill

```ts
import { ContextPill } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednořádkový kontextový přepínač do horní lišty; label slouží jako přístupnostní název a nápověda, detail se ukazuje na široké obrazovce.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `label` | string | `—` |
| `value` | string | `—` |
| `icon` | any | `—` |
| `children` | any | `—` |
| `contentClassName` | string | `—` |
| `contentAlign` | start · center · end | `start` |
| `valueMuted` | boolean | `false` |
| `statusIndicator` | any | `—` |
| `compactValue` | string | `—` |
| `tooltip` | string | `—` |
| `valueClassName` | string | `—` |
| `valueContainerClassName` | string | `—` |
| `detail` | any | `—` |
| `detailClassName` | string | `—` |

**Examples:**

_Kontext s detailem_
```tsx
<ContextPill label="Firma" value="Slivka s.r.o." tooltip="Firma: Slivka s.r.o. · IČO 12345678">…</ContextPill>
```

**Avoid:**

- Nepoužívejte pro běžná formulářová pole.
- Nevkládejte viditelný druhý řádek s popiskem.

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

### CurrencyAmount

```ts
import { CurrencyAmount } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DataGrid

```ts
import { DataGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Použijte pro tabulkové přehledy s řazením, filtrováním, součty a exportem. Nadpis je výchozí skrytý; zobrazte ho jen výslovně přes showTitle. Ruční načtení předejte přes onRefresh; hromadný výběr zapněte selectable. Volitelné period a book vykreslí GridContextBar nad řádkem akcí.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `storageKey` | string | `—` |
| `title` | any | `—` |
| `showTitle` | boolean | `false` |
| `hideTitleMark` | boolean | `—` |
| `exportTitle` | string | `—` |
| `rows` | any | `—` |
| `columns` | any | `—` |
| `rowKey` | function | `—` |
| `loading` | boolean | `—` |
| `error` | any | `—` |
| `onRetry` | function | `—` |
| `onRefresh` | function | `—` |
| `refreshing` | boolean | `—` |
| `onRowClick` | function | `—` |
| `actions` | any | `—` |
| `toolbarLeft` | any | `—` |
| `period` | any | `—` |
| `book` | any | `—` |
| `filters` | any | `—` |
| `filterChips` | any | `—` |
| `onClearFilters` | function | `—` |
| `defaultFilters` | any | `—` |
| `viewMode` | any | `—` |
| `onViewModeChange` | function | `—` |
| `viewZoomKey` | string | `—` |
| `asOf` | any | `—` |
| `addAction` | any | `—` |
| `moreActions` | any | `—` |
| `pdfExport` | function | `—` |
| `extraExports` | any | `—` |
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
| `className` | string | `border border-t-0 bg-card px-2 py-1.5` |
| `texts` | any | `—` |

**Examples:**

_Grid s obnovením a výběrem_
```tsx
<DataGrid rows={rows} columns={columns} rowKey={(row) => row.id} storageKey="doklady" onRefresh={reload} refreshing={loading} selectable />
```

**Avoid:**

- Vlastní tlačítko obnovení mimo lištu gridu
- Přepisovat klávesu F5
- Textové tlačítko Vybrat více místo GridSelectionToggle
- Zobrazovat nadpis gridu bez výslovného showTitle
- ExcelExportButton uvnitř gridu
- Ovládání gridu nad společným řádkem akcí
- Akce Nový v PageHeader místo addAction

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
| `className` | string | `date-field-trigger absolute right-[0.3em] top-1/2 size-[1.7em] -translate-y-1/2 rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground` |
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

### Dialog

```ts
import { Dialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogClose

```ts
import { DialogClose } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogContent

```ts
import { DialogContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogDescription

```ts
import { DialogDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogFooter

```ts
import { DialogFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogHeader

```ts
import { DialogHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogOverlay

```ts
import { DialogOverlay } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogPortal

```ts
import { DialogPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogTitle

```ts
import { DialogTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DialogTrigger

```ts
import { DialogTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DimensionSelect

```ts
import { DimensionSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DocumentForm

```ts
import { DocumentForm } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Celostránkový editor dokladu. Hlavička DocumentHeaderValue, viditelné skupiny přes fields (documentFieldsForType), řádky přes JournalLinesEditor a další záložky přes tabs. Číslo, kurz, kniha po založení a směr jsou jen ke čtení; formulář nic neukládá.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | string | `—` |
| `description` | any | `—` |
| `value` | any | `—` |
| `onChange` | function | `—` |
| `lines` | any | `—` |
| `onLinesChange` | function | `—` |
| `books` | any | `—` |
| `accounts` | any | `—` |
| `partners` | any | `—` |
| `dimensions` | any | `—` |
| `currencies` | any | `—` |
| `fields` | any | `—` |
| `editableFields` | any | `—` |
| `isNew` | boolean | `false` |
| `mainSide` | MD · D | `—` |
| `mainAccountLocked` | boolean | `false` |
| `linesEditorProps` | any | `—` |
| `tabs` | any | `—` |
| `status` | any | `—` |
| `approved` | boolean | `—` |
| `changedBy` | string | `—` |
| `changedAt` | string | `—` |
| `actions` | any | `—` |
| `readOnly` | boolean | `false` |
| `readOnlyReason` | any | `—` |
| `texts` | any | `—` |
| `className` | string | `flex flex-wrap items-center gap-2` |

**Examples:**

_Přijatá faktura_
```tsx
<DocumentForm title="Přijatá faktura" value={header} onChange={setHeader} lines={lines} onLinesChange={setLines} books={books} accounts={accounts} partners={partners} fields={documentFieldsForType("FP")} mainSide="D" status="filed" tabs={[{ id: "schedule", label: "Platební kalendář", content: <PaymentScheduleEditor … /> }]} />
```

**Avoid:**

- Nečíslujte doklad ani nepřepisujte kurz ve formuláři – číslo přiděluje databáze.
- Neřiďte stav Zaúčtován přes readOnly; použijte editableFields.
- Nepředávejte sideFields přímo – patří do linesEditorProps.

### DocumentStatusBadge

```ts
import { DocumentStatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DraftRestoredBanner

```ts
import { DraftRestoredBanner } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Zobrazte nad formulářem, když useTabDraft vrátí meta.restored (koncept obnoven) nebo meta.conflict (záznam se mezitím změnil a koncept se nepoužil).

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | restored · conflict | `restored` |
| `savedAt` | any | `—` |
| `onDiscard` | function | `—` |
| `onShowDraft` | function | `—` |
| `texts` | any | `—` |

**Examples:**

_Obnovený koncept_
```tsx
const [form, setForm, draft] = useTabDraft(tabId, base, 'form', { recordVersion: row.updated_at });
{draft.restored ? <DraftRestoredBanner savedAt={draft.restored.savedAt} onDiscard={draft.discard} /> : null}
{draft.conflict ? <DraftRestoredBanner variant="conflict" savedAt={draft.conflict.savedAt} onShowDraft={draft.applyConflict} onDiscard={draft.discard} /> : null}
```

**Avoid:**

- Použít koncept automaticky, když se verze záznamu liší
- Zobrazovat banner bez tlačítka Zahodit
- Mazat koncept až po zavření okna místo po uložení

### Drawer

```ts
import { Drawer } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerClose

```ts
import { DrawerClose } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerContent

```ts
import { DrawerContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerDescription

```ts
import { DrawerDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerFooter

```ts
import { DrawerFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerHeader

```ts
import { DrawerHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerOverlay

```ts
import { DrawerOverlay } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerPortal

```ts
import { DrawerPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerTitle

```ts
import { DrawerTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DrawerTrigger

```ts
import { DrawerTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenu

```ts
import { DropdownMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuCheckboxItem

```ts
import { DropdownMenuCheckboxItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuContent

```ts
import { DropdownMenuContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuGroup

```ts
import { DropdownMenuGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuItem

```ts
import { DropdownMenuItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuLabel

```ts
import { DropdownMenuLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuPortal

```ts
import { DropdownMenuPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuRadioGroup

```ts
import { DropdownMenuRadioGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuRadioItem

```ts
import { DropdownMenuRadioItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuSeparator

```ts
import { DropdownMenuSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuShortcut

```ts
import { DropdownMenuShortcut } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuSub

```ts
import { DropdownMenuSub } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuSubContent

```ts
import { DropdownMenuSubContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuSubTrigger

```ts
import { DropdownMenuSubTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DropdownMenuTrigger

```ts
import { DropdownMenuTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### FilterChips

```ts
import { FilterChips } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Odebíratelné štítky aktivních filtrů nad výkazem nebo gridem, s „Zrušit vše“.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `chips` | any | `—` |
| `onClearAll` | function | `—` |
| `size` | sm · md | `md` |
| `texts` | any | `—` |

**Examples:**

_Filtry_
```tsx
<FilterChips chips={[{ id: "g", label: "Skupina", value: "51 – Služby", onRemove: () => setGroup(null) }]} onClearAll={clear} />
```

**Avoid:**

- Vlastní štítky filtrů ve stránce

### FiscalPeriodSelect

```ts
import { FiscalPeriodSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FontSizeSetting

```ts
import { FontSizeSetting } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `placeholder` | string | `Vyberte velikost písma` |
| `label` | string | `Velikost písma` |
| `className` | string | `w-[220px]` |

### Form

```ts
import { Form } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormControl

```ts
import { FormControl } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormDescription

```ts
import { FormDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormField

```ts
import { FormField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormItem

```ts
import { FormItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormLabel

```ts
import { FormLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### FormMessage

```ts
import { FormMessage } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### GridAddActions

```ts
import { GridAddActions } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridBody

```ts
import { GridBody } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridBookSelect

```ts
import { GridBookSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Kontextový výběr účetní knihy; jediná dostupná, readOnly nebo needitovatelná kniha se zobrazí jako tučný text bez zakázaného výběru.

**Examples:**

_Kniha jen pro čtení_
```tsx
<GridBookSelect books={books} value={bookId} readOnly />
```

**Avoid:**

- Nevykreslujte jedinou nebo needitovatelnou knihu jako disabled combobox.

### GridContextBar

```ts
import { GridContextBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Samostatný kontextový řádek bezprostředně nad GridToolbar; vlevo kniha, oddělovač a období. Škáluje se stejným zoomem a hustotou jako řádek akcí.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `period` | any | `—` |
| `book` | any | `—` |
| `zoom` | number | `—` |
| `density` | any | `—` |

**Examples:**

_Kniha a období_
```tsx
<GridContextBar book={bookConfig} period={periodConfig} />
```

**Avoid:**

- Vkládat období nebo knihu zároveň do toolbarLeft

### GridEmptyRow

```ts
import { GridEmptyRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridErrorRow

```ts
import { GridErrorRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridExpandControls

```ts
import { GridExpandControls } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### GridPeriodFilter

```ts
import { GridPeriodFilter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Volba celého, měsíčního, čtvrtletního, pololetního, YTD nebo vlastního rozsahu v mezích účetního období.

### GridProgress

```ts
import { GridProgress } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridRefreshButton

```ts
import { GridRefreshButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sdílené ikonové obnovení dat v liště DataGridu a TreeGridu; samo čeká na Promise a zobrazuje probíhající stav.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `onRefresh` | function | `—` |
| `refreshing` | boolean | `—` |
| `zoom` | number | `1` |
| `className` | string | `—` |
| `texts` | any | `—` |

**Examples:**

_Asynchronní obnovení_
```tsx
<GridRefreshButton onRefresh={reload} refreshing={isRefreshing} zoom={zoom} />
```

**Avoid:**

- Přepisovat klávesu F5
- Přidávat vedle ikony text Obnovit
- Vytvářet vlastní refresh tlačítko pro každý grid

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

### GridToggleButton

```ts
import { GridToggleButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

tone=mode pro modrý režim; tone=grouping pro oranžové přeskupení dat.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `pressed` | boolean | `—` |
| `tone` | mode · grouping | `mode` |
| `icon` | any | `—` |

**Avoid:**

- Oranžová pro režim, který data nefiltruje ani nepřeskupuje

### GridToolbar

```ts
import { GridToolbar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jediný řádek akcí pro DataGrid, TreeGrid a vlastní obsah.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `left` | any | `—` |
| `right` | any | `—` |
| `zoom` | number | `1` |
| `density` | any | `normal` |

**Examples:**

_Vlastní obsah_
```tsx
<GridToolbar left={parameters} right={actions} />
```

**Avoid:**

- Ovládání gridu mimo společný řádek akcí
- Samostatná exportní tlačítka v gridu

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

### HoverCard

```ts
import { HoverCard } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HoverCardContent

```ts
import { HoverCardContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HoverCardTrigger

```ts
import { HoverCardTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### Input

```ts
import { Input } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### InputOTP

```ts
import { InputOTP } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### InputOTPGroup

```ts
import { InputOTPGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### InputOTPSeparator

```ts
import { InputOTPSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### InputOTPSlot

```ts
import { InputOTPSlot } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### JournalLinesEditor

```ts
import { JournalLinesEditor } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Editovatelný grid účetních předkontací se zoomem, hustotou, validací buněk, měnou a klávesovým ovládáním. Režim mode="mainAccount" s mainSide a mainAccount zamkne hlavní stranu; převod do databáze přes toJournalRow / fromJournalRow.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `lines` | any | `—` |
| `onChange` | function | `—` |
| `accounts` | any | `—` |
| `dimensions` | any | `—` |
| `partners` | any | `—` |
| `currencies` | any | `—` |
| `showCurrency` | boolean | `false` |
| `sideFields` | shared · split | `split` |
| `sharedSide` | any | `both` |
| `mode` | internal · mainAccount | `internal` |
| `mainSide` | MD · D | `—` |
| `mainAccount` | string | `—` |
| `sideFieldRules` | any | `—` |
| `dimensionRequired` | boolean | `false` |
| `isNonTaxAllowed` | function | `—` |
| `editableFields` | any | `—` |
| `totalAmount` | number | `—` |
| `totalMode` | entered · computed | `computed` |
| `roundingLimit` | number | `0.5` |
| `onRoundingFill` | function | `—` |
| `expectedTotal` | number | `—` |
| `defaults` | any | `—` |
| `validate` | function | `—` |
| `storageKey` | string | `journal-lines` |
| `texts` | any | `—` |
| `className` | string | `journal-cell-editor` |

**Examples:**

_Řádky zápisu_
```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} expectedTotal={total} storageKey="invoice-lines" />
```

**Avoid:**

- Nepřidávejte in-place účetní editaci do obecného DataGridu.
- Pro zaúčtované doklady nepoužívejte readOnly, pokud mají zůstat upravitelné vybrané sloupce; použijte editableColumns.
- Nepoužívejte odstraněné toDbLines / fromDbLines ani pairNo; mainAccount nepředávejte jako objekt.

### Label

```ts
import { Label } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### LayoutMenu

```ts
import { LayoutMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nabídka uložených rozložení. Varianta trigger="icon" patří do AppShell.navSearchMenu vedle hledání; data a ukládání dodává aplikace.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `onSave` | function | `—` |
| `onApply` | function | `—` |
| `onUpdate` | function | `—` |
| `onDelete` | function | `—` |
| `onReorder` | function | `—` |
| `shortcut` | boolean | `true` |
| `trigger` | default · icon | `default` |
| `texts` | any | `—` |
| `className` | string | `size-4` |

**Examples:**

_Vedle hledání v menu_
```tsx
<AppShell navSearchMenu={<LayoutMenu trigger="icon" items={layouts} onSave={save} onApply={apply} onUpdate={update} onDelete={remove} />} />
```

**Avoid:**

- Vkládat nabídku rozložení do horní lišty
- Ukládat do rozložení koncepty nebo nové neuložené záznamy
- Zavírat rozepsané záložky při použití rozložení

### LayoutSwitcher

```ts
import { LayoutSwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### Menubar

```ts
import { Menubar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarCheckboxItem

```ts
import { MenubarCheckboxItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarContent

```ts
import { MenubarContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarGroup

```ts
import { MenubarGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarItem

```ts
import { MenubarItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarLabel

```ts
import { MenubarLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarMenu

```ts
import { MenubarMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarPortal

```ts
import { MenubarPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarRadioGroup

```ts
import { MenubarRadioGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarRadioItem

```ts
import { MenubarRadioItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarSeparator

```ts
import { MenubarSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarShortcut

```ts
import { MenubarShortcut } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarSub

```ts
import { MenubarSub } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarSubContent

```ts
import { MenubarSubContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarSubTrigger

```ts
import { MenubarSubTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MenubarTrigger

```ts
import { MenubarTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MonthYearSelect

```ts
import { MonthYearSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### MultiSelect

```ts
import { MultiSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenu

```ts
import { NavigationMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuContent

```ts
import { NavigationMenuContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuIndicator

```ts
import { NavigationMenuIndicator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuItem

```ts
import { NavigationMenuItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuLink

```ts
import { NavigationMenuLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuList

```ts
import { NavigationMenuList } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuTrigger

```ts
import { NavigationMenuTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### NavigationMenuViewport

```ts
import { NavigationMenuViewport } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### NotificationBell

```ts
import { NotificationBell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Prezentační seznam oznámení v horní liště; data, načítání a akce dodává aplikace.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `unreadCount` | number | `—` |
| `loading` | boolean | `false` |
| `onItemClick` | function | `—` |
| `onMarkAllRead` | function | `—` |
| `onShowAll` | function | `—` |
| `texts` | any | `—` |
| `className` | string | `size-4` |

**Examples:**

_Tři nepřečtená oznámení_
```tsx
<NotificationBell items={items} unreadCount={3} onItemClick={openNotification} onMarkAllRead={markAllRead} />
```

**Avoid:**

- Nenačítejte data uvnitř komponenty; NotificationBell je čistě prezentační.

### OptionSelect

```ts
import { OptionSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PageHeader

```ts
import { PageHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Hlavička každé stránky bez podtitulu. V panelu vykreslí vlevo nadpis a dirty tečku, vpravo listování záznamy, historii, maximalizaci a menu ⋯; akce stránky přijímá přes menuActions.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | any | `—` |
| `description` | any | `—` |
| `actions` | any | `—` |
| `menuActions` | any | `—` |
| `paneTexts` | any | `—` |

**Avoid:**

- Předávat actions uvnitř panelu místo menuActions
- Vkládat akci Nový do záhlaví místo gridového addAction
- Předávat description; kontext patří do GridContextBar nebo horní lišty

### Pagination

```ts
import { Pagination } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaginationContent

```ts
import { PaginationContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaginationEllipsis

```ts
import { PaginationEllipsis } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaginationItem

```ts
import { PaginationItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaginationLink

```ts
import { PaginationLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `isActive` | boolean | `—` |

### PaginationNext

```ts
import { PaginationNext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaginationPrevious

```ts
import { PaginationPrevious } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaneApiContext

```ts
import { PaneApiContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaneChromeContext

```ts
import { PaneChromeContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaneEmpty

```ts
import { PaneEmpty } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `hint` | string | `—` |
| `className` | string | `flex h-9 shrink-0 items-center justify-between gap-3 border-b bg-accent px-3 text-sm text-accent-foreground` |

### PaneLayout

```ts
import { PaneLayout } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Režim více oken s vždy viditelnou lištou rovnocenných záložek; musí být uvnitř PaneTabsProvider. Vykresluje jen aktivní záložku každého panelu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `renderTab` | function | `—` |
| `getTabIcon` | function | `—` |
| `renderEmpty` | function | `—` |
| `minPaneWidth` | number | `560` |
| `texts` | any | `—` |
| `className` | string | `flex h-9 shrink-0 items-center justify-between gap-3 border-b bg-accent px-3 text-sm text-accent-foreground` |

**Examples:**

_Panely se záložkami_
```tsx
<PaneTabsProvider state={state} onChange={setState}>
  <PaneLayout renderTab={(tab) => <Page route={tab.route} />} getTabIcon={(tab) => ICONS[tab.icon]} />
</PaneTabsProvider>
```

**Avoid:**

- Držet stav formuláře záložky jen v useState – po přepnutí se ztratí; použijte useTabDraft.
- Používat usePaneDirty / openInPane (odstraněno ve 2.12.0).

### PaneLink

```ts
import { PaneLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Odkaz do záložek: klik nahradí aktivní záložku, Cmd/Ctrl + klik nebo prostřední tlačítko otevře novou, Cmd/Ctrl + Shift + klik sousední panel.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `route` | string | `—` |
| `params` | object | `—` |
| `options` | any | `—` |
| `href` | string | `—` |

**Examples:**

_Položka menu_
```tsx
<PaneLink route="/denik" options={{ title: 'Účetní deník', icon: 'journal' }}>Účetní deník</PaneLink>
```

**Avoid:**

- Obyčejný <a> uvnitř panelů – Cmd + klik otevře záložku prohlížeče.

### PaneTabBar

```ts
import { PaneTabBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Vždy viditelná lišta rovnocenných záložek panelu, včetně jediné záložky a prázdného panelu; podporuje DnD, zavření prostředním tlačítkem, kontextové menu a overflow „»“.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `pane` | any | `—` |
| `paneIndex` | number | `—` |
| `paneCount` | number | `—` |
| `api` | any | `—` |
| `getTabIcon` | function | `—` |
| `onToggleMaximize` | function | `—` |
| `texts` | any | `—` |
| `className` | string | `flex min-w-0 flex-1 items-stretch overflow-hidden` |

**Examples:**

_Vlastní panel_
```tsx
<PaneTabBar pane={pane} paneIndex={0} paneCount={1} api={tabs} />
```

**Avoid:**

- Přidávat vedle lišty samostatný křížek panelu – zavření je v menu ⋯.

### PaneTabsContext

```ts
import { PaneTabsContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaneTabsProvider

```ts
import { PaneTabsProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Stav a akce záložek v panelech, dialog neuložených změn a zkratky Alt+…; obalte jím AppShell i PaneLayout.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `state` | any | `open` |
| `onChange` | function | `—` |
| `onSaveTab` | function | `—` |
| `onNewTabRequest` | function | `—` |
| `shortcuts` | boolean | `true` |
| `texts` | any | `—` |
| `children` | any | `—` |

**Examples:**

_Otevření záznamu_
```tsx
const tabs = usePaneTabs();
tabs?.openTab('/doklad', { id }, { kind: 'record', title: 'Doklad FP2026000012' });
```

**Avoid:**

- Otevírat konkrétní záznam s kind 'list' – otevřel by se vícekrát.
- Přepisovat Cmd/Ctrl+W nebo Ctrl+1–9.

### PartnerSelect

```ts
import { PartnerSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PaymentScheduleEditor

```ts
import { PaymentScheduleEditor } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Platební kalendář dokladu (splátky a pozastávky) s dopočtem Zbývá rozepsat, rozložením na splátky a uvolněním pozastávky. Komponenta nic neukládá; aplikace uloží celé pole items jedním voláním.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `onChange` | function | `—` |
| `totalToPay` | number | `—` |
| `paid` | number | `—` |
| `remaining` | number | `—` |
| `users` | any | `—` |
| `currency` | string | `CZK` |
| `readOnly` | boolean | `false` |
| `canRelease` | boolean | `false` |
| `canUnrelease` | boolean | `false` |
| `onRelease` | function | `—` |
| `onUnrelease` | function | `—` |
| `onGenerate` | function | `—` |
| `texts` | any | `—` |
| `className` | string | `flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2` |

**Examples:**

_Kalendář faktury_
```tsx
<PaymentScheduleEditor items={items} onChange={setItems} totalToPay={12100} paid={3630} remaining={8470} users={users} canRelease onRelease={(id, date) => release(id, date)} />
```

**Avoid:**

- Nepočítejte splátky ručně – použijte generatePaymentSchedule se stejnou logikou jako databáze.
- Neukládejte jednotlivé řádky zvlášť.

### PeriodFilter

```ts
import { PeriodFilter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PeriodSwitcher

```ts
import { PeriodSwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Kontextový výběr účetního období se stavovým štítkem, rozsahem na široké obrazovce a podporou firmy bez založeného období.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `periods` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `label` | string | `Účetní období` |
| `stateLabels` | object | `—` |
| `disableClosed` | boolean | `false` |
| `className` | string | `p-3` |
| `periodsLabel` | string | `Období` |
| `placeholder` | string | `Vyberte období` |
| `emptyText` | string | `Firma nemá účetní období` |
| `createLabel` | string | `Založit období` |
| `onCreate` | function | `—` |

**Examples:**

_Výběr období_
```tsx
<PeriodSwitcher periods={periods} value={periodId} onChange={setPeriodId} />
```

_Firma bez období_
```tsx
<PeriodSwitcher periods={[]} value={null} onChange={setPeriodId} onCreate={createPeriod} />
```

**Avoid:**

- Nepoužívejte stejný text pro popisek a hodnotu přepínače.
- Nepoužívejte pro obecné datumové filtry.

### PermissionGate

```ts
import { PermissionGate } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PinnedBar

```ts
import { PinnedBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Použijte jako trvalou lištu záložek stránek pod horní lištou AppShellu. Stav připnutí a pořadí vlastní aplikace.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `onOpen` | function | `—` |
| `onUnpin` | function | `—` |
| `onReorder` | function | `—` |
| `texts` | any | `—` |
| `className` | string | `size-8 shrink-0` |

**Examples:**

_Připnuté stránky_
```tsx
<PinnedBar items={items} onOpen={(id, options) => openPinned(id, options.newPane)} onUnpin={unpin} onReorder={setOrder} />
```

**Avoid:**

- Vykreslit lištu při prázdném items
- Ukládat rozpracovaný stav stránky do položky připnutí
- Zalamovat připnuté položky do více řádků

### Popover

```ts
import { Popover } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PopoverAnchor

```ts
import { PopoverAnchor } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PopoverContent

```ts
import { PopoverContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### PopoverTrigger

```ts
import { PopoverTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Progress

```ts
import { Progress } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### RadioGroup

```ts
import { RadioGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### RadioGroupItem

```ts
import { RadioGroupItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ReadOnlyBanner

```ts
import { ReadOnlyBanner } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### ResizableHandle

```ts
import { ResizableHandle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ResizablePanel

```ts
import { ResizablePanel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ResizablePanelGroup

```ts
import { ResizablePanelGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ScrollArea

```ts
import { ScrollArea } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ScrollBar

```ts
import { ScrollBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SearchButton

```ts
import { SearchButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Ikonové tlačítko otevírající globální hledání.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `onClick` | function | `—` |
| `label` | string | `Hledat (Ctrl+K)` |
| `className` | string | `size-4` |

**Examples:**

_Základní použití_
```tsx
<SearchButton onClick={() => setOpen(true)} />
```

**Avoid:**

- Nepoužívejte textové tlačítko v horní liště.

### Select

```ts
import { Select } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectContent

```ts
import { SelectContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectGroup

```ts
import { SelectGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectItem

```ts
import { SelectItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectLabel

```ts
import { SelectLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectScrollDownButton

```ts
import { SelectScrollDownButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectScrollUpButton

```ts
import { SelectScrollUpButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectSeparator

```ts
import { SelectSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectTrigger

```ts
import { SelectTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SelectValue

```ts
import { SelectValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Separator

```ts
import { Separator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Sheet

```ts
import { Sheet } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `side` | top · bottom · left · right | `right` |

### SheetClose

```ts
import { SheetClose } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetContent

```ts
import { SheetContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetDescription

```ts
import { SheetDescription } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetFooter

```ts
import { SheetFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetHeader

```ts
import { SheetHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetOverlay

```ts
import { SheetOverlay } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetPortal

```ts
import { SheetPortal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetTitle

```ts
import { SheetTitle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SheetTrigger

```ts
import { SheetTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Sidebar

```ts
import { Sidebar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarContent

```ts
import { SidebarContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarFooter

```ts
import { SidebarFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarGroup

```ts
import { SidebarGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarGroupAction

```ts
import { SidebarGroupAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarGroupContent

```ts
import { SidebarGroupContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarGroupLabel

```ts
import { SidebarGroupLabel } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarHeader

```ts
import { SidebarHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarInput

```ts
import { SidebarInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarInset

```ts
import { SidebarInset } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenu

```ts
import { SidebarMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuAction

```ts
import { SidebarMenuAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuBadge

```ts
import { SidebarMenuBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuButton

```ts
import { SidebarMenuButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · outline | `default` |
| `size` | default · sm · lg | `default` |

### SidebarMenuItem

```ts
import { SidebarMenuItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuSkeleton

```ts
import { SidebarMenuSkeleton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuSub

```ts
import { SidebarMenuSub } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuSubButton

```ts
import { SidebarMenuSubButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarMenuSubItem

```ts
import { SidebarMenuSubItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarProvider

```ts
import { SidebarProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarRail

```ts
import { SidebarRail } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarSeparator

```ts
import { SidebarSeparator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SidebarTrigger

```ts
import { SidebarTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Skeleton

```ts
import { Skeleton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Slider

```ts
import { Slider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SlivkaHead

```ts
import { SlivkaHead } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `nonce` | string | `—` |
| `fonts` | boolean | `true` |
| `themeScript` | boolean | `true` |

### SlivkaProvider

```ts
import { SlivkaProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `children` | any | `—` |
| `queryClient` | any | `—` |
| `tooltipDelayDuration` | number | `300` |
| `toasterProps` | any | `—` |

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

### Switch

```ts
import { Switch } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Table

```ts
import { Table } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableBody

```ts
import { TableBody } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableCaption

```ts
import { TableCaption } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableCell

```ts
import { TableCell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableFooter

```ts
import { TableFooter } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableHead

```ts
import { TableHead } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableHeader

```ts
import { TableHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TableRow

```ts
import { TableRow } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Tabs

```ts
import { Tabs } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TabsContent

```ts
import { TabsContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TabsList

```ts
import { TabsList } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TabsTrigger

```ts
import { TabsTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TagPicker

```ts
import { TagPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Textarea

```ts
import { Textarea } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ThemeSetting

```ts
import { ThemeSetting } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nastavení světlého, tmavého nebo systémového motivu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `label` | string | `Motiv` |
| `lightLabel` | string | `Světlý` |
| `darkLabel` | string | `Tmavý` |
| `systemLabel` | string | `Podle systému` |
| `className` | string | `text-sm font-medium` |

**Examples:**

_Základní použití_
```tsx
<ThemeSetting />
```

**Avoid:**

- Nevkládejte do horní lišty; patří na stránku Předvolby.

### ThemeToggle

```ts
import { ThemeToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `className` | string | `—` |
| `lightLabel` | string | `Světlý režim` |
| `darkLabel` | string | `Tmavý režim` |

### ThemeToggleButton

```ts
import { ThemeToggleButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Ikonové přepnutí světlého a tmavého motivu v horní liště, synchronizované s ThemeSetting.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `darkLabel` | string | `Tmavý režim` |
| `lightLabel` | string | `Světlý režim` |
| `onThemeChange` | function | `—` |
| `className` | string | `size-4` |

**Examples:**

_Horní lišta_
```tsx
<ThemeToggleButton onThemeChange={saveTheme} />
```

**Avoid:**

- Nevytvářejte oddělený stav motivu mimo sdílené nastavení design systému.

### TimeInputRight

```ts
import { TimeInputRight } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `wrapperClassName` | string | `—` |

### Toaster

```ts
import { Toaster } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Toggle

```ts
import { Toggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · outline | `default` |
| `size` | default · sm · lg | `default` |

### ToggleGroup

```ts
import { ToggleGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ToggleGroupItem

```ts
import { ToggleGroupItem } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### Tooltip

```ts
import { Tooltip } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TooltipContent

```ts
import { TooltipContent } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TooltipProvider

```ts
import { TooltipProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TooltipTrigger

```ts
import { TooltipTrigger } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### TreeGrid

```ts
import { TreeGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Použijte pro stromová data se součty za uzel, úrovněmi rozbalení a exportem. Nadpis je výchozí skrytý; zobrazte ho jen výslovně přes showTitle. Podporuje stejné obnovení a hromadný výběr jako DataGrid. Volitelné period a book vykreslí GridContextBar nad řádkem akcí.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `rows` | any | `—` |
| `columns` | any | `—` |
| `title` | string | `—` |
| `showTitle` | boolean | `false` |
| `storageKey` | string | `—` |
| `exportName` | string | `—` |
| `exportMeta` | any | `—` |
| `defaultCollapsed` | boolean | `false` |
| `expandLevels` | any | `—` |
| `expandDepth` | number | `—` |
| `onExpandDepthChange` | function | `—` |
| `highlightedRowId` | string | `—` |
| `onRowClick` | function | `—` |
| `onRowOpen` | function | `—` |
| `actions` | any | `—` |
| `toolbarLeft` | any | `—` |
| `period` | any | `—` |
| `book` | any | `—` |
| `filters` | any | `—` |
| `filterChips` | any | `—` |
| `onClearFilters` | function | `—` |
| `defaultFilters` | any | `—` |
| `viewMode` | any | `—` |
| `onViewModeChange` | function | `—` |
| `viewZoomKey` | string | `—` |
| `asOf` | any | `—` |
| `addAction` | any | `—` |
| `moreActions` | any | `—` |
| `pdfExport` | function | `—` |
| `extraExports` | any | `—` |
| `onRefresh` | function | `—` |
| `refreshing` | boolean | `—` |
| `selectable` | boolean | `—` |
| `selectionActions` | function | `—` |
| `onSelectedRowsChange` | function | `—` |
| `gridTexts` | any | `—` |
| `texts` | any | `—` |
| `loading` | boolean | `—` |
| `className` | string | `rounded-t-lg border bg-card px-3 py-2 font-semibold` |

**Examples:**

_Strom s obnovením a výběrem_
```tsx
<TreeGrid title="Účtová osnova" rows={rows} columns={columns} onRefresh={reload} refreshing={loading} selectable onSelectedRowsChange={setSelected} />
```

**Avoid:**

- Vlastní rozbalovací tabulka místo TreeGrid
- Vlastní tlačítko obnovení mimo lištu
- Ruční sčítání uzlů v aplikaci
- Zobrazovat nadpis gridu bez výslovného showTitle
- ExcelExportButton uvnitř gridu
- Ovládání gridu nad společným řádkem akcí
- Akce Nový v PageHeader místo addAction

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

### UserMenu

```ts
import { UserMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Uživatelská nabídka s přímým přepínáním pracovních prostorů.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `name` | string | `—` |
| `email` | string | `—` |
| `workspaces` | any | `—` |
| `activeWorkspaceId` | string | `—` |
| `onWorkspaceChange` | function | `—` |
| `workspaceLabel` | string | `Pracovní prostor` |
| `workspaceSearchPlaceholder` | string | `Hledat pracovní prostor…` |
| `items` | any | `—` |
| `onSignOut` | function | `—` |
| `signOutLabel` | string | `Odhlásit` |
| `menuLabel` | string | `Uživatelská nabídka` |

**Examples:**

_Základní použití_
```tsx
<UserMenu name="Petr Slivka" email="petr@slivka.cz" workspaces={workspaces} />
```

**Avoid:**

- Nevkládejte pracovní prostory do vnořeného podmenu.

### ViewModeToggle

```ts
import { ViewModeToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### VirtualPad

```ts
import { VirtualPad } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### VsField

```ts
import { VsField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

