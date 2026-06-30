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
  /**
   * Optional secondary line under the value, e.g. "3 completed" or
   * "of $5M target". Omit to keep the tighter no-subtitle layout.
   */
  subtitle?: string;
  /** Style forwarded to the Surface wrapper — use for flex sizing, minWidth, etc. */
  style?: ViewStyle;
};

/** Vertical gap between the title and the value. Tune manually. */
const TITLE_TO_VALUE_GAP = 14;
/** Vertical gap between the value and the progress bar / subtitle. Tune manually. */
const VALUE_TO_DETAIL_GAP = 6;
/**
 * Line height of the value. Keep this EQUAL to the font size (18) so the
 * number's line box hugs the glyphs — then TITLE_TO_VALUE_GAP and
 * VALUE_TO_DETAIL_GAP are the only things controlling the spacing, and they
 * stay independent. Raising it adds space both above AND below the number.
 */
const VALUE_LINE_HEIGHT = 18;
/**
 * Shared style for all text below the number — the progress percentage AND
 * the subtitle. Change here once to keep them the same size / weight.
 * lineHeight === fontSize so the gaps stay controlled purely by margins.
 */
const DETAIL_TEXT = {
  fontSize: 11,
  lineHeight: 16,
  fontWeight: "400",
  color: TONE_HEX.muted,
} as const;

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
  subtitle,
  style,
}: MetricCardProps): JSX.Element {
  return (
    <Surface style={{ padding: 10, borderRadius: 14, ...style }}>
      <Typography
        style={{
          fontSize: 12,
          lineHeight: 12,
          color: TONE_HEX.muted,
          fontWeight: "400",
        }}
      >
        {label}
      </Typography>

      <Typography
        weight="bold"
        style={{
          fontSize: 18,
          fontWeight: "700",
          lineHeight: VALUE_LINE_HEIGHT,
          color: valueColor ?? TONE_HEX.foreground,
          marginTop: TITLE_TO_VALUE_GAP,
        }}
      >
        {value}
      </Typography>

      {progress !== undefined && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: VALUE_TO_DETAIL_GAP,
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
          <Typography style={DETAIL_TEXT}>
            {Math.round(progress * 100)}%
          </Typography>
        </View>
      )}

      {subtitle !== undefined && (
        <Typography
          style={{ ...DETAIL_TEXT, marginTop: VALUE_TO_DETAIL_GAP }}
        >
          {subtitle}
        </Typography>
      )}
    </Surface>
  );
}
