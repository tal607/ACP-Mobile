# MobileACP Figma — Session Memory
> Living file. Rewrite in place at the end of each session. Do not append.
> Last updated: 2026-06-22

---

## HOW TO USE THIS FILE
At the start of any new Figma session for MobileACP, say **"continue mobile figma"** and Claude will read this file first.
At the end of a session, say **"update memory"** and Claude will rewrite this file with the current state.

---

## What this covers
Figma work for the MobileACP React Native app. Source code lives in `mobile-acp-app/src/`. The Figma file is the "📱 Mobile" file. Design uses HeroUI Kit V3 Community as the linked component library.

---

## Key references

| Item | Value |
|------|-------|
| Figma file key | `ysM7HMSZnOX9jhF0GBCYj4` |
| Figma file name | 📱 Mobile |
| Target page | 🚧 Design in Progress (id: `1:5`) |
| HeroUI Kit V3 Community file key | `csQ4eMx4m2m622SdraZ3mi` |
| Desktop Bridge plugin | Figma Desktop Bridge (MCP Bridge) — cloud relay, pair with a code each session |
| Source screen | `mobile-acp-app/src/app/(tabs)/index.tsx` |

---

## Current state

**Home Screen frame** — complete. Named "Home Screen", 390x844px, VERTICAL auto-layout, `itemSpacing=13`. Located on "🚧 Design in Progress" page. Contains 6 sections using real HeroUI component instances.

| Section | Height | HeroUI components used |
|---------|--------|----------------------|
| Header | 41px | Avatar (md, initials) |
| Quick Actions | 36px | Button (primary/outline/ghost, md) |
| Next Meeting Card | 148px | Chip (soft, sm), Button (outline, sm) |
| Later Today | 161px | Chip (accent/success/warning, sm) |
| Action Items | 137px | Checkbox (default) |
| Recent Activity | 176px | Avatar (sm), Separator (tertiary/horizontal) |

Native Figma frames (not HeroUI Card) used for card containers and section wrappers.

---

## HeroUI component keys (from HeroUI Kit V3 Community library)

These are component variant keys for `figma.importComponentByKeyAsync(key)`:

**Button**
- Primary / md: `3c77e7aafc5d53b7a5a7df8ab22cdeaeb5df5b6e` (confirm key in library if needed)
- Property names: `label#2218:8`, `showPrefix#2218:6`, `showSuffix#2218:4`

**Chip**
- sm variant keys vary by color/style — query the library for exact keys
- Property names: `label#2489:53`, `showPrefix#2489:71`, `showSuffix#2489:77`

**Avatar**
- Property names: `value#2595:0`

**Checkbox**
- Key: `29b379945ca646190c66b2d31743fa007effcf13`
- Property names: `title#2450:6`, `description#2450:5`, `showDescription#2450:7`, `showError#2450:15`

**Separator**
- Keys: query library for tertiary/horizontal variant

> Note: Always verify keys against the live library at session start — they can change if the library file updates.

---

## Critical Figma Plugin API patterns

```javascript
// CORRECT: set FILL after appendChild
parent.appendChild(child);
child.layoutSizingHorizontal = 'FILL';  // NOT before appendChild

// Import a component from the linked HeroUI library
const comp = await figma.importComponentByKeyAsync(key);
const inst = comp.createInstance();
inst.setProperties({'label#2218:8': 'My Label', 'showPrefix#2218:6': false});

// Fix collapsed frames (HORIZONTAL layout height = 10px bug)
// counterAxisSizingMode = 'AUTO' for HORIZONTAL frames
// primaryAxisSizingMode = 'AUTO' for VERTICAL frames

// Font style names for Inter
// Use "Regular", "Medium", "Semi Bold" (NOT "SemiBold")
```

---

## HeroUI color palette
- Primary: `#006FEE`
- Background: `#FFFFFF`
- Surface: `#FAFAFA` / `#F0F9FF`
- Text: `#11181C`
- Muted: `#71717A`
- Border: `#E4E4E7`

---

## Next priorities
1. Design remaining screens: Dashboard detail, Contacts, Tasks, Settings
2. Consider linking HeroUI Pro native kit if a license becomes available (heroui.pro)
3. Add interactive prototype connections between screens

---

## Working rules
- Always re-pair the Desktop Bridge plugin at the start of each session (it disconnects between sessions)
- Probe the HeroUI library for component keys before scripting — do not hardcode keys without verifying
- Use native frames for card/section containers; use HeroUI instances only for interactive elements (buttons, chips, avatars, checkboxes, separators)
- No em-dashes in any generated output
