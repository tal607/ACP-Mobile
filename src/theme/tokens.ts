import type { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

/**
 * JS-side design tokens — the things that can't live in CSS (icon names,
 * semantic color mappings, sizes). Edit here to change them everywhere.
 *
 * (Colors / radius / borders / dividers live in `src/global.css`.)
 */

type IoniconName = keyof typeof Ionicons.glyphMap;
type MaterialName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * An icon glyph. A plain string is an Ionicons name (our default family);
 * use the tagged forms to pull a glyph from another family when Ionicons
 * lacks a good one. The <Icon /> component renders the right family.
 */
export type IconSpec =
  | IoniconName
  | { lib: "ionicons"; name: IoniconName }
  | { lib: "material"; name: MaterialName }
  | { lib: "mci"; name: MaterialCommunityName };

/** Semantic foreground/tone names that map to HeroUI theme colors. */
export type Tone = "foreground" | "muted" | "accent" | "success" | "danger" | "warning";

/**
 * Literal Agora hex per tone — used for icon colors. We resolve icons from these
 * literals (not HeroUI's `useThemeColor`) so icon color is always a valid value.
 * Keep in sync with the semantic tokens in `src/global.css`.
 */
export const TONE_HEX: Record<Tone, string> = {
  foreground: "#434343",
  muted: "#8c8c8c",
  accent: "#2f54eb",
  success: "#73d13d",
  danger: "#ff4d4f",
  warning: "#ffa940",
};

/** White, for icons/text on a colored (accent/primary) fill. */
export const ON_COLOR = "#ffffff";

/** Gold used for the favorite star (list badge + contact detail header). */
export const FAVORITE_GOLD = "#F5A623";

/**
 * Semantic icon names → the actual Ionicons glyph.
 * Use these names via the <Icon /> component so swapping an icon is one edit.
 */
export const ICONS = {
  // quick actions
  addContact: "person-add-outline",
  logNote: "create-outline",
  sendInvite: "paper-plane-outline",
  // header
  bell: "notifications-outline",
  person: "person",
  // meeting / activity
  video: "videocam-outline",
  email: "mail-outline",
  call: "call-outline",
  note: "document-text-outline",
  meeting: "calendar-outline",
  chevron: "chevron-forward",
  chevronDown: "chevron-down",
  chevronUp: "chevron-up",
  close: "close",
  // navigation / actions
  back: "chevron-back",
  search: "search",
  share: "share-outline",
  more: "ellipsis-horizontal",
  filter: "options-outline",
  check: "checkmark",
  arrowDown: "arrow-down",
  arrowUp: "arrow-up",
  location: "location-outline",
  org: "business-outline",
  favorite: "star-outline",
  favoriteFilled: "star",
  // bottom nav tabs
  home: "home-outline",
  contacts: "people-outline",
  calendar: "calendar-outline",
  activity: "pulse-outline",
  // AI Co-pilot — slim filled 4-point sparkle (Ionicons' filled sparkle is too chunky).
  copilot: { lib: "mci", name: "star-four-points" },
  // Kanban drag handle
  grip: { lib: "mci", name: "drag-vertical" },
  // contact actions / details
  trash: "trash-outline",
  portal: "eye-outline",
  lockOpen: "lock-open-outline",
  shield: "shield-checkmark-outline",
  apps: "apps-outline",
  edit: "create-outline",
  addTag: "pricetag-outline",
  // create / activity actions
  add: "add",
  task: "checkmark-circle-outline",
  attach: "attach-outline",
  flag: "flag-outline",
  mic: "mic-outline",
  time: "time-outline",
} satisfies Record<string, IconSpec>;

export type IconName = keyof typeof ICONS;

/** Standard icon sizes. */
export const ICON_SIZE = {
  sm: 16,
  md: 18,
  lg: 20,
} as const;

/** Contact "tag" label → Chip color (HeroUI Chip color). */
export const TAG_COLOR: Record<string, "success" | "accent" | "warning" | "default"> = {
  Prospect: "success",
  Investor: "accent",
  Lead: "warning",
};

export function tagColor(tag: string): "success" | "accent" | "warning" | "default" {
  return TAG_COLOR[tag] ?? "default";
}

/** Activity kind → icon + tone (drives the colored icon circle). */
export const ACTIVITY: Record<string, { icon: IconName; tone: Extract<Tone, "danger" | "success" | "accent" | "warning"> }> = {
  note: { icon: "note", tone: "danger" },
  meeting: { icon: "meeting", tone: "success" },
  call: { icon: "call", tone: "warning" },
  email: { icon: "email", tone: "accent" },
  task: { icon: "task", tone: "accent" },
  "synced-meeting": { icon: "meeting", tone: "success" },
  "synced-email": { icon: "email", tone: "accent" },
};

export type ActivityKind = keyof typeof ACTIVITY;

/** Soft background class per tone (for icon circles / chips). */
export const TONE_SOFT_BG: Record<"danger" | "success" | "accent" | "warning", string> = {
  danger: "bg-danger-soft",
  success: "bg-success-soft",
  accent: "bg-accent-soft",
  warning: "bg-warning-soft",
};
