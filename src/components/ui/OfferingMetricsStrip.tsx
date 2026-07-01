import type { JSX } from "react";
import { View } from "react-native";
import { Typography } from "heroui-native";
import { TONE_HEX } from "@/theme/tokens";

type Props = {
  raised: number;
  raiseTarget: number;
  prospectsCount: number;
  completedCount: number;
  softCommitted: number;
};

function fmt(n: number): string {
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
 * Compact 3-tile metrics row for the offering detail page.
 * Raised (with progress bar) | Prospects | Soft Committed.
 * Full-height dividers via a View sibling — no ScrollView, no fixed widths.
 */
export function OfferingMetricsStrip({
  raised,
  raiseTarget,
  prospectsCount,
  completedCount,
  softCommitted,
}: Props): JSX.Element {
  const progress = raiseTarget > 0 ? Math.min(raised / raiseTarget, 1) : 0;
  const pct = Math.round(progress * 100);

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 0.5,
        borderBottomColor: "#F0F0F0",
      }}
    >
      {/* Raised */}
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11 }}>
        <Typography
          style={{ fontSize: 10, color: TONE_HEX.muted, fontWeight: "500" }}
        >
          Raised
        </Typography>
        <Typography
          weight="semibold"
          style={{ fontSize: 15, color: TONE_HEX.foreground, marginTop: 3 }}
        >
          {fmt(raised)}
        </Typography>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 5,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              backgroundColor: "#EFEFEF",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 2,
                width: `${pct}%`,
                borderRadius: 1,
                backgroundColor: TONE_HEX.accent,
              }}
            />
          </View>
          <Typography
            style={{ fontSize: 10, color: TONE_HEX.accent, fontWeight: "600" }}
          >
            {pct}%
          </Typography>
        </View>
      </View>

      {/* Divider */}
      <View style={{ width: 0.5, backgroundColor: "#EBEBEB" }} />

      {/* Prospects */}
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11 }}>
        <Typography
          style={{ fontSize: 10, color: TONE_HEX.muted, fontWeight: "500" }}
        >
          Prospects
        </Typography>
        <Typography
          weight="semibold"
          style={{ fontSize: 15, color: TONE_HEX.foreground, marginTop: 3 }}
        >
          {prospectsCount}
        </Typography>
        <Typography
          style={{ fontSize: 10, color: TONE_HEX.muted, marginTop: 5 }}
        >
          {completedCount} completed
        </Typography>
      </View>

      {/* Divider */}
      <View style={{ width: 0.5, backgroundColor: "#EBEBEB" }} />

      {/* Soft Committed */}
      <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11 }}>
        <Typography
          style={{ fontSize: 10, color: TONE_HEX.muted, fontWeight: "500" }}
        >
          Soft committed
        </Typography>
        <Typography
          weight="semibold"
          style={{ fontSize: 15, color: TONE_HEX.foreground, marginTop: 3 }}
        >
          {fmt(softCommitted)}
        </Typography>
        <Typography
          style={{ fontSize: 10, color: TONE_HEX.muted, marginTop: 5 }}
        >
          of {fmt(raiseTarget)} target
        </Typography>
      </View>
    </View>
  );
}
