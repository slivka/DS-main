# Components

Component catalog for **DS - main**. Import all components from `@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b`.

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

**Props:**

| Prop | Type | Default |
|---|---|---|
| `code` | string | `—` |
| `name` | string | `—` |
| `className` | string | `truncate font-mono tabular-nums` |

### AccountSelect

```ts
import { AccountSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr účtu z osnovy; suffix vykreslí uvnitř spouštěče například stranu MD/DAL. S allowLevels a catalog podporuje také třídu nebo skupinu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `accounts` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `Vyberte účet` |
| `searchPlaceholder` | string | `Hledat účet nebo číslo…` |
| `emptyText` | string | `Žádný účet nenalezen` |
| `hideInactive` | boolean | `false` |
| `disableSyntheticWithAnalytics` | boolean | `true` |
| `typeLabels` | object | `—` |
| `allowLevels` | any | `—` |
| `catalog` | any | `—` |
| `disabled` | boolean | `—` |
| `initialSearch` | string | `—` |
| `defaultOpen` | boolean | `false` |
| `onOpenChange` | function | `—` |
| `onKeyDown` | any | `—` |
| `suffix` | any | `—` |
| `ariaLabel` | string | `—` |
| `className` | string | `ml-auto flex shrink-0 items-center gap-2` |

**Examples:**

_Třída nebo skupina_
```tsx
<AccountSelect accounts={accounts} catalog={classesAndGroups} allowLevels={["class","group"]} value={prefix} onChange={setPrefix} />
```

**Avoid:**

- Nativní select pro účty
- Doplňování tečky do uloženého kódu

### ActiveStatusBadge

```ts
import { ActiveStatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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
| `countryClassName` | string | `@min-[40rem]:col-span-1` |
| `className` | string | `@min-[40rem]:col-span-3` |
| `children` | any | `—` |
| `labels` | any | `—` |
| `defaultCountry` | string | `SK` |
| `mapAction` | any | `—` |
| `readOnly` | boolean | `false` |

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

### AppShell

```ts
import { AppShell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Společný rám aplikace s tmavým hlavním menu a šedými kontextovými panely. Části panelu řídí titul, kontext, navigaci a rozsah platnosti. Panely: Panely (Číselníky / Nastavení / Administrace). AppShellPanel: id, title, icon, tooltip, nav?, context?, badge?, accent?; views?: {id,label,title,context?,scope?,nav}[] – části panelu se segmentovým přepínačem (≥ 2); activeView? + onViewChange? (řízené, šipky/Home/End); scope?: 'company' | 'workspace' | 'platform' – mimo company zašedne contextLeft; sidebarTone?: 'app' | 'panel' (výchozí 'panel' = šedé menu). Otevřený panel bez nav/views má prázdné menu. Nápověda u zašedlé firmy a období v panelu se scope workspace/platform (výchozí z DsTexts appShell.contextDisabledHint). AppShell ve výchozím stavu nemění document.title; opt-in manageDocumentTitle jej nastaví podle appName.

**Examples:**

_Řízené části Nastavení_
```tsx
<AppShell panels={[{ id: "settings", title: "Nastavení", icon: Settings, tooltip: "Nastavení", activeView, onViewChange: setActiveView, views: [{ id: "company", label: "Firma", title: "Nastavení firmy", context: company.name, scope: "company", nav: companyNav }, { id: "workspace", label: "Prostor", title: "Nastavení prostoru", context: workspace.name, scope: "workspace", nav: workspaceNav }] }]}>{children}</AppShell>
```

**Avoid:**

- Neřiďte aktivní část panelu lokálně uvnitř navigace; použijte activeView a onViewChange.
- Nezobrazujte panelové menu v aplikačním tónu bez výslovného sidebarTone="app".
- Nezakrývejte výběr firmy a období pro workspace/platform; AppShell jej sám ponechá a zakáže.

### AppShellContentProvider

```ts
import { AppShellContentProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

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

### BankAccountField

```ts
import { BankAccountField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr účtu nebo ruční zadání. disabledReason nahrazuje výzvu výběru uvnitř pole, nikdy se nevykresluje pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `options` | any | `—` |
| `bankCodes` | any | `—` |
| `invalidAccountText` | string | `—` |
| `invalidBankCodeText` | string | `—` |
| `otherAccountText` | string | `—` |
| `className` | string | `line-through` |
| `selectionOnly` | boolean | `false` |
| `onAddAccount` | function | `—` |
| `addAccountText` | string | `—` |
| `placeholder` | string | `—` |
| `disabledReason` | string | `—` |

**Examples:**

Účet dodavatele

```tsx
<BankAccountField aria-label="Bankovní účet" value={account} onChange={setAccount} options={accounts} bankCodes={bankCodes} />
```

**Avoid:**

- Nepředvyplňujte hodnotu jen podle příznaku default; hodnotu řídí aplikace.
- Nepřijímejte neúplný ruční účet bez kontroly po opuštění pole.
- Neopakujte disabledReason pod polem ani v duplicitním tooltipu.


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
| `clearLabel` | string | `—` |
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

### CashReceiptPrintDialog

```ts
import { CashReceiptPrintDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Zobrazuje náhled a vytváří pokladní doklad; vstup přijímá značku měny dokladu i domácí měny a bez značky použije kód.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `value` | any | `—` |
| `context` | any | `—` |
| `defaultCopies` | any | `2` |
| `defaultTwoPerPage` | boolean | `true` |
| `defaultPrintNumber` | boolean | `true` |

**Examples:**

_Pokladní doklad se značkami měn_
```tsx
<CashReceiptPrintDialog {...props} value={{ ...receipt, currency: 'EUR', currencySymbol: '€', homeCurrency: 'CZK', homeCurrencySymbol: 'Kč' }} />
```

**Avoid:**

- Nevkládejte značku měny přímo do částky; předejte ji přes currencySymbol nebo homeCurrencySymbol.

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

### CheckboxField

```ts
import { CheckboxField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Zaškrtávátko formuláře; čtvereček se zarovná na první řádek i u víceřádkového popisku a hint je odsazen na úroveň textu. Platí pro natural i input.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `checked` | boolean | `—` |
| `onCheckedChange` | function | `—` |
| `label` | any | `true` |
| `hint` | any | `—` |
| `align` | natural · input | `natural` |

**Examples:**

_Vedle polí_
```tsx
<FieldGrid cols={4}>…<CheckboxField align="input" label="Plátce DPH" checked={v} onCheckedChange={setV} /></FieldGrid>
```

_Víceřádkový popisek s nápovědou_
```tsx
<CheckboxField label={<>Majetek používaný také soukromě<br />se sledováním poměru</>} hint="Poměr se uplatní při odpisech." checked={v} onCheckedChange={setV} />
```

**Avoid:**

- Holý Checkbox s nativním <label>
- CheckboxField pro Aktivní u číselníku
- Checkbox pro okamžitě ukládané nastavení – použijte SwitchField

### CheckboxGroup

```ts
import { CheckboxGroup } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Skupina CheckboxField pod sebou nebo vedle sebe s volitelným nadpisem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `direction` | vertical · horizontal | `vertical` |
| `title` | any | `—` |
| `children` | any | `—` |

**Examples:**

_Role_
```tsx
<CheckboxGroup direction="horizontal" title="Role"><CheckboxField … /></CheckboxGroup>
```

**Avoid:**

- Vlastní flex obal s nejednotnými mezerami

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

Neutrální obrysový výběr firmy s hledáním v jediném seznamu, IČO, řízeným otevřením a automatickým zavřením po volbě.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `label` | string | `Firma` |
| `searchPlaceholder` | string | `Hledat firmu…` |
| `emptyText` | string | `Žádná firma nebyla nalezena.` |
| `createLabel` | string | `Nová firma` |
| `onCreate` | function | `—` |
| `actions` | any | `—` |
| `className` | string | `min-w-0 flex-1` |
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |

**Examples:**

_Řízený výběr firmy_
```tsx
<CompanySwitcher items={companies} value={companyId} onChange={setCompanyId} open={open} onOpenChange={setOpen} />
```

_Akce pro správce_
```tsx
<CompanySwitcher items={firmy} value={id} onChange={setId} actions={[{ id: "manage", label: "Spravovat firmy…", onSelect: openManage }]} />
```

**Avoid:**

- Nevytvářejte skupinu posledních firem.
- Nenahrazujte nativním selectem.

### ConfirmByTypingDialog

```ts
import { ConfirmByTypingDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Potvrzení nevratné akce opsáním textu (a volitelným zaškrtnutím); během běhu nejde zavřít, chyba zůstane v dialogu, po úspěchu se zavře.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `title` | string | `—` |
| `description` | any | `—` |
| `summary` | any | `—` |
| `confirmText` | string | `—` |
| `acknowledgement` | string | `—` |
| `confirmLabel` | string | `—` |
| `cancelLabel` | string | `—` |
| `instruction` | string | `—` |
| `destructive` | boolean | `true` |
| `onConfirm` | function | `—` |

**Examples:**

_Odstranění prostoru_
```tsx
<ConfirmByTypingDialog open={open} onOpenChange={setOpen} title="Odstranit prostor" description="Akci nelze vrátit." confirmText="Test" acknowledgement="Rozumím, že data budou smazána" confirmLabel="Odstranit prostor" onConfirm={remove} />
```

**Avoid:**

- Nepoužívejte pro běžné potvrzení – to je ConfirmDialog.
- Chybu nehlaste toastem; vyhoďte ji z onConfirm.

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

Jednořádkový řízený kontextový přepínač do horní lišty; drží společnou geometrii, focus a zavírání firemního i období štítku.

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
| `iconClassName` | string | `—` |
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |

**Examples:**

_Řízené otevření_
```tsx
<ContextPill label="Firma" value="Slivka s.r.o." open={open} onOpenChange={setOpen}>…</ContextPill>
```

**Avoid:**

- Nepoužívejte pro běžná formulářová pole.
- Neobcházejte zavírání změnou key podle cesty.

### ContextSwitcher

```ts
import { ContextSwitcher } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Přepínač kontextu (prostoru) nahoře ve sloupci StandaloneShell: zkratka, název, popis a popover s hledáním od prahu, tečkou aktuálního a akcemi. Esc zavře jen popover.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `label` | string | `—` |
| `description` | any | `—` |
| `icon` | any | `—` |
| `items` | any | `—` |
| `value` | string | `—` |
| `onValueChange` | function | `—` |
| `actions` | any | `—` |
| `searchThreshold` | number | `6` |
| `searchPlaceholder` | string | `—` |
| `emptyText` | string | `—` |
| `currentLabel` | string | `—` |
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `className` | string | `flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground [&_svg]:size-4` |

**Examples:**

_Přepínač prostoru_
```tsx
<ContextSwitcher label="Slivka Group" description="3 firmy" items={spaces} value={id} onValueChange={setId} actions={[{ id: "new", label: "Nový prostor…", icon: Plus, onSelect: create }]} />
```

**Avoid:**

- Nepoužívejte pro výběr firmy v AppShell – tam je CompanySwitcher.

### CounterpartyField

```ts
import { CounterpartyField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Volný text protistrany s volitelným propojením; prázdný dotaz zobrazí aktivní partnery a favoriteIds je řadí první.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `partners` | any | `—` |
| `onCreatePartner` | function | `—` |
| `disabled` | boolean | `—` |
| `placeholder` | string | `—` |
| `id` | string | `—` |
| `className` | string | `inline-flex shrink-0 items-center gap-1 rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground` |
| `linkedLabel` | string | `Partner` |
| `unlinkLabel` | string | `Zrušit propojení` |
| `createLabel` | string | `Nový partner` |
| `favoriteIds` | any | `—` |

**Examples:**

_Výběr partnera_
```tsx
<CounterpartyField value={value} onChange={setValue} partners={partners} favoriteIds={["p1"]} />
```

**Avoid:**

- Nepoužívejte prázdný vlastní seznam místo předání všech aktivních partnerů.

### CounterpartyInputField

```ts
import { CounterpartyInputField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `mode` | partner · manual | `—` |
| `partnerId` | string | `—` |
| `name` | string | `—` |
| `partners` | any | `—` |
| `onPartnerChange` | function | `—` |
| `onNameChange` | function | `—` |
| `onModeChange` | function | `—` |
| `lockedReason` | string | `—` |
| `disabled` | boolean | `—` |
| `ariaLabel` | string | `—` |
| `partnerModeLabel` | string | `—` |
| `manualModeLabel` | string | `—` |
| `replaceManualWarning` | string | `—` |
| `hasManualData` | boolean | `—` |
| `id` | string | `—` |
| `readOnly` | boolean | `—` |
| `onCreatePartner` | function | `—` |
| `onEditPartner` | function | `—` |

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
| `placeholder` | string | `—` |
| `className` | string | `truncate` |

### CurrencyAmount

```ts
import { CurrencyAmount } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DangerZone

```ts
import { DangerZone } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sekce nevratných akcí s červeným okrajem; každá položka má nadpis, popis a akci vpravo.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | string | `—` |
| `items` | any | `—` |

**Examples:**

_Prostor_
```tsx
<DangerZone items={[{ title: "Odstranit prostor", description: "Smaže všechny firmy.", action: <Button variant="destructive" onClick={ask}>Odstranit</Button> }]} />
```

**Avoid:**

- Nevkládejte sem vratné akce.

### DataGrid

```ts
import { DataGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Datový grid se sjednocenou lištou: Nový vlevo, Obnovit úplně vpravo a individuální Upravit/Odstranit pouze ve sticky sloupci akcí řádku.

**Examples:**

_Akce řádků s vysvětlením zákazu_
```tsx
<DataGrid rows={rows} columns={columns} onEditRow={editRow} onDeleteRow={deleteRow} deleteDisabledReason={row => row.posted ? "Zaúčtovaný doklad nelze odstranit." : undefined} />
```

_Párování s editovatelnou částkou_
```tsx
<DataGrid storageKey="matching" rows={items} rowKey={(r) => r.id} selectMode
  selectedKeys={keys} onSelectedKeysChange={setKeys}
  selectionSummary={(rows) => <span>Vybráno {rows.length}</span>}
  columns={[{ id: "amount", label: "Párovat částkou", numeric: true, total: "sumSelected",
    value: (r) => amounts[r.id], editor: (r) => <GridAmountEditor ariaLabel="Párovat částkou" value={amounts[r.id]} max={r.remaining} currencySymbol={r.currencySymbol} invalid={exceedsMax(amounts[r.id], r.remaining)} invalidMessage="Převyšuje zbývající částku" onChange={(v) => setAmount(r.id, v)} /> }]} />
```

**Avoid:**

- Umisťovat Upravit nebo Odstranit jednotlivého řádku do horní lišty
- Skrýt zakázanou akci, pokud má uživatel potřebovat vysvětlení důvodu

### DateField

```ts
import { DateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednotné datumové pole. warning zvýrazní pole a přes aria-describedby zpřístupní text; warningDisplay="indicator" jej zobrazí v tooltipu ikony.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `id` | string | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `—` |
| `disabled` | boolean | `—` |
| `className` | string | `relative` |
| `inputClassName` | string | `—` |
| `maxDate` | any | `—` |
| `minDate` | any | `—` |
| `gridZoom` | number | `—` |
| `onValidityChange` | function | `—` |
| `link` | any | `—` |
| `hint` | string | `—` |
| `warning` | string | `—` |
| `warningDisplay` | below · indicator | `below` |

**Examples:**

_Datum s varováním v indikátoru_
```tsx
<DateField value={date} onChange={setDate} warning="Datum je mimo období" warningDisplay="indicator" />
```

**Avoid:**

- Nepoužívejte warning jako chybu vstupu; aria-invalid patří pouze neplatnému datu.

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

Výběr hodnoty ze seznamu; text a ikonové akce mají oddělené místo před pevnou šipkou.

**Examples:**

Výběr hodnoty

```tsx
<DimensionSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.


### DocumentActionBar

```ts
import { DocumentActionBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DocumentCounterpartyTab

```ts
import { DocumentCounterpartyTab } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `partnerId` | string | `—` |
| `onReloadFromPartner` | function | `—` |
| `readOnly` | boolean | `false` |
| `counterpartyLocked` | boolean | `false` |
| `counterpartyLockedReason` | string | `—` |
| `counterpartyManualFields` | any | `—` |
| `onRefreshCounterparty` | function | `—` |
| `refreshCounterpartyWarning` | string | `—` |
| `counterpartyFrozenAt` | string | `—` |
| `countries` | any | `—` |
| `showCountryCode` | boolean | `false` |

### DocumentDirectionBadge

```ts
import { DocumentDirectionBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### DocumentForm

```ts
import { DocumentForm } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednotný formulář dokladu s typovanou identitou a měnou vždy vedle Celkem. Všechny doklady řadí základní údaje, datumy, platební údaje, částku a záložky; partnerské i firemní bankovní účty jsou v platebních údajích a dateWarnings se zobrazují ve společném pruhu.

**Examples:**

_Faktura s editovatelným účtem_
```tsx
<DocumentForm {...props} identity={{ variant: "invoice", book: "FV - Vydané faktury", period: "2026", account: { side: "MD", label: "311.001 - Odběratelé", editable: true }, number: "FV2026000420" }} mainAccountOptions={allowedAccounts} />
```

**Avoid:**

- Nevykreslujte hlavní účet v dolní sekci formuláře ani neskládejte identitu přes volné položky.
- Nevkládejte měnu do popisku Celkem ani do identity cashBank.
- Nevykreslujte dateWarnings pod poli a nepředvyplňujte bankovní účet uvnitř komponenty.

### DocumentPrintTab

```ts
import { DocumentPrintTab } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `readOnly` | boolean | `false` |

### DocumentSettingsDialog

```ts
import { DocumentSettingsDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `value` | any | `—` |
| `onSave` | function | `—` |
| `documentTypeLabel` | string | `—` |
| `allowCounterpartySuggestions` | boolean | `false` |
| `showVatCalcMode` | boolean | `false` |
| `busy` | boolean | `—` |
| `texts` | any | `—` |

### DocumentStatusBadge

```ts
import { DocumentStatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Stav účetního dokladu. Výchozí size="sm" patří do gridů; size="md" sjednocuje výšku štítku v pruhu akcí s badge směru.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `status` | draft · filed · posted · locked · cancelled | `approved` |
| `config` | any | `—` |
| `approved` | boolean | `false` |
| `approvedLabel` | string | `Schvájen` |
| `size` | sm · md | `sm` |
| `className` | string | `size-3` |

**Examples:**

_Stav v pruhu akcí_
```tsx
<DocumentStatusBadge status="filed" approved size="md" />
```

**Avoid:**

- Nevytvářejte vlastní barevné štítky stavů dokladu.
- V gridech nepoužívejte velikost md.

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

### DsTextsProvider

```ts
import { DsTextsProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Centrální texty a locale. Obalte aplikaci jednou v kořeni; lokální textové props mají vyšší prioritu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `children` | any | `—` |
| `locale` | any | `—` |
| `texts` | any | `—` |

**Examples:**

_Slovenská aplikace_
```tsx
<DsTextsProvider texts={DS_TEXTS_SK} locale="sk"><App /></DsTextsProvider>
```

**Avoid:**

- Nevkládejte uživatelsky viditelné texty knihovny natvrdo; přidejte klíč do DsTexts, DS_TEXTS_CS a DS_TEXTS_SK.

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

Jediný obal pole na kartě záznamu i v DocumentForm: 12px polotučný popisek, mezera 4px, ovládání a jednotný hint nebo error. FieldValue zobrazuje hodnotu jen pro čtení.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `label` | any | `—` |
| `htmlFor` | string | `—` |
| `hint` | any | `—` |
| `error` | any | `—` |
| `span` | 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 | `—` |
| `className` | string | `—` |
| `children` | any | `—` |

**Examples:**

_Pole přes čtyři sloupce_
```tsx
<FieldGrid cols={12}><Field label="Jméno" span={4}><Input /></Field></FieldGrid>
```

**Avoid:**

- Nevkládejte hodnotu jen ke čtení volně do FieldGrid; použijte Field s FieldValue.

### FieldGrid

```ts
import { FieldGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Responzivní mřížka polí; podporuje 1, 2, 3, 4, 6, 12 a 20 sloupců. Field.span určuje šířku od 40 rem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `cols` | any | `2` |
| `title` | any | `—` |
| `hint` | any | `—` |
| `className` | string | `—` |
| `children` | any | `—` |

**Examples:**

_Jméno osoby_
```tsx
<FieldGrid cols={12}><Field label="Titul před" span={2}>…</Field><Field label="Jméno" span={4}>…</Field></FieldGrid>
```

**Avoid:**

- Nepoužívejte ruční CSS grid pro standardní formulářové řádky.

### FieldInlineActions

```ts
import { FieldInlineActions } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Samostatné ikonové akce výběru v pevně vyhrazeném místě vlevo od šipky. Hodnotu a nabídku řídí rodič.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `onEdit` | function | `—` |
| `editLabel` | string | `—` |
| `onClear` | function | `—` |
| `clearLabel` | string | `—` |
| `size` | default · compact | `default` |
| `className` | string | `size-3.5` |

**Examples:**

Vymazání výběru

```tsx
<FieldInlineActions onClear={() => setValue("")} clearLabel={texts.documentForm.clear} />
```

**Avoid:**

- Nevnořujte do tlačítka spouštěče.
- Nevyhraďte místo odsazením, které zároveň posune šipku.


### FieldTable

```ts
import { FieldTable } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `ariaLabel` | string | `—` |
| `columns` | any | `—` |
| `rows` | any | `—` |
| `className` | string | `hidden @min-[40rem]:block` |

### FieldValue

```ts
import { FieldValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Hodnota nebo stav jen ke čtení uvnitř Field; výškou a svislým zarovnáním odpovídá Input.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `trailing` | any | `—` |
| `variant` | field · plain | `field` |
| `lockedReason` | string | `—` |

**Examples:**

_Stav DPH_
```tsx
<Field label="Stav DPH" hint="Ověřeno 26.09.2026"><FieldValue><VatStatusBadge status="payer" /></FieldValue></Field>
```

**Avoid:**

- Nevkládejte FieldValue bez nadřazeného Field a popisku.

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

**Props:**

| Prop | Type | Default |
|---|---|---|
| `tone` | default · destructive | `default` |
| `disabledReason` | string | `—` |

### GridActions

```ts
import { GridActions } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridAddActions

```ts
import { GridAddActions } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridAmountEditor

```ts
import { GridAmountEditor } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Číselná editovatelná buňka v obecném DataGrid – vrací se ze sloupce editor (zobrazí se jen u vybraných řádků). Enter potvrdí, Esc vrátí, Tab / Shift+Tab přechází mezi editory, chyba = červený roh s tooltipem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | number | `—` |
| `onChange` | function | `—` |
| `max` | number | `—` |
| `currencySymbol` | string | `—` |
| `decimals` | number | `2` |
| `invalid` | boolean | `—` |
| `invalidMessage` | string | `—` |
| `ariaLabel` | string | `—` |

**Examples:**

_Částka k párování s maximem_
```tsx
<GridAmountEditor ariaLabel="Párovat částkou" value={amount} max={remaining} currencySymbol={row.currencySymbol} invalid={exceedsMax(amount, remaining)} invalidMessage="Převyšuje zbývající částku" onChange={setAmount} />
```

**Avoid:**

- Nepoužívej pro řádky účetního zápisu – ty edituje jen JournalLinesEditor.
- Nepoužívej mimo grid ve formulářích – tam patří AmountInput / DecimalInput.
- Nepiš natvrdo Kč – currencySymbol vždy z dat.

### GridBody

```ts
import { GridBody } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridBookSelect

```ts
import { GridBookSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Kontextový výběr účetní knihy; při více knihách drží stálou šířku podle nejdelšího popisku. Jediná dostupná, readOnly nebo needitovatelná kniha se zobrazí jako tučný text.

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

Kontextové záhlaví nad GridToolbar; vlevo jsou přístupně popsané Kniha a Období, vpravo může být další kontextový filtr. Používá tokenový podklad záhlaví a škáluje se stejně jako grid.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `period` | any | `—` |
| `book` | any | `—` |
| `contextRight` | any | `—` |
| `texts` | any | `—` |
| `zoom` | number | `—` |
| `density` | any | `—` |

**Examples:**

_Kniha, období a směr_
```tsx
<GridContextBar book={bookConfig} period={periodConfig} contextRight={<GridSegmentedToggle options={GRID_DIRECTION_OPTIONS} value={direction} onChange={setDirection} defaultValue="all" ariaLabel="Směr dokladu" />} />
```

**Avoid:**

- Vkládat období nebo knihu zároveň do toolbarLeft
- Používat neutrální vzhled pro segmentový filtr, který zužuje data

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

### GridRowMenu

```ts
import { GridRowMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Ikonové menu řádku gridu pro rowActions, např. Aktivovat / Deaktivovat.

**Examples:**

_Řádek_
```tsx
rowActions={(r) => <GridRowMenu items={[activeToggleMenuItem(r.active, (next) => setActive(r.id, next))]} />}
```

**Avoid:**

- Textová tlačítka v řádku gridu

### GridSearch

```ts
import { GridSearch } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSectionToggles

```ts
import { GridSectionToggles } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridSegmentedToggle

```ts
import { GridSegmentedToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Segmentový filtr pro pravou část kontextového řádku. Výchozí hodnota je neutrální; jiná hodnota je oranžová, protože zužuje data.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `value` | any | `—` |
| `onChange` | function | `—` |
| `defaultValue` | any | `—` |
| `label` | string | `—` |
| `ariaLabel` | string | `—` |
| `disabled` | boolean | `—` |
| `size` | default · row | `default` |

**Examples:**

_Směr pokladního dokladu_
```tsx
<GridSegmentedToggle options={GRID_DIRECTION_OPTIONS} value={direction} onChange={setDirection} defaultValue="all" ariaLabel="Směr pokladního dokladu" />
```

**Avoid:**

- Používat pro běžnou akci místo volby jedné z navzájem výlučných hodnot
- Vynechat ariaLabel, pokud přepínač nemá viditelný label

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

### GridToolbarCollapsible

```ts
import { GridToolbarCollapsible } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### GridToolbarOverflowContext

```ts
import { GridToolbarOverflowContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

Pole IČO s vyhledáním v rejstříku; ve výchozím stavu přijímá jen číslice (max. 8).

**Props:**

| Prop | Type | Default |
|---|---|---|
| `onLookup` | function | `—` |
| `digitsOnly` | boolean | `true` |
| `lookupLabel` | string | `Vyhledat v rejstříku` |
| `refreshLabel` | string | `Aktualizovat z rejstříku` |

**Examples:**

_IČO partnera_
```tsx
<IcoField value={ico} onChange={setIco} onLookup={loadFromAres} busy={busy} />
```

**Avoid:**

- Ruční čištění mezer v aplikaci – řeší digitsOnly

### IcoLink

```ts
import { IcoLink } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Zobrazí IČO monospacem a u platného českého IČO přidá odkaz do obchodního rejstříku nebo ARES.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `ico` | string | `—` |
| `value` | string | `—` |
| `country` | string | `—` |
| `kind` | company · person | `company` |
| `target` | auto · or · ares | `auto` |
| `className` | string | `size-3` |

**Examples:**

_Právnická osoba_
```tsx
<IcoLink ico="27074358" country="CZ" kind="company" target="auto" />
```

**Avoid:**

- Nevytvářejte odkaz pro neplatné nebo zahraniční IČO.

### InactiveTag

```ts
import { InactiveTag } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Šedý štítek „neaktivní“ u již vybrané neaktivní položky ve výběrech.

**Examples:**

_Výběr_
```tsx
<InactiveTag />
```

**Avoid:**

- Nabízení neaktivních položek ve výběru

### Input

```ts
import { Input } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Textový vstup. Krátký vzor zápisu hodnoty předávejte přes `formatPattern` (vykreslí se tlumeně jako placeholder); holý `placeholder` u vstupů nepoužívejte. Vysvětlení patří pod sekci (`FieldGrid.hint`).

**Props:**

| Prop | Type | Default |
|---|---|---|
| `formatPattern` | string | `—` |

**Examples:**

```tsx
<Input value={account} onChange={onAccountChange} formatPattern={appTexts.accountNumberPattern} />
```

**Avoid:**

- Nevkládejte příklad hodnoty, popisek ani popisnou nápovědu do placeholderu.

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

Účetní rozpis s pružnými sloupci, editací klávesnicí a validací předávanou společnému chybovému pruhu formuláře.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `recapTotalAmount` | number | `—` |
| `recapTotalLabel` | string | `—` |

**Examples:**

Rozpis se zkrácenými účty

```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} onValidationChange={(count, errors) => setError(errors[0]?.message)} storageKey="invoice-lines" />
```

Řádky s DPH (2.55.0)

```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč" mode="mainAccount" mainSide="D" mainAccount="321001" vat={{ enabled: vatEnabled, codes: vatCodes, calcMode, onCalcModeChange: setCalcMode, pdpSubjects }} />
// uložení: toJournalRows(lines, { mainSide: "D", vat: { calcMode } })
```

2.92.0

```tsx
<JournalLinesEditor {...props} recapTotalAmount={externalDocumentTotal} />
```

**Avoid:**

- Neskrývejte automaticky sloupec, který uživatel výslovně zapnul ve Sloupcích.
- Nevykreslujte počet chyb do patičky gridu; použijte onValidationChange a společný chybový pruh formuláře.
- Posílat nebo editovat řádky daně (isVatLine) – vytváří je jen databáze; ukládejte přes toJournalRows.


### JournalLinesRecap

```ts
import { JournalLinesRecap } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sbalitelný souhrn účtování a zakázek, který se přepočítává z aktuálních řádků.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `lines` | any | `—` |
| `accounts` | any | `—` |
| `dimensions` | any | `—` |
| `documentCurrency` | string | `—` |
| `documentCurrencySymbol` | string | `—` |
| `homeCurrency` | string | `—` |
| `homeCurrencySymbol` | string | `—` |
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `tab` | string | `—` |
| `onTabChange` | function | `—` |
| `recapTabs` | any | `—` |
| `zoom` | number | `1` |
| `storageKey` | string | `journal-recap` |
| `texts` | any | `—` |
| `vatSummary` | any | `—` |
| `headerTotal` | ReactNode | `—` |

**Examples:**

Rekapitulace

```tsx
<JournalLinesRecap lines={lines} accounts={accounts} storageKey="invoice-lines" />
```

2.92.0

```tsx
<JournalLinesRecap {...props} headerTotal={<JournalRecapHomeTotal total={total} rate={rate} symbol={homeSymbol} />} />
```

**Avoid:**

- Nepočítejte rekapitulaci z filtrované podmnožiny řádků.


### Label

```ts
import { Label } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### LayoutMenu

```ts
import { LayoutMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nabídka uložených rozložení v pevném pořadí: Uložit aktuální jako nové… s ikonou Spravovat vpravo, uložená rozložení a Přepsat uložené aktuálním. Varianta trigger="icon" patří vedle hledání.

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
<AppShell navSearchMenu={<LayoutMenu trigger="icon" items={layouts} onSave={({ name, snapshot }) => save(name, snapshot)} onApply={apply} onUpdate={update} onDelete={remove} />} />
```

**Avoid:**

- Vkládat nabídku rozložení do horní lišty
- Přidávat výchozí rozložení nebo ikony počtu panelů
- Ukládat koncepty nebo nové neuložené záznamy

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
| `options` | any | `—` |
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

### LookupField

```ts
import { LookupField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Vstup s ikonovou akcí vpravo (lupa / ⟳) pro vyhledání nebo obnovení údajů z registru. Režim auto přepne na ⟳ po vyplnění nebo úspěšné akci.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `mode` | search · refresh · auto | `auto` |
| `onAction` | function | `—` |
| `busy` | boolean | `false` |
| `hideAction` | boolean | `false` |
| `resetKey` | any | `—` |
| `searchLabel` | string | `Vyhledat` |
| `refreshLabel` | string | `Aktualizovat` |
| `onEditSelected` | function | `—` |
| `editSelectedLabel` | string | `—` |

**Examples:**

_Název z registru_
```tsx
<LookupField value={name} onChange={setName} onAction={lookupByName} busy={busy} searchLabel="Vyhledat podle názvu" />
```

**Avoid:**

- Tlačítko registru vedle pole místo v poli
- Vlastní input s absolutně umístěnou ikonou

### MaskInput

```ts
import { MaskInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `tokens` | any | `—` |
| `preview` | string | `—` |
| `readOnly` | boolean | `—` |
| `lockedReason` | string | `—` |

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

### NoticeBar

```ts
import { NoticeBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Provozní informace, upozornění, potvrzení nebo problém v kontextu formuláře; může nabídnout navazující textovou akci.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `tone` | info · warning · success · danger · neutral | `—` |
| `title` | any | `—` |
| `children` | any | `—` |
| `actions` | any | `—` |
| `onClose` | function | `—` |
| `closeLabel` | string | `—` |

**Examples:**

_Přeplatek partnera_
```tsx
<NoticeBar tone="info" title="Otevřený přeplatek" actions={<Button>Použít VS</Button>}>Partner má otevřený přeplatek.</NoticeBar>
```

**Avoid:**

- Nepoužívejte pro chybu, která brání uložení dokladu; patří do DocumentForm.error.
- Nepoužívejte pro důvod režimu jen pro čtení; patří do ReadOnlyBanner.
- Nevykreslujte upozornění k dokladu mimo DocumentForm.notices.

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

Standardní výběr ze seznamu. ariaLabel pojmenuje výběr bez navázaného popisku; placeholderValueLabel mění text prázdné položky.

**Examples:**

Pojmenovaný výběr

```tsx
<OptionSelect ariaLabel="Bankovní účet" value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Pro volbu Firma / Osoba nepoužívejte OptionSelect; použijte SegmentedField.
- Nevkládejte ikonová tlačítka do tlačítka spouštěče.


### PageHeader

```ts
import { PageHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Hlavička každé stránky bez podtitulu. V panelu vykreslí vlevo nadpis a dirty tečku, vpravo listování záznamy, historii, maximalizaci a menu ⋯; akce stránky přijímá přes menuActions.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | any | `—` |
| `titleSlot` | any | `—` |
| `titleBadge` | any | `—` |
| `description` | any | `—` |
| `actions` | any | `—` |
| `menuActions` | any | `—` |
| `paneTexts` | any | `—` |

**Avoid:**

- Předávat actions uvnitř panelu místo menuActions
- Vkládat akci Nový do záhlaví místo gridového addAction
- Předávat description; kontext patří do GridContextBar nebo horní lišty

### PageLayout

```ts
import { PageLayout } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | list · form | `form` |
| `children` | any | `—` |
| `className` | string | `pointer-events-none absolute h-px w-px` |

### PageTabs

```ts
import { PageTabs } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `listLabel` | string | `Sekce stránky` |
| `className` | string | `flex h-10 w-full justify-start gap-1 rounded-none border-b bg-transparent p-0` |

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
| `embedded` | boolean | `false` |

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

### PaneScrollContext

```ts
import { PaneScrollContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

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
| `state` | any | `—` |
| `onChange` | function | `—` |
| `onSaveTab` | function | `—` |
| `onNewTabRequest` | function | `—` |
| `shortcuts` | boolean | `true` |
| `texts` | any | `—` |
| `onNotice` | function | `—` |
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

Výběr partnera podle názvu a IČO; PartnerOption podporuje také DIČ pro navazující zobrazení ve formuláři.

**Examples:**

Výběr hodnoty

```tsx
<PartnerSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.


### PaymentOrderAccountField

```ts
import { PaymentOrderAccountField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `enabled` | boolean | `—` |
| `onEnabledChange` | function | `—` |
| `children` | any | `—` |
| `enabledLabel` | string | `—` |
| `disabledLabel` | string | `—` |
| `disabledReason` | string | `—` |

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
| `currencySymbol` | string | `—` |
| `readOnly` | boolean | `false` |
| `canRelease` | boolean | `false` |
| `canUnrelease` | boolean | `false` |
| `onRelease` | function | `—` |
| `onUnrelease` | function | `—` |
| `onGenerate` | function | `—` |
| `texts` | any | `—` |
| `className` | string | `zoom-filters grid-toolbar-row flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2` |

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

Kontextový výběr účetního období se stavovou barvou a obrysem, řízeným otevřením a odlišením stavu bez výběru od firmy bez období.

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
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |

**Examples:**

_Řízený výběr období_
```tsx
<PeriodSwitcher periods={periods} value={periodId} onChange={setPeriodId} open={open} onOpenChange={setOpen} />
```

**Avoid:**

- Nepřebírejte stavovou barvu období na štítek firmy.
- Neobcházejte zavírání změnou key podle cesty.

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

### PrintPreviewDialog

```ts
import { PrintPreviewDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
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

### RateField

```ts
import { RateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Kurz cizí měny s doporučenou hodnotou, zdrojem a povinným důvodem ručního kurzu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | number | `—` |
| `onChange` | function | `—` |
| `currency` | string | `—` |
| `homeCurrency` | string | `—` |
| `homeCurrencySymbol` | string | `—` |
| `currencySymbol` | string | `—` |
| `rateAmount` | number | `—` |
| `suggestedRate` | number | `—` |
| `suggestedInfo` | string | `—` |
| `manual` | boolean | `—` |
| `onUseSuggested` | function | `—` |
| `disabled` | boolean | `—` |
| `readOnly` | boolean | `—` |
| `note` | string | `—` |
| `onNoteChange` | function | `—` |
| `noteLabel` | string | `Důvod ručního kurzu` |
| `sourceLabel` | string | `—` |
| `manualSourceLabel` | string | `Ruční kurz` |
| `suggestedTooltip` | function | `—` |
| `requiredMessage` | string | `Uveďte důvod ručního kurzu.` |
| `showNote` | boolean | `true` |
| `id` | string | `rate` |
| `className` | string | `font-mono tabular-nums` |
| `inputClassName` | string | `—` |

**Examples:**

Kurz EUR

```tsx
<RateField value={rate} onChange={setRate} currency="EUR" homeCurrency="CZK" rateAmount={1} suggestedRate={24.38} suggestedInfo="ČNB 25. 9. 2026" manual={manual} />
```

2.92.0

```tsx
<RateField {...rateProps} inputClassName="h-11" />
```

**Avoid:**

- Nepoužívejte holý číselný input pro kurz.
- Ruční kurz neukládejte bez důvodu.


### ReadOnlyBanner

```ts
import { ReadOnlyBanner } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ReceivedBankAccountField

```ts
import { ReceivedBankAccountField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `isHomeCurrency` | boolean | `—` |
| `bankCodes` | any | `—` |
| `disabled` | boolean | `—` |
| `onValidationChange` | function | `—` |
| `texts` | object | `—` |

### RecordActionBar

```ts
import { RecordActionBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Přilepený pruh karty záznamu pod PageHeader. Sjednocuje uložení, primární a další akce, společný busy stav a pořadí error → notices. DocumentForm jej používá interně.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `leftContent` | any | `—` |
| `saveAction` | any | `—` |
| `primaryAction` | any | `—` |
| `moreActions` | any | `—` |
| `busy` | boolean | `false` |
| `error` | any | `—` |
| `notices` | any | `—` |
| `saveLabel` | string | `—` |
| `moreActionsLabel` | string | `—` |
| `errorTitle` | any | `—` |
| `closeErrorLabel` | string | `—` |
| `className` | string | `animate-spin` |
| `dataSlot` | string | `record-action-bar` |
| `errorDataSlot` | string | `record-action-error` |
| `noticesDataSlot` | string | `record-action-notices` |

**Examples:**

_Karta majetku_
```tsx
<RecordActionBar saveAction={{ onSave, dirty }} primaryAction={{ label: "Zařadit", onClick: classify }} notices={<NoticeBar tone="info">Informace</NoticeBar>} />
```

**Avoid:**

- Nevykreslujte Uložit ani akce záznamu volně pod poli.
- Stav záznamu nedávejte do pruhu; patří do PageHeader.titleBadge.

### RecordDialog

```ts
import { RecordDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednotný dialog pro editaci i detail záznamu. Pro detail bez editace použijte readOnly; rovnocenné datové sekce předávejte přes tabs. Stav záznamu přes status (Aktivní / Neaktivní vedle nadpisu) a lifecycleAction (Deaktivovat / Aktivovat vlevo vedle Odstranit, s dirty nabídne „Uložit změny a …“).

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `title` | string | `—` |
| `description` | string | `—` |
| `onSubmit` | function | `—` |
| `submitLabel` | string | `Uložit` |
| `closeLabel` | string | `Zavřít` |
| `busy` | boolean | `—` |
| `children` | any | `—` |
| `extraActions` | any | `—` |
| `size` | md · lg | `sm` |
| `wide` | boolean | `—` |
| `contentClassName` | string | `—` |
| `sidePanel` | any | `—` |
| `sidePanelLabel` | string | `—` |
| `sidePanelTitle` | any | `—` |
| `headerExtra` | any | `—` |
| `titleBadges` | any | `—` |
| `sidePanelExtra` | any | `—` |
| `readOnly` | boolean | `false` |
| `tabs` | any | `—` |
| `status` | any | `—` |
| `lifecycleAction` | any | `—` |
| `dirty` | boolean | `false` |
| `cancelLabel` | string | `Zrušit` |
| `saveAndActionLabel` | string | `Uložit změny a {label}` |
| `dirtyConfirmTitle` | string | `Formulář obsahuje neuložené změny` |

**Examples:**

_Detail prostoru jen pro čtení_
```tsx
<RecordDialog open={open} onOpenChange={setOpen} title={workspace.name} readOnly tabs={[{ value: "members", label: "Členové", content: <MembersGrid /> }]} />
```

_Stav a deaktivace_
```tsx
<RecordDialog status={{ active }} dirty={dirty} lifecycleAction={{ label: active ? "Deaktivovat" : "Aktivovat", confirm: { title: "Deaktivovat partnera?" }, onClick: ({ saveFirst }) => toggle(saveFirst) }} …/>
```

**Avoid:**

- Nevykreslujte tlačítko Uložit v režimu readOnly.
- Nevytvářejte vlastní lištu záložek mimo tabs.

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

### SectionHeading

```ts
import { SectionHeading } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nadpis sekce formuláře, dialogu, karty nebo panelu; nepoužívejte pro nadpis stránky ani záhlaví gridu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `level` | any | `2` |
| `aside` | any | `—` |

**Examples:**

_Sekce formuláře_
```tsx
<SectionHeading level={2}>Platební údaje</SectionHeading>
```

**Avoid:**

- Nepoužívejte SectionHeading místo PageHeader ani GridTitleBar.

### SegmentedField

```ts
import { SegmentedField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Segmentová volba 2–3 vzájemně výlučných typů záznamu ve formuláři s ovládáním šipkami.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `value` | any | `—` |
| `onChange` | function | `—` |
| `disabled` | boolean | `—` |
| `label` | string | `—` |
| `ariaLabel` | string | `—` |

**Examples:**

_Typ partnera_
```tsx
<SegmentedField ariaLabel="Typ partnera" options={[{ value: "company", label: "Firma" }, { value: "person", label: "Osoba" }]} value={kind} onChange={setKind} />
```

**Avoid:**

- Nepoužívejte GridSegmentedToggle ve formuláři.
- Nepoužívejte OptionSelect pro 2–3 základní typy záznamu.

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

### SettingsSection

```ts
import { SettingsSection } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sekce okamžitých nastavení s jednotnou nápovědou „Změny se ukládají hned“.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `title` | any | `—` |
| `children` | any | `—` |
| `instantSaveHint` | any | `Změny se ukládají hned` |
| `className` | string | `mb-1` |

**Examples:**

_Sekce_
```tsx
<SettingsSection title="Firma">{switches}</SettingsSection>
```

**Avoid:**

- Míchání SwitchField s poli čekajícími na Uložit

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

### ShowInactiveToggle

```ts
import { ShowInactiveToggle } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Standardní přepínač „Zobrazit neaktivní“ nad gridem číselníku; výchozí vypnuto.

**Examples:**

_Grid_
```tsx
<DataGrid filters={<ShowInactiveToggle pressed={show} onPressedChange={setShow} />} rows={filterInactiveRows(rows, show, (r) => r.active)} … />
```

**Avoid:**

- Switch nebo OptionSelect pro filtr neaktivních

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
| `locale` | any | `—` |
| `texts` | any | `—` |

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

### StandaloneNav

```ts
import { StandaloneNav } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Menu stránek v levém sloupci StandaloneShell se stejným vzhledem jako menu panelů; aktivní položka podle trasy, pod md výběr stránek.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `groups` | any | `—` |
| `pathname` | string | `—` |
| `label` | string | `—` |
| `selectPlaceholder` | string | `—` |
| `className` | string | `w-full bg-background text-foreground` |

**Examples:**

_Stránky prostoru_
```tsx
<StandaloneNav groups={[{ id: "ws", label: "", section: "Prostor", items: [{ to: "/ws/udaje", label: "Údaje prostoru" }] }]} />
```

**Avoid:**

- Nepoužívejte uvnitř AppShell – tam slouží navGroups / views panelu.

### StandaloneShell

```ts
import { StandaloneShell } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Rám obrazovky nad úrovní firmy (nastavení prostoru) mimo AppShell: horní lišta s logem, nadpisem, uživatelským menu a Zavřít, šedý levý sloupec a samostatně rolovaný obsah. Esc zavře jen bez otevřeného překryvu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `brand` | any | `—` |
| `title` | string | `—` |
| `userMenu` | any | `—` |
| `onClose` | function | `—` |
| `closeLabel` | string | `—` |
| `sidebar` | any | `—` |
| `children` | any | `—` |

**Examples:**

_Nastavení prostoru_
```tsx
<StandaloneShell brand={<Logo />} title="Nastavení prostoru" userMenu={<UserMenu … />} onClose={close} sidebar={<><ContextSwitcher … /><StandaloneNav groups={groups} /></>}>{page}</StandaloneShell>
```

**Avoid:**

- Nepoužívejte pro nastavení firmy – to patří do panelu AppShell.
- Neskládejte vlastní lištu a sloupec místo tohoto rámu.
- Neuložené změny ohlídejte v onClose, rám je sám nekontroluje.

### StatusBadge

```ts
import { StatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednotný štítek stavu. Tón accent označuje privilegovaný pohled provozovatele bez chybového významu.

**Examples:**

_Provozovatel_
```tsx
<StatusBadge status="operator" config={{ operator: { label: "Provozovatel", tone: "accent" } }} />
```

**Avoid:**

- Nepoužívejte danger pro provozovatele; danger je vyhrazený pro chyby a blokace.

### StatusDot

```ts
import { StatusDot } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SuggestInput

```ts
import { SuggestInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Textové pole s přepínatelným našeptávačem z předchozích záznamů.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `loadSuggestions` | function | `—` |
| `enabled` | boolean | `—` |
| `onEnabledChange` | function | `—` |
| `readOnly` | boolean | `—` |
| `debounceMs` | number | `200` |
| `enabledLabel` | string | `Našeptávač z předchozích dokladů – zapnuto` |
| `disabledLabel` | string | `Našeptávač z předchozích dokladů – vypnuto` |

**Examples:**

_Historie popisů_
```tsx
<SuggestInput value={value} onChange={setValue} loadSuggestions={load} enabled={enabled} onEnabledChange={setEnabled} />
```

**Avoid:**

- Nenačítejte více než deset viditelných návrhů ani neblokujte psaní čekáním na odpověď.

### Switch

```ts
import { Switch } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SwitchField

```ts
import { SwitchField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Řádek okamžitého nastavení – popisek vlevo, přepínač vpravo, uloží se hned.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `checked` | boolean | `—` |
| `onCheckedChange` | function | `—` |
| `label` | any | `true` |
| `hint` | any | `—` |
| `busy` | boolean | `false` |

**Examples:**

_Nastavení_
```tsx
<SettingsSection title="Upozornění"><SwitchField label="Připomínat splatnost" checked={v} busy={saving} onCheckedChange={save} /></SettingsSection>
```

**Avoid:**

- Přepínač ve formuláři s tlačítkem Uložit
- Filtr ano/ne nad gridem – použijte GridToggleButton

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

Stromový grid se součty, rozbalováním a shodným sticky sloupcem akcí jako DataGrid; onRowOpen má při dvojkliku přednost před úpravou.

**Examples:**

_Akce řádků s vysvětlením zákazu_
```tsx
<TreeGrid rows={rows} columns={columns} onEditRow={editRow} onDeleteRow={deleteRow} deleteDisabledReason={row => row.posted ? "Zaúčtovaný doklad nelze odstranit." : undefined} />
```

**Avoid:**

- Umisťovat Upravit nebo Odstranit jednotlivého řádku do horní lišty
- Skrýt zakázanou akci, pokud má uživatel potřebovat vysvětlení důvodu

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

### UnitSelect

```ts
import { UnitSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr hodnoty ze seznamu; text a ikonové akce mají oddělené místo před pevnou šipkou.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `onCreateUnit` | function | `—` |
| `disabled` | boolean | `—` |
| `initialSearch` | string | `—` |
| `defaultOpen` | boolean | `false` |
| `onOpenChange` | function | `—` |
| `onKeyDown` | any | `—` |
| `placeholder` | string | `Vyberte MJ` |
| `searchPlaceholder` | string | `Hledat kód nebo název…` |
| `emptyText` | string | `Žádná měrná jednotka nenalezena` |
| `createLabel` | function | `—` |
| `className` | string | `relative h-full min-w-0` |
| `inactiveLabel` | string | `neaktivní` |
| `onEditSelected` | function | `—` |
| `editSelectedLabel` | string | `—` |

**Examples:**

Výběr hodnoty

```tsx
<UnitSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.


### UnknownValue

```ts
import { UnknownValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### UnsavedChangesDialog

```ts
import { UnsavedChangesDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `tabTitle` | string | `—` |
| `intent` | string | `—` |
| `saving` | boolean | `—` |
| `onSave` | function | `—` |
| `onDiscard` | function | `—` |
| `onBack` | function | `—` |
| `onOpenInNewTab` | function | `—` |
| `action` | "close" \| "switch" \| "logout" \| "navigate" | `navigate` |

**Examples:**

2.92.0

```tsx
<UnsavedChangesDialog {...props} action="close" />
```


### UserMenu

```ts
import { UserMenu } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Uživatelská nabídka v pevném pořadí: identita, vlastní položky, velikost zobrazení, pracovní prostor a odhlášení. workspaceAction přidá klávesnicí dostupnou správu prostorů.

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
| `workspaceAction` | function | `—` |
| `onSignOut` | function | `—` |
| `signOutLabel` | string | `Odhlásit` |
| `menuLabel` | string | `Uživatelská nabídka` |

**Examples:**

_S akcí pracovních prostorů_
```tsx
<UserMenu name="Petr Slivka" email="petr@slivka.cz" workspaces={workspaces} workspaceAction={{ label: "Spravovat pracovní prostory", icon: Settings, onSelect: openWorkspaceSettings }} />
```

**Avoid:**

- Nevkládejte pracovní prostory do vnořeného podmenu.
- Neměňte pevné pořadí položek ani nepřidávejte další bez schválení.

### VatCodeSelect

```ts
import { VatCodeSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr kódu DPH (kód – název) pro řádek dokladu. V buňce gridu použijte defaultOpen – otevře se hned při vstupu do editace a psaní filtruje podle kódu i názvu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `codes` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `Vyberte kód DPH` |
| `searchPlaceholder` | string | `Hledat kód nebo název…` |
| `emptyText` | string | `Žádný kód DPH nenalezen` |
| `disabled` | boolean | `—` |
| `defaultOpen` | boolean | `false` |
| `initialSearch` | string | `—` |
| `onOpenChange` | function | `—` |
| `onKeyDown` | any | `—` |
| `className` | string | `ml-auto size-4 shrink-0 opacity-50` |

**Examples:**

_Buňka Kód DPH v editoru řádků_
```tsx
<VatCodeSelect defaultOpen codes={vatCodes} value={line.vatCodeId} initialSearch={editing?.seed} onKeyDown={selectKey} onChange={(id) => { changeVatCode(line, id); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />
```

**Avoid:**

- Nepoužívejte OptionSelect pro kód DPH v buňce gridu – neumí se otevřít hned při editaci ani filtrovat psaním.

### VatStatusBadge

```ts
import { VatStatusBadge } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Stav DPH partnera se štítkem nespolehlivého plátce a datem ověření.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `status` | payer · identified_person · vat_group · non_payer · unverified | `—` |
| `unreliableSince` | any | `—` |
| `checkedAt` | any | `—` |
| `texts` | any | `—` |
| `className` | string | `inline-flex items-center rounded-sm border border-destructive bg-destructive px-2 py-0.5 text-xs font-medium leading-tight text-destructive-foreground` |

**Examples:**

_Nespolehlivý plátce_
```tsx
<VatStatusBadge status="payer" unreliableSince="2026-03-01" checkedAt="2026-09-26" />
```

**Avoid:**

- Vlastní barevné štítky stavu DPH

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

Starší společný výběr pracovního prostoru a firmy; firemní část používá neutrální obrys, ikonu budovy a volitelné IČO.

**Examples:**

_Pracovní prostor a firma_
```tsx
<WorkspaceCompanySwitcher workspaces={workspaces} companies={companies} workspaceId={workspaceId} companyId={companyId} onWorkspaceChange={setWorkspaceId} onCompanyChange={setCompanyId} />
```

**Avoid:**

- Pro nové horní lišty používejte CompanySwitcher a pracovní prostor přepínejte v UserMenu.

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


### JournalRecapHomeTotal

```ts
import { JournalRecapHomeTotal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `total` | number | `—` |
| `rate` | number \| null | `—` |
| `rateAmount` | number | `1` |
| `symbol` | string | `—` |
| `labelTemplate` | string | `—` |

**Examples:**

Přepočtený celek

```tsx
<JournalRecapHomeTotal total={total} rate={rate} rateAmount={rateAmount} symbol={homeCurrencySymbol} />
```

**Avoid:**

- Nevkládejte značku měny natvrdo.
- Nevydávejte chybějící kurz za nulu.
