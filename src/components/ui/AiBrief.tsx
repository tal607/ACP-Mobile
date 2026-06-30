import { type JSX } from "react";
import { View } from "react-native";
import { Typography } from "heroui-native";
import { Icon } from "./Icon";

type AiBriefProps = {
  /** The brief text to display. */
  text: string;
  /**
   * Show the "Copilot Brief" label + icon header row above the text.
   * Pass false on the home screen next meeting card where space is tight.
   * @default true
   */
  showLabel?: boolean;
};

/**
 * Shared AI brief callout.
 * Blue-tinted background, no border — works in both light and dark mode.
 */
export function AiBrief({ text, showLabel = true }: AiBriefProps): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: "rgba(47, 84, 235, 0.08)",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 5,
      }}
    >
      {showLabel && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="copilot" size="sm" color="#2F54EB" />
          <Typography style={{ fontSize: 11, fontWeight: "400", color: "#8C8C8C" }}>
            Copilot Brief
          </Typography>
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        {!showLabel && <Icon name="copilot" size="sm" color="#2F54EB" />}
        <Typography type="body-xs" style={{ flex: 1, lineHeight: 18 }}>
          {text}
        </Typography>
      </View>
    </View>
  );
}
