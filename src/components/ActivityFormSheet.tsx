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
import { ACTIVITY, TONE_HEX, TONE_SOFT_BG } from "@/theme/tokens";
import { CONTACTS, type ContactDetailData } from "@/data/contacts";
import type { FeedActivity } from "@/data/activities";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";

/* ------------------------------------------------------------------ *
 * Types & config
 * ------------------------------------------------------------------ */

export type ActivityFormKind = "note" | "call" | "meeting" | "email";

const KIND_CONFIG: Record<ActivityFormKind, {
  label: string;
  subjectPlaceholder: string;
  bodyPlaceholder: string;
  actionWord: string;
  noun: string;
}> = {
  note: {
    label: "Note",
    subjectPlaceholder: "Type subject",
    bodyPlaceholder: "Write something about this note",
    actionWord: "added a",
    noun: "Note",
  },
  call: {
    label: "Call",
    subjectPlaceholder: "Type subject",
    bodyPlaceholder: "Write something about this call",
    actionWord: "logged a",
    noun: "Call",
  },
  meeting: {
    label: "Meeting",
    subjectPlaceholder: "Meeting title",
    bodyPlaceholder: "Write something about this meeting",
    actionWord: "logged a",
    noun: "Meeting",
  },
  email: {
    label: "Logged Email",
    subjectPlaceholder: "Type subject",
    bodyPlaceholder: "Write something about this logged email",
    actionWord: "logged an",
    noun: "Email",
  },
};

/* ------------------------------------------------------------------ *
 * Sub-components
 * ------------------------------------------------------------------ */

/** A static non-interactive pill chip for the bottom metadata row. */
function MetaChip({ label, icon }: { label: string; icon?: string }): JSX.Element {
  return (
    <View style={chipStyles.chip}>
      {icon ? (
        <Icon name={icon as never} size="sm" tone="muted" />
      ) : null}
      <Typography style={chipStyles.label}>{label}</Typography>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  label: {
    fontSize: 12,
    color: TONE_HEX.muted,
  },
  activeChip: {
    borderColor: TONE_HEX.accent,
    backgroundColor: `${TONE_HEX.accent}0d`,
  },
  activeLabel: {
    color: TONE_HEX.accent,
  },
});

/* ------------------------------------------------------------------ *
 * Contact picker overlay (shown inline when picking a contact)
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
    <View style={pickerStyles.container}>
      {/* Header */}
      <View style={pickerStyles.header}>
        <Pressable onPress={onClose} hitSlop={12} style={pickerStyles.backBtn}>
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>
        <Typography weight="semibold" style={{ fontSize: 15, flex: 1 }}>
          Select Contact
        </Typography>
      </View>

      {/* Search */}
      <View style={pickerStyles.searchRow}>
        <Icon name="search" size="sm" tone="muted" />
        <TextInput
          style={pickerStyles.searchInput}
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

      {/* Contact list */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filtered.map((contact, i) => (
          <View key={contact.id}>
            {i > 0 && <View style={pickerStyles.hairline} />}
            <Pressable onPress={() => onSelect(contact)} style={pickerStyles.contactRow}>
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

const pickerStyles = StyleSheet.create({
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
 * Main ActivityFormSheet
 * ------------------------------------------------------------------ */

export function ActivityFormSheet({
  kind,
  visible,
  onClose,
  onSave,
  defaultContact,
}: {
  kind: ActivityFormKind | null;
  visible: boolean;
  onClose: () => void;
  onSave: (activity: FeedActivity) => void;
  defaultContact?: ContactDetailData;
}): JSX.Element | null {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactDetailData | null>(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [followUp, setFollowUp] = useState(false);

  // Reset state every time the sheet opens; pre-fill defaultContact if provided
  useEffect(() => {
    if (visible) {
      setSubject("");
      setBody("");
      setSelectedContact(defaultContact ?? null);
      setShowContactPicker(false);
      setFollowUp(false);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!kind) return null;

  const config = KIND_CONFIG[kind];
  const meta = ACTIVITY[kind];

  const handleSave = () => {
    const activity: FeedActivity = {
      id: `form-${Date.now()}`,
      kind,
      source: "manual",
      actor: "Tal",
      action: config.actionWord,
      noun: config.noun,
      time: "Just now",
      title: subject.trim() || `New ${config.noun}`,
      desc: body.trim(),
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
              <View style={styles.headerLeft}>
                <View
                  className={`h-7 w-7 rounded-full items-center justify-center ${TONE_SOFT_BG[meta.tone]}`}
                >
                  <Icon name={meta.icon} size={14} tone={meta.tone} />
                </View>
                <Typography weight="semibold" style={{ fontSize: 16 }}>
                  {config.label}
                </Typography>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
                <Icon name="close" size="md" tone="muted" />
              </Pressable>
            </View>

            {/* Form body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 380 }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {/* Subject input */}
              <TextInput
                style={styles.subjectInput}
                placeholder={config.subjectPlaceholder}
                placeholderTextColor={TONE_HEX.muted}
                value={subject}
                onChangeText={setSubject}
                returnKeyType="next"
                autoCapitalize="sentences"
              />

              <View style={styles.divider} />

              {/* Body input */}
              <TextInput
                style={styles.bodyInput}
                placeholder={config.bodyPlaceholder}
                placeholderTextColor={TONE_HEX.muted}
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </ScrollView>

            <View style={styles.divider} />

            {/* Bottom metadata chips row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <MetaChip icon="meeting" label="Today" />
              <MetaChip icon="person" label="Assigned to you" />

              {/* Contact chip — locked when defaultContact provided, interactive otherwise */}
              <Pressable
                onPress={() => !defaultContact && setShowContactPicker(true)}
                style={[chipStyles.chip, selectedContact ? chipStyles.activeChip : null]}
              >
                <Icon name="person" size="sm" tone={selectedContact ? "accent" : "muted"} />
                <Typography
                  style={[chipStyles.label, selectedContact ? chipStyles.activeLabel : null]}
                  numberOfLines={1}
                >
                  {selectedContact ? selectedContact.name : "Add contact"}
                </Typography>
                {selectedContact && !defaultContact ? (
                  <Pressable
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedContact(null);
                    }}
                  >
                    <Icon name="close" size={12} tone="accent" />
                  </Pressable>
                ) : null}
              </Pressable>

              {/* Follow-up chip — toggleable */}
              <Pressable
                onPress={() => setFollowUp(!followUp)}
                style={[chipStyles.chip, followUp ? chipStyles.activeChip : null]}
              >
                <Icon name="flag" size="sm" tone={followUp ? "accent" : "muted"} />
                <Typography
                  style={[chipStyles.label, followUp ? chipStyles.activeLabel : null]}
                >
                  Follow-up
                </Typography>
              </Pressable>

              <MetaChip label="Priority" />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Typography style={{ fontWeight: "500", color: TONE_HEX.foreground, fontSize: 15 }}>
                  Cancel
                </Typography>
              </Pressable>
              <Pressable onPress={handleSave} style={styles.saveBtn}>
                <Typography style={{ fontWeight: "600", color: "#ffffff", fontSize: 15 }}>
                  Save
                </Typography>
              </Pressable>
            </View>

            {/* Contact picker overlay — sits on top of the sheet */}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  subjectInput: {
    fontSize: 16,
    fontWeight: "600",
    color: TONE_HEX.foreground,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e4e4e7",
  },
  bodyInput: {
    fontSize: 14,
    color: TONE_HEX.foreground,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 120,
    lineHeight: 22,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
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
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: TONE_HEX.accent,
    alignItems: "center",
  },
});
