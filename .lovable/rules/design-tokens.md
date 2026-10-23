# Design Tokens

Token reference for **DS - main**. Use utility classes and CSS variables — never raw values.

## Colors

Apply with any color utility: `bg-<name>`, `text-<name>`, `border-<name>`, `ring-<name>`, `divide-<name>`, etc.

| Name | CSS variable |
|---|---|
| `col-tone-gray-soft` | `--col-tone-gray-soft` |
| `col-tone-gray-soft-fg` | `--col-tone-gray-soft-fg` |
| `col-tone-gray-strong` | `--col-tone-gray-strong` |
| `col-tone-gray-strong-fg` | `--col-tone-gray-strong-fg` |
| `col-tone-gray-mark` | `--col-tone-gray-mark` |
| `col-tone-blue-soft` | `--col-tone-blue-soft` |
| `col-tone-blue-soft-fg` | `--col-tone-blue-soft-fg` |
| `col-tone-blue-strong` | `--col-tone-blue-strong` |
| `col-tone-blue-strong-fg` | `--col-tone-blue-strong-fg` |
| `col-tone-blue-mark` | `--col-tone-blue-mark` |
| `col-tone-teal-soft` | `--col-tone-teal-soft` |
| `col-tone-teal-soft-fg` | `--col-tone-teal-soft-fg` |
| `col-tone-teal-strong` | `--col-tone-teal-strong` |
| `col-tone-teal-strong-fg` | `--col-tone-teal-strong-fg` |
| `col-tone-teal-mark` | `--col-tone-teal-mark` |
| `col-tone-olive-soft` | `--col-tone-olive-soft` |
| `col-tone-olive-soft-fg` | `--col-tone-olive-soft-fg` |
| `col-tone-olive-strong` | `--col-tone-olive-strong` |
| `col-tone-olive-strong-fg` | `--col-tone-olive-strong-fg` |
| `col-tone-olive-mark` | `--col-tone-olive-mark` |
| `col-tone-yellow-soft` | `--col-tone-yellow-soft` |
| `col-tone-yellow-soft-fg` | `--col-tone-yellow-soft-fg` |
| `col-tone-yellow-strong` | `--col-tone-yellow-strong` |
| `col-tone-yellow-strong-fg` | `--col-tone-yellow-strong-fg` |
| `col-tone-yellow-mark` | `--col-tone-yellow-mark` |
| `col-tone-orange-soft` | `--col-tone-orange-soft` |
| `col-tone-orange-soft-fg` | `--col-tone-orange-soft-fg` |
| `col-tone-orange-strong` | `--col-tone-orange-strong` |
| `col-tone-orange-strong-fg` | `--col-tone-orange-strong-fg` |
| `col-tone-orange-mark` | `--col-tone-orange-mark` |
| `col-tone-pink-soft` | `--col-tone-pink-soft` |
| `col-tone-pink-soft-fg` | `--col-tone-pink-soft-fg` |
| `col-tone-pink-strong` | `--col-tone-pink-strong` |
| `col-tone-pink-strong-fg` | `--col-tone-pink-strong-fg` |
| `col-tone-pink-mark` | `--col-tone-pink-mark` |
| `col-tone-purple-soft` | `--col-tone-purple-soft` |
| `col-tone-purple-soft-fg` | `--col-tone-purple-soft-fg` |
| `col-tone-purple-strong` | `--col-tone-purple-strong` |
| `col-tone-purple-strong-fg` | `--col-tone-purple-strong-fg` |
| `col-tone-purple-mark` | `--col-tone-purple-mark` |
| `pane-tabbar` | `--pane-tabbar` |
| `border-strong` | `--border-strong` |
| `surface-page` | `--surface-page` |
| `foreground` | `--foreground` |
| `card` | `--card` |
| `card-foreground` | `--card-foreground` |
| `popover` | `--popover` |
| `popover-foreground` | `--popover-foreground` |
| `primary` | `--primary` |
| `primary-foreground` | `--primary-foreground` |
| `secondary` | `--secondary` |
| `secondary-foreground` | `--secondary-foreground` |
| `muted` | `--muted` |
| `muted-foreground` | `--muted-foreground` |
| `accent` | `--accent` |
| `accent-foreground` | `--accent-foreground` |
| `operator-accent` | `--operator-accent` |
| `operator-accent-foreground` | `--operator-accent-foreground` |
| `tooltip` | `--tooltip` |
| `tooltip-foreground` | `--tooltip-foreground` |
| `tooltip-border` | `--tooltip-border` |
| `destructive` | `--destructive` |
| `destructive-foreground` | `--destructive-foreground` |
| `success` | `--success` |
| `success-foreground` | `--success-foreground` |
| `success-soft` | `--success-soft` |
| `success-strong` | `--success-strong` |
| `destructive-soft` | `--destructive-soft` |
| `destructive-strong` | `--destructive-strong` |
| `warning` | `--warning` |
| `warning-foreground` | `--warning-foreground` |
| `warning-strong` | `--warning-strong` |
| `suggestion-soft` | `--suggestion-soft` |
| `border` | `--border` |
| `input` | `--input` |
| `ring` | `--ring` |
| `sidebar` | `--sidebar` |
| `sidebar-foreground` | `--sidebar-foreground` |
| `sidebar-accent` | `--sidebar-accent` |
| `sidebar-accent-foreground` | `--sidebar-accent-foreground` |
| `sidebar-border` | `--sidebar-border` |
| `sidebar-muted` | `--sidebar-muted` |
| `sidebar-indicator` | `--sidebar-indicator` |
| `sidebar-input` | `--sidebar-input` |
| `sidebar-hover` | `--sidebar-hover` |
| `sidebar-badge-active` | `--sidebar-badge-active` |
| `sidebar-badge-active-foreground` | `--sidebar-badge-active-foreground` |
| `company` | `--company` |
| `company-foreground` | `--company-foreground` |
| `company-muted` | `--company-muted` |
| `person` | `--person` |
| `person-strong` | `--person-strong` |
| `person-foreground` | `--person-foreground` |
| `person-muted` | `--person-muted` |
| `share-high` | `--share-high` |
| `share-mid` | `--share-mid` |
| `share-low` | `--share-low` |
| `surface-hover` | `--surface-hover` |
| `surface-active` | `--surface-active` |
| `surface-selected` | `--surface-selected` |
| `surface-subtle` | `--surface-subtle` |
| `row-stripe` | `--row-stripe` |
| `switch-unchecked` | `--switch-unchecked` |
| `filter-active` | `--filter-active` |
| `grid-navy-deep` | `--grid-navy-deep` |
| `grid-navy` | `--grid-navy` |
| `grid-steel` | `--grid-steel` |
| `grid-frost` | `--grid-frost` |
| `grid-chrome-border` | `--grid-chrome-border` |
| `sidebar-badge` | `--sidebar-badge` |
| `sidebar-badge-foreground` | `--sidebar-badge-foreground` |
| `sidebar-active` | `--sidebar-active` |
| `sidebar-active-foreground` | `--sidebar-active-foreground` |
| `success-border` | `--success-border` |
| `info-border` | `--info-border` |
| `warning-border` | `--warning-border` |
| `error-border` | `--error-border` |

## Typography

Typography classes (`font-*` for families, `text-*` for sizes):

| Class | CSS variable |
|---|---|
| `font-sans` | `--font-sans` |
| `font-display` | `--font-display` |
| `font-mono` | `--font-mono` |
| `text-title` | `--text-title` |
| `text-section` | `--text-section` |
| `text-label` | `--text-label` |
| `text-meta` | `--text-meta` |
| — | `--calendar-body-h` |
| `text-identity` | `--text-identity` |
| — | `--grid-heading-surface` |
| — | `--grid-line` |
| — | `--warning-text` |

## Spacing

Apply with any spacing utility: `p-<name>`, `m-<name>`, `gap-<name>`, `space-<name>`, `w-<name>`, `h-<name>`, etc.

| Name | CSS variable |
|---|---|
| — | `--col-format-gap` |
| — | `--document-date-text-gap` |
| — | `--document-date-left-padding` |
| — | `--document-date-right-padding` |
| — | `--chip-gap` |
| — | `--field-toggle-space` |

## Border Radius

Border-radius classes:

| Class | CSS variable |
|---|---|
| `rounded-sm` | `--radius-sm` |
| `rounded-md` | `--radius-md` |
| `rounded-lg` | `--radius-lg` |
| `rounded-xl` | `--radius-xl` |
| `rounded-2xl` | `--radius-2xl` |
| `rounded` | `--radius` |

## Shadows

Box-shadow classes:

| Class | CSS variable |
|---|---|
| `shadow-panel` | `--shadow-panel` |
| — | `--focus-ring-shadow` |
| — | `--tw-ring-shadow` |
| — | `--grid-actions-shadow` |

## Other

Reference via `var(--name)` in inline styles or CSS.

| CSS variable |
|---|
| `--col-format-strip` |
| `--col-format-dot` |
| `--col-format-swatch` |
| `--record-panel-width` |
| `--note-input-min` |
| `--note-input-max` |
| `--record-panel-wide` |
| `--record-indicator-slot` |
| `--attachment-preview-height` |
| `--badge-h-sm` |
| `--badge-h-md` |
| `--badge-cap-offset` |
| `--identity-account-width` |
| `--identity-account-accessories-width` |
| `--calendar-width` |
| `--document-date-icon-offset` |
| `--document-date-icon-step` |
| `--document-date-icon-size` |
| `--grid-title-surface` |
| `--grid-toolbar-surface` |
| `--control-h` |
| `--grid-total-surface` |
| `--f-h` |
| `--p-h` |
| `--grid-edge-x` |
| `--grid-edge-y` |
| `--cell-size` |
| `--grid-pad-y` |
| `--grid-pad-x` |
| `--grid-row-h` |
| `--grid-head-scale` |
| `--grid-head-rows` |
| `--success-bg` |
| `--info-bg` |
| `--warning-bg` |
| `--error-bg` |
| `--chip-pad-x` |
| `--chip-pad-y` |
| `--chip-icon` |
| `--field-feedback-offset` |
| `--grid-actions-divider` |

