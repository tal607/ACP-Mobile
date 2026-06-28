import { Typography } from "heroui-native";
import { useMemo, useState, type JSX } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TONE_HEX } from "@/theme/tokens";
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
import { ActivityCard, FeedDateSep, type Activity } from "@/components/ActivityCard";
import { Icon } from "@/components/ui/Icon";

/* ------------------------------------------------------------------ *
 * Main screen
 * ------------------------------------------------------------------ */

export default function ActivityTab(): JSX.Element {
  const [activities, setActivities] = useState<FeedActivity[]>(FEED_ACTIVITIES);
  const [showPicker, setShowPicker] = useState(false);

  // Form sheet state
  const [formKind, setFormKind] = useState<ActivityFormKind | null>(null);
  const [formInitial, setFormInitial] = useState<Activity | null>(null);
  const [formReadOnly, setFormReadOnly] = useState(false);

  // Task sheet state
  const [showTask, setShowTask] = useState(false);
  const [taskInitial, setTaskInitial] = useState<Activity | null>(null);

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
      setTaskInitial(null);
      setShowTask(true);
    } else {
      setFormInitial(null);
      setFormReadOnly(false);
      setFormKind(kind as ActivityFormKind);
    }
  };

  const openActivityDetail = (item: FeedActivity) => {
    if (item.kind === "task") {
      setTaskInitial(item);
      setShowTask(true);
    } else if (item.kind === "synced-meeting") {
      setFormInitial(item);
      setFormReadOnly(true);
      setFormKind("meeting");
    } else if (item.kind === "synced-email") {
      setFormInitial(item);
      setFormReadOnly(true);
      setFormKind("email");
    } else {
      setFormInitial(item);
      setFormReadOnly(false);
      setFormKind(item.kind as ActivityFormKind);
    }
  };

  const handleFormSave = (activity: FeedActivity) => {
    const isEdit = activities.some((a) => a.id === activity.id);
    if (isEdit) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? { ...a, ...activity } : a))
      );
    } else {
      setActivities((prev) => [activity, ...prev]);
    }
    setFormKind(null);
    setFormInitial(null);
    setFormReadOnly(false);
    setShowTask(false);
    setTaskInitial(null);
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setFormKind(null);
    setFormInitial(null);
    setShowTask(false);
    setTaskInitial(null);
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
            <FeedDateSep label={date} />
            <View style={{ position: "relative" }}>
              <View style={screenStyles.spine} />
              {items.map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  contactName={item.contactName}
                  source={item.source}
                  onPress={() => openActivityDetail(item)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
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
        onClose={() => { setFormKind(null); setFormInitial(null); setFormReadOnly(false); }}
        onSave={handleFormSave}
        onDelete={handleDelete}
        initialActivity={formInitial ?? undefined}
        readOnly={formReadOnly}
      />
      <CreateTaskSheet
        visible={showTask}
        onClose={() => { setShowTask(false); setTaskInitial(null); }}
        onSave={handleFormSave}
        onDelete={handleDelete}
        initialActivity={taskInitial ?? undefined}
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
  },
  spine: {
    position: "absolute",
    left: 11,
    top: 10,
    bottom: 10,
    width: 1,
    backgroundColor: "#ebebeb",
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
