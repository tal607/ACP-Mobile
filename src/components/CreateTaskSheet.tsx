import { Chip, Typography } from "heroui-native";
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
import { ScopedTheme } from "uniwind";
import { TONE_HEX } from "@/theme/tokens";
import { CONTACTS, type ContactDetailData } from "@/data/contacts";
import { STAFF_MEMBERS, CURRENT_USER, type StaffMember } from "@/data/staff";
import type { FeedActivity } from "@/data/activities";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";
import type { Activity } from "./ActivityCard";

/* ------------------------------------------------------------------ *
 * Picker options
 * ------------------------------------------------------------------ */

const DATE_CHIPS = ["Today", "Tomorrow", "This Friday", "Next Monday", "Custom..."];
const TIME_CHIPS = ["08:00 AM", "10:00 AM", "12:00 PM", "02:00 PM", "05:00 PM"];
const REMINDER_CHIPS = ["30 min before", "1 hr before", "1 day before", "Custom..."];

const PRIORITY_OPTIONS: Array<{
  label: string;
  color: string;
  bg: string;
  chipColor: "default" | "success" | "warning" | "danger";
}> = [
  { label: "None",   color: "#8c8c8c", bg: "#f5f5f5", chipColor: "default"  },
  { label: "Low",    color: "#15803d", bg: "#f0fdf4", chipColor: "success"  },
  { label: "Medium", color: "#b45309", bg: "#fffbeb", chipColor: "warning"  },
  { label: "High",   color: "#dc2626", bg: "#fff5f5", chipColor: "danger"   },
];

const fmtTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ *
 * PropRow
 * ------------------------------------------------------------------ */

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

function PropChip({
  label,
  color = "accent",
  onRemove,
}: {
  label: string;
  color?: "accent" | "success" | "warning" | "danger" | "default";
  onRemove?: () => void;
}): JSX.Element {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Chip size="sm" variant="soft" color={color}>
        <Chip.Label>{label}</Chip.Label>
      </Chip>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={6} style={{ marginLeft: 2 }}>
          <Icon name="close" size={11} tone="muted" />
        </Pressable>
      )}
    </View>
  );
}

const propStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 42,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  iconWrap: { width: 22, alignItems: "center" },
  label: { fontSize: 13, color: TONE_HEX.muted, width: 100, paddingLeft: 8 },
  valueWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  mutedText: { fontSize: 13, color: TONE_HEX.muted },
});

/* ------------------------------------------------------------------ *
 * Waveform
 * ------------------------------------------------------------------ */

function Waveform({ heights }: { heights: number[] }): JSX.Element {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2, flex: 1 }}>
      {heights.map((h, i) => (
        <View key={i} style={{ width: 3, height: h, backgroundColor: "#ef4444", borderRadius: 2 }} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Inline chip row + custom date input
 * ------------------------------------------------------------------ */

function InlineChipRow({
  options,
  active,
  activeStyle = "blue",
  onSelect,
}: {
  options: string[];
  active: string;
  activeStyle?: "green" | "blue";
  onSelect: (opt: string) => void;
}): JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={expandStyles.chipRow}
      style={expandStyles.chipScroll}
    >
      {options.map((opt) => {
        const isActive = opt === active;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              expandStyles.chip,
              isActive && (activeStyle === "green" ? expandStyles.chipGreen : expandStyles.chipBlue),
            ]}
          >
            <Typography
              style={[
                expandStyles.chipLabel,
                isActive && (activeStyle === "green"
                  ? { color: "#15803d", fontWeight: "500" }
                  : { color: TONE_HEX.accent, fontWeight: "500" }),
              ]}
            >
              {opt}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function CustomDateInput({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}): JSX.Element {
  return (
    <View style={expandStyles.customDateRow}>
      <Icon name="meeting" size={14} tone="muted" />
      <TextInput
        style={expandStyles.customDateInput}
        placeholder={placeholder ?? "e.g. Jul 15"}
        placeholderTextColor={TONE_HEX.muted}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        autoFocus
      />
      <Pressable onPress={onSubmit} style={expandStyles.customDateDone}>
        <Typography style={{ fontSize: 13, fontWeight: "600", color: TONE_HEX.accent }}>Done</Typography>
      </Pressable>
    </View>
  );
}

const expandStyles = StyleSheet.create({
  chipScroll: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  chipRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "#f5f5f5",
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  chipGreen: { backgroundColor: "#f0fdf4", borderColor: "#86efac" },
  chipBlue: {
    backgroundColor: `${TONE_HEX.accent}10`,
    borderColor: `${TONE_HEX.accent}45`,
  },
  chipLabel: { fontSize: 13, color: TONE_HEX.foreground },
  customDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
    backgroundColor: "#fafafa",
  },
  customDateInput: {
    flex: 1,
    fontSize: 14,
    color: TONE_HEX.foreground,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  customDateDone: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});

/* ------------------------------------------------------------------ *
 * Staff picker (inline chip grid)
 * ------------------------------------------------------------------ */

function StaffChipExpand({
  selected,
  onToggle,
}: {
  selected: StaffMember[];
  onToggle: (s: StaffMember) => void;
}): JSX.Element {
  return (
    <View style={staffStyles.container}>
      {STAFF_MEMBERS.map((s) => {
        const active = selected.some((x) => x.id === s.id);
        return (
          <Pressable
            key={s.id}
            onPress={() => onToggle(s)}
            style={[staffStyles.chip, active && staffStyles.chipActive]}
          >
            <InitialsAvatar initials={s.initials} size="sm" />
            <View>
              <Typography style={[staffStyles.name, active && { color: TONE_HEX.accent }]}>
                {s.name}
              </Typography>
              <Typography style={staffStyles.role}>{s.role}</Typography>
            </View>
            {active && <Icon name="check" size={13} tone="accent" />}
          </Pressable>
        );
      })}
    </View>
  );
}

const staffStyles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    borderWidth: 0.5,
    borderColor: "#e4e4e7",
    minWidth: "45%",
    flex: 1,
  },
  chipActive: {
    backgroundColor: `${TONE_HEX.accent}0d`,
    borderColor: `${TONE_HEX.accent}55`,
  },
  name: { fontSize: 13, fontWeight: "500", color: TONE_HEX.foreground },
  role: { fontSize: 11, color: TONE_HEX.muted },
});

/* ------------------------------------------------------------------ *
 * Associated records overlay (multi-select)
 * ------------------------------------------------------------------ */

function RecordPickerOverlay({
  selected,
  onToggle,
  onClose,
}: {
  selected: ContactDetailData[];
  onToggle: (c: ContactDetailData) => void;
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
          Associated Records
        </Typography>
        <Pressable onPress={onClose} style={cpStyles.doneBtn}>
          <Typography style={cpStyles.doneBtnLabel}>Done</Typography>
        </Pressable>
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
        {filtered.map((contact, i) => {
          const isSelected = selected.some((s) => s.id === contact.id);
          return (
            <View key={contact.id}>
              {i > 0 && <View style={cpStyles.hairline} />}
              <Pressable onPress={() => onToggle(contact)} style={cpStyles.row}>
                <InitialsAvatar initials={contact.initials} size="sm" />
                <View style={{ flex: 1 }}>
                  <Typography type="body-sm" weight="semibold">{contact.name}</Typography>
                  {contact.company ? (
                    <Typography type="body-xs" color="muted">{contact.company}</Typography>
                  ) : null}
                </View>
                {isSelected
                  ? <Icon name="check" size="sm" tone="accent" />
                  : <View style={{ width: 16 }} />
                }
              </Pressable>
            </View>
          );
        })}
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
  doneBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: `${TONE_HEX.accent}15`,
  },
  doneBtnLabel: { fontSize: 13, fontWeight: "600", color: TONE_HEX.accent },
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
 * Main CreateTaskSheet
 * ------------------------------------------------------------------ */

export function CreateTaskSheet({
  visible,
  onClose,
  onSave,
  onDelete,
  defaultContact,
  initialActivity,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (activity: FeedActivity) => void;
  onDelete?: (id: string) => void;
  defaultContact?: ContactDetailData;
  initialActivity?: Activity;
}): JSX.Element {
  const isEditMode = !!initialActivity;
  const taskNameRef = useRef<TextInput>(null);

  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("Today");
  const [customDueDate, setCustomDueDate] = useState("");
  const [showCustomDueDate, setShowCustomDueDate] = useState(false);

  const [time, setTime] = useState<string | null>(null);

  const [reminder, setReminder] = useState<string | null>(null);
  const [customReminder, setCustomReminder] = useState("");
  const [showCustomReminder, setShowCustomReminder] = useState(false);

  const [priority, setPriority] = useState("None");

  const [assignedTo, setAssignedTo] = useState<StaffMember[]>([CURRENT_USER]);

  const [associatedRecords, setAssociatedRecords] = useState<ContactDetailData[]>([]);
  const [showRecordPicker, setShowRecordPicker] = useState(false);

  const [notes, setNotes] = useState("");
  const [openProp, setOpenProp] = useState<
    "date" | "time" | "reminder" | "priority" | "assignedTo" | null
  >(null);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(14).fill(6));

  const toggleProp = (prop: "date" | "time" | "reminder" | "priority" | "assignedTo") => {
    setOpenProp((prev) => (prev === prop ? null : prop));
    setShowCustomDueDate(false);
    setShowCustomReminder(false);
  };

  // Reset / pre-fill on open
  useEffect(() => {
    if (visible) {
      if (initialActivity) {
        setTaskName(initialActivity.title ?? "");
        setNotes(initialActivity.desc ?? "");
      } else {
        setTaskName("");
        setNotes("");
      }
      setDueDate("Today");
      setCustomDueDate("");
      setShowCustomDueDate(false);
      setTime(null);
      setReminder(null);
      setCustomReminder("");
      setShowCustomReminder(false);
      setPriority("None");
      setAssignedTo([CURRENT_USER]);
      setAssociatedRecords(defaultContact ? [defaultContact] : []);
      setShowRecordPicker(false);
      setOpenProp(null);
      setIsRecording(false);
      setRecordingSecs(0);
      setWaveHeights(Array(14).fill(6));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recording timer + waveform
  useEffect(() => {
    if (!isRecording) { setWaveHeights(Array(14).fill(6)); return; }
    const timer = setInterval(() => setRecordingSecs((s) => s + 1), 1000);
    const wave = setInterval(() => {
      setWaveHeights(Array.from({ length: 14 }, () => Math.random() * 14 + 4));
    }, 120);
    return () => { clearInterval(timer); clearInterval(wave); };
  }, [isRecording]);

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingSecs(0);
    const transcript =
      "Prep the investor update deck, share via the portal, and confirm receipt. Priority: send today.";
    setNotes((prev) => (prev ? `${prev}\n\n${transcript}` : transcript));
  };

  const handleCreate = () => {
    if (!taskName.trim()) return;
    const activity: FeedActivity = {
      id: initialActivity?.id ?? `task-${Date.now()}`,
      kind: "task",
      source: "manual",
      actor: "Tal",
      action: "created a",
      noun: "Task",
      time: isEditMode ? (initialActivity?.time ?? "Just now") : "Just now",
      title: taskName.trim(),
      desc: [
        `Due ${dueDate}${time ? ` at ${time}` : ""}.`,
        reminder ? `Reminder: ${reminder}.` : "",
        priority !== "None" ? `Priority: ${priority}.` : "",
        notes.trim(),
      ]
        .filter(Boolean)
        .join(" "),
      contactId: associatedRecords[0]?.id,
      contactName: associatedRecords[0]?.name,
      dateGroup: (initialActivity as FeedActivity | undefined)?.dateGroup ?? "Today",
    };
    onSave(activity);
  };

  const handleDelete = () => {
    if (initialActivity) { onDelete?.(initialActivity.id); onClose(); }
  };

  const handleDateSelect = (opt: string) => {
    if (opt === "Custom...") {
      setShowCustomDueDate(true);
    } else {
      setDueDate(opt);
      setShowCustomDueDate(false);
      setOpenProp(null);
    }
  };

  const commitCustomDueDate = () => {
    if (customDueDate.trim()) setDueDate(customDueDate.trim());
    setShowCustomDueDate(false);
    setOpenProp(null);
    setCustomDueDate("");
  };

  const handleReminderSelect = (opt: string) => {
    if (opt === "Custom...") {
      setShowCustomReminder(true);
    } else {
      setReminder(opt);
      setShowCustomReminder(false);
      setOpenProp(null);
    }
  };

  const commitCustomReminder = () => {
    if (customReminder.trim()) setReminder(customReminder.trim());
    setShowCustomReminder(false);
    setOpenProp(null);
    setCustomReminder("");
  };

  const toggleStaff = (s: StaffMember) => {
    setAssignedTo((prev) =>
      prev.some((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : [...prev, s],
    );
  };

  const toggleRecord = (c: ContactDetailData) => {
    setAssociatedRecords((prev) =>
      prev.some((x) => x.id === c.id)
        ? prev.filter((x) => x.id !== c.id)
        : [...prev, c],
    );
  };

  const priorityConfig =
    PRIORITY_OPTIONS.find((p) => p.label === priority) ?? PRIORITY_OPTIONS[0];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      onShow={() => taskNameRef.current?.focus()}
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
                <View style={styles.taskIcon}>
                  <Icon name="task" size={13} tone="accent" />
                </View>
                <Typography style={styles.navTitle}>
                  {isEditMode ? "Edit task" : "New task"}
                </Typography>
              </View>
              <View style={styles.navRight}>
                {isEditMode && (
                  <Pressable onPress={handleDelete} hitSlop={12} style={styles.trashBtn}>
                    <Icon name="trash" size="md" tone="danger" />
                  </Pressable>
                )}
                <Pressable onPress={handleCreate} hitSlop={12} disabled={!taskName.trim()}>
                  <Typography style={[styles.navCreate, !taskName.trim() && styles.navCreateDisabled]}>
                    Save
                  </Typography>
                </Pressable>
              </View>
            </View>

            {/* Task name input */}
            <TextInput
              ref={taskNameRef}
              style={styles.titleInput}
              placeholder="Task name..."
              placeholderTextColor="#c0c0c0"
              value={taskName}
              onChangeText={setTaskName}
              returnKeyType="next"
              autoCapitalize="sentences"
              autoFocus
            />

            {/* Property rows + notes in scroll */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
            >
              {/* --- DUE DATE --- */}
              <PropRow
                icon="meeting"
                label="Due date"
                onPress={() => toggleProp("date")}
              >
                <PropChip label={dueDate} color="success" />
              </PropRow>

              {openProp === "date" && (
                <>
                  <InlineChipRow
                    options={DATE_CHIPS}
                    active={dueDate}
                    activeStyle="green"
                    onSelect={handleDateSelect}
                  />
                  {showCustomDueDate && (
                    <CustomDateInput
                      value={customDueDate}
                      onChange={setCustomDueDate}
                      onSubmit={commitCustomDueDate}
                      placeholder="e.g. Jul 15"
                    />
                  )}
                </>
              )}

              {/* --- TIME --- */}
              <PropRow
                icon="time"
                label="Time"
                onPress={() => toggleProp("time")}
              >
                {time ? (
                  <PropChip label={time} />
                ) : (
                  <Typography style={propStyles.mutedText}>Add time...</Typography>
                )}
              </PropRow>

              {openProp === "time" && (
                <InlineChipRow
                  options={TIME_CHIPS}
                  active={time ?? ""}
                  activeStyle="blue"
                  onSelect={(opt) => { setTime(opt); setOpenProp(null); }}
                />
              )}

              {/* --- REMINDER --- */}
              <PropRow
                icon="bell"
                label="Reminder"
                onPress={() => toggleProp("reminder")}
              >
                {reminder ? (
                  <PropChip
                    label={reminder}
                    color="default"
                    onRemove={() => setReminder(null)}
                  />
                ) : (
                  <Typography style={propStyles.mutedText}>Set reminder...</Typography>
                )}
              </PropRow>

              {openProp === "reminder" && (
                <>
                  <InlineChipRow
                    options={REMINDER_CHIPS}
                    active={reminder ?? ""}
                    activeStyle="blue"
                    onSelect={handleReminderSelect}
                  />
                  {showCustomReminder && (
                    <CustomDateInput
                      value={customReminder}
                      onChange={setCustomReminder}
                      onSubmit={commitCustomReminder}
                      placeholder="e.g. Jul 14 at 9am"
                    />
                  )}
                </>
              )}

              {/* --- PRIORITY --- */}
              <PropRow
                icon="flag"
                label="Priority"
                onPress={() => toggleProp("priority")}
              >
                <PropChip label={priority} color={priorityConfig.chipColor} />
              </PropRow>

              {openProp === "priority" && (
                <View style={styles.priorityRow}>
                  {PRIORITY_OPTIONS.map((opt) => {
                    const active = opt.label === priority;
                    return (
                      <Pressable
                        key={opt.label}
                        onPress={() => { setPriority(opt.label); setOpenProp(null); }}
                        style={[
                          styles.priorityChip,
                          { backgroundColor: opt.bg, borderColor: `${opt.color}35` },
                          active && { borderColor: opt.color, borderWidth: 1.5 },
                        ]}
                      >
                        <Typography style={[styles.priorityLabel, { color: opt.color }]}>
                          {opt.label}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* --- ASSIGNED TO --- */}
              <PropRow
                icon="person"
                label="Assigned to"
                onPress={() => toggleProp("assignedTo")}
              >
                {assignedTo.length === 0 ? (
                  <Typography style={propStyles.mutedText}>Add staff...</Typography>
                ) : (
                  assignedTo.map((s) => (
                    <PropChip
                      key={s.id}
                      label={s.name.split(" ")[0]}
                      color="default"
                      onRemove={() => toggleStaff(s)}
                    />
                  ))
                )}
              </PropRow>

              {openProp === "assignedTo" && (
                <StaffChipExpand selected={assignedTo} onToggle={toggleStaff} />
              )}

              {/* --- ASSOCIATED RECORDS --- */}
              <PropRow
                icon="contacts"
                label="Associated"
                onPress={() => setShowRecordPicker(true)}
              >
                {associatedRecords.length === 0 ? (
                  <Typography style={propStyles.mutedText}>Add records...</Typography>
                ) : (
                  associatedRecords.map((c) => (
                    <PropChip
                      key={c.id}
                      label={c.name.split(" ")[0]}
                      color="accent"
                      onRemove={() => toggleRecord(c)}
                    />
                  ))
                )}
              </PropRow>

              {/* --- NOTES --- */}
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes..."
                placeholderTextColor="#c0c0c0"
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </ScrollView>

            {/* Toolbar / recording bar */}
            {isRecording ? (
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
                <View style={{ flex: 1 }} />
                <Pressable
                  onPress={handleCreate}
                  style={[styles.createBtn, !taskName.trim() && styles.createBtnDisabled]}
                >
                  <Typography style={styles.createBtnLabel}>
                    {isEditMode ? "Save task" : "Create task"}
                  </Typography>
                </Pressable>
              </View>
            )}

            {/* Associated records overlay */}
            {showRecordPicker && (
              <RecordPickerOverlay
                selected={associatedRecords}
                onToggle={toggleRecord}
                onClose={() => setShowRecordPicker(false)}
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
  taskIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${TONE_HEX.accent}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 14, fontWeight: "600", color: TONE_HEX.foreground },
  navCreate: { fontSize: 14, fontWeight: "600", color: TONE_HEX.accent },
  navCreateDisabled: { opacity: 0.35 },
  navRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  trashBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "600",
    color: TONE_HEX.foreground,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    lineHeight: 28,
  },

  // Priority segmented row
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },
  priorityChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  priorityLabel: { fontSize: 13, fontWeight: "500" },

  // Notes
  notesInput: {
    fontSize: 15,
    color: TONE_HEX.foreground,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    lineHeight: 23,
    minHeight: 80,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e7",
  },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  createBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: TONE_HEX.accent,
    alignItems: "center",
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnLabel: { fontSize: 14, fontWeight: "600", color: "#ffffff" },

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
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
  recTime: { fontSize: 14, fontWeight: "600", color: "#ef4444", minWidth: 34 },
  recDone: { fontSize: 14, fontWeight: "600", color: TONE_HEX.accent },
});
