import type { JSX } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ACTIVITY, TONE_SOFT_BG, TONE_HEX, type ActivityKind } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type Activity = {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  noun: string;
  time: string;
  title: string;
  desc: string;
};

/* ------------------------------------------------------------------ *
 * FeedDateSep — compact date label + trailing hairline
 * ------------------------------------------------------------------ */

export function FeedDateSep({ label }: { label: string }): JSX.Element {
  return (
    <View style={sepStyles.row}>
      <Text style={sepStyles.label}>{label}</Text>
      <View style={sepStyles.line} />
    </View>
  );
}

const sepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  label: {
    fontSize: 11,
    color: TONE_HEX.muted,
    fontWeight: "500",
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
  },
});

/* ------------------------------------------------------------------ *
 * ActivityCard — compact timeline row (no card wrapper)
 * ------------------------------------------------------------------ */

export function ActivityCard({
  item,
  contactName,
  source,
  onPress,
}: {
  item: Activity;
  contactName?: string;
  source?: "manual" | "synced";
  onPress?: () => void;
}): JSX.Element {
  const meta = ACTIVITY[item.kind];

  // Subtitle: first sentence of desc (no trailing period) + optional contact attribution
  const descSnippet = item.desc
    ? (item.desc.split(/\.\s/)[0] ?? "").replace(/\.$/, "")
    : "";
  const subtitle = [descSnippet, contactName].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? styles.rowPressed : null,
      ]}
    >
      {/* Colored icon circle */}
      <View className={TONE_SOFT_BG[meta.tone]} style={styles.iconCircle}>
        <Icon name={meta.icon} size={11} tone={meta.tone} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Line 1: action text + timestamp */}
        <View style={styles.line1}>
          {source === "synced" && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncText}>{item.actor}</Text>
            </View>
          )}
          <Text
            style={[styles.actionText, styles.actionFlex]}
            numberOfLines={1}
          >
            {source !== "synced" && (
              <Text style={styles.actorBold}>{item.actor} </Text>
            )}
            {item.action} {item.noun}
          </Text>
          <Text style={styles.timestamp}>{item.time}</Text>
        </View>

        {/* Line 2: title */}
        {item.title ? (
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
        ) : null}

        {/* Line 3: subtitle */}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Tappability affordance */}
      {onPress && (
        <View style={styles.chevronWrap}>
          <Icon name="chevron" size={11} tone="muted" />
        </View>
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  rowPressed: {
    backgroundColor: "#f5f5f5",
  },
  chevronWrap: {
    alignSelf: "center",
    paddingLeft: 2,
    opacity: 0.45,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  line1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionFlex: {
    flex: 1,
  },
  actionText: {
    fontSize: 12.5,
    color: TONE_HEX.muted,
  },
  actorBold: {
    fontSize: 12.5,
    fontWeight: "600",
    color: TONE_HEX.foreground,
  },
  timestamp: {
    fontSize: 11,
    color: TONE_HEX.muted,
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: TONE_HEX.foreground,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: TONE_HEX.muted,
    marginTop: 4,
  },
  syncBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    flexShrink: 0,
  },
  syncText: {
    fontSize: 11,
    color: TONE_HEX.muted,
    fontWeight: "500",
  },
});
