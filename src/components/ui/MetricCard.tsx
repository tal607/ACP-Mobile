import type { JSX } from "react";
import { View, type ViewStyle } from "react-native";
import { Surface, Typography } from "heroui-native";
import { TONE_HEX } from "@/theme/tokens";

type MetricCardProps = {
  /** Uppercase label shown above the value. */
  label: string;
  /** Formatted value string, e.g. "$2.5M" or "2". */
  value: string;
  /** Optional color override for the value (defaults to foreground). */
  valueColor?: string;
  /**
   * 0–1: renders a thin progress bar with an inline percentage label.
   * Pass undefined to hide the bar.
   */
  progress?: number;
  /** Style forwarded to the Surface wrapper — use for flex sizing, minWidth, etc. */
  style?: ViewStyle;
};

/**
 * Shared metric card used across profile detail, investments tab, and
 * transactions page. Option A: tighter padding, no subtitle text line.
 * An optional progress bar sits inline with a percentage label.
 */
export function MetricCard({
  label,
  value,
  valueColor,
  progress,
  style,
}: MetricCardProps): JSX.Element {
  return (
    <Surface style={{ padding: 10, borderRadius: 14, gap: 4, ...style }}>
      <Typography
        style={{
          fontSize: 12,
          color: TONE_HEX.muted,
          fontWeight: "500",
        }}
      >
        {label}
      </Typography>

      <Typography
        weight="bold"
        style={{ fontSize: 18, color: valueColor ?? TONE_HEX.foreground }}
      >
        {value}
      </Typography>

      {progress !== undefined && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#f0f0f0",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 4,
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor:
                  progress >= 1 ? TONE_HEX.accent : TONE_HEX.warning,
                borderRadius: 2,
              }}
            />
          </View>
          <Typography
            style={{ fontSize: 12, color: TONE_HEX.muted, fontWeight: "500" }}
          >
            {Math.round(progress * 100)}%
          </Typography>
        </View>
      )}
    </Surface>
  );
}
