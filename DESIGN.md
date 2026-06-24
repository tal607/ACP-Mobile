# Design system — "to change X, edit Y"

This app uses a **two-tier design system** so styling stays consistent across every screen and each
change is a **single edit**. Never restyle a button/card per screen — change it in its one home below.

## Tier 1 — Design tokens (colors, radius, borders, dividers)

**File: `src/global.css`** → the `APP THEME OVERRIDES` block.

Values come from the **Agora design system** (Figma `Tokens.json`). HeroUI's semantic tokens are set to
**direct hex** values (the Agora palette is listed as a reference comment above them). We use direct hex —
not `var()` indirection — so both Tailwind classes AND HeroUI's `useThemeColor` resolve reliably. Change a
semantic line and it applies to **every** HeroUI component and Tailwind class across all screens. Current:
accent `#2F54EB`, text `#434343`, muted `#8C8C8C`, page/bg **snow `#FCFCFC`**, surface `#FFFFFF`, border
`#F0F0F0`, **divider/separator `#D9D9D9`** (border-strong), success `#73D13D`, danger `#FF4D4F`, warning
`#FFA940`. Cards = 16px (`rounded-2xl`), buttons = pill (`rounded-full`), section titles = 12px (`text-xs`).

| To change… | Edit token |
|---|---|
| Brand / primary color | `--accent` |
| Status colors | `--success`, `--danger`, `--warning` |
| Page background | `--background` |
| Card color / grouped rows | `--surface`, `--surface-secondary` |
| Text / secondary text | `--foreground`, `--muted` |
| **Stroke / border color** | `--border` |
| **Divider lines** | `--separator` |
| Border thickness | `--border-width` |
| **Roundness of everything** | `--radius` (all `rounded-*` + component corners scale from this) |

Colors are in `oklch(L C H)`. Easiest: paste a hex and I'll convert it, or use `oklch()` directly.

## Tier 2 — Shared components (buttons, cards, rows, icons, layout)

**Folder: `src/components/`** (primitives in `src/components/ui/`). Edit one file → every screen updates.

| To change all… | Edit file |
|---|---|
| Page padding / margins / section spacing (**layout**) | `ui/Screen.tsx` |
| **Icons** (which glyph) or default icon color | `ui/Icon.tsx` + the `ICONS` map in `theme/tokens.ts` |
| White outline **pill buttons** (quick actions, Prep) | `ui/PillButton.tsx` |
| Filled **primary buttons** (Join meeting) | `ui/PrimaryButton.tsx` |
| Filled **secondary buttons** (Email) | `ui/SecondaryButton.tsx` |
| Status **tags** / which color a tag is | `ui/Tag.tsx` + `TAG_COLOR` in `theme/tokens.ts` |
| Contact **avatars** (initials) | `ui/InitialsAvatar.tsx` |
| Section headers / count badges | `ui/SectionHeader.tsx`, `ui/CountBadge.tsx` |
| **Meeting cards** | `MeetingCard.tsx` |
| **Activity feed cards** + which icon/color per kind | `ActivityCard.tsx` + `ACTIVITY` in `theme/tokens.ts` |
| **Action item rows** | `ActionItemRow.tsx` |

## Non-CSS design constants

**File: `src/theme/tokens.ts`** — icon name map, tag→color map, activity kind→icon/tone map, icon sizes.

## Rule

Only **real HeroUI Native components** (`heroui-native`) — never invent components/props. Styling is via
Tailwind classes that resolve to the tokens above. If a design needs a component HeroUI lacks, we discuss
it before adding anything custom.
