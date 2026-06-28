import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ACTIVITY, TONE_HEX, TONE_SOFT_BG } from "@/theme/tokens";
import { Icon } from "./ui/Icon";
import type { Activity } from "./ActivityCard";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const KIND_LABEL: Partial<Record<string, string>> = {
  note: "Note",
  call: "Call",
  meeting: "Meeting",
  email: "Email",
  task: "Task",
  "synced-meeting": "Meeting (synced)",
  "synced-email": "Email (synced)",
};

/* Small icon + label property row */
function PropRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}): JSX.Element {
  return (
    <View style={styles.propRow}>
      <Icon name={icon as never} size={14} tone="muted" />
      <Text style={styles.propLabel}>{label}</Text>
      <Text style={styles.propValue}>{value}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * ActivityDetailSheet
 * ------------------------------------------------------------------ */

export type ActivityDetailSheetProps = {
  activity: Activity | null;
  visible: boolean;
  onClose: () => void;
  onSave?: (updated: Activity) => void;
};

export function ActivityDetailSheet({
  activity,
  visible,
  onClose,
  onSave,
}: ActivityDetailSheetProps): JSX.Element {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const titleRef = useRef<TextInput>(null);

  /* Sync state when activity changes */
  useEffect(() => {
    if (activity) {
      setTitle(activity.title ?? "");
      setBody(activity.desc ?? "");
    }
  }, [activity]);

  const isDirty =
    activity !== null &&
    (title.trim() !== (activity.title ?? "") ||
      body.trim() !== (activity.desc ?? ""));

  const handleSave = () => {
    if (!activity || !isDirty) return;
    onSave?.({ ...activity, title: title.trim(), desc: body.trim() });
    onClose();
  };

  if (!activity) return <></>;

  const meta = ACTIVITY[activity.kind];
  const kindLabel = KIND_LABEL[activity.kind] ?? activity.noun;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      onShow={() => {
        /* small delay so animation completes before focus */
        setTimeout(() => titleRef.current?.focus(), 120);
      }}
    >
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Drag handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Nav bar */}
        <View style={styles.nav}>
          <Pressable onPress={onClose} style={styles.navClose} hitSlop={8}>
            <Icon name="close" size={18} tone="muted" />
          </Pressable>

          {/* Kind badge */}
          <View style={[styles.kindBadge, { backgroundColor: `${TONE_HEX[meta.tone]}18` }]}>
            <Icon name={meta.icon as never} size={12} tone={meta.tone} />
            <Text style={[styles.kindLabel, { color: TONE_HEX[meta.tone] }]}>
              {kindLabel}
            </Text>
          </View>

          {/* Save — only visible when dirty */}
          {isDirty ? (
            <Pressable onPress={handleSave} style={styles.saveBtn} hitSlop={8}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          ) : (
            <View style={styles.navClose} />
          )}
        </View>

        <View style={styles.divider} />

        {/* Scrollable body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Untitled"
            placeholderTextColor={TONE_HEX.muted}
            style={styles.titleInput}
            multiline
            scrollEnabled={false}
          />

          {/* Property rows */}
          <View style={styles.propSection}>
            <PropRow icon="time" label="Date" value={activity.time} />
            <PropRow icon="person" label="Logged by" value={activity.actor} />
          </View>

          <View style={styles.divider} />

          {/* Body / description */}
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Add notes…"
            placeholderTextColor={TONE_HEX.muted}
            style={styles.bodyInput}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    minHeight: "82%",
    maxHeight: "92%",
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  kindBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  kindLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: TONE_HEX.accent,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
    marginHorizontal: 0,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    color: TONE_HEX.foreground,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    lineHeight: 30,
  },
  propSection: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 10,
  },
  propRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  propLabel: {
    fontSize: 13,
    color: TONE_HEX.muted,
    width: 76,
  },
  propValue: {
    fontSize: 13,
    color: TONE_HEX.foreground,
    fontWeight: "500",
    flex: 1,
  },
  bodyInput: {
    fontSize: 15,
    color: TONE_HEX.foreground,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingTop: 16,
    minHeight: 140,
  },
});
