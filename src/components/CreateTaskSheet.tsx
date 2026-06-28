import { Typography } from "heroui-native";
import { useEffect, useState, type JSX } from "react";
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
import { ScopedTheme } from "uniwind";
import { TONE_HEX } from "@/theme/tokens";
import { CONTACTS, type ContactDetailData } from "@/data/contacts";
import type { FeedActivity } from "@/data/activities";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";

/* ------------------------------------------------------------------ *
 * Picker options
 * ------------------------------------------------------------------ */

const DATE_OPTIONS = [
  "Today, Jun 28",
  "Tomorrow, Jun 29",
  "This Friday, Jun 30",
  "Next Monday, Jul 7",
  "Next Week",
];

const TIME_OPTIONS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM",
];

const PRIORITY_OPTIONS = ["None", "Low", "Medium", "High"];

/* ------------------------------------------------------------------ *
 * Inline dropdown component
 * ------------------------------------------------------------------ */

function InlineDropdown({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}): JSX.Element {
  return (
    <View style={dropStyles.container}>
      {options.map((opt, i) => (
        <View key={opt}>
          {i > 0 && <View style={dropStyles.hairline} />}
          <Pressable
            onPress={() => onSelect(opt)}
            style={dropStyles.row}
          >
            <View style={[dropStyles.radio, opt === selected && dropStyles.radioActive]}>
              {opt === selected && <View style={dropStyles.radioDot} />}
            </View>
            <Typography
              type="body-sm"
              style={opt === selected ? { color: TONE_HEX.accent, fontWeight: "600" } : undefined}
            >
              {opt}
            </Typography>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const dropStyles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginHorizontal: 0,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    overflow: "hidden",
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
    marginLeft: 44,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: TONE_HEX.accent,
    backgroundColor: `${TONE_HEX.accent}15`,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TONE_HEX.accent,
  },
});

/* ------------------------------------------------------------------ *
 * Field row — label + pressable selector
 * ------------------------------------------------------------------ */

function FieldSelector({
  label,
  value,
  isOpen,
  onToggle,
}: {
  label: string;
  value: string;
  isOpen: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <Pressable onPress={onToggle} style={fieldStyles.selector}>
      <Typography style={fieldStyles.label} numberOfLines={1}>
        {label}
      </Typography>
      <View style={fieldStyles.valueRow}>
        <Typography
          type="body-sm"
          style={{ color: isOpen ? TONE_HEX.accent : TONE_HEX.foreground, fontWeight: "500" }}
          numberOfLines={1}
        >
          {value}
        </Typography>
        <Icon
          name={isOpen ? "chevronUp" : "chevronDown"}
          size="sm"
          tone={isOpen ? "accent" : "muted"}
        />
      </View>
    </Pressable>
  );
}

const fieldStyles = StyleSheet.create({
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    color: TONE_HEX.muted,
    fontWeight: "500",
    flex: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

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
            <Pressable onPress={() => onSelect(contact)} style={cpStyles.contactRow}>
              <InitialsAvatar initials={contact.initials} size="sm" />
              <View style={{ flex: 1 }}>
                <Typography type="body-sm" weight="semibold">
                  {contact.name}
                </Typography>
                {contact.company ? (
                  <Typography type="body-xs" color="muted">
                    {contact.company}
                  </Typography>
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TONE_HEX.foreground,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
    marginLeft: 60,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
});

/* ------------------------------------------------------------------ *
 * Section label
 * ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: string }): JSX.Element {
  return (
    <Typography
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: TONE_HEX.muted,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {children}
    </Typography>
  );
}

/* ------------------------------------------------------------------ *
 * Main CreateTaskSheet
 * ------------------------------------------------------------------ */

export function CreateTaskSheet({
  visible,
  onClose,
  onSave,
  defaultContact,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (activity: FeedActivity) => void;
  defaultContact?: ContactDetailData;
}): JSX.Element {
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("Today, Jun 28");
  const [time, setTime] = useState("08:00 AM");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("None");
  const [selectedContact, setSelectedContact] = useState<ContactDetailData | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);

  // Which inline picker is open: null | "date" | "time" | "priority"
  const [openPicker, setOpenPicker] = useState<"date" | "time" | "priority" | null>(null);

  const toggle = (picker: "date" | "time" | "priority") =>
    setOpenPicker((prev) => (prev === picker ? null : picker));

  // Reset on open; pre-fill defaultContact if provided
  useEffect(() => {
    if (visible) {
      setTaskName("");
      setDueDate("Today, Jun 28");
      setTime("08:00 AM");
      setNotes("");
      setPriority("None");
      setSelectedContact(defaultContact ?? null);
      setShowContactPicker(false);
      setOpenPicker(null);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => {
    if (!taskName.trim()) return;
    const activity: FeedActivity = {
      id: `task-${Date.now()}`,
      kind: "task",
      source: "manual",
      actor: "Tal",
      action: "created a",
      noun: "Task",
      time: "Just now",
      title: taskName.trim(),
      desc: [
        `Due ${dueDate} at ${time}.`,
        priority !== "None" ? `Priority: ${priority}.` : "",
        notes.trim(),
      ]
        .filter(Boolean)
        .join(" "),
      contactId: selectedContact?.id,
      contactName: selectedContact?.name,
      dateGroup: "Today",
    };
    onSave(activity);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Typography weight="semibold" style={{ fontSize: 16 }}>
                Add Task
              </Typography>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                <Icon name="close" size="md" tone="muted" />
              </Pressable>
            </View>

            {/* Form body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.formContent}
            >

              {/* Task name */}
              <SectionLabel>Task Name *</SectionLabel>
              <View style={styles.inputField}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Enter task name"
                  placeholderTextColor={TONE_HEX.muted}
                  value={taskName}
                  onChangeText={setTaskName}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.gap} />

              {/* Due date + Time */}
              <View style={styles.row2}>
                <View style={{ flex: 3 }}>
                  <SectionLabel>Due Date *</SectionLabel>
                  <FieldSelector
                    label=""
                    value={dueDate}
                    isOpen={openPicker === "date"}
                    onToggle={() => toggle("date")}
                  />
                  {openPicker === "date" && (
                    <InlineDropdown
                      options={DATE_OPTIONS}
                      selected={dueDate}
                      onSelect={(v) => { setDueDate(v); setOpenPicker(null); }}
                    />
                  )}
                </View>
                <View style={{ flex: 2 }}>
                  <SectionLabel>Time</SectionLabel>
                  <FieldSelector
                    label=""
                    value={time}
                    isOpen={openPicker === "time"}
                    onToggle={() => toggle("time")}
                  />
                  {openPicker === "time" && (
                    <InlineDropdown
                      options={TIME_OPTIONS}
                      selected={time}
                      onSelect={(v) => { setTime(v); setOpenPicker(null); }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.gap} />

              {/* Notes */}
              <SectionLabel>Notes</SectionLabel>
              <View style={styles.notesField}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes..."
                  placeholderTextColor={TONE_HEX.muted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                />
              </View>

              <View style={styles.gap} />

              {/* Priority */}
              <SectionLabel>Priority</SectionLabel>
              <FieldSelector
                label=""
                value={priority}
                isOpen={openPicker === "priority"}
                onToggle={() => toggle("priority")}
              />
              {openPicker === "priority" && (
                <InlineDropdown
                  options={PRIORITY_OPTIONS}
                  selected={priority}
                  onSelect={(v) => { setPriority(v); setOpenPicker(null); }}
                />
              )}

              <View style={styles.gap} />

              {/* Assigned to — static */}
              <SectionLabel>Assigned To</SectionLabel>
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
                    Tal Yanay
                  </Typography>
                  <Icon name="close" size={12} tone="accent" />
                </View>
              </View>

              <View style={styles.gap} />

              {/* Related contact */}
              <SectionLabel>Related Contact</SectionLabel>
              {selectedContact ? (
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { maxWidth: "80%" }]}>
                    <InitialsAvatar initials={selectedContact.initials} size="sm" />
                    <Typography type="body-sm" style={{ color: TONE_HEX.accent, flex: 1 }} numberOfLines={1}>
                      {selectedContact.name}
                    </Typography>
                    {!defaultContact && (
                      <Pressable
                        hitSlop={8}
                        onPress={() => setSelectedContact(null)}
                      >
                        <Icon name="close" size={12} tone="accent" />
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowContactPicker(true)}
                  style={styles.addContactBtn}
                >
                  <Icon name="addContact" size="sm" tone="accent" />
                  <Typography style={{ color: TONE_HEX.accent, fontSize: 14, fontWeight: "500" }}>
                    Add contact
                  </Typography>
                </Pressable>
              )}

              {/* Bottom spacing */}
              <View style={{ height: 8 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Typography style={{ fontWeight: "500", color: TONE_HEX.foreground, fontSize: 15 }}>
                  Cancel
                </Typography>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                style={[styles.createBtn, !taskName.trim() && styles.createBtnDisabled]}
              >
                <Typography style={{ fontWeight: "600", color: "#ffffff", fontSize: 15 }}>
                  Create
                </Typography>
              </Pressable>
            </View>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
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
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  gap: {
    height: 20,
  },
  inputField: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  nameInput: {
    fontSize: 15,
    color: TONE_HEX.foreground,
    paddingVertical: 10,
  },
  row2: {
    flexDirection: "row",
    gap: 10,
  },
  notesField: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 80,
  },
  notesInput: {
    fontSize: 14,
    color: TONE_HEX.foreground,
    paddingVertical: 10,
    lineHeight: 22,
    minHeight: 60,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: `${TONE_HEX.accent}12`,
    borderWidth: 1,
    borderColor: `${TONE_HEX.accent}30`,
  },
  addContactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e4e4e7",
    alignItems: "center",
  },
  createBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: TONE_HEX.accent,
    alignItems: "center",
  },
  createBtnDisabled: {
    opacity: 0.45,
  },
});
