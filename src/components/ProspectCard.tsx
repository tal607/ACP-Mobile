import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "heroui-native";
import { Icon } from "@/components/ui/Icon";
import { TONE_HEX } from "@/theme/tokens";
import type { Prospect } from "@/data/offerings";

type Props = {
  prospect: Prospect;
  /** Hex color for the left accent border — matches the stage color. */
  stageColor: string;
  onPress: () => void;
};

function fmtAmount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}K`;
  }
  return `$${n.toLocaleString()}`;
}

/**
 * Prospect card for the kanban board.
 * Shows: name, subscription step + days in stage, subscription amount.
 * Left border is colored by stage. Drag handle indicates draggability (v2).
 * Tapping navigates to the prospect detail page.
 */
export function ProspectCard({ prospect, stageColor, onPress }: Props): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          borderTopWidth: 0.5,
          borderRightWidth: 0.5,
          borderBottomWidth: 0.5,
          borderTopColor: "#F0F0F0",
          borderRightColor: "#F0F0F0",
          borderBottomColor: "#F0F0F0",
          borderLeftWidth: 3,
          borderLeftColor: stageColor,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
          padding: 12,
        }}
      >
        {/* Drag handle — visual indicator, full drag-and-drop is v2 */}
        <Icon name="grip" size={16} color="#D9D9D9" />

        {/* Content */}
        <View style={{ flex: 1, gap: 3 }}>
          <Typography
            weight="semibold"
            numberOfLines={1}
            style={{ fontSize: 14, color: TONE_HEX.foreground }}
          >
            {prospect.name}
          </Typography>

          <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
            {prospect.subscriptionStep} · {prospect.daysInStage}{" "}
            {prospect.daysInStage === 1 ? "day" : "days"}
          </Typography>

          <Typography
            weight="semibold"
            style={{
              fontSize: 13,
              color:
                prospect.subscriptionAmount != null
                  ? TONE_HEX.foreground
                  : TONE_HEX.muted,
            }}
          >
            {prospect.subscriptionAmount != null
              ? fmtAmount(prospect.subscriptionAmount)
              : "—"}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
}
