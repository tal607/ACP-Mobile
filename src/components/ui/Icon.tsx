import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import type { JSX } from "react";
import { ICON_SIZE, ICONS, type IconName, type IconSpec, TONE_HEX, type Tone } from "@/theme/tokens";

type IconProps = {
  /** Semantic icon name (see ICONS in theme/tokens.ts). */
  name: IconName;
  /** Size token or explicit number. @default 'md' */
  size?: keyof typeof ICON_SIZE | number;
  /** Theme tone → literal hex (see TONE_HEX). @default 'foreground' */
  tone?: Tone;
  /** Explicit color override (wins over tone). */
  color?: string;
};

/**
 * One icon wrapper for the whole app. Maps a semantic name → Ionicons glyph,
 * applies a standard size, and resolves color from a literal Agora hex (TONE_HEX)
 * so the icon always gets a valid color. Change an icon or its tones in
 * `theme/tokens.ts`.
 */
export function Icon({ name, size = "md", tone = "foreground", color }: IconProps): JSX.Element {
  const px = typeof size === "number" ? size : ICON_SIZE[size];
  const c = color ?? TONE_HEX[tone];
  const spec = ICONS[name] as IconSpec;

  // Plain string = Ionicons (default family).
  if (typeof spec === "string") return <Ionicons name={spec} size={px} color={c} />;
  switch (spec.lib) {
    case "material":
      return <MaterialIcons name={spec.name} size={px} color={c} />;
    case "mci":
      return <MaterialCommunityIcons name={spec.name} size={px} color={c} />;
    default:
      return <Ionicons name={spec.name} size={px} color={c} />;
  }
}
