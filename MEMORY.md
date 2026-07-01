# MobileACP — Session Memory
> Living file. Rewrite in place at the end of each session. Do not append.
> Last updated: 2026-07-01

---

## HOW TO USE THIS FILE

- **Prototype sessions** — say **"continue mobile acp prototype"** and Claude will read this file first.
- **Figma sessions** — say **"continue mobile figma"** and Claude will read this file first.
- At the end of any session, say **"update memory"** and Claude will rewrite this file with the current state.

---

## Project overview

React Native / Expo Router app prototyping the mobile version of ACP (Agora Control Panel). Running at **http://localhost:8081/**. Source in `~/Desktop/mobile-acp-app/src/`.

Two-tier design system:
- CSS tokens in `src/global.css` (colors, radius, borders)
- Shared components in `src/components/` and `src/components/ui/`

---

## Agora design tokens (JS-side — `src/theme/tokens.ts`)

| Token | Value |
|-------|-------|
| accent | `#2F54EB` |
| foreground | `#434343` |
| muted | `#8C8C8C` |
| background | `#FCFCFC` |
| surface | `#FFFFFF` |
| border | `#F0F0F0` |

Icon libraries available: Ionicons (default), MaterialIcons (`lib: "material"`), MaterialCommunityIcons (`lib: "mci"`). All rendered via `<Icon name="..." />`.

---

## Routing structure

```
src/app/
  (tabs)/
    index.tsx          — Home screen
    contacts.tsx       — Contacts tab
    offerings.tsx      — Offerings list
    ...
  offering/
    [offeringId].tsx   — Offering detail page (active development)
  prospect/
    [prospectId].tsx   — Prospect detail page (placeholder)
```

---

## Components inventory (`src/components/`)

### UI primitives (`src/components/ui/`)

| Component | Description |
|-----------|-------------|
| `MetricCard` | Label + bold value + optional progress bar. Used in 3-up rows. |
| `OfferingCard` | Offering list card with progress bar + status chip. Navigates to offering detail. |
| `OfferingMetricsStrip` | 3-tile horizontal row (Raised/Prospects/Soft Committed) with full-height dividers. Built but currently replaced by MetricCard row in offering page. |
| `SegmentedControl` | 2-option icon-only pill toggle. EFEFEF container, white+shadow on active tile. Props: `options: [Option, Option]`, `value`, `onChange`. Supports `iconName` or `label` per option. |
| `Icon` | Unified icon component. Size accepts `"sm"/"md"/"lg"` or a number. Color accepts `tone` (semantic) or `color` (hex). |
| `Screen`, `BottomNav`, `SectionHeader`, etc. | Standard layout primitives |

### Domain components

| Component | Description |
|-----------|-------------|
| `ProspectCard` | Kanban card. Drag handle (visual only) + name + step·days + amount. 3px colored left border. |
| `ProspectRow` | Compact list row. Name + amount (top line) + step·days (second line) + chevron. 3px colored left border. |
| `ProspectListView` | SectionList grouped by `KANBAN_STAGES` order. Stage headers (dot + name + count badge). Empty stages hidden. Accepts `stages`, `stageColors`, `prospects`, `onPressProspect`. |
| `KanbanColumn` | Single stage column. Header + nested vertical ScrollView of ProspectCards. `alignSelf: "stretch"`. |
| `KanbanBoard` | Horizontal ScrollView of KanbanColumns. `COLUMN_WIDTH = SCREEN_WIDTH - 72` for ~50px peek. |

---

## Offering detail page (`/offering/[offeringId]`)

Current layout (top to bottom):

1. **Nav header** — circular back button (F5F5F5) + centered offering name + more icon
2. **Metric cards row** — 3 `MetricCard` components, `flex: 1` each, white bg with border-bottom:
   - Raised (with progress bar via `progress` prop)
   - Prospects
   - Soft Committed
3. **Toolbar row** — search bar (`flex: 1`, F5F5F5 bg, `clearButtonMode="while-editing"`) + `SegmentedControl` (viewList/viewBoard icons)
4. **Content** — swaps between `ProspectListView` (default) and `KanbanBoard`

Key state:
- `view: "list" | "kanban"` — defaults to `"list"`
- `query: string` — filters `filteredProspects` passed to both views; metrics always show totals

---

## Data model (`src/data/offerings.ts`)

**`SubscriptionStage`** union: `"Hasn't Started" | "Started" | "Counter Sign" | "Waitlist" | "Completed" | "Signed"`

**`KANBAN_STAGES`**: `["Hasn't Started", "Started", "Counter Sign", "Waitlist", "Completed"]`

**`STAGE_CONFIG`** — color + label per stage:

| Stage | Color |
|-------|-------|
| Hasn't Started | `#8C8C8C` |
| Started | `#531DAB` |
| Counter Sign | `#0958D9` |
| Waitlist | `D46B08` |
| Completed | `#389E0D` |
| Signed | `#389E0D` |

**`Prospect`** type: `id, offeringId, name, stage, subscriptionStep, daysInStage, subscriptionAmount?, softCommitment?, organization?, staffMember?, dataRoomAccess`

**`getProspectsForOffering(offeringId)`** — helper to filter `PROSPECTS` by offering. 11 mock prospects exist for `off-1` (Agora Multifamily Fund III).

---

## Icon tokens (relevant additions)

```ts
grip:      { lib: "mci", name: "drag-vertical" }   // kanban drag handle
viewList:  "list-outline"                           // Ionicons list view
viewBoard: { lib: "mci", name: "view-column" }      // MCI kanban view
```

---

## Pending work

1. **Prospect detail page** (`/prospect/[prospectId]`) — currently a placeholder. User said "later on I will define and design it more." Shows name + stage + "coming soon".
2. **Drag-and-drop kanban** — drag handle (grip icon) is visual only. Full drag between columns is v2 (requires `react-native-draggable-flatlist` or similar).
3. **Remaining screens** — Contacts detail, Tasks, Home screen refinements.

---

## Figma reference

| Item | Value |
|------|-------|
| Figma file key | `ysM7HMSZnOX9jhF0GBCYj4` |
| Figma file name | 📱 Mobile |
| Target page | 🚧 Design in Progress (id: `1:5`) |
| HeroUI Kit V3 Community file key | `csQ4eMx4m2m622SdraZ3mi` |
| Desktop Bridge plugin | Figma Desktop Bridge (MCP Bridge) — cloud relay, pair with a code each session |

**Home Screen frame** — complete. 390x844px, VERTICAL auto-layout, `itemSpacing=13`. 6 sections: Header, Quick Actions, Next Meeting Card, Later Today, Action Items, Recent Activity.

---

## Working rules

- No em-dashes in any generated output
- Never hardcode Figma component keys without verifying against the live library
- Metrics rows always reflect totals, never filtered counts
- `OfferingMetricsStrip` still exists in the codebase but is not used in the offering page (replaced by MetricCard row) — do not delete it
- Pre-existing TypeScript errors in `ContactActionSheet`, `CreateContactSheet`, `MultiPrepSheet`, `PrepSheet` (absoluteFillObject, "regular" TextWeight, disabled prop) — do not touch
