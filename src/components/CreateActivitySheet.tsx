import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ScopedTheme } from "uniwind";
import { ACTIVITY, TONE_SOFT_BG } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type CreateActivityKind = "email" | "call" | "meeting" | "note" | "task";

type TypeConfig = {
  kind: CreateActivityKind;
  label: string;
  subLabel: string;
};

const ACTIVITY_TYPES: TypeConfig[] = [
  { kind: "email",   label: "Log Email",    subLabel: "Record a sent or received email" },
  { kind: "call",    label: "Log Call",     subLabel: "Record a phone or video call" },
  { kind: "meeting", label: "Log Meeting",  subLabel: "Record a meeting or conversation" },
  { kind: "note",    label: "Create Note",  subLabel: "Add a note about a contact or deal" },
  { kind: "task",    label: "Create Task",  subLabel: "Add a task with a due date" },
];

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function CreateActivitySheet({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (kind: CreateActivityKind) => void;
}): JSX.Element {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Typography weight="semibold" style={{ fontSize: 16 }}>
                New Activity
              </Typography>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                <Icon name="close" size="md" tone="muted" />
              </Pressable>
            </View>

            {/* Type rows */}
            <View style={styles.list}>
              {ACTIVITY_TYPES.map((type, i) => {
                const meta = ACTIVITY[type.kind];
                return (
                  <View key={type.kind}>
                    {i > 0 && <View style={styles.divider} />}
                    <Pressable
                      onPress={() => onSelect(type.kind)}
                      style={styles.row}
                    >
                      {/* Icon circle — uses the same soft-bg system as ActivityCard */}
                      <View
                        className={`h-10 w-10 rounded-full items-center justify-center ${TONE_SOFT_BG[meta.tone]}`}
                      >
                        <Icon name={meta.icon} size={20} tone={meta.tone} />
                      </View>

                      {/* Labels */}
                      <View style={styles.rowText}>
                        <Typography weight="semibold" style={{ fontSize: 15 }}>
                          {type.label}
                        </Typography>
                        <Typography type="body-sm" color="muted">
                          {type.subLabel}
                        </Typography>
                      </View>

                      <Icon name="chevron" size="sm" tone="muted" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScopedTheme>
    </Modal>
  );
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#e4e4e7",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e7",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
    marginLeft: 74,
  },
});
