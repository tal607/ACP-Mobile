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
 * Compact horizontal prospect row for the list view.
 * Top line: name (left) + subscription amount (right).
 * Bottom line: subscription step · days in stage.
 * Left border colored by stage. Chevron indicates navigability.
 */
export function ProspectRow({ prospect, stageColor, onPress }: Props): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 10,
          borderTopWidth: 0.5,
          borderRightWidth: 0.5,
          borderBottomWidth: 0.5,
          borderLeftWidth: 3,
          borderTopColor: "#F0F0F0",
          borderRightColor: "#F0F0F0",
          borderBottomColor: "#F0F0F0",
          borderLeftColor: stageColor,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {/* Text content */}
        <View style={{ flex: 1, gap: 2 }}>
          {/* Name + amount */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <Typography
              weight="semibold"
              numberOfLines={1}
              style={{ fontSize: 14, color: TONE_HEX.foreground, flex: 1 }}
            >
              {prospect.name}
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

          {/* Step + days */}
          <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
            {prospect.subscriptionStep} · {prospect.daysInStage}{" "}
            {prospect.daysInStage === 1 ? "day" : "days"}
          </Typography>
        </View>

        {/* Chevron */}
        <Icon name="chevron" size="sm" tone="muted" />
      </View>
    </Pressable>
  );
}
