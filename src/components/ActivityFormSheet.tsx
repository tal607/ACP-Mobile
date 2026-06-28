import { useEffect, useRef, useState, type JSX } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Chip, Typography } from "heroui-native";
import { ScopedTheme } from "uniwind";
import { ACTIVITY, TONE_HEX } from "@/theme/tokens";
import { CONTACTS, type ContactDetailData } from "@/data/contacts";
import type { FeedActivity } from "@/data/activities";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";
import type { Activity } from "./ActivityCard";

/* ------------------------------------------------------------------ *
 * Types & config
 * ------------------------------------------------------------------ */

export type ActivityFormKind = "note" | "call" | "meeting" | "email";

const KIND_CONFIG: Record<
  ActivityFormKind,
  {
    label: string;
    titlePlaceholder: string;
    bodyPlaceholder: string;
    actionWord: string;
    noun: string;
    mockTranscription: string;
  }
> = {
  note: {
    label: "Note",
    titlePlaceholder: "Untitled note...",
    bodyPlaceholder: "Write your note...",
    actionWord: "added a",
    noun: "Note",
    mockTranscription:
      "Checked in on recent activity. They mentioned renewed interest in the growth fund — worth a follow-up next week.",
  },
  call: {
    label: "Log call",
    titlePlaceholder: "Untitled call...",
    bodyPlaceholder: "What happened on this call...",
    actionWord: "logged a",
    noun: "Call",
    mockTranscription:
      "Quick check-in call. Discussed timeline and next steps. They want the full deck before the end of the week.",
  },
  meeting: {
    label: "Log meeting",
    titlePlaceholder: "Untitled meeting...",
    bodyPlaceholder: "What happened in this meeting...",
    actionWord: "logged a",
    noun: "Meeting",
    mockTranscription:
      "Good meeting — covered Q3 numbers and pipeline. Strong interest in the new fund. Need to schedule a follow-up.",
  },
  email: {
    label: "Log email",
    titlePlaceholder: "Untitled email...",
    bodyPlaceholder: "What was this email about...",
    actionWord: "logged an",
    noun: "Email",
    mockTranscription:
      "Followed up on the previous thread regarding investment terms. Waiting on their response by end of week.",
  },
};

const DATE_OPTIONS = ["Today", "Yesterday", "2 days ago", "This week"];

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ *
 * Sub-components
 * ------------------------------------------------------------------ */

/** Single property row — icon · label · value */
function PropRow({
  icon,
  label,
  children,
  onPress,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  onPress?: () => void;
}): JSX.Element {
  return (
    <Pressable onPress={onPress} style={propStyles.row} hitSlop={{ top: 2, bottom: 2 }}>
      <View style={propStyles.iconWrap}>
        <Icon name={icon as never} size={15} tone="muted" />
      </View>
      <Typography style={propStyles.label}>{label}</Typography>
      <View style={propStyles.valueWrap}>{children}</View>
    </Pressable>
  );
}

/** Slim badge using HeroUI Chip soft variant */
function PropChip({
  label,
  color = "accent",
}: {
  label: string;
  color?: "accent" | "success" | "warning" | "danger" | "default";
}): JSX.Element {
  return (
    <Chip size="sm" variant="soft" color={color}>
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}

const propStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 42,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  iconWrap: { width: 22, alignItems: "center" },
  label: { fontSize: 13, color: TONE_HEX.muted, width: 100, paddingLeft: 8 },
  valueWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  valueText: { fontSize: 13, color: TONE_HEX.foreground },
  mutedText: { fontSize: 13, color: TONE_HEX.muted },
});

/** Waveform animation bars */
function Waveform({ heights }: { heights: number[] }): JSX.Element {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2, flex: 1 }}>
      {heights.map((h, i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: h,
            backgroundColor: "#ef4444",
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Contact picker overlay
 * ------------------------------------------------------------------ */

function ContactPickerOverlay({
  selected,
  onSelect,
  onClose,
}: {
  selected: ContactDetailData | null;
  onSelect: (c: ContactDetailData) => void;
  onClose: () => void;
}): JSX.Element {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? CONTACTS.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.company ?? "").toLowerCase().includes(query.toLowerCase()),
      )
    : CONTACTS;

  return (
    <View style={cpStyles.container}>
      <View style={cpStyles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={cpStyles.backBtn}>
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>
        <Typography weight="semibold" style={{ fontSize: 15, flex: 1 }}>
          Select Contact
        </Typography>
      </View>
      <View style={cpStyles.searchRow}>
        <Icon name="search" size="sm" tone="muted" />
        <TextInput
          style={cpStyles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={TONE_HEX.muted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Icon name="close" size="sm" tone="muted" />
          </Pressable>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.map((contact, i) => (
          <View key={contact.id}>
            {i > 0 && <View style={cpStyles.hairline} />}
            <Pressable onPress={() => onSelect(contact)} style={cpStyles.row}>
              <InitialsAvatar initials={contact.initials} size="sm" />
              <View style={{ flex: 1 }}>
                <Typography type="body-sm" weight="semibold">{contact.name}</Typography>
                {contact.company ? (
                  <Typography type="body-xs" color="muted">{contact.company}</Typography>
                ) : null}
              </View>
              {selected?.id === contact.id && (
                <Icon name="check" size="sm" tone="accent" />
              )}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e7",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  searchInput: { flex: 1, fontSize: 14, color: TONE_HEX.foreground },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7", marginLeft: 60 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
});

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export function ActivityFormSheet({
  kind,
  visible,
  onClose,
  onSave,
  onDelete,
  defaultContact,
  initialActivity,
  readOnly,
}: {
  kind: ActivityFormKind | null;
  visible: boolean;
  onClose: () => void;
  onSave: (activity: FeedActivity) => void;
  onDelete?: (id: string) => void;
  defaultContact?: ContactDetailData;
  initialActivity?: Activity;
  readOnly?: boolean;
}): JSX.Element | null {
  const titleRef = useRef<TextInput>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactDetailData | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(14).fill(6));

  const isEditMode = !!initialActivity && !readOnly;
  const isViewMode = !!initialActivity && !!readOnly;

  // Reset / pre-fill state when the sheet opens
  useEffect(() => {
    if (visible) {
      if (initialActivity) {
        setTitle(initialActivity.title ?? "");
        setBody(initialActivity.desc ?? "");
        setSelectedDate(initialActivity.time);
      } else {
        setTitle("");
        setBody("");
        setSelectedDate("Today");
      }
      setSelectedContact(defaultContact ?? null);
      setShowContactPicker(false);
      setFollowUp(false);
      setDatePickerOpen(false);
      setIsRecording(false);
      setRecordingSecs(0);
      setWaveHeights(Array(14).fill(6));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recording timer + waveform animation
  useEffect(() => {
    if (!isRecording) {
      setWaveHeights(Array(14).fill(6));
      return;
    }
    const timer = setInterval(() => setRecordingSecs((s) => s + 1), 1000);
    const wave = setInterval(() => {
      setWaveHeights(Array.from({ length: 14 }, () => Math.random() * 14 + 4));
    }, 120);
    return () => {
      clearInterval(timer);
      clearInterval(wave);
    };
  }, [isRecording]);

  if (!kind) return null;

  const config = KIND_CONFIG[kind];
  const meta = ACTIVITY[kind];

  const handleSave = () => {
    const activity: FeedActivity = {
      id: initialActivity?.id ?? `form-${Date.now()}`,
      kind,
      source: "manual",
      actor: "Tal",
      action: config.actionWord,
      noun: config.noun,
      time: isEditMode ? selectedDate : "Just now",
      title: title.trim() || config.noun,
      desc: body.trim(),
      contactId: selectedContact?.id,
      contactName: selectedContact?.name,
      dateGroup: (initialActivity as FeedActivity | undefined)?.dateGroup ?? "Today",
    };
    onSave(activity);
  };

  const handleDelete = () => {
    if (initialActivity) {
      onDelete?.(initialActivity.id);
      onClose();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingSecs(0);
    setBody((prev) => (prev ? `${prev}\n\n${config.mockTranscription}` : config.mockTranscription));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => titleRef.current?.focus()}
    >
      <ScopedTheme theme="light">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Nav bar */}
            <View style={styles.nav}>
              <Pressable onPress={onClose} hitSlop={12} style={styles.navCloseBtn}>
                <Icon name="close" size="md" tone="muted" />
              </Pressable>

              <View style={styles.navCenter}>
                <View
                  style={[
                    styles.kindIcon,
                    { backgroundColor: `${TONE_HEX[meta.tone]}18` },
                  ]}
                >
                  <Icon name={meta.icon} size={13} tone={meta.tone} />
                </View>
                <Typography style={styles.navTitle}>
                  {isViewMode ? `${config.label} · Synced` : config.label}
                </Typography>
              </View>

              <View style={styles.navRight}>
                {isEditMode && (
                  <Pressable onPress={handleDelete} hitSlop={12} style={styles.trashBtn}>
                    <Icon name="trash" size="md" tone="danger" />
                  </Pressable>
                )}
                {!isViewMode && (
                  <Pressable onPress={handleSave} hitSlop={12}>
                    <Typography style={styles.navSaveBtn}>Save</Typography>
                  </Pressable>
                )}
                {isViewMode && (
                  <View style={styles.syncedBadge}>
                    <Typography style={styles.syncedText}>View only</Typography>
                  </View>
                )}
              </View>
            </View>

            {/* Document title input */}
            <TextInput
              ref={titleRef}
              style={[styles.titleInput, isViewMode && styles.titleInputReadOnly]}
              placeholder={config.titlePlaceholder}
              placeholderTextColor="#c0c0c0"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              autoCapitalize="sentences"
              autoFocus={!isViewMode}
              editable={!isViewMode}
            />

            {/* Property rows */}
            <View>
              {/* Date */}
              <PropRow
                icon="meeting"
                label="Date"
                onPress={isViewMode ? undefined : () => setDatePickerOpen((o) => !o)}
              >
                <PropChip label={selectedDate} color="success" />
              </PropRow>

              {datePickerOpen && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateChips}
                  style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e4e4e7" }}
                >
                  {DATE_OPTIONS.map((opt) => {
                    const active = opt === selectedDate;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => { setSelectedDate(opt); setDatePickerOpen(false); }}
                        style={[styles.dateChip, active && styles.dateChipActive]}
                      >
                        <Typography
                          style={[styles.dateChipLabel, active && styles.dateChipLabelActive]}
                        >
                          {opt}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Related to */}
              <PropRow
                icon="person"
                label="Related to"
                onPress={isViewMode ? undefined : () => !defaultContact && setShowContactPicker(true)}
              >
                {selectedContact ? (
                  <PropChip label={selectedContact.name} />
                ) : (
                  <Typography style={propStyles.mutedText}>Add contact...</Typography>
                )}
              </PropRow>

              {/* Follow-up */}
              <PropRow
                icon="flag"
                label="Follow-up"
                onPress={isViewMode ? undefined : () => setFollowUp((f) => !f)}
              >
                {followUp ? (
                  <PropChip label="On" />
                ) : (
                  <Typography style={propStyles.mutedText}>Off</Typography>
                )}
              </PropRow>
            </View>

            {/* Body textarea */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.bodyScroll}
            >
              <TextInput
                style={styles.bodyInput}
                placeholder={config.bodyPlaceholder}
                placeholderTextColor="#c0c0c0"
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
                editable={!isViewMode}
              />
            </ScrollView>

            {/* Toolbar / recording bar — hidden in view-only mode */}
            {isViewMode ? null : isRecording ? (
              <View style={styles.recordingBar}>
                <View style={styles.recDot} />
                <Typography style={styles.recTime}>{fmtTime(recordingSecs)}</Typography>
                <Waveform heights={waveHeights} />
                <Pressable onPress={stopRecording} hitSlop={8}>
                  <Typography style={styles.recDone}>Done</Typography>
                </Pressable>
              </View>
            ) : (
              <View style={styles.toolbar}>
                <Pressable
                  onPress={() => { setIsRecording(true); setRecordingSecs(0); }}
                  style={styles.micBtn}
                  hitSlop={8}
                >
                  <Icon name="mic" size="md" tone="muted" />
                </Pressable>
              </View>
            )}

            {/* Contact picker overlay */}
            {showContactPicker && (
              <ContactPickerOverlay
                selected={selectedContact}
                onSelect={(c) => {
                  setSelectedContact(c);
                  setShowContactPicker(false);
                }}
                onClose={() => setShowContactPicker(false)}
              />
            )}
          </View>
        </KeyboardAvoidingView>
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
    minHeight: "82%",
    maxHeight: "92%",
    overflow: "hidden",
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

  // Nav bar
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e4e4e7",
  },
  navCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f3f3f3",
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  kindIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 14, fontWeight: "600", color: TONE_HEX.foreground },
  navSaveBtn: { fontSize: 14, fontWeight: "600", color: TONE_HEX.accent },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  trashBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  syncedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "#f5f5f5",
  },
  syncedText: {
    fontSize: 12,
    color: TONE_HEX.muted,
    fontWeight: "500",
  },

  // Title input
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    color: TONE_HEX.foreground,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    lineHeight: 28,
  },
  titleInputReadOnly: {
    color: TONE_HEX.foreground,
  },

  // Date chips (inline picker)
  dateChips: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "#f5f5f5",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  dateChipActive: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  dateChipLabel: { fontSize: 13, color: TONE_HEX.foreground },
  dateChipLabelActive: { color: "#15803d", fontWeight: "500" },

  // Body
  bodyScroll: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
    flex: 1,
    minHeight: 120,
  },
  bodyInput: {
    fontSize: 15,
    color: TONE_HEX.foreground,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    lineHeight: 23,
    minHeight: 100,
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  // Recording bar
  recordingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
    backgroundColor: "#fff5f5",
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  recTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
    minWidth: 34,
  },
  recDone: {
    fontSize: 14,
    fontWeight: "600",
    color: TONE_HEX.accent,
  },
});
