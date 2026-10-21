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

Výběr účtu z osnovy; suffix vykreslí uvnitř spouštěče například stranu MD/DAL. S allowLevels a catalog podporuje také třídu nebo skupinu. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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
| `id` | string | `—` |
| `className` | string | `ml-auto flex shrink-0 items-center gap-2` |

**Examples:**

_Třída nebo skupina_
```tsx
<AccountSelect accounts={accounts} catalog={classesAndGroups} allowLevels={["class","group"]} value={prefix} onChange={setPrefix} />
```

**Avoid:**

- Nativní select pro účty
- Doplňování tečky do uloženého kódu
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

### AdvanceAllocationDialog

```tsx
import { AdvanceAllocationDialog } from "@/design-system/{slug}";
```

Řízený výběr ZL/DD a přiřazovaných částek; výchozí minimum dodává APP. DS kontroluje meze a chrání změny.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `target` | "list"  /  "taxDocument" | `—` |
| `candidates` | AdvanceAllocationCandidate[] | `—` |
| `value` | AdvanceAllocation[] | `—` |
| `onChange` | (value: AdvanceAllocation[]) => void | `—` |
| `remaining` | number | `—` |
| `currency` | string | `—` |
| `storageKey` | string | `—` |
| `dirty` | boolean | `—` |
| `loading` | boolean | `—` |
| `busy` | boolean | `—` |
| `error` | string | `—` |
| `readOnly` | boolean | `—` |
| `onAllocate` | (
    value: AdvanceAllocation[],
  ) => void | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvanceAllocationDialog open={open} onOpenChange={setOpen} target="list" candidates={candidates} value={value} onChange={setValue} remaining={remaining} currency={currency.symbol} storageKey="allocation" dirty={dirty} onAllocate={saveAllocation} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

### AdvanceCorrectionDialog

```tsx
import { AdvanceCorrectionDialog } from "@/design-system/{slug}";
```

Náhled řádků opravného DD dodaných APP a explicitní rozhodnutí Vytvořit/Nevytvářet. Zavření není odmítnutí.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `rows` | AdvanceCorrectionRow[] | `—` |
| `storageKey` | string | `—` |
| `onDecision` | (create: boolean) => void | `—` |
| `busy` | boolean | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvanceCorrectionDialog open={open} onOpenChange={setOpen} rows={preview} storageKey="advance-correction" onDecision={handleDecision} busy={busy} error={error} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

### AdvanceDeductionsSection

```tsx
import { AdvanceDeductionsSection } from "@/design-system/{slug}";
```

Odečty faktury pod rekapitulací přes linesEditorProps.afterVatRecap; u ZL APP slot nepředává. Částky, stav a práva z APP.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `rows` | AdvanceDeductionRow[] | `—` |
| `storageKey` | string | `—` |
| `addAction` | AdvanceCommand | `—` |
| `manualAction` | AdvanceCommand | `—` |
| `onAction` | (
    action: AdvanceDeductionAction,
    row: AdvanceDeductionRow,
  ) => void | `—` |
| `onOpenTaxDocument` | (row: AdvanceDeductionRow) => void | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvanceDeductionsSection rows={deductions} storageKey="deductions" addAction={addAction} manualAction={manualAction} onAction={handleAction} onOpenTaxDocument={openDD} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

### AdvancePaymentBreakdown

```tsx
import { AdvancePaymentBreakdown } from "@/design-system/{slug}";
```

Dvě roviny platby zálohy skládají SettlementBar a LinkedRecordsPanel. APP dodává částky, lhůtu, stav DD a oprávnění.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `totals` | AdvancePaymentTotals | `—` |
| `currency` | string | `—` |
| `planes` | {
    lists: AdvancePaymentPlane;
    taxDocuments: AdvancePaymentPlane;
  } | `—` |
| `actions` | AdvancePaymentActions | `—` |
| `taxStatus` | AdvanceTaxStatus | `—` |
| `deadline` | {
    days: number;
    label: string;
    overdue: boolean;
    warning?: string;
  } | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvancePaymentBreakdown totals={totals} currency={currency.symbol} planes={planes} taxStatus={status} deadline={{ days: 15, label: deadlineLabel, overdue }} actions={actions} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

### AdvanceReasonDialog

```tsx
import { AdvanceReasonDialog } from "@/design-system/{slug}";
```

Řízený výběr důvodu DD nebude nebo storna s textem; nabídku právních důvodů poskytuje APP.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `title` | string | `—` |
| `reasons` | SelectOption[] | `—` |
| `value` | AdvanceReasonValue | `—` |
| `onChange` | (value: AdvanceReasonValue) => void | `—` |
| `onConfirm` | (value: AdvanceReasonValue) => void | `—` |
| `dirty` | boolean | `—` |
| `busy` | boolean | `—` |
| `error` | string | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvanceReasonDialog open={open} onOpenChange={setOpen} title={title} reasons={reasons} value={value} onChange={setValue} dirty={dirty} onConfirm={saveDecision} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

### AdvanceRegisterGrid

```tsx
import { AdvanceRegisterGrid } from "@/design-system/{slug}";
```

Preset DataGridu se zůstatky APP, řízenými filtry a řezem k datu; nepočítá lhůty ani historické zůstatky.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `rows` | AdvanceRegisterRow[] | `—` |
| `storageKey` | string | `—` |
| `filters` | AdvanceRegisterFilters | `—` |
| `onFiltersChange` | (filters: AdvanceRegisterFilters) => void | `—` |
| `asOf` | NonNullable<
    DataGridProps<AdvanceRegisterRow>["asOf"]
  > | `—` |
| `onOpen` | (row: AdvanceRegisterRow) => void | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |

**Examples:**

**Zálohy:**

```tsx
<AdvanceRegisterGrid rows={rows} storageKey="advances" filters={filters} onFiltersChange={setFilters} asOf={asOf} onOpen={openPayment} />
```

**Avoid:**

- Neprovádějte doménové výpočty, párování ani zápisy v DS; nesčítejte různé měny.

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

### AmountDifference

```ts
import { AmountDifference } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Společný stav rozdílu částek pro editor řádků a bankovní výpis. Výpis vykresluje komponentu pouze při nenulové odchylce; popisky a značka měny pocházejí z aplikace nebo DsTexts. Vyrovnaný stav nepřipojuje měnu; editor řádků používá balancedLabel a výpis nulový rozdíl nezobrazuje.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | number | `—` |
| `label` | string | `—` |
| `overLabel` | string | `—` |
| `balancedLabel` | string | `—` |
| `currencySymbol` | string | `—` |

**Examples:**

_Rozdíl výpisu_
```tsx
{difference !== 0 && <AmountDifference value={difference} label={texts.difference} currencySymbol={currency.symbol} />}
```

**Avoid:**

- Nevytvářejte vlastní styl rozdílu v jednotlivých formulářích.
- Nevkládejte pevnou značku měny ani zde nepočítejte součty.

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

### AttachmentList

```tsx
import { AttachmentList } from "@/design-system/{slug}";
```

Zdroj s náhledem a akcí Nahradit, ostatní přílohy s metadaty a operacemi aplikace. removeKind určuje delete/Smazat nebo remove/Odebrat; oprávnění a důvody dodává aplikace. Výběr i přetažení sdílejí validateFiles, chyby zobrazuje NoticeBar.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `attachments` | readonly RecordAttachment[] | `—` |
| `source` | RecordAttachment  /  null | `—` |
| `accept` | readonly string[] | `—` |
| `maxSize` | number | `—` |
| `canAdd` | boolean | `—` |
| `addDisabledReason` | string | `—` |
| `onFiles` | (files: File[], rejected: RejectedFile[]) => void | `—` |
| `canRemove` | (attachment: RecordAttachment) => boolean | `—` |
| `removeDisabledReason` | (attachment: RecordAttachment) => string  /  undefined | `—` |
| `removeKind` | (attachment: RecordAttachment) => "delete"  /  "remove"  /  null | `—` |
| `onRemove` | ( attachment: RecordAttachment, kind: "delete"  /  "remove", reason?: string, ) => void  /  Promise<void> | `—` |
| `allowRemovalReason` | boolean | `—` |
| `onReplaceSource` | (source: RecordAttachment) => void  /  Promise<void> | `—` |
| `canReplaceSource` | boolean | `—` |
| `replaceDisabledReason` | string | `—` |
| `onDownload` | (attachment: RecordAttachment) => void | `—` |
| `onOpen` | (attachment: RecordAttachment) => void | `—` |
| `texts` | Partial<AttachmentTexts> | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<AttachmentList attachments={files} source={source} accept={allowedTypes} maxSize={limit} canAdd={rights.add} onFiles={upload} canRemove={canRemove} removeKind={removeKind} onRemove={removeAttachment} allowRemovalReason onReplaceSource={replaceSource} />
```

**Avoid:**

- Nenačítejte soubory uvnitř DS; nerozhodujte removeKind podle stavu dokladu v komponentě. Zakázanou akci nezakrývejte. Zdroj nemažte ani neodebírejte.

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

Používejte sdílenou komponentu se stabilní geometrií při změně stavu a měřítka.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `size` | sm · md | `sm` |
| `variant` | default · secondary · destructive · outline · success · warning · info | `default` |

**Examples:**

_Běžné použití_
```tsx
<Badge variant="outline">Kontrola</Badge>
```

**Avoid:**

- Neměňte výšku ani tvar podle aktivního nebo zakázaného stavu.

### BankAccountField

```ts
import { BankAccountField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr účtu nebo ruční zadání. disabledReason nahrazuje výzvu výběru uvnitř pole, nikdy se nevykresluje pod polem. BankAccountOption vyžaduje úplné number + bankCode nebo iban; tuzemská dvojice má přednost, jinak se zobrazí IBAN po čtyřech znacích. Hledání zahrnuje IBAN i při současném tuzemském čísle. Výběr je vždy hledatelný; data bez úplné tuzemské dvojice nebo IBAN se vyřadí za běhu. Hledání podporuje také IBAN s mezerami. BankAccountOptionBase má number a bankCode volitelné; bankAccountOptionValue poskytuje stabilní identitu. Filtr za běhu ověřuje řetězcový typ number, bankCode a iban. Hledání ignoruje mezery v IBAN na obou stranách dotazu. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Sdílený účet. Přidání v řádku hledání předává dotaz, neplatný účet má výstrahu uvnitř pole a nikdy text pod polem. onAddAccount má tvar (searchText: string) => void; dosavadní bezparametrické callbacky zůstávají kompatibilní. Ruční vstup nahrazuje výběr ve stejném poli; aplikace řídí entryMode a onEntryModeChange, přepnutí nemaže hodnotu.

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
| `className` | string | `flex min-w-0 items-center gap-2` |
| `selectionOnly` | boolean | `false` |
| `onAddAccount` | function | `—` |
| `addAccountDisabledReason` | string | `—` |
| `addAccountText` | string | `—` |
| `placeholder` | string | `—` |
| `disabledReason` | string | `—` |
| `entryMode` | selected · manual | `—` |
| `onEntryModeChange` | function | `—` |
| `manualFormatPattern` | string | `—` |

**Examples:**

_Účet dodavatele_
```tsx
<BankAccountField aria-label="Bankovní účet" value={account} onChange={setAccount} options={accounts} bankCodes={bankCodes} />
```

_Účet pouze s IBAN_
```tsx
<BankAccountField value={accountId} onChange={setAccountId} selectionOnly options={[{ id: "eur", iban: "CZ6508000000192000145399" }]} />
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<BankAccountField value={account} onChange={setAccount} options={accounts} entryMode={entryMode} onEntryModeChange={setEntryMode} manualFormatPattern={texts.accountFormat} />
```

**Avoid:**

- Nepředvyplňujte hodnotu jen podle příznaku default; hodnotu řídí aplikace.
- Nepřijímejte neúplný ruční účet bez kontroly po opuštění pole.
- Neopakujte disabledReason pod polem ani v duplicitním tooltipu.
- Nevynechávejte účty partnera pouze s IBAN a neskládejte zápis undefined/undefined.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### BankStatementForm

```ts
import { BankStatementForm } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Formulář bankovního výpisu: Uložit je společná primární akce RecordActionBar se sdílenou měřenou kaskádou; dirty/disabled/busy se řídí props. Číslo se upravuje vpravo v IdentityLine; hasItems, checked/posted a readOnly ukážou FieldValue se zámkem a důvodem i klepnutím. value obsahuje date, number a bankClosing, nikoli note. Základní údaje: datum vlevo, nepovinný Zůstatek dle banky vpravo a pouze nenulový Rozdíl přes AmountDifference. Zůstatky dle pohybů mají čtyři součty. Domácí měna zachovává samostatné porovnání. Kontrola a její zrušení vysvětlují účel i klepnutím; checkDisabledReason zakáže jen kontrolu. Aplikace řídí ukládání a změnu stavu. Bankovní zůstatek v obou měnách má na široké ploše span 3/12 vpravo; nenulový rozdíl těsně vlevo. Číslo dědí typografii IdentityLine také při zamčení. Zamčené Uložit vysvětluje lockedReason. Povolená kontrola se klikem provede bez připnutí vysvětlení; dotyk jej ukáže na 3 s. Výpis bez viditelného stavového štítku; status dál řídí zamčení. Nový výpis má prázdné pohyby; + Příjem / + Výdaj volají onSaveThenAdd, aplikace nejdříve úspěšně uloží. Kontrola používá sdílenou kaskádu RecordActionBar.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `status` | open · checked · posted | `—` |
| `book` | any | `—` |
| `currency` | string | `—` |
| `currencySymbol` | string | `—` |
| `period` | any | `—` |
| `bankAccount` | any | `—` |
| `balances` | any | `—` |
| `home` | any | `—` |
| `onHomeBankClosingChange` | function | `—` |
| `hasItems` | boolean | `—` |
| `isNew` | boolean | `—` |
| `onSaveThenAdd` | function | `—` |
| `readOnly` | boolean | `—` |
| `dirty` | boolean | `—` |
| `busy` | boolean | `—` |
| `onSave` | function | `—` |
| `onSaveAndClose` | function | `—` |
| `checkDisabledReason` | string | `—` |
| `onCheckedChange` | function | `—` |
| `onDelete` | function | `—` |
| `error` | any | `—` |
| `notices` | any | `—` |
| `items` | any | `—` |
| `texts` | any | `—` |

**Examples:**

_Řízený výpis_
```tsx
<BankStatementForm value={statement} onChange={setStatement} status="open" book={bookName} currency={currency.code} currencySymbol={currency.symbol} period={periodLabel} bankAccount={accountLabel} balances={totals} dirty={dirty} onSave={save} onCheckedChange={check} items={itemsGrid} />
```

**Avoid:**

- Nevkládejte pevnou značku měny; použijte currencySymbol a home.currencySymbol.
- Neukládejte data uvnitř knihovny ani neschovávejte důvod zakázaného odstranění.
- Nepředávejte value.note; výpis poznámku nemá.
- Nevykreslujte nulový rozdíl ani další pole čísla v základní sekci.

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

Výběr účetní knihy ve formuláři. Jedinou aktivní knihu výchozí displayWhenSingle zobrazí jako hodnotu jen pro čtení a automaticky doplní její id. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

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
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 12h: zakázané varianty default (primary), destructive, ghost i link mají šedý podklad muted/40 a tlumený text. Vnořené spany se plošně nepřebarvují, aby odznaky zachovaly vlastní stav. size="control" bere výšku z --control-h svého prostředí; ostatní velikosti zůstávají beze změny.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `variant` | default · destructive · outline · outline-destructive · secondary · ghost · link | `default` |
| `size` | default · sm · lg · icon · control | `default` |
| `asChild` | boolean | `false` |

**Examples:**

_Použití společného stavu_
```tsx
<Button {...props} />
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<Button size="control" variant="outline">{texts.map}</Button>
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### Calendar

```ts
import { Calendar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jednotný výběr dnů, měsíců a let. Inline nepřebírá fokus; initialFocus volí vybraný den, dnešek v měsíci, první povolený den měsíce. Rámeček jen při klávesnici, Dnes uprostřed. disabled se slučuje s minDate/maxDate; captionLayout od 2.110.0 nemá účinek.

**Examples:**

_Běžné použití_
```tsx
<Calendar mode="single" selected={date} onSelect={setDate} onToday={setDate} />
```

**Avoid:**

- Neměňte výšku ani tvar podle aktivního nebo zakázaného stavu.

### CalendarDayButton

```ts
import { CalendarDayButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### CalendarPicker

```ts
import { CalendarPicker } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `—` |
| `disabled` | boolean | `—` |
| `maxDate` | any | `—` |
| `minDate` | any | `—` |
| `className` | string | `size-4 shrink-0 text-muted-foreground` |
| `label` | string | `—` |
| `baseDate` | string | `—` |

**Examples:**

_Použití společného stavu_
```tsx
<CalendarPicker {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Použití společného stavu_
```tsx
<CategorySelect {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Zaškrtávátko formuláře s jednořádkovým zkráceným popiskem a úplným textem v bublině. Hint je ikona Info u popisku; align="input" má výšku --control-h. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `checked` | boolean | `—` |
| `onCheckedChange` | function | `—` |
| `label` | any | `true` |
| `hint` | any | `—` |
| `error` | string | `—` |
| `warning` | string | `—` |
| `align` | natural · input | `natural` |

**Examples:**

_Vedle polí_
```tsx
<FieldGrid cols={4}>…<CheckboxField align="input" label="Plátce DPH" checked={v} onCheckedChange={setV} /></FieldGrid>
```

_Dlouhý popisek s nápovědou_
```tsx
<CheckboxField label={texts.privateAsset} hint={texts.assetRatioHint} checked={v} onCheckedChange={setV} />
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<CheckboxField label={texts.approved} checked={approved} onCheckedChange={setApproved} error={errors.approved} align="input" />
```

**Avoid:**

- Holý Checkbox s nativním <label>
- CheckboxField pro Aktivní u číselníku
- Checkbox pro okamžitě ukládané nastavení – použijte SwitchField
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Použití společného stavu_
```tsx
<ChipMultiSelect {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Neutrální obrysový výběr firmy s hledáním v jediném seznamu, IČO, řízeným otevřením a automatickým zavřením po volbě. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání kontaktu s + v řádku hledání. onCreateNew dostane aktuální hledaný text, bez oprávnění akce vysvětlí důvod. Položky nabídky jsou jednořádkové: jméno a zkrácené doplňkové údaje, celý text v title. Také dlouhé jméno kontaktu se zkrátí výpustkou a má celý text v title.

**Examples:**

_Použití společného stavu_
```tsx
<ContactSelect {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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
| `onSearchChange` | function | `—` |
| `keepValue` | boolean | `false` |

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

Přepínač kontextu (prostoru) nahoře ve sloupci StandaloneShell: zkratka, název, popis a popover s hledáním od prahu, tečkou aktuálního a akcemi. Esc zavře jen popover. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### CounterpartyField

```ts
import { CounterpartyField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Volný text protistrany s volitelným propojením; prázdný dotaz zobrazí aktivní partnery a favoriteIds je řadí první. ＋ v řádku hledání předává aktuální dotaz; createDisabledReason zakáže přidání s přístupným vysvětlením.

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
| `createLabel` | string | `—` |
| `createDisabledReason` | string | `—` |
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

Edit dokladu 13: ContactRound v obou režimech; partner je zapnutý, ruční vypnutý s přeškrtnutím. Stálý název z DsTexts, tooltip podle stavu, lockedReason zachová fokus bez změny. Tužka jen pro vybraného partnera; šipka a křížek vlevo od FieldToggleButton. 13b: partnerModeLabel a manualModeLabel jsou nepovinné a @deprecated od 2.100.0 (ignorované); přepisy předejte přes DsTexts.fieldToggle.directory / directoryUnpressed. Odstranění v 3.0.0.

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

**Examples:**

_Řízené použití_
```tsx
<CounterpartyInputField {...props} />
```

**Avoid:**

- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.

### CountrySelect

```ts
import { CountrySelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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

**Examples:**

_Použití společného stavu_
```tsx
<CountrySelect {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

```tsx
import { DataGrid } from "@/design-system/{slug}";
```

Datový grid se sjednocenou lištou: Nový vlevo, Obnovit úplně vpravo a individuální Upravit/Odstranit pouze ve sticky sloupci akcí řádku. Sloupec type="record-indicators" přijímá indicators s libovolnými id a count(row); klik volá onIndicatorClick bez výběru řádku, Excel rozvine samostatné číselné počty.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `onIndicatorClick` | (row: Row, id: string) => void | `—` |

**Examples:**

**Akce řádků s vysvětlením zákazu:**

```tsx
<DataGrid rows={rows} columns={columns} onEditRow={editRow} onDeleteRow={deleteRow} deleteDisabledReason={row => row.posted ? "Zaúčtovaný doklad nelze odstranit." : undefined} />
```

**Párování s editovatelnou částkou:**

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

Jednotné datumové pole. warning zvýrazní pole a přes aria-describedby zpřístupní text; warningDisplay="indicator" jej zobrazí v tooltipu ikony. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 13: Výjimka: vazba data zachovává vlastní geometrii a --document-date-*; stálý název, aria-pressed, fokusovatelný zakázaný stav a důvod v tooltipu i přístupném popisu. 13b: link.label je nepovinný stálý přístupný název; výchozí fieldToggle.dateLink. Vazba DPH přejímá vlastní název Svázat s DUZP z DocumentForm textů. Datum s chybou/varováním uvnitř pole; relativní +14 od baseDate a quickOptions v kalendáři. warningDisplay=below je přijímáno jen pro kompatibilitu a ignorováno.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `baseDate` | string | `—` |
| `quickOptions` | function | `—` |
| `id` | string | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `—` |
| `disabled` | boolean | `—` |
| `className` | string | `sr-only` |
| `inputClassName` | string | `—` |
| `maxDate` | any | `—` |
| `minDate` | any | `—` |
| `gridZoom` | number | `—` |
| `onValidityChange` | function | `—` |
| `link` | any | `—` |
| `hint` | string | `—` |
| `warning` | string | `—` |
| `warningDisplay` | below · indicator | `—` |
| `error` | string | `—` |

**Examples:**

_Datum s varováním v indikátoru_
```tsx
<DateField value={date} onChange={setDate} warning="Datum je mimo období" warningDisplay="indicator" />
```

_Editace dokladu_
```tsx
<DateField value={dueDate} onChange={setDueDate} baseDate={issueDate} quickOptions={options} />
```

**Avoid:**

- Nepoužívejte warning jako chybu vstupu; aria-invalid patří pouze neplatnému datu.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.

### DateRangeField

```ts
import { DateRangeField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | any | `—` |
| `onChange` | function | `—` |
| `placeholder` | string | `—` |
| `months` | number | `1` |
| `disabled` | boolean | `—` |
| `maxDate` | any | `—` |
| `minDate` | any | `—` |
| `className` | string | `size-4 shrink-0 text-muted-foreground` |
| `label` | string | `—` |
| `baseDate` | string | `—` |

**Examples:**

_Použití společného stavu_
```tsx
<DateRangeField {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

### DecimalInput

```ts
import { DecimalInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Číselné pole s oddělenými tisíci a tabulkovými číslicemi. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

**Examples:**

_Zakázané pole_
```tsx
<DecimalInput disabled value={total} onChange={setTotal} />
```

**Avoid:**

- Nenastavujte lokální barvu ani průhlednost zakázaného pole.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

Výběr hodnoty ze seznamu; text a ikonové akce mají oddělené místo před pevnou šipkou. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledatelný výběr: přidání jako + v pravém okraji hledání, callback dostane aktuální dotaz. Bez práva důvod v tooltipu. Nabídka roste do dostupné šířky a 36 rem, nezalamuje se. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Výběr hodnoty_
```tsx
<DimensionSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Používejte sdílenou komponentu se stabilní geometrií při změně stavu a měřítka.

**Examples:**

_Příjem_
```tsx
<DocumentDirectionBadge direction="in" />
```

**Avoid:**

- Neměňte výšku ani tvar podle aktivního nebo zakázaného stavu.

### DocumentForm

```tsx
import { DocumentForm } from "@/design-system/{slug}";
```

Jednotný formulář dokladu s typovanou identitou. FP/ZFP/DDPOZ řadí Dodavatele + IČO + DIČ, účet + způsob platby (DDPOZ bez způsobu), Popis + číslo. Pod 40rem jsou pole pod sebou ve stejném DOM/Tab pořadí. FV/ZFV mají způsob platby a účet nahoře; kurzy mají zdroj v tooltipu. Datumová pole mají kompaktní šířku jen v dokladu s rozšířením podle popisku; DUZP a Datum DPH se při nedostatku místa zalomí jednotlivě bez rolování. KS/SS zůstávají viditelné, při nepoužité platbě prázdné a zakázané s důvodem; uložené hodnoty DS nemaže. Datum i popisek mají standardní velikost podle zoomu; zmenšení se měří pouze pro pole, které samo přesahuje kontejner. Šířku určuje aktivní formát a společné ikony. Delší popisek rozšiřuje jen své pole. Zamčené KS/SS mají přístupné jméno z popisku a samostatný popis důvodu. bankAccountOptions podporuje účty pouze s IBAN. Měření je izomorfní, klíčované formátem a popisky; nesouvisející editace neobnovuje ResizeObserver. Každé přesahující pole se zmenší podle vlastní šířky včetně popisku, bez zmenšení sousedů. Zakázané nativní vstupy včetně KS/SS a ručního účtu sdílejí podklad muted/40 se zamčeným datumem v obou režimech; hodnoty ani důvody se nemění. Částka, oba kurzy a měna mají standardní výšku control-h. Celkem používá velikost běžného VS a tučný řez v ručním i odvozeném režimu; přepínač součtu se škáluje uvnitř pole. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Zamčený účet a pevná měna sdílejí stejný stav. Měření datumů omezuje škálu na rozsah 0–1 a korekci na čtyři průchody. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Celkem, Kurz a VS používají sans, text-sm a tabular-nums; Celkem zůstává tučně. Edit dokladu 12h: Celkem je při zákazu editace readOnly, nikoli disabled; zůstává dosažitelné klávesnicí a lze označit a kopírovat hodnotu. Edit dokladu 13: Součet Sigma používá FieldToggleButton; vynucený součet předává lockedReason. Pravý prostor určuje --field-toggle-space; ostatní datumová geometrie se nemění. 13b: identita je společná IdentityLine; Datum DPH má stálý název texts.vatDateLinkLabel (výchozí Svázat s DUZP). texts.sumFromLines, texts.selectFromDirectory a texts.enterManually jsou nepovinné @deprecated od 2.100.0 a ignorované; použijte DsTexts.fieldToggle.sumPressed / directory / directoryUnpressed. Odstranění v 3.0.0. Formulář dokladu se sdílenými sekcemi a pruhy. FV/ZFV mají daňové číslo s vazbou; účetní datum výchozí sleduje vystavení. BA Bankovní pohyb s protiúčtem, ID Partner před Popisem a Datumy. Nové hodnoty hlavičky: taxDocumentNumber, taxDocumentNumberLinked, bankAccountKind, bankCode, bankIban, bankSwift. Navázané účetní datum a u FP/ZFP/DDPOZ ručně neměněné DUZP se zapisují přes onChange (při změně vystavení a jednou při otevření dokladu), takže zobrazené = uložené. Neplatné datum a varování čísla dodavatele pro VS jsou ⚠ v poli a celý text v pruhu nad formulářem; chybějící kurz DPH se hlásí jednou a ne u dokladu jen pro čtení. onAddBankAccount dostává hledaný text. Úvodní zápis odvozených datumů přes onChange probíhá jen u upravitelného dokladu; readOnly, posted, locked a cancelled zachovávají uložená data bez callbacku. error.fieldErrors jsou odkazy souhrnu; error.onFieldErrorSelect přepíše výchozí scroll a fokus. Nezaměňujte s mapou validačních chyb DocumentForm.fieldErrors. Pruh vzoru přes templateEdit sdílí faktury i ZL nad identitou.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `actionBarContent` | ReactNode | `—` |
| `templateEdit` | TemplateEditState | `—` |

**Examples:**

**Faktura s editovatelným účtem:**

```tsx
<DocumentForm {...props} identity={{ variant: "invoice", book: "FV - Vydané faktury", period: "2026", account: { side: "MD", label: "311.001 - Odběratelé", editable: true }, number: "FV2026000420" }} mainAccountOptions={allowedAccounts} />
```

**Platba přijatého dokladu bez účtu:**

```tsx
<DocumentForm {...props} documentType="FP" receivedAccountDisabledReason={paymentAccountReason} value={{ ...value, rateSourceAttention: true }} />
```

**Nepoužitá bankovní platba:**

```tsx
<DocumentForm {...props} documentType="FV" companyBankAccountDisabledReason={paymentAccountReason} />
```

**Stav pole a jednotná výška (2.107.0):**

```tsx
<DocumentForm {...props} error={{ message: texts.invalid, fieldErrors, onFieldErrorSelect: focusFieldErrorLink }} />
```

**Živý pruh (2.108.0):**

```tsx
<DocumentForm {...props} issues={serverIssues} validationActive={triedSave} saveFailed={failed} onFieldChange={(id) => dropServerIssue(id)} />
```

**Duplikace a vzory:**

```tsx
<DocumentForm {...formProps} templateEdit={{ name, onSave: saveTemplate, onDiscard: discardTemplate }} />
```

**Avoid:**

- Nevykreslujte hlavní účet v dolní sekci formuláře ani neskládejte identitu přes volné položky.
- Nevkládejte měnu do popisku Celkem ani do identity cashBank.
- Nevykreslujte dateWarnings pod poli a nepředvyplňujte bankovní účet uvnitř komponenty.
- DS nemaže uložené účty a symboly při zamčení; jejich změnu řídí aplikace.
- Neskrývejte KS/SS ani nemažte hodnoty v DS; prázdný zakázaný vzhled není změnou uložených dat.
- Nezmenšujte datumové písmo, pokud se plné pole vejde; delší popisek nesmí měnit šířky ostatních polí.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### DocumentNewMenu

```tsx
import { DocumentNewMenu } from "@/design-system/{slug}";
```

Nabídka Nový v DataGrid.toolbarLeft: prázdný doklad, vzory s jedním dokladem/sérií a správa. APP dodává vzory a callbacky. label/icon/onPrimary umožní dvě nezávislá split-button tlačítka pro pokladnu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `templates` | Pick<DocumentTemplate, "id"  /  "name">[] | `—` |
| `onBlank` | () => void | `—` |
| `onTemplate` | (id: string, mode: DuplicationMode) => void | `—` |
| `onManage` | () => void | `—` |
| `label` | string | `—` |
| `icon` | ReactNode | `—` |
| `onPrimary` | () => void | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<DocumentNewMenu templates={templates} onBlank={openBlank} onTemplate={openFromTemplate} onManage={openManager} />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

### DocumentPostingGrid

```ts
import { DocumentPostingGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Obsah záložky Zaúčtování: grid jen ke čtení se všemi stranami deníku dokladu z DB; účty v rozšířené formě, automatické řádky se štítkem (DPH, Bez nároku, Záloha, Zaokrouhlení, Kurzové zaokrouhlení). U zálohových listů se záložka nepřidává.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `entries` | any | `—` |
| `accounts` | any | `—` |
| `texts` | any | `—` |

**Examples:**

_Záložka Zaúčtování_
```tsx
tabs={[{ id: "posting", label: texts.vatFive.postingTab, content: <DocumentPostingGrid entries={entries} accounts={accounts} /> }]}
```

**Avoid:**

- Nepočítejte zaúčtování v aplikaci ani v DS – řádky dodává DB.
- Nepřidávejte kontrolní součet MD / DAL.

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

Nastavení dokladu s počtem kopií StepperInput v rozsahu 1–5, platným také při psaní a šipkách.

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

**Examples:**

_Základní použití_
```tsx
<DocumentSettingsDialog />
```

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
| `approvedLabel` | string | `Schválen` |
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

### DuplicationDialog

```tsx
import { DuplicationDialog } from "@/design-system/{slug}";
```

Řízený dialog jednoho dokladu nebo série s náhledem APP. RecordDialog chrání změny; vytvoření je blokované bez platného náhledu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `value` | DuplicationValue | `—` |
| `onChange` | (value: DuplicationValue) => void | `—` |
| `rows` | DuplicationPreviewRow[] | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |
| `busy` | boolean | `—` |
| `dirty` | boolean | `—` |
| `onCreate` | (value: DuplicationValue) => void | `—` |
| `storageKey` | string | `—` |
| `title` | string | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<DuplicationDialog open={open} onOpenChange={setOpen} value={parameters} onChange={setParameters} rows={preview} loading={loading} error={error} dirty={dirty} busy={busy} storageKey="invoice-duplicate" onCreate={createDocuments} />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

### DuplicationPreview

```tsx
import { DuplicationPreview } from "@/design-system/{slug}";
```

Náhled již zmapovaných řádků v DataGrid. canCreate určuje souhrn; důvod nevytvoření má ikonu a tooltip bez změny výšky.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `rows` | DuplicationPreviewRow[] | `—` |
| `loading` | boolean | `—` |
| `storageKey` | string | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<DuplicationPreview rows={previewRows} loading={loading} storageKey="invoice-preview" />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

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

Jediný obal pole na kartě záznamu i v DocumentForm: 12px polotučný popisek, mezera 4px, ovládání; error a warning jsou uvnitř ovládání, `hint` u Field, DateField a CheckboxField zůstává pod polem; převod na ikonu přijde až v 2.106.0. Chyby a varování se pod polem nevykreslují. FieldValue zobrazuje hodnotu jen pro čtení. Popisek svázaný přes htmlFor má stabilní ID htmlFor + "-label" pro aria-labelledby zamčené skupiny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Popisek zachovává velikost písma; dlouhý text zkrátí výpustkou a celý text má v title. labelId váže FieldValue přes aria-labelledby bez htmlFor. Sdílený obal pole; error a warning jsou uvnitř ovládání před akcemi, nikdy pod polem. Zprávy předávejte také pruhu formuláře. Od 2.107.0 hint zobrazuje Info v řádku popisku; nikdy text pod polem. Chyby a varování zůstávají uvnitř ovládání.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `label` | any | `—` |
| `htmlFor` | string | `—` |
| `labelId` | string | `—` |
| `hint` | any | `—` |
| `error` | any | `—` |
| `warning` | any | `—` |
| `span` | 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 19 · 20 | `—` |
| `className` | string | `—` |
| `children` | any | `—` |

**Examples:**

_Pole přes čtyři sloupce_
```tsx
<FieldGrid cols={12}><Field label="Jméno" span={4}><Input /></Field></FieldGrid>
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<Field label={texts.name} hint={texts.nameHint}><Input value={name} error={errors.name} onChange={handleName} /></Field>
```

**Avoid:**

- Nevkládejte hodnotu jen ke čtení volně do FieldGrid; použijte Field s FieldValue.
- Důvod zákazu není jméno pole; aria-labelledby odkazuje popisek, aria-describedby důvod.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### FieldErrorSummary

```ts
import { FieldErrorSummary } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Souhrn nejvýše pěti odkazů, zbytek jako „a další N“ přes DsTexts. Klik zaměří pole i v detailu řádku.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `errors` | any | `—` |
| `onSelect` | function | `—` |

**Examples:**

_Stav pole a jednotná výška (2.107.0)_
```tsx
<FieldErrorSummary errors={fieldErrors} onSelect={focusFieldErrorLink} />
```

**Avoid:**

- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### FieldFeedbackContext

```ts
import { FieldFeedbackContext } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sdílený stav error/warning mezi Field a jeho ovládáním; pro běžné formuláře použijte Field, vlastní složená pole mohou kontext předat potomkům.

**Examples:**

_Předání stavu složenému poli_
```tsx
<FieldFeedbackContext.Provider value={{ error, warning }}><CustomControl /></FieldFeedbackContext.Provider>
```

**Avoid:**

- Nevykreslujte druhou výstrahu, pokud ji již vykresluje Field.

### FieldFeedbackIndicator

```ts
import { FieldFeedbackIndicator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. FieldStatusIndicator je alias původního FieldFeedbackIndicator.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `className` | string | `flex flex-col gap-1` |
| `side` | start · end | `end` |
| `placement` | inside · label | `inside` |
| `extraInfo` | any | `—` |
| `id` | string | `—` |

**Examples:**

_Stav pole a jednotná výška (2.107.0)_
```tsx
<FieldStatusIndicator error={errors.amount} side="start" id={status.describedById} />
```

**Avoid:**

- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### FieldGrid

```ts
import { FieldGrid } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Responzivní mřížka polí; podporuje 1, 2, 3, 4, 6, 12 a 20 sloupců. Field.span určuje šířku od 40 rem. Pod 40 rem se hustá mřížka skládá do jednoho sloupce včetně všech dětí s vlastní col-span.

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

### FieldHintIcon

```ts
import { FieldHintIcon } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Ikona Info v řádku popisku, bublina dostupná myší, klávesnicí i dotykem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `hint` | any | `—` |
| `id` | string | `—` |
| `className` | string | `flex flex-col gap-1` |

**Examples:**

_Stav pole a jednotná výška (2.107.0)_
```tsx
<FieldHintIcon hint={texts.accountHint} />
```

**Avoid:**

- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

_Vymazání výběru_
```tsx
<FieldInlineActions onClear={() => setValue("")} clearLabel={texts.documentForm.clear} />
```

**Avoid:**

- Nevnořujte do tlačítka spouštěče.
- Nevyhraďte místo odsazením, které zároveň posune šipku.

### FieldStatusIndicator

```ts
import { FieldStatusIndicator } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. FieldStatusIndicator je alias původního FieldFeedbackIndicator.

**Examples:**

_Stav pole a jednotná výška (2.107.0)_
```tsx
<FieldStatusIndicator error={errors.amount} side="start" id={status.describedById} />
```

**Avoid:**

- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

### FieldToggleButton

```ts
import { FieldToggleButton } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Jediný sdílený ikonový přepínač uvnitř pole; vstup rezervuje --field-toggle-space. Zapnutý plný, vypnutý obrys s přeškrtnutím; zamčený zůstává fokusovatelný a nevolá změnu. 13b: disabled nebo chybějící callback bez lockedReason používá fieldToggle.locked v tooltipu i aria-describedby. Rezerva --field-toggle-space reaguje na lokální --control-h; text kliknutím patří pouze odemčenému stavu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `icon` | any | `—` |
| `pressed` | boolean | `—` |
| `onPressedChange` | function | `—` |
| `label` | string | `—` |
| `pressedTooltip` | string | `—` |
| `unpressedTooltip` | string | `—` |
| `lockedReason` | string | `—` |
| `disabled` | boolean | `—` |

**Examples:**

_Platit příkazem_
```tsx
<FieldToggleButton icon={Landmark} pressed={payByOrder} onPressedChange={setPayByOrder} label={texts.payByOrder} pressedTooltip={texts.enabled} unpressedTooltip={texts.disabled} lockedReason={reason} />
```

**Avoid:**

- Neměňte label podle stavu; tooltipy jsou samostatné.
- Nezaměňujte lockedReason za nativní disabled bez fokusu.

### FieldValue

```ts
import { FieldValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Hodnota nebo stav jen ke čtení uvnitř Field; výškou a svislým zarovnáním odpovídá Input. Výchozí role group zpřístupňuje jméno z aria-labelledby; ID popisku předá Field.labelId. lockedReason zobrazí fokusovatelné tlačítko zámku s tooltipem dostupným i klepnutím; v identitě lze použít variant="plain" a aria-label. Zámek používá kompaktní size-4 bez podkladu v plain variantě, se zachováním tooltipu i klepnutím.

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

- Nezapomeňte přístupné jméno: uvnitř Field aria-labelledby, v identitě aria-label.

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

### FormIssuesBar

```ts
import { FormIssuesBar } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Živý seznam toho, co zbývá opravit, nad formulářem; RecordActionBar a DocumentForm ho skládají z issues. Každá položka odkazuje na pole.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `issues` | any | `—` |
| `saveFailed` | boolean | `false` |
| `title` | any | `—` |
| `message` | any | `—` |
| `forceError` | any | `—` |
| `fieldErrors` | any | `—` |
| `onFieldErrorSelect` | function | `—` |
| `onClose` | function | `—` |
| `onSelect` | function | `—` |
| `closeLabel` | string | `—` |
| `dataSlot` | string | `form-issues-bar` |

**Examples:**

_Serverová chyba DUZP_
```tsx
<RecordActionBar issues={[{ fieldId: "document-taxDate", label: texts.taxDate, message: validationMessage, severity: "error", source: "server" }]} saveAction={{ onSave: save }} />
```

**Avoid:**

- Toast nebo text pod polem místo položky v pruhu.
- Stejná hláška hlavičky znovu jako „Řádek N: …“ – DS deduplikuje podle code.
- Mazání serverových položek v DS – maže je aplikace podle onFieldChange.

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

Primární akce lišty gridu. Jedna akce: ikona + text od 640 px. Dvě a více: plný label → shortLabel → jedno tlačítko „+ ▾“ podle skutečně změřené šířky lišty. Šířka nabídky se měří v kopii, neodhaduje. GridAddAction má label, shortLabel, icon, onClick, disabled, disabledReason. Zakázaná položka nabídky ukáže disabledReason jako stále viditelný druhý řádek (bez tooltipu), je dostupná klávesnicí a neprovede akci. onClick z nabídky dostane událost výběru Event, nikoli MouseEvent; nepoužívejte souřadnice myši. 13j: zakázané tlačítko s disabledReason je aria-disabled, klik/klepnutí/Enter ukáže důvod a akci nespustí.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `actions` | any | `—` |

**Examples:**

_Dva směry pohybu_
```tsx
<GridAddActions actions={[{ label: "Nový příjem", shortLabel: "Příjem", icon: ArrowDownLeft, onClick: () => createIncome() }, { label: "Nový výdaj", shortLabel: "Výdaj", icon: ArrowUpRight, onClick: () => createExpense(), disabled: true, disabledReason: "Období je uzavřené" }]} />
```

**Avoid:**

- Neskrývejte názvy dvou akcí do dvou stejných ikon.
- Nepředpokládejte MouseEvent u výběru z nabídky ani nevynechávejte důvod zakázání.

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

### HistoryChangeTable

```ts
import { HistoryChangeTable } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `changes` | any | `—` |
| `prefix` | string | `—` |

### HistoryEventDetail

```ts
import { HistoryEventDetail } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HistoryGridAction

```ts
import { HistoryGridAction } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### HistoryPanel

```tsx
import { HistoryPanel } from "@/design-system/{slug}";
```

Zastaralé od 2.114.0 – použijte RecordHistoryTimeline; odstraní se v příští major verzi.

**Props:**

| Prop | Type | Default |
|---|---|---|


**Examples:**



**Avoid:**

- Nepoužívejte v nových obrazovkách; nahraďte RecordHistoryTimeline.

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

### IdentityLine

```ts
import { IdentityLine } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Společná prezentační identita formuláře; položky a volitelný příznak vlevo, číslo vpravo, jednotné oddělovače a typografie. Využívají ji DocumentForm a BankStatementForm. Pro editovatelné nebo zamčené číslo použijte numberContent; aplikace vlastní hodnotu a callback. Vlastní numberContent dědí typografii čísla a zůstává omezen šířkou řádku také při zoomu.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `items` | any | `—` |
| `leading` | any | `—` |
| `number` | string | `—` |
| `numberContent` | any | `—` |
| `fallback` | any | `—` |
| `numberId` | string | `—` |

**Examples:**

_Identita výpisu_
```tsx
<IdentityLine items={[book, currency, period, bankAccount]} number={statement.number} />
```

_Číslo dokladu s identifikátorem_
```tsx
<IdentityLine items={[book, period]} number={document.number} numberId="document-number" />
```

_Identifikace_
```tsx
<IdentityLine items={[bookName, periodLabel]} number={documentNumber} />
```

**Avoid:**

- Neskládejte druhý vlastní řádek identity ani vlastní styl čísla.
- Nepřidávejte do identity ukládání nebo doménovou logiku.

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

Použijte pro textový vstup; krátký vzor zápisu předávejte přes formatPattern, vysvětlení patří pod sekci. Zakázaný vstup sdílí podklad muted/40 se zamčeným datumem; rámeček, text a průhlednost zůstávají shodné ve světlém i tmavém režimu. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Chyba a varování mají rámeček a ukazatel s úplným tooltipem uvnitř pole. Formát přes formatPattern, nikoli nápovědu pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `formatPattern` | string | `—` |
| `error` | string | `—` |
| `warning` | string | `—` |

**Examples:**

_Vzor čísla účtu_
```tsx
<Input value={account} onChange={onAccountChange} formatPattern={appTexts.accountNumberPattern} />
```

**Avoid:**

- Nevkládejte příklad hodnoty, popisek ani popisnou nápovědu do placeholderu.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

```tsx
import { JournalLinesEditor } from "@/design-system/{slug}";
```

Editovatelná mřížka řádků dokladu: Popis · Kód DPH · Částka bez DPH · MD · DAL · Zakázka (2.118.0). Enter skáče dál a vyplněná/zakotvená pole přeskakuje, na konci řádku založí řádek s kódem DPH a účty, Shift+Enter zpět; špendlík zakotví sloupec v otevřeném dokladu. Rekapitulace DPH po oddílech a patička Součet · Odečtené zálohy · Zaokrouhlení · K úhradě · Rozdíl. withoutAccounts pro zálohové listy. Slot afterVatRecap umístí odečty pod rekapitulaci; patička používá samostatné advanceDeduction APP. Detail řádku nabízí nárok na odpočet a khLimitExcluded; vat.rowDetails.canEdit/disabledReason dodává APP. withoutAccounts skryje účetní pole bez smazání hodnot; změny jdou přes onChange.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `afterVatRecap` | React.ReactNode | `—` |

**Examples:**

**Rozpis se zkrácenými účty:**

```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} onValidationChange={(count, errors) => setError(errors[0]?.message)} storageKey="invoice-lines" />
```

**Řádky bez DPH s přepisem daně dle dokladu:**

```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} documentCurrency={documentCurrency} homeCurrency={homeCurrency} homeCurrencySymbol={homeCurrencySymbol} mode="mainAccount" mainSide="D" mainAccount="321001" vat={{ enabled: vatEnabled, codes: vatCodes, pdpSubjects }} vatOverrides={vatOverrides} onVatOverridesChange={setVatOverrides} />
// uložení: řádky bez DPH spolu s _vat_overrides: vatOverrides
```

**Stav pole a jednotná výška (2.107.0):**

```tsx
<JournalLinesEditor {...props} onCreateDimension={query => openDimension({ name: query })} onValidationChange={(count, errors) => setFieldErrors(errors)} />
```

**Skupiny DPH a patička (2.109.0):**

```tsx
<JournalLinesEditor {...props} vat={{ enabled: true, codes: vatCodes }} vatOverrides={overrides} onVatOverridesChange={setOverrides} vatExchangeRate={vatRate} roundingLimit={companyRoundingLimit} onRoundingChange={setRounding} vatOverrideSeverity={filing ? "error" : "warning"} />
// uložení: { lines: toJournalRows(lines, opts), _vat_overrides: overrides.map(o => ({ vat_code_id: o.vatCodeId, vat_rate: o.vatRate, tax_amount: o.taxAmount })) }
```

**Zálohový list:**

```tsx
<JournalLinesEditor lines={lines} onChange={setLines} accounts={accounts} documentCurrency="CZK" homeCurrency="CZK" withoutAccounts vat={{ enabled: true, codes, showKhSection: false, recapNote: texts.vatFive.notTaxDocument }} />
```

**Nárok 60 % a vyloučení limitu KH:**

```tsx
<JournalLinesEditor {...props} lines={[{ id: "line-1", amount: 1000, vatCodeId: codeId, vatDeduction: "partial", vatDeductionShare: 60, khLimitExcluded: true }]} onChange={setLines} vat={{ enabled: true, codes, rowDetails: { canEdit: () => canEdit, disabledReason: lockedReason } }} />
```

**Avoid:**

- Neskrývejte automaticky sloupec, který uživatel výslovně zapnul ve Sloupcích.
- Nevykreslujte počet chyb do patičky gridu; použijte onValidationChange a společný chybový pruh formuláře.
- Posílat nebo editovat řádky daně (isVatLine) – vytváří je jen databáze; ukládejte přes toJournalRows.
- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.
- Neposílejte vat_manual ani ruční daň řádku – pevnou daň zakládá jen systém.
- Nepočítejte daň skupin v aplikaci; náhled dává computeVatGroups a skutečné řádky daně DB.
- Při skrytí účetních polí nebo změně kódu nemažte vatDeduction, vatDeductionShare ani khLimitExcluded; limit KH a oprávnění zajišťuje APP.

### JournalLinesRecap

```ts
import { JournalLinesRecap } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Sbalitelný souhrn účtování a zakázek, který se přepočítává z aktuálních řádků.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `headerTotal` | any | `—` |
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

**Examples:**

_Rekapitulace_
```tsx
<JournalLinesRecap lines={lines} accounts={accounts} storageKey="invoice-lines" />
```

_2.92.0_
```tsx
<JournalLinesRecap {...props} headerTotal={<JournalRecapHomeTotal total={total} rate={rate} symbol={homeSymbol} />} />
```

**Avoid:**

- Nepočítejte rekapitulaci z filtrované podmnožiny řádků.

### JournalRecapHomeTotal

```ts
import { JournalRecapHomeTotal } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nepoužívat – rozhodnutí 18. 10. (2.108.0): domácí celek se v rekapitulaci nezobrazuje. Celek v domácí měně do hlavičky rekapitulace. Přepočet používá kurz dokladu; bez kurzu ukáže pomlčku.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `total` | number | `—` |
| `labelTemplate` | string | `—` |
| `rate` | number | `—` |
| `rateAmount` | number | `1` |
| `symbol` | string | `—` |

**Examples:**

_Přepočtený celek_
```tsx
<JournalRecapHomeTotal total={total} rate={rate} rateAmount={rateAmount} symbol={homeCurrencySymbol} />
```

**Avoid:**

- Jakékoli nové použití – komponenta je zastaralá (rozhodnutí 18. 10.).
- Nevkládejte značku měny natvrdo.
- Nevydávejte chybějící kurz za nulu.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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

**Examples:**

_Použití společného stavu_
```tsx
<LegalFormField {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### LinkRecordDialog

```tsx
import { LinkRecordDialog } from "@/design-system/{slug}";
```

Dialog nové vazby s návrhy, hledáním aplikace, typem a poznámkou. RecordDialog chrání změny; při chybě se nezavře.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `candidates` | LinkedRecordItem[] | `—` |
| `results` | LinkedRecordItem[] | `—` |
| `relationTypes` | LinkRecordConfig["relationTypes"] | `—` |
| `onSearch` | LinkRecordConfig["onSearch"] | `—` |
| `onSave` | (value: LinkRecordValue) => void  /  Promise<void> | `—` |
| `title` | string | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<LinkRecordDialog open={open} onOpenChange={setOpen} candidates={suggestions} relationTypes={types} onSearch={searchRecords} onSave={saveLink} />
```

**Avoid:**

- Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.

### LinkedRecordEntry

```tsx
import { LinkedRecordEntry } from "@/design-system/{slug}";
```

Sdílený klikací řádek nebo uzel vazby; zmapované hodnoty, stav a ikonu dodává aplikace.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `item` | LinkedRecordItem | `—` |
| `onOpen` | (item: LinkedRecordItem, modifiers: LinkedRecordModifiers) => void | `—` |
| `variant` | enum | `row` |

**Examples:**

**Panel záznamu:**

```tsx
<LinkedRecordEntry item={record} variant="node" onOpen={openRecord} />
```

**Avoid:**

- Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.

### LinkedRecordsPanel

```tsx
import { LinkedRecordsPanel } from "@/design-system/{slug}";
```

Propojené záznamy jako obsah záložky RecordSidePanel: řízené skupiny a seznam/tok, souhrn vypořádání a akce aplikace. unlinkReason + onUnlink zobrazí jediné potvrzení s důvodem; confirmUnlink=false přenechá potvrzení APP.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `groups` | LinkedRecordGroup[] | `—` |
| `settlement` | SettlementRow[] | `—` |
| `mode` | LinkedRecordsMode | `—` |
| `onModeChange` | (mode: LinkedRecordsMode) => void | `—` |
| `collapsedGroups` | string[] | `—` |
| `onCollapsedGroupsChange` | (ids: string[]) => void | `—` |
| `onOpen` | (item: LinkedRecordItem, modifiers: LinkedRecordModifiers) => void | `—` |
| `onRemove` | (item: LinkedRecordItem) => void  /  Promise<void> | `—` |
| `confirmUnlink` | boolean | `—` |
| `unlinkReason` | { label?: string | `—` |
| `onUnlink` | (item: LinkedRecordItem, reason: string) => void  /  Promise<void> | `—` |
| `onLink` | (value: LinkRecordValue) => void  /  Promise<void> | `—` |
| `linkDialog` | LinkRecordConfig | `—` |
| `emptyText` | string | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<LinkedRecordsPanel groups={groups} mode={mode} onModeChange={setMode} collapsedGroups={collapsed} onCollapsedGroupsChange={setCollapsed} onOpen={openRecord} unlinkReason={{ required: true }} onUnlink={unlinkWithReason} onLink={saveLink} linkDialog={linkConfig} />
```

**Avoid:**

- Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.

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

Vybere měsíc a rok společným kalendářem. Escape zavře nabídku přímo; Vymazat vrací null. emptyLabel pojmenuje prázdný výběr. minYear/maxYear omezují měsíce i roky; monthClassName/yearClassName zůstávají na společném spouštěči.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `minYear` | number | `—` |
| `maxYear` | number | `—` |
| `emptyLabel` | string | `—` |
| `monthLabel` | string | `—` |
| `yearLabel` | string | `—` |
| `disabled` | boolean | `—` |
| `className` | string | `w-auto p-0` |
| `yearClassName` | string | `—` |
| `monthClassName` | string | `—` |

**Examples:**

_Běžné použití_
```tsx
<MonthYearSelect value={month} onChange={setMonth} minYear={2020} maxYear={2030} />
```

**Avoid:**

- Neměňte výšku ani tvar podle aktivního nebo zakázaného stavu.

### MultiSelect

```ts
import { MultiSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Použití společného stavu_
```tsx
<MultiSelect {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### MultiSelectionPanel

```tsx
import { MultiSelectionPanel } from "@/design-system/{slug}";
```

Souhrn více vybraných záznamů se slotem children pro hromadnou akci. Jinou doménu pojmenujte propem label; počet se formátuje s oddělenými tisíci.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `count` | number | `—` |
| `label` | (count: string) => string | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<MultiSelectionPanel count={selection.count}><Button onClick={addNoteToSelected}>Přidat poznámku</Button></MultiSelectionPanel>
```

**Avoid:**

- Neprovádějte hromadné operace ani dotazy v DS.

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

Standardní výběr ze seznamu. ariaLabel pojmenuje výběr bez navázaného popisku; placeholderValueLabel mění text prázdné položky.  Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledatelná větev ignoruje mezery v dotazu i hledaném zápisu (také IBAN). Hledatelný výběr: přidání jako + v pravém okraji hledání, callback dostane aktuální dotaz. Bez práva důvod v tooltipu. Nabídka roste do dostupné šířky a 36 rem, nezalamuje se. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Pojmenovaný výběr_
```tsx
<OptionSelect ariaLabel="Bankovní účet" value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Pro volbu Firma / Osoba nepoužívejte OptionSelect; použijte SegmentedField.
- Nevkládejte ikonová tlačítka do tlačítka spouštěče.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### PageHeader

```ts
import { PageHeader } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Nadpis stránky se stavovým štítkem centrovaným na účaří + polovinu x-výšky písma; bez pevného posunu. Záhlaví panelu řadí historii, maximalizaci, menu a Zavřít panel.

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

**Examples:**

_Běžné použití_
```tsx
<PageHeader />
```

_Nadpis se stavem_
```tsx
<PageHeader title="Přijatá faktura" titleBadge={<DocumentStatusBadge status="draft" />} />
```

**Avoid:**

- Předávat actions uvnitř panelu místo menuActions
- Vkládat akci Nový do záhlaví místo gridového addAction
- Předávat description; kontext patří do GridContextBar nebo horní lišty
- Neposouvejte štítek pevným px ani cap metrikou; nesmí se ořezat diakritika nadpisu.

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

Stav a akce záložek v panelech, dialog neuložených změn a zkratky Alt+…; obalte jím AppShell i PaneLayout. Přepnutí a odhlášení volejte přes guardUnsaved(callback, "switch"/"logout"); close řeší DS. Navázaná okna (openLinkedTab) sledují zdrojovou záložku, ne pozici panelu; připnutí zamkne záznam, zavření zdroje nechá okno připnuté na posledním záznamu.

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

_Navázané okno panelu záznamu_
```tsx
tabs.openLinkedTab(pane.tabId, { id: "history", label: "Historie" })
```

**Avoid:**

- Otevírat konkrétní záznam s kind 'list' – otevřel by se vícekrát.
- Přepisovat Cmd/Ctrl+W nebo Ctrl+1–9.
- Navázanou záložku nevážete na pozici panelu ani ji neotvírejte vlastní cestou; vždy přes openLinkedTab.

### PartnerSelect

```ts
import { PartnerSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Výběr partnera podle názvu a IČO; PartnerOption podporuje také DIČ pro navazující zobrazení ve formuláři. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Hledatelný výběr: přidání jako + v pravém okraji hledání, callback dostane aktuální dotaz. Bez práva důvod v tooltipu. Nabídka roste do dostupné šířky a 36 rem, nezalamuje se. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Výběr hodnoty_
```tsx
<PartnerSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### PaymentOrderAccountField

```ts
import { PaymentOrderAccountField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Účet s přepínačem příkazu; vypnutý stav ukazuje důvod uvnitř šedého pole, bez zámku. Chybějící onEnabledChange ponechá přepínač fokusovatelný s aria-disabled; klik nic neprovede. Šipka hledatelného výběru a text mají samostatný prostor vlevo od tlačítka příkazu při všech zoomech. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 13: Přepínač Landmark skládá FieldToggleButton, pravý prostor určuje --field-toggle-space. Zamčení nemění účet a zachová přístupný důvod.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `enabled` | boolean | `—` |
| `onEnabledChange` | function | `—` |
| `children` | any | `—` |
| `enabledLabel` | string | `—` |
| `disabledLabel` | string | `—` |
| `disabledReason` | string | `—` |
| `lockedReason` | string | `—` |

**Examples:**

_Vypnutý příkaz_
```tsx
<PaymentOrderAccountField enabled={false} enabledLabel={texts.payByOrder} disabledLabel={texts.excludeFromPaymentOrders} disabledReason={texts.paymentOrderDisabled}>{accountControl}</PaymentOrderAccountField>
```

**Avoid:**

- Při vypnutí nemažte hodnotu uvnitř této komponenty.
- Nevykreslujte druhý zámek ani důvod pod polem.
- Nepřekrývejte tlačítkem příkazu šipku výběru ani jeho text.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.

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

### PinnedNoteBar

```tsx
import { PinnedNoteBar } from "@/design-system/{slug}";
```

Jediný řádek hlavičky s textem připnuté poznámky. Zkrácení zachovává celý text v tooltipu dostupném myší i fokusem; klik otevírá poznámky.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `text` | string | `—` |
| `onOpen` | () => void | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<PinnedNoteBar text={pinnedNote.body} onOpen={() => { setTab("notes"); setOpen(true); }} />
```

**Avoid:**

- Nezvětšujte pruh na více řádků ani v něm neřešte připnutí nebo ukládání.

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

Sémantické radio s geometricky vystředěnou tečkou podle středu ovládání; bez pixelového svislého posunu.

**Examples:**

_Základní použití_
```tsx
<RadioGroupItem />
```

### RateField

```ts
import { RateField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Kurz s jednotkou a zdrojem v přístupném tooltipu celého pole; chyba i varování jsou uvnitř pole, nikdy pod polem. Ruční nebo upozorněný zdroj má ikonu vlevo; rozdíl proti návrhu zachovává červenou aktualizaci. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 12h: hodnota jen pro čtení nemá aria-disabled na obecném div; dostupný tooltip a trvalý popis zdroje zůstávají zachovány. Kurz s vysvětlením zdroje a výstrahou uvnitř ovládání; ruční důvod samostatné pole, jeho chyba není pod polem.

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
| `sourceAttention` | boolean | `false` |
| `onUseSuggested` | function | `—` |
| `disabled` | boolean | `—` |
| `readOnly` | boolean | `—` |
| `note` | string | `—` |
| `onNoteChange` | function | `—` |
| `noteLabel` | string | `—` |
| `sourceLabel` | string | `—` |
| `manualSourceLabel` | string | `—` |
| `suggestedTooltip` | function | `—` |
| `requiredMessage` | string | `—` |
| `showNote` | boolean | `true` |
| `id` | string | `rate` |
| `className` | string | `sr-only` |
| `inputClassName` | string | `—` |
| `error` | string | `—` |
| `warning` | string | `—` |

**Examples:**

_Kurz EUR_
```tsx
<RateField value={rate} onChange={setRate} currency="EUR" homeCurrency="CZK" rateAmount={1} suggestedRate={24.38} suggestedInfo="ČNB 25. 9. 2026" manual={manual} />
```

_2.92.0_
```tsx
<RateField {...rateProps} inputClassName="h-11" />
```

_Upozorněný zdroj_
```tsx
<RateField {...rateProps} sourceAttention sourceLabel={sourceDescription} />
```

**Avoid:**

- Nepoužívejte holý číselný input pro kurz.
- Ruční kurz neukládejte bez důvodu.
- Jednotku a zdroj kurzu nevykreslujte pod polem; použijte tooltip pole.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

### ReadOnlyBanner

```ts
import { ReadOnlyBanner } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### ReadOnlyControlValue

```ts
import { ReadOnlyControlValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `children` | any | `—` |
| `id` | string | `—` |
| `numeric` | boolean | `—` |
| `multiline` | boolean | `—` |
| `ariaLabel` | string | `—` |

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

Přilepený pruh karty záznamu pod PageHeader. Sjednocuje uložení, primární a další akce, společný busy stav a pořadí error → notices. DocumentForm jej používá interně. Ikony položek dalších akcí mají jednotnou velikost size-4 a shrink-0. 13b: levý obsah zůstává v prostoru odděleném od kompaktních akcí také na úzkém formuláři. Používejte saveAction, moreActions a leftContent; nepřebíjejte skrývání ikon ani textů selektory potomků. 13c: levá textová tlačítka při zalomení rostou na výšku, neprotékají pevnou výškou. 13d: růst platí pouze pro data-slot=button mimo role switch/checkbox; přepínač DPH zachová 20 × 36 px při 100 %. 13j: saveAction a primaryAction přijímají disabledReason – akce zůstane fokusovatelná (aria-disabled), klik/klepnutí/Enter ji nespustí a ukáže důvod v tooltipu; bez důvodu zůstává nativně disabled. Zablokovaná položka dalších akcí ukazuje důvod jako druhý řádek. Uložit je vždy primární tlačítko; busy zobrazí spinner. Kaskáda podle měřené šířky: text → sekundární ikony → nakonec ikona Uložit. Kompaktní zablokovaná primární akce má tooltip Název: důvod. Důvod položky menu je jen přístupný popis, nikoli součást názvu. Sdílená lišta: standardně textové akce bez ikon, podle měřené šířky nejdříve sekundární ikony, nakonec Uložit ikona. Primární modré Uložit, dirty/disabled/busy, tooltip a přístupný název zachovány. Povolené primaryAction.tooltip vysvětlí akci i po dotyku. Chyba před upozorněními. primaryAction.tooltip vysvětluje povolený krok i krátce po dotyku; normální klik jej provede bez připnutí. Každá akce má Tooltip i v plné šířce (název akce, případně primaryAction.tooltip); ⋯ používá Tooltip místo title. Levý obsah si drží rezervu nejvýš 10 rem a zkrátí se s …, akce nikdy nepřekryje. error.fieldErrors jsou odkazy souhrnu; error.onFieldErrorSelect přepíše výchozí scroll a fokus. Nezaměňujte s mapou validačních chyb DocumentForm.fieldErrors.

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
| `issues` | any | `—` |
| `saveFailed` | boolean | `—` |
| `onIssuesClose` | function | `—` |
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

_Stav pole a jednotná výška (2.107.0)_
```tsx
<RecordActionBar {...props} error={{ message: texts.invalid, fieldErrors, onFieldErrorSelect: focusFieldErrorLink }} />
```

_Uložení změn_
```tsx
<RecordActionBar saveAction={{ onSave, dirty }} primaryAction={{ label: "Zařadit", onClick: classify }} />
```

**Avoid:**

- Nevykreslujte Uložit ani akce záznamu volně pod poli.
- Stav záznamu nedávejte do pruhu; patří do PageHeader.titleBadge.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

### RecordDialog

```tsx
import { RecordDialog } from "@/design-system/{slug}";
```

Jednotný dialog pro editaci i detail záznamu; size je povinný (sm 32 rem krátké, md 48 rem číselníky, lg 56 rem) a platí stejně v panelu i mimo něj. Obsah ve FieldGrid cols={12}. Předávejte dirty (i u nového záznamu) – DS pak hlídá křížek, Esc, Zrušit i klik mimo potvrzením „Zavřít záznam s neuloženými změnami?“. readOnly vykreslí DS vstupy jako hodnoty a nechá jen Zavřít. Chyba uložení přes error, odstranění přes deleteAction, busy ukáže „Ukládám…“. Stav přes status a lifecycleAction; fieldErrors ve stejném pruhu nad tlačítky. Záložky lze řídit activeTab + onTabChange; bez activeTab vybírá DS. submitDisabled blokuje uložení i klávesou; zavření zůstává dostupné.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | function | `—` |
| `title` | string | `—` |
| `description` | string | `—` |
| `onSubmit` | function | `—` |
| `submitDisabled` | boolean | `false` |
| `submitLabel` | string | `—` |
| `closeLabel` | string | `—` |
| `busy` | boolean | `false` |
| `children` | any | `—` |
| `extraActions` | any | `—` |
| `size` | enum | `sm` |
| `contentClassName` | string | `—` |
| `sidePanel` | any | `—` |
| `sidePanelLabel` | string | `—` |
| `sidePanelTitle` | any | `—` |
| `headerExtra` | any | `—` |
| `titleBadges` | any | `—` |
| `sidePanelExtra` | any | `—` |
| `readOnly` | boolean | `false` |
| `tabs` | any | `—` |
| `activeTab` | string | `—` |
| `onTabChange` | function | `—` |
| `status` | any | `—` |
| `lifecycleAction` | any | `—` |
| `deleteAction` | any | `—` |
| `dirty` | boolean | `false` |
| `cancelLabel` | string | `—` |
| `saveAndActionLabel` | string | `Uložit změny a {label}` |
| `dirtyConfirmTitle` | string | `Formulář obsahuje neuložené změny` |
| `fieldErrors` | any | `—` |
| `error` | any | `—` |

**Examples:**

**Detail prostoru jen pro čtení:**

```tsx
<RecordDialog open={open} onOpenChange={setOpen} title={workspace.name} readOnly tabs={[{ value: "members", label: "Členové", content: <MembersGrid /> }]} />
```

**Stav a deaktivace:**

```tsx
<RecordDialog status={{ active }} dirty={dirty} lifecycleAction={{ label: active ? "Deaktivovat" : "Aktivovat", confirm: { title: "Deaktivovat partnera?" }, onClick: ({ saveFirst }) => toggle(saveFirst) }} …/>
```

**Stav pole a jednotná výška (2.107.0):**

```tsx
<RecordDialog {...props} fieldErrors={fieldErrors}>{fields}</RecordDialog>
```

**Číselník s ochranou změn, chybou a Odstranit (2.111.0):**

```tsx
<RecordDialog open={open} onOpenChange={setOpen} title="Kniha FP" size="md" dirty={dirty} busy={saving} error={saveError} onSubmit={save} deleteAction={{ onClick: remove, confirm: { title: "Odstranit knihu FP?" } }}>
  <FieldGrid cols={12}>…</FieldGrid>
</RecordDialog>
```

**Partner na zvolené záložce:**

```tsx
<RecordDialog open={open} size="md" title="Partner" onOpenChange={setOpen} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} error={saveError} onSubmit={save} />
```

**Duplikace a vzory:**

```tsx
<RecordDialog open={open} size="md" title={title} onOpenChange={setOpen} submitDisabled={!canCreate} onSubmit={create} />
```

**Avoid:**

- Nevykreslujte tlačítko Uložit v režimu readOnly.
- Nevytvářejte vlastní lištu záložek mimo tabs.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.
- Nevkládejte Alert do obsahu dialogu – chybu uložení předejte v error.
- Nepřidávejte vlastní tlačítko Odstranit do extraActions – použijte deleteAction.
- Bez práva upravit nezakazujte vstupy – použijte readOnly.
- Nepřepínejte submitLabel na „Ukládám…“ – stačí busy.
- V řízeném režimu aktualizujte activeTab přes onTabChange; DS hodnotu sám nepřepíše.

### RecordHistoryTimeline

```tsx
import { RecordHistoryTimeline } from "@/design-system/{slug}";
```

Historie záznamu jako časová osa po dnech (Dnes / Včera / datum), nejnovější nahoře; funguje i jako záložka RecordSidePanel v úzké šířce. Aplikace dodává už zmapované události s popisky a hodnotami a řídí režim (basic/detailed) i filtr typů; komponenta nic nenačítá ani doménově neformátuje.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `events` | HistoryEvent[] | `—` |
| `mode` | HistoryMode | `—` |
| `onModeChange` | (mode: HistoryMode) => void | `—` |
| `filter` | HistoryKind[] | `—` |
| `onFilterChange` | (filter: HistoryKind[]) => void | `—` |
| `loading` | boolean | `—` |
| `emptyText` | string | `—` |
| `now` | Date | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<RecordHistoryTimeline events={historyEvents} mode={mode} onModeChange={setMode} filter={filter} onFilterChange={setFilter} loading={isLoading} />
```

**Avoid:**

- Nepředávejte surová data auditu (názvy sloupců, JSON, ID); hodnoty mapuje a formátuje aplikace. Nepoužívejte zastaralý HistoryPanel.

### RecordNotes

```tsx
import { RecordNotes } from "@/design-system/{slug}";
```

Existující panel poznámek s řazením, úpravou a odstraněním. canEdit/canRemove mají přednost před starým editable; canAdd=false skryje vstup. pinned/editedAt jsou data aplikace, onPin žádá změnu; nejvýše jednu připnutou hlídá aplikace. Výchozí texty přes DsTexts CS/SK, lokální texts mají přednost.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `notes` | RecordNote[] | `—` |
| `onAdd` | (body: string) => void  /  Promise<void> | `—` |
| `onUpdate` | (id: string, body: string) => void  /  Promise<void> | `—` |
| `onRemove` | (id: string) => void  /  Promise<void> | `—` |
| `texts` | Partial<RecordNotesTexts> | `—` |
| `canAdd` | boolean | `true` |
| `canPin` | boolean  /  ((note: RecordNote) => boolean) | `false` |
| `canEdit` | boolean  /  ((note: RecordNote) => boolean) | `—` |
| `canRemove` | boolean  /  ((note: RecordNote) => boolean) | `—` |
| `onPin` | (id: string, pinned: boolean) => void  /  Promise<void> | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<RecordNotes notes={notes} canAdd={rights.add} canEdit={canEdit} canRemove={canRemove} canPin={rights.pin} onPin={pinNote} onAdd={addNote} onUpdate={updateNote} onRemove={removeNote} />
```

**Avoid:**

- Nevynucujte jediné připnutí v DS a neslučujte canEdit s canRemove. editable zůstává zpětně kompatibilní záloha.

### RecordPanelTriggers

```tsx
import { RecordPanelTriggers } from "@/design-system/{slug}";
```

Sdílené ikonové spouštěče s počty; aplikace dodává libovolná id, popisky a ikony. Nula ukazuje tlumenou ikonu bez čísla. V DocumentForm použijte actionBarContent, v RecordDialog headerExtra.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `indicators` | readonly RecordIndicator[] | `—` |
| `onIndicatorClick` | (id: string) => void | `—` |
| `activeTab` | string | `—` |
| `size` | enum | `default` |

**Examples:**

**Panel záznamu:**

```tsx
<RecordPanelTriggers indicators={[{ id: "files", label: "Přílohy", icon: Paperclip, count: 2 }]} onIndicatorClick={id => { setTab(id); setOpen(true); }} />
```

**Avoid:**

- Nevkládejte napevno doménová id ani neoznačujte řádek při kliku na indikátor.

### RecordReadOnlyProvider

```ts
import { RecordReadOnlyProvider } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | boolean | `—` |
| `children` | any | `—` |

### RecordSidePanel

```tsx
import { RecordSidePanel } from "@/design-system/{slug}";
```

Obal hlavního obsahu a pravého panelu záznamu. Na běžné šířce obsah odsune, pod 640 px šířky prostředí používá místní překryv. Záložky, připnutí a šířku řídí aplikace; nic nenačítá.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |
| `activeTab` | string | `—` |
| `onActiveTabChange` | (id: string) => void | `—` |
| `tabs` | readonly RecordSidePanelTab[] | `—` |
| `header` | ReactNode | `—` |
| `pinned` | boolean | `false` |
| `onPinnedChange` | (pinned: boolean) => void | `—` |
| `width` | enum | `default` |
| `onWidthChange` | (width: "default"  /  "wide") => void | `—` |
| `onOpenInAdjacentPane` | () => void | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<RecordSidePanel open={open} onOpenChange={setOpen} header={record.number} activeTab={tab} onActiveTabChange={setTab} tabs={tabs} pinned={pinned} onPinnedChange={setPinned} width={width} onWidthChange={setWidth}><DocumentForm {...formProps} /></RecordSidePanel>
```

**Avoid:**

- Nevykreslujte panel vedle obalu bez children; aplikace řídí vazbu připnutí na záznam, nikoli DS.

### ResizableCombobox

```ts
import { ResizableCombobox } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

**Examples:**

_Použití společného stavu_
```tsx
<ResizableCombobox {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

### SearchableOptionSelect

```ts
import { SearchableOptionSelect } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Hledatelná větev OptionSelect s akcí + vpravo v hledání. Pro běžné formuláře preferujte OptionSelect searchable. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `options` | any | `—` |
| `onChange` | function | `—` |
| `emptyValueLabel` | any | `—` |
| `noResultsLabel` | string | `—` |
| `searchPlaceholder` | string | `—` |
| `inactiveLabel` | string | `—` |
| `unknownValueLabel` | string | `—` |
| `allowEmpty` | boolean | `—` |
| `disabled` | boolean | `—` |
| `id` | string | `—` |
| `ariaLabel` | string | `—` |
| `className` | string | `relative min-w-0` |
| `selectedLabel` | function | `—` |
| `onCreate` | function | `—` |
| `createLabel` | string | `—` |
| `createDisabledReason` | string | `—` |

**Examples:**

_Základní použití_
```tsx
<SearchableOptionSelect />
```

**Avoid:**

- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Segmentová volba 2–3 vzájemně výlučných typů záznamu ve formuláři s ovládáním šipkami. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Edit dokladu 12i (2.98.0): zakázaná vybraná volba používá plné muted pozadí, foreground a font-semibold bez primární barvy; nevybraná zůstává muted/40 a muted-foreground s normálním řezem. Povolená vybraná volba zachovává primary/10 a primary. Obě zakázané volby mají kontrast nejméně 4,5 : 1; segmenty gridu beze změny. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `value` | any | `—` |
| `onChange` | function | `—` |
| `disabled` | boolean | `—` |
| `label` | string | `—` |
| `ariaLabel` | string | `—` |
| `error` | string | `—` |
| `warning` | string | `—` |
| `ref` | any | `—` |

**Examples:**

_Typ partnera_
```tsx
<SegmentedField ariaLabel="Typ partnera" options={[{ value: "company", label: "Firma" }, { value: "person", label: "Osoba" }]} value={kind} onChange={setKind} />
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<SegmentedField label={texts.deduction} value={deduction} onChange={setDeduction} options={options} error={errors.deduction} />
```

**Avoid:**

- Nepoužívejte GridSegmentedToggle ve formuláři.
- Nepoužívejte OptionSelect pro 2–3 základní typy záznamu.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

Spouštěč základního výběru. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech.

**Examples:**

_Zakázané pole_
```tsx
<Select disabled><SelectTrigger><SelectValue /></SelectTrigger></Select>
```

**Avoid:**

- Nenastavujte lokální barvu ani průhlednost zakázaného pole.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.

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

### SettlementBar

```tsx
import { SettlementBar } from "@/design-system/{slug}";
```

Souhrn úhrad nebo zúčtování po měnách. Částky, měny, label a progres dodává aplikace; komponenta nic nepočítá.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `rows` | SettlementRow[] | `—` |

**Examples:**

**Panel záznamu:**

```tsx
<SettlementBar rows={settlementRows} />
```

**Avoid:**

- Nepředávejte surová doménová data; DS nesmí načítat ani určovat oprávnění aplikace.

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

**Props:**

| Prop | Type | Default |
|---|---|---|
| `status` | any | `—` |
| `config` | any | `—` |
| `fallbackLabel` | string | `—` |
| `size` | sm · md | `sm` |
| `ref` | any | `—` |

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

### StepperInput

```ts
import { StepperInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Číselný krokovač pro omezený rozsah, například počet kopií. Psaní ani šipky nemohou překročit min/max; tlačítka na hranici jsou zakázaná.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | number | `—` |
| `onChange` | function | `—` |
| `min` | number | `0` |
| `max` | number | `—` |
| `step` | number | `1` |
| `size` | default · compact | `default` |

**Examples:**

_Počet kopií_
```tsx
<StepperInput value={copies} onChange={setCopies} min={1} max={5} step={1} />
```

**Avoid:**

- Nepoužívejte radio pro počet kopií.
- Neobcházejte rozsah vlastním číselným vstupem.

### SuggestInput

```ts
import { SuggestInput } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Textové pole s přepínatelným našeptávačem z předchozích záznamů. Edit dokladu 13: Vsazený FieldToggleButton History místo celovýškového tlačítka. Stálý přístupný název z DsTexts, stavové tooltipy samostatné, přepnutí nemaže hodnotu.

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
| `enabledLabel` | string | `—` |
| `disabledLabel` | string | `—` |

**Examples:**

_Historie popisů_
```tsx
<SuggestInput value={value} onChange={setValue} loadSuggestions={load} enabled={enabled} onEnabledChange={setEnabled} />
```

**Avoid:**

- Nenačítejte více než deset viditelných návrhů ani neblokujte psaní čekáním na odpověď.
- Neskládejte další vlastní přepínač; stálý název nenahrazujte tooltipem stavu.

### Switch

```ts
import { Switch } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### SwitchField

```ts
import { SwitchField } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Řádek okamžitého nastavení – popisek vlevo, přepínač vpravo, uloží se hned. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `checked` | boolean | `—` |
| `onCheckedChange` | function | `—` |
| `label` | any | `true` |
| `hint` | any | `—` |
| `error` | string | `—` |
| `warning` | string | `—` |
| `busy` | boolean | `false` |

**Examples:**

_Nastavení_
```tsx
<SettingsSection title="Upozornění"><SwitchField label="Připomínat splatnost" checked={v} busy={saving} onCheckedChange={save} /></SettingsSection>
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<SwitchField label={texts.enabled} checked={enabled} onCheckedChange={setEnabled} warning={warnings.enabled} />
```

**Avoid:**

- Přepínač ve formuláři s tlačítkem Uložit
- Filtr ano/ne nad gridem – použijte GridToggleButton
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Duplicitní název (u jednotky také kód) zakáže ＋ s důvodem DsTexts.selectCreate.duplicate. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Examples:**

_Použití společného stavu_
```tsx
<TagPicker {...props} />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### TemplateEditBanner

```tsx
import { TemplateEditBanner } from "@/design-system/{slug}";
```

Pruh Upravujete vzor se společnými akcemi. V dokladu použijte DocumentForm.templateEdit, funguje pro faktury i ZL.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `template` | TemplateEditState | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<TemplateEditBanner template={{ name: template.name, onSave: saveTemplate, onDiscard: discardTemplate, busy }} />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

### TemplateManager

```tsx
import { TemplateManager } from "@/design-system/{slug}";
```

Správa vzorů jako obsah panelu; samostatná oprávnění canRename/canShare/canEdit/canDelete a důvody. Smazání přes ConfirmDialog.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `templates` | DocumentTemplate[] | `—` |
| `storageKey` | string | `—` |
| `onAction` | (template: DocumentTemplate, action: TemplateAction) => void | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<TemplateManager templates={templates} storageKey="document-templates" onAction={handleTemplateAction} loading={loading} error={error} />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

### TemplateManagerDialog

```tsx
import { TemplateManagerDialog } from "@/design-system/{slug}";
```

Správa vzorů ve sdíleném dialogu md. Nemá společné Uložit; individuální akce předává APP a chybu zobrazí v patičce.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `templates` | DocumentTemplate[] | `—` |
| `storageKey` | string | `—` |
| `onAction` | (template: DocumentTemplate, action: TemplateAction) => void | `—` |
| `loading` | boolean | `—` |
| `error` | string | `—` |
| `open` | boolean | `—` |
| `onOpenChange` | (open: boolean) => void | `—` |

**Examples:**

**Duplikace a vzory:**

```tsx
<TemplateManagerDialog open={open} onOpenChange={setOpen} templates={templates} storageKey="template-manager-dialog" onAction={handleTemplateAction} error={error} />
```

**Avoid:**

- Nevypočítávejte období ani nevytvářejte doklady v DS; data, oprávnění a zápis dodává APP.

### Textarea

```ts
import { Textarea } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Víceřádkové textové pole. Zakázaný stav sdílí podklad muted/40, rámeček input a barvu foreground se zakázaným Input a DateField. Průhlednost je 1 kvůli čitelnosti; platí v obou režimech celé knihovny. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `error` | string | `—` |
| `warning` | string | `—` |
| `label` | string | `—` |

**Examples:**

_Zakázané pole_
```tsx
<Textarea disabled value={description} aria-label={texts.description} />
```

_Stav pole a jednotná výška (2.107.0)_
```tsx
<Textarea id="note" label={texts.note} value={note} onChange={handleNote} error={errors.note} />
```

**Avoid:**

- Nenastavujte lokální barvu ani průhlednost zakázaného pole.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

Sdílený stav pole: chyba má přednost před varováním, rámeček a přístupný popis nemění výšku. Ikona prvků bez místa uvnitř patří do řádku popisku. Popisky jsou jednořádkové, dlouhé se zkrátí; hint je ikona Info, nikoli text pod polem.

**Examples:**

_Stav pole a jednotná výška (2.107.0)_
```tsx
<ToggleGroup type="single" label={texts.mode} value={mode} onValueChange={setMode} warning={warnings.mode}><ToggleGroupItem value="a">A</ToggleGroupItem></ToggleGroup>
```

**Avoid:**

- Nevykreslujte zprávu pod polem ani nepřepisujte jeho výšku.

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

Výběr hodnoty ze seznamu; text a ikonové akce mají oddělené místo před pevnou šipkou. Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Výběr jednotky; + vpravo v hledání předá aktuální dotaz onCreateUnit, zakázaná akce vysvětlí důvod. Zachovává návrat vytvořené jednotky. Při prázdném hledání je ＋ zašedlé s důvodem DsTexts.selectCreate.emptyQuery. Duplicitní název (u jednotky také kód) zakáže ＋ s důvodem DsTexts.selectCreate.duplicate. Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `options` | any | `—` |
| `value` | string | `—` |
| `onChange` | function | `—` |
| `onCreateUnit` | function | `—` |
| `createDisabledReason` | string | `—` |
| `disabled` | boolean | `—` |
| `initialSearch` | string | `—` |
| `defaultOpen` | boolean | `false` |
| `onOpenChange` | function | `—` |
| `onKeyDown` | any | `—` |
| `placeholder` | string | `Vyberte MJ` |
| `searchPlaceholder` | string | `Hledat kód nebo název…` |
| `emptyText` | string | `Žádná měrná jednotka nenalezena` |
| `createLabel` | function | `—` |
| `className` | string | `relative h-[var(--control-h)] min-w-0 in-[td]:h-full` |
| `inactiveLabel` | string | `neaktivní` |
| `onEditSelected` | function | `—` |
| `editSelectedLabel` | string | `—` |

**Examples:**

_Výběr hodnoty_
```tsx
<UnitSelect value={value} onChange={setValue} options={options} />
```

**Avoid:**

- Nevkládejte ikonová tlačítka do tlačítka spouštěče.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

### UnknownValue

```ts
import { UnknownValue } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

### UnsavedChangesDialog

```ts
import { UnsavedChangesDialog } from "@ws-8gsevdft8cwt1luatyrl/109c3412-986a-4b45-8db7-7364336b1c7b"
```

Potvrzení odchodu pojmenované výsledkem; fokus Zpět, zahodit outline-destructive.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `open` | boolean | `—` |
| `action` | any | `—` |
| `tabTitle` | string | `—` |
| `intent` | string | `—` |
| `saving` | boolean | `—` |
| `onSave` | function | `—` |
| `onDiscard` | function | `—` |
| `onBack` | function | `—` |
| `onOpenInNewTab` | function | `—` |
| `restoreFocusTo` | any | `—` |

**Examples:**

_2.92.0_
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

Výběr kódu DPH ve skupinách S daní / Osvobozená a zvláštní režimy / Mimo DPH (menu_group z dat); u dokladu bez pevného směru skupiny Výstup / Vstup. Ve výběru „Z – Tuzemsko základní (21 %)“, v poli „Z 21 %“ (obousměrně se směrem). Klíčem je id (kód + směr). Hledání probíhá přímo v poli; tisknutelný znak otevře nový dotaz, Enter potvrzuje, Tab/Esc/odchod hodnotu nemění.

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
| `bidirectional` | boolean | `false` |
| `defaultDirection` | any | `—` |

**Examples:**

_Buňka Kód DPH v editoru řádků_
```tsx
<VatCodeSelect defaultOpen codes={vatCodes} value={line.vatCodeId} initialSearch={editing?.seed} onKeyDown={selectKey} onChange={(id) => { changeVatCode(line, id); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />
```

**Avoid:**

- Nepoužívejte OptionSelect pro kód DPH v buňce gridu – neumí se otevřít hned při editaci ani filtrovat psaním.
- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Nepřidávejte druhé hledací okno do nabídky ani nepotvrzujte hodnotu při Tab.

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

Edit dokladu 12g: zakázaný stav používá muted/40, input a muted-foreground bez průhlednosti; prázdná hodnota je kurzívou. Stavové rámečky warning, destructive a aria-invalid mají přednost. Platí také pro spouštěče výběru na Button v obou režimech. Celkem, Kurz a VS používají sans, text-sm a tabular-nums; Celkem zůstává tučně.

**Props:**

| Prop | Type | Default |
|---|---|---|
| `value` | string | `—` |
| `onChange` | function | `—` |
| `maxLength` | number | `10` |
| `placeholder` | string | `—` |
| `required` | boolean | `—` |
| `disabled` | boolean | `—` |
| `readOnly` | boolean | `—` |
| `id` | string | `—` |
| `className` | string | `relative min-w-0 [--field-feedback-offset:calc(var(--field-toggle-space)+0.25rem)]` |
| `linked` | boolean | `—` |
| `onLinkedChange` | function | `—` |
| `derivedValue` | string | `—` |
| `pendingText` | string | `—` |
| `warning` | string | `—` |

**Examples:**

_Použití společného stavu_
```tsx
<VsField {...props} />
```

_Zámek VS (2.108.0)_
```tsx
<VsField value={vs} onChange={setVs} linked={linked} onLinkedChange={setLinked} derivedValue="20260456" pendingText="přidělí se při zařazení" />
```

**Avoid:**

- Nesnižujte průhlednost zakázaného textu pod kontrast 4,5 : 1; nepřebíjejte stavové rámečky.
- Ukládat derivedValue do DB – autoritou je variable_symbol_auto; ukládá se jen stav vazby.

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

