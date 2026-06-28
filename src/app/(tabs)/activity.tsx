import { Card, Typography } from "heroui-native";
import { useMemo, useState, type JSX } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ACTIVITY, TONE_HEX, TONE_SOFT_BG } from "@/theme/tokens";
import {
  FEED_ACTIVITIES,
  type FeedActivity,
} from "@/data/activities";
import {
  CreateActivitySheet,
  type CreateActivityKind,
} from "@/components/CreateActivitySheet";
import {
  ActivityFormSheet,
  type ActivityFormKind,
} from "@/components/ActivityFormSheet";
import { CreateTaskSheet } from "@/components/CreateTaskSheet";
import { Icon } from "@/components/ui/Icon";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

/** "Alex Thompson" → "AT", "Gmail" → "GM" */
function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1][0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ *
 * Feed activity card — extends ActivityCard with contact row + synced badge
 * ------------------------------------------------------------------ */

function FeedCard({ item }: { item: FeedActivity }): JSX.Element {
  const meta = ACTIVITY[item.kind];

  return (
    <View>
      {/* Contact + synced context row */}
      {(item.contactName || item.source === "synced") && (
        <View style={feedStyles.contextRow}>
          {item.contactName && (
            <View style={feedStyles.contactPill}>
              <InitialsAvatar initials={nameInitials(item.contactName)} size="sm" />
              <Typography type="body-xs" style={{ color: TONE_HEX.muted, marginLeft: 4 }}>
                {item.contactName}
              </Typography>
            </View>
          )}
          {item.source === "synced" && (
            <View style={feedStyles.syncedBadge}>
              <Typography style={feedStyles.syncedText}>SYNCED</Typography>
            </View>
          )}
        </View>
      )}

      {/* Activity card body */}
      <Card className="gap-2 rounded-2xl">
        {/* Header row: icon + headline + time */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            className={`h-9 w-9 rounded-full items-center justify-center ${TONE_SOFT_BG[meta.tone]}`}
          >
            <Icon name={meta.icon} size={17} tone={meta.tone} />
          </View>
          <Typography type="body" style={{ flex: 1, fontSize: 13 }}>
            {item.actor} {item.action}{" "}
            <Typography type="body" weight="semibold" style={{ fontSize: 13 }}>
              {item.noun}
            </Typography>
          </Typography>
          <Typography type="body-xs" color="muted">
            {item.time}
          </Typography>
        </View>

        {/* Title + description */}
        <View style={{ gap: 2 }}>
          <Typography type="body-sm" weight="semibold">
            {item.title}
          </Typography>
          {item.desc ? (
            <Typography type="body-sm" color="muted" numberOfLines={2}>
              {item.desc}
            </Typography>
          ) : null}
        </View>
      </Card>
    </View>
  );
}

const feedStyles = StyleSheet.create({
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
    marginLeft: 4,
  },
  contactPill: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#f0f0f0",
  },
  syncedText: {
    fontSize: 9,
    fontWeight: "700",
    color: TONE_HEX.muted,
    letterSpacing: 0.5,
  },
});

/* ------------------------------------------------------------------ *
 * Main screen
 * ------------------------------------------------------------------ */

export default function ActivityTab(): JSX.Element {
  const [activities, setActivities] = useState<FeedActivity[]>(FEED_ACTIVITIES);
  const [showPicker, setShowPicker] = useState(false);
  const [formKind, setFormKind] = useState<ActivityFormKind | null>(null);
  const [showTask, setShowTask] = useState(false);

  /** Group activities by dateGroup, preserving insertion order. */
  const sections = useMemo(() => {
    const map = new Map<string, FeedActivity[]>();
    for (const item of activities) {
      const key = item.dateGroup;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  }, [activities]);

  const handlePickerSelect = (kind: CreateActivityKind) => {
    setShowPicker(false);
    if (kind === "task") {
      setShowTask(true);
    } else {
      setFormKind(kind as ActivityFormKind);
    }
  };

  const handleFormSave = (activity: FeedActivity) => {
    setActivities((prev) => [activity, ...prev]);
    setFormKind(null);
    setShowTask(false);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View style={screenStyles.header}>
        <Typography className="text-2xl" weight="bold">
          Activity
        </Typography>
        <Pressable style={screenStyles.headerBtn} hitSlop={8}>
          <Icon name="filter" size="md" tone="muted" />
        </Pressable>
      </View>

      {/* Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenStyles.feedContent}
      >
        {sections.map(({ date, items }) => (
          <View key={date} style={screenStyles.section}>
            {/* Date section header */}
            <Typography style={screenStyles.sectionLabel}>
              {date}
            </Typography>

            {/* Activity cards */}
            <View style={screenStyles.cardStack}>
              {items.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB — floats above the tab bar */}
      <Pressable
        onPress={() => setShowPicker(true)}
        style={screenStyles.fab}
      >
        <Icon name="add" size={28} color="#ffffff" />
      </Pressable>

      {/* Sheets */}
      <CreateActivitySheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
      />
      <ActivityFormSheet
        kind={formKind}
        visible={formKind !== null}
        onClose={() => setFormKind(null)}
        onSave={handleFormSave}
      />
      <CreateTaskSheet
        visible={showTask}
        onClose={() => setShowTask(false)}
        onSave={handleFormSave}
      />
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const screenStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100, // room for FAB
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TONE_HEX.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 12,
    marginLeft: 4,
  },
  cardStack: {
    gap: 10,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TONE_HEX.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});
