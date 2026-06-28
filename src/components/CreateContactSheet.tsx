import { Separator, Typography } from "heroui-native";
import { useState, type JSX } from "react";
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
import { Icon } from "./ui/Icon";
import { PrimaryButton } from "./ui/PrimaryButton";
import { SecondaryButton } from "./ui/SecondaryButton";

/* ------------------------------------------------------------------ *
 * Local helpers
 * ------------------------------------------------------------------ */

/** Horizontal pill selector — single select. */
function PillSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className="rounded-full px-3 py-1.5"
            style={{
              backgroundColor: active ? TONE_HEX.accent : "#f5f5f5",
              borderWidth: 1,
              borderColor: active ? TONE_HEX.accent : "#e4e4e7",
            }}
          >
            <Typography
              style={{
                fontSize: 13,
                color: active ? "#ffffff" : TONE_HEX.foreground,
                fontWeight: active ? "600" : "400",
              }}
            >
              {opt}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Dropdown-style inline selector. */
function SelectField({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#f9f9f9",
          borderWidth: 1,
          borderColor: open ? TONE_HEX.accent : "#e4e4e7",
          borderRadius: 10,
          borderBottomLeftRadius: open ? 0 : 10,
          borderBottomRightRadius: open ? 0 : 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Typography
          style={{
            fontSize: 14,
            color: value ? TONE_HEX.foreground : TONE_HEX.muted,
          }}
        >
          {value || placeholder || "Select…"}
        </Typography>
        <Icon name={open ? "chevronUp" : "chevronDown"} size="sm" tone="muted" />
      </Pressable>

      {open && (
        <View
          style={{
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: TONE_HEX.accent,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            overflow: "hidden",
          }}
        >
          {options.map((opt, i) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: pressed ? "#f5f5f5" : opt === value ? "#f0f4ff" : "#ffffff",
                borderTopWidth: i === 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: "#e4e4e7",
              })}
            >
              <Typography
                style={{
                  fontSize: 14,
                  color: opt === value ? TONE_HEX.accent : TONE_HEX.foreground,
                  fontWeight: opt === value ? "600" : "400",
                }}
              >
                {opt}
              </Typography>
              {opt === value && (
                <Icon name="check" size={14} color={TONE_HEX.accent} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/** Labelled field wrapper. */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: JSX.Element;
}): JSX.Element {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-0.5">
        <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
          {label}
        </Typography>
        {required && (
          <Typography style={{ fontSize: 12, color: TONE_HEX.danger }}>
            {" "}*
          </Typography>
        )}
      </View>
      {children}
    </View>
  );
}

/** Styled text input. */
function StyledInput({
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  autoComplete,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  autoComplete?: "email" | "name" | "off";
}): JSX.Element {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={TONE_HEX.muted}
      keyboardType={keyboardType ?? "default"}
      autoCapitalize={autoCapitalize ?? "sentences"}
      autoComplete={autoComplete ?? "off"}
      style={{
        fontSize: 14,
        color: TONE_HEX.foreground,
        backgroundColor: "#f9f9f9",
        borderWidth: 1,
        borderColor: "#e4e4e7",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Form state
 * ------------------------------------------------------------------ */

type FormState = {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  profile: string;
  sendPortalInvite: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  type: "",
  profile: "",
  sendPortalInvite: false,
};

const TITLE_OPTIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
const TYPE_OPTIONS = ["Investor", "Prospect", "Lead"];
const PROFILE_OPTIONS = [
  "Sarah Kim Individual",
  "Alex Thompson LLC",
  "Pinnacle Capital Group",
  "Initech Ventures Fund III",
  "Margaret Thompson Trust",
];

/* ------------------------------------------------------------------ *
 * CreateContactSheet
 * ------------------------------------------------------------------ */

export function CreateContactSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): JSX.Element | null {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  if (!visible) return null;

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const canCreate = form.email.trim().length > 0;

  const handleCreate = () => {
    // Prototype: just close. Real impl would call an API.
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={handleClose}>
      <ScopedTheme theme="light">
        <KeyboardAvoidingView
          style={{ flex: 1, justifyContent: "flex-end" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Tap-to-dismiss backdrop */}
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.35)" },
            ]}
            onPress={handleClose}
          />

          {/* Sheet panel */}
          <View
            className="bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "92%" }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-separator" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
              <Typography weight="bold" style={{ fontSize: 18 }}>
                Create New Contact
              </Typography>
              <Pressable
                onPress={handleClose}
                className="h-8 w-8 rounded-full bg-surface-secondary items-center justify-center"
              >
                <Icon name="close" size="md" tone="muted" />
              </Pressable>
            </View>

            <Separator />

            {/* Scrollable form */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 8 }}
            >
              {/* Title */}
              <Field label="Title">
                <PillSelect
                  options={TITLE_OPTIONS}
                  value={form.title}
                  onChange={(v) => set("title", v)}
                />
              </Field>

              {/* First + Last Name */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Field label="First Name">
                    <StyledInput
                      placeholder="First Name"
                      value={form.firstName}
                      onChangeText={(v) => set("firstName", v)}
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </Field>
                </View>
                <View className="flex-1">
                  <Field label="Last Name">
                    <StyledInput
                      placeholder="Last Name"
                      value={form.lastName}
                      onChangeText={(v) => set("lastName", v)}
                      autoCapitalize="words"
                    />
                  </Field>
                </View>
              </View>

              {/* Email */}
              <Field label="Email" required>
                <StyledInput
                  placeholder="Email"
                  value={form.email}
                  onChangeText={(v) => set("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </Field>

              {/* Type */}
              <Field label="Type">
                <SelectField
                  options={TYPE_OPTIONS}
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  placeholder="Select type…"
                />
              </Field>

              {/* Profile */}
              <Field label="Profile">
                <SelectField
                  options={PROFILE_OPTIONS}
                  value={form.profile}
                  onChange={(v) => set("profile", v)}
                  placeholder="Select profile…"
                />
              </Field>

              {/* Send Portal Invitation */}
              <Pressable
                onPress={() => set("sendPortalInvite", !form.sendPortalInvite)}
                className="flex-row items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3.5"
              >
                <View
                  className="h-5 w-5 rounded items-center justify-center"
                  style={{
                    borderWidth: 2,
                    borderColor: form.sendPortalInvite
                      ? TONE_HEX.accent
                      : "#d9d9d9",
                    backgroundColor: form.sendPortalInvite
                      ? TONE_HEX.accent
                      : "transparent",
                  }}
                >
                  {form.sendPortalInvite && (
                    <Icon name="check" size={12} color="#ffffff" />
                  )}
                </View>
                <Typography weight="semibold" style={{ fontSize: 14 }}>
                  Send Portal Invitation
                </Typography>
              </Pressable>
            </ScrollView>

            {/* Footer */}
            <View
              className="flex-row gap-3 px-5 py-4"
              style={{ borderTopWidth: 1, borderTopColor: "#f0f0f0" }}
            >
              <SecondaryButton className="flex-1" onPress={handleClose}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                className="flex-1"
                onPress={handleCreate}
                disabled={!canCreate}
              >
                Create
              </PrimaryButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScopedTheme>
    </Modal>
  );
}
