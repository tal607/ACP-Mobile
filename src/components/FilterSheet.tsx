import { Separator, Typography } from "heroui-native";
import { useEffect, useState, type JSX, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ScopedTheme } from "uniwind";
import { TONE_HEX } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

/* ------------------------------------------------------------------ *
 * Filter state — exported so contacts.tsx can use it
 * ------------------------------------------------------------------ */

export type FilterState = {
  staffMembers: string[];
  organizations: string[];
  types: string[];
  stages: string[];
  dataRoomStatus: string[];
  leadSources: string[];
  investedIn: string[];
  tags: string[];
  classifications: string[];
  staticLists: string[];
  emailMarketing: string;
  totalInvestedRange: string;
  totalBalanceRange: string;
  totalContributedRange: string;
  totalDistributedRange: string;
  totalInvestmentsCount: string;
  lastInteraction: string;
  createdOn: string;
  lastLoginDate: string;
  customDate1: string;
  customDate2: string;
  dateOfBirth: string;
  location: string;
  country: string[];
  idPassport: string;
  mainTaxId: string;
};

export const EMPTY_FILTERS: FilterState = {
  staffMembers: [], organizations: [], types: [],
  stages: [], dataRoomStatus: [], leadSources: [], investedIn: [],
  tags: [], classifications: [], staticLists: [], emailMarketing: "",
  totalInvestedRange: "", totalBalanceRange: "", totalContributedRange: "",
  totalDistributedRange: "", totalInvestmentsCount: "",
  lastInteraction: "", createdOn: "", lastLoginDate: "",
  customDate1: "", customDate2: "", dateOfBirth: "",
  location: "", country: [], idPassport: "", mainTaxId: "",
};

export function countActiveFilters(f: FilterState): number {
  return (
    f.staffMembers.length + f.organizations.length + f.types.length +
    f.stages.length + f.dataRoomStatus.length + f.leadSources.length +
    f.investedIn.length + f.tags.length + f.classifications.length +
    f.staticLists.length + (f.emailMarketing ? 1 : 0) +
    (f.totalInvestedRange ? 1 : 0) + (f.totalBalanceRange ? 1 : 0) +
    (f.totalContributedRange ? 1 : 0) + (f.totalDistributedRange ? 1 : 0) +
    (f.totalInvestmentsCount ? 1 : 0) +
    (f.lastInteraction ? 1 : 0) + (f.createdOn ? 1 : 0) +
    (f.lastLoginDate ? 1 : 0) + (f.customDate1 ? 1 : 0) +
    (f.customDate2 ? 1 : 0) + (f.dateOfBirth ? 1 : 0) +
    (f.location ? 1 : 0) + f.country.length +
    (f.idPassport ? 1 : 0) + (f.mainTaxId ? 1 : 0)
  );
}

/** Only the 3 quick filters shown in the main sheet. */
function countCommonFilters(f: FilterState): number {
  return f.staffMembers.length + f.organizations.length + f.types.length;
}

/* ------------------------------------------------------------------ *
 * Operator definitions
 * ------------------------------------------------------------------ */

const OPERATORS: { value: string; label: string }[] = [
  { value: "is", label: "Is" },
  { value: "is_not", label: "Is not" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

const TEXT_OPERATORS: { value: string; label: string }[] = [
  { value: "is", label: "Is" },
  { value: "contains", label: "Contains" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

function operatorNeedsValue(op: string): boolean {
  return op === "is" || op === "is_not" || op === "contains";
}

/* ------------------------------------------------------------------ *
 * Advanced query-builder types
 * ------------------------------------------------------------------ */

type AdvancedCondition = {
  id: string;
  fieldId: string;
  operator: string;
  values: string[];
};

type OpenPicker = { conditionId: string; type: "field" | "operator" | "value" } | null;

type FieldDef = {
  id: string;
  label: string;
  isArray: boolean;
  isText?: boolean;
  options?: { value: string; label: string }[];
};

/* ------------------------------------------------------------------ *
 * Static option sets
 * ------------------------------------------------------------------ */

const STAFF_MEMBERS = ["Tal", "Roee", "Miriam", "Dana"];
const TYPES = ["Investor", "Prospect", "Lead"];
const STAGES = ["First Touch", "In Discussion", "Active LP", "Lead", "Exited"];
const DATA_ROOM_OPTS = [
  { value: "not_sent", label: "Not Sent" },
  { value: "sent", label: "Sent" },
  { value: "opened", label: "Opened" },
];
const LEAD_SOURCES = ["Referral", "Website", "Conference", "Cold Outreach", "LinkedIn"];
const FUNDS = ["Fund II", "Fund III"];
const CLASSIFICATIONS = ["Individual", "Entity", "Family Office", "Institutional"];
const ALL_TAGS = [
  "High Net Worth", "Family Office", "Institutional", "Angel",
  "Self-Directed IRA", "Co-invest Interest", "Re-up Candidate",
  "Inbound", "Price Sensitive", "Active Evaluator",
];

/**
 * All advanced filter fields — includes the fields moved from the common section.
 * Moved fields appear first for discoverability.
 */
const ADVANCED_FIELDS: FieldDef[] = [
  // Moved from common filters
  { id: "stages", label: "Stage", isArray: true, options: STAGES.map((s) => ({ value: s, label: s })) },
  { id: "leadSources", label: "Lead Source", isArray: true, options: LEAD_SOURCES.map((s) => ({ value: s, label: s })) },
  { id: "investedIn", label: "Invested In", isArray: true, options: FUNDS.map((s) => ({ value: s, label: s })) },
  { id: "dataRoomStatus", label: "Data Room", isArray: true, options: DATA_ROOM_OPTS },
  { id: "classifications", label: "Classification", isArray: true, options: CLASSIFICATIONS.map((c) => ({ value: c, label: c })) },
  { id: "tags", label: "Tags", isArray: true, options: ALL_TAGS.map((t) => ({ value: t, label: t })) },
  // Original advanced fields
  { id: "country", label: "Country", isArray: true, options: [
    "United States", "United Kingdom", "Canada", "Israel",
    "Australia", "Germany", "France", "Singapore",
  ].map((c) => ({ value: c, label: c })) },
  { id: "staticLists", label: "Static Lists", isArray: true, options: [
    "Q3 2025 Outreach", "Fund III Waitlist", "Co-invest Pipeline", "Annual Summit Invites",
  ].map((s) => ({ value: s, label: s })) },
  { id: "emailMarketing", label: "Email Marketing", isArray: false, options: [
    { value: "subscribed", label: "Subscribed" },
    { value: "unsubscribed", label: "Unsubscribed" },
  ] },
  { id: "lastInteraction", label: "Last Interaction", isArray: false, options: [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "over30", label: "30+ Days" },
  ] },
  { id: "createdOn", label: "Created On", isArray: false, options: [
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_year", label: "This Year" },
  ] },
  { id: "lastLoginDate", label: "Last Login", isArray: false, options: [
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "never", label: "Never" },
  ] },
  { id: "dateOfBirth", label: "Date of Birth", isArray: false, options: [
    { value: "this_month", label: "This Month" },
    { value: "next_month", label: "Next Month" },
    { value: "is_set", label: "Is Set" },
    { value: "not_set", label: "Not Set" },
  ] },
  { id: "customDate1", label: "Custom Date 1", isArray: false, options: [
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_year", label: "This Year" },
    { value: "past", label: "Past" },
  ] },
  { id: "customDate2", label: "Custom Date 2", isArray: false, options: [
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_year", label: "This Year" },
    { value: "past", label: "Past" },
  ] },
  { id: "totalInvestedRange", label: "Total Invested", isArray: false, options: [
    { value: "none", label: "$0" },
    { value: "under500k", label: "< $500K" },
    { value: "500k-1m", label: "$500K–$1M" },
    { value: "over1m", label: "$1M+" },
  ] },
  { id: "totalBalanceRange", label: "Total Balance", isArray: false, options: [
    { value: "none", label: "$0" },
    { value: "under500k", label: "< $500K" },
    { value: "500k-1m", label: "$500K–$1M" },
    { value: "over1m", label: "$1M+" },
  ] },
  { id: "totalContributedRange", label: "Total Contributed", isArray: false, options: [
    { value: "none", label: "$0" },
    { value: "under500k", label: "< $500K" },
    { value: "500k-1m", label: "$500K–$1M" },
    { value: "over1m", label: "$1M+" },
  ] },
  { id: "totalDistributedRange", label: "Total Distributed", isArray: false, options: [
    { value: "yes", label: "Has Distributions" },
    { value: "no", label: "None" },
  ] },
  { id: "totalInvestmentsCount", label: "# Investments", isArray: false, options: [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2plus", label: "2+" },
  ] },
  { id: "location", label: "Location", isArray: false, isText: true },
  { id: "idPassport", label: "ID / Passport", isArray: false, isText: true },
  { id: "mainTaxId", label: "Main Tax ID", isArray: false, isText: true },
];

/* ------------------------------------------------------------------ *
 * Summary helpers
 * ------------------------------------------------------------------ */

function summarizeArr(selected: string[]): string {
  if (selected.length === 0) return "All";
  if (selected.length === 1) return selected[0];
  return `${selected.length} selected`;
}

function conditionValueSummary(cond: AdvancedCondition): string {
  if (!operatorNeedsValue(cond.operator)) return "";
  const fd = ADVANCED_FIELDS.find((f) => f.id === cond.fieldId);
  if (!fd || cond.values.length === 0) return "Select value";
  if (fd.isText) return cond.values[0] ?? "Enter value";
  if (fd.isArray) {
    const labels = cond.values.map(
      (v) => fd.options?.find((o) => o.value === v)?.label ?? v,
    );
    if (labels.length === 1) return labels[0];
    return `${labels.length} selected`;
  }
  return fd.options?.find((o) => o.value === cond.values[0])?.label ?? cond.values[0];
}

/* ------------------------------------------------------------------ *
 * Unique ID
 * ------------------------------------------------------------------ */

let _idCounter = 0;
function newId(): string {
  return `c${++_idCounter}`;
}

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

/** Vertical checklist — multi-select. */
function CheckList({
  options,
  selected,
  onToggle,
  maxVisible = 8,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  maxVisible?: number;
}): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, maxVisible);
  const hiddenCount = Math.max(0, options.length - maxVisible);

  return (
    <View>
      {visible.map((opt, i) => {
        const active = selected.includes(opt);
        return (
          <View key={opt}>
            {i > 0 && (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e8e8e8" }} />
            )}
            <Pressable
              onPress={() => onToggle(opt)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 }}
            >
              <View
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  backgroundColor: active ? TONE_HEX.accent : "transparent",
                  borderWidth: active ? 0 : 1.5, borderColor: "#d0d0d0",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {active && <Icon name="check" size="sm" color="#ffffff" />}
              </View>
              <Typography type="body-sm" style={{ flex: 1, color: TONE_HEX.foreground }}>
                {opt}
              </Typography>
            </Pressable>
          </View>
        );
      })}
      {!showAll && hiddenCount > 0 && (
        <Pressable onPress={() => setShowAll(true)} style={{ paddingTop: 6 }}>
          <Typography style={{ color: TONE_HEX.accent, fontSize: 13, fontWeight: "500" }}>
            +{hiddenCount} more
          </Typography>
        </Pressable>
      )}
    </View>
  );
}

/** Text input for free-form filter fields. */
function TextFilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}): JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 8,
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
        backgroundColor: "#f0f0f0",
      }}
    >
      <TextInput
        style={{ flex: 1, fontSize: 14, color: TONE_HEX.foreground }}
        placeholder={placeholder ?? "Search..."}
        placeholderTextColor={TONE_HEX.muted}
        value={value}
        onChangeText={onChange}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable hitSlop={8} onPress={() => onChange("")}>
          <Icon name="close" size="sm" tone="muted" />
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Shared badge — true circle for 1–9, tight pill for 10+
 * ------------------------------------------------------------------ */

const BADGE_SIZE = 20;

function AccentBadge({ n }: { n: number }): JSX.Element {
  const str = String(n);
  const wide = str.length > 1;
  return (
    <View
      style={{
        backgroundColor: TONE_HEX.accent,
        borderRadius: BADGE_SIZE / 2,
        width: wide ? undefined : BADGE_SIZE,
        height: BADGE_SIZE,
        minWidth: BADGE_SIZE,
        paddingHorizontal: wide ? 5 : 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography style={{ fontSize: 11, color: "#ffffff", fontWeight: "700", lineHeight: BADGE_SIZE }}>
        {str}
      </Typography>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * AccordionRow — collapsible filter row (common filters)
 * ------------------------------------------------------------------ */

type RowId = string;

function AccordionRow({
  label,
  summary,
  activeCount,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  summary: string;
  activeCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <>
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: "row", alignItems: "center",
          paddingHorizontal: 20, paddingVertical: 15,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography style={{ flex: 1, fontSize: 15, color: TONE_HEX.foreground, fontWeight: "500" }}>
          {label}
        </Typography>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {activeCount > 0
            ? <AccentBadge n={activeCount} />
            : <Typography style={{ fontSize: 13, color: TONE_HEX.muted }}>{summary}</Typography>
          }
          <Icon
            name={isOpen ? "chevronUp" : "chevronDown"}
            size="sm"
            color={isOpen ? TONE_HEX.accent : TONE_HEX.muted}
          />
        </View>
      </Pressable>
      {isOpen && (
        <View
          style={{
            backgroundColor: "#f7f7f7",
            paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16,
            borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e8e8e8",
          }}
        >
          {children}
        </View>
      )}
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" }} />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * SectionLabel
 * ------------------------------------------------------------------ */

function SectionLabel({ title, count }: { title: string; count?: number }): JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6, gap: 8,
      }}
    >
      <Typography
        style={{
          fontSize: 11, fontWeight: "700", color: TONE_HEX.muted,
          letterSpacing: 0.8, textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>
      {count != null && count > 0 && (
        <View
          style={{
            backgroundColor: `${TONE_HEX.accent}22`, borderRadius: 999,
            paddingHorizontal: 7, paddingVertical: 1,
          }}
        >
          <Typography style={{ fontSize: 10, color: TONE_HEX.accent, fontWeight: "600" }}>
            {count}
          </Typography>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * ConditionRow — single advanced filter condition (3-part: Field | Op | Value)
 * ------------------------------------------------------------------ */

function ConditionRow({
  condition,
  usedFieldIds,
  openType,
  onTogglePicker,
  onChangeField,
  onChangeOperator,
  onToggleValue,
  onSetText,
  onRemove,
}: {
  condition: AdvancedCondition;
  usedFieldIds: string[];
  openType: "field" | "operator" | "value" | null;
  onTogglePicker: (type: "field" | "operator" | "value") => void;
  onChangeField: (fieldId: string) => void;
  onChangeOperator: (operator: string) => void;
  onToggleValue: (value: string) => void;
  onSetText: (value: string) => void;
  onRemove: () => void;
}): JSX.Element {
  const fd = ADVANCED_FIELDS.find((f) => f.id === condition.fieldId);
  const fieldSelected = condition.fieldId !== "";
  const opSelected = condition.operator !== "";
  const ops = fd?.isText ? TEXT_OPERATORS : OPERATORS;
  const currentOp = ops.find((o) => o.value === condition.operator);
  const needsValue = operatorNeedsValue(condition.operator);
  const hasValue = condition.values.length > 0;
  const valueSummary = conditionValueSummary(condition);

  const isFieldOpen = openType === "field";
  const isOpOpen = openType === "operator";
  const isValueOpen = openType === "value";

  // Fields available: own field + any not yet used by another condition
  const availableFields = ADVANCED_FIELDS.filter(
    (f) => f.id === condition.fieldId || !usedFieldIds.includes(f.id),
  );

  const selectorBase: object = {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, paddingVertical: 9,
    borderRadius: 8, borderWidth: 1.5,
    backgroundColor: "#ffffff",
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {/* Row 1: [Field] [Operator] [Remove ×] */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
        {/* Field selector */}
        <Pressable
          onPress={() => onTogglePicker("field")}
          style={[selectorBase, {
            flex: 1, gap: 4,
            borderColor: isFieldOpen ? TONE_HEX.accent : "#dcdcdc",
            backgroundColor: isFieldOpen ? `${TONE_HEX.accent}08` : "#ffffff",
          }]}
        >
          <Typography
            style={{
              flex: 1, fontSize: 13, fontWeight: "500",
              color: fieldSelected ? TONE_HEX.foreground : TONE_HEX.muted,
            }}
            numberOfLines={1}
          >
            {fd?.label ?? "Select"}
          </Typography>
          <Icon
            name={isFieldOpen ? "chevronUp" : "chevronDown"}
            size="sm"
            color={isFieldOpen ? TONE_HEX.accent : TONE_HEX.muted}
          />
        </Pressable>

        {/* Operator selector — always visible, disabled until field is picked */}
        <Pressable
          onPress={() => fieldSelected && onTogglePicker("operator")}
          style={[selectorBase, {
            width: 86, gap: 2,
            borderColor: isOpOpen ? TONE_HEX.accent : "#dcdcdc",
            backgroundColor: isOpOpen ? `${TONE_HEX.accent}08` : "#ffffff",
            opacity: fieldSelected ? 1 : 0.4,
          }]}
        >
          <Typography
            style={{
              flex: 1, fontSize: 12, fontWeight: "500",
              color: opSelected ? TONE_HEX.foreground : TONE_HEX.muted,
            }}
            numberOfLines={1}
          >
            {currentOp?.label ?? "Select"}
          </Typography>
          <Icon
            name={isOpOpen ? "chevronUp" : "chevronDown"}
            size="sm"
            color={isOpOpen ? TONE_HEX.accent : TONE_HEX.muted}
          />
        </Pressable>

        {/* Remove */}
        <Pressable onPress={onRemove} hitSlop={12} style={{ padding: 2 }}>
          <View
            style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: "#f0f0f0",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="close" size="sm" color={TONE_HEX.muted} />
          </View>
        </Pressable>
      </View>

      {/* Field picker dropdown */}
      {isFieldOpen && (
        <View
          style={{
            marginBottom: 6, borderRadius: 10, backgroundColor: "#ffffff",
            borderWidth: 1, borderColor: "#e0e0e0", overflow: "hidden",
          }}
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {availableFields.map((f, i) => {
              const selected = f.id === condition.fieldId;
              return (
                <View key={f.id}>
                  {i > 0 && (
                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#ebebeb" }} />
                  )}
                  <Pressable
                    onPress={() => onChangeField(f.id)}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingHorizontal: 14, paddingVertical: 11, gap: 10,
                    }}
                  >
                    <Typography
                      type="body-sm"
                      style={{
                        flex: 1,
                        color: selected ? TONE_HEX.accent : TONE_HEX.foreground,
                        fontWeight: selected ? "600" : "400",
                      }}
                    >
                      {f.label}
                    </Typography>
                    {selected && <Icon name="check" size="sm" color={TONE_HEX.accent} />}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Operator picker dropdown */}
      {isOpOpen && (
        <View
          style={{
            marginBottom: 6, borderRadius: 10, backgroundColor: "#ffffff",
            borderWidth: 1, borderColor: "#e0e0e0", overflow: "hidden",
          }}
        >
          <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {ops.map((op, i) => {
              const selected = op.value === condition.operator;
              return (
                <View key={op.value}>
                  {i > 0 && (
                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#ebebeb" }} />
                  )}
                  <Pressable
                    onPress={() => onChangeOperator(op.value)}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingHorizontal: 14, paddingVertical: 11, gap: 10,
                    }}
                  >
                    <Typography
                      type="body-sm"
                      style={{
                        flex: 1,
                        color: selected ? TONE_HEX.accent : TONE_HEX.foreground,
                        fontWeight: selected ? "600" : "400",
                      }}
                    >
                      {op.label}
                    </Typography>
                    {selected && <Icon name="check" size="sm" color={TONE_HEX.accent} />}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Row 2: Value selector — only after field + operator are both chosen */}
      {fieldSelected && opSelected && needsValue && (
        <>
          <Pressable
            onPress={() => onTogglePicker("value")}
            style={[selectorBase, {
              gap: 4,
              borderColor: isValueOpen ? TONE_HEX.accent : hasValue ? TONE_HEX.accent : "#dcdcdc",
              backgroundColor: hasValue ? `${TONE_HEX.accent}0d` : "#ffffff",
            }]}
          >
            <Typography
              style={{
                flex: 1, fontSize: 13,
                color: hasValue ? TONE_HEX.accent : TONE_HEX.muted,
                fontWeight: hasValue ? "500" : "400",
              }}
              numberOfLines={1}
            >
              {valueSummary}
            </Typography>
            <Icon
              name={isValueOpen ? "chevronUp" : "chevronDown"}
              size="sm"
              color={hasValue ? TONE_HEX.accent : TONE_HEX.muted}
            />
          </Pressable>

          {/* Value picker dropdown */}
          {isValueOpen && fd && (
            <View
              style={{
                marginTop: 4, borderRadius: 10, backgroundColor: "#ffffff",
                borderWidth: 1, borderColor: "#e0e0e0", overflow: "hidden",
              }}
            >
              {fd.isText ? (
                <View style={{ padding: 12 }}>
                  <TextFilterInput
                    value={condition.values[0] ?? ""}
                    onChange={onSetText}
                    placeholder={`Enter ${fd.label}`}
                  />
                </View>
              ) : (
                <>
                  <ScrollView
                    style={{ maxHeight: 220 }}
                    showsVerticalScrollIndicator
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {fd.options?.map((opt, i) => {
                      const active = condition.values.includes(opt.value);
                      return (
                        <View key={opt.value}>
                          {i > 0 && (
                            <View
                              style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#ebebeb" }}
                            />
                          )}
                          <Pressable
                            onPress={() => onToggleValue(opt.value)}
                            style={{
                              flexDirection: "row", alignItems: "center",
                              paddingHorizontal: 14, paddingVertical: 11, gap: 12,
                            }}
                          >
                            <View
                              style={{
                                width: 18, height: 18,
                                borderRadius: fd.isArray ? 4 : 9,
                                backgroundColor: active ? TONE_HEX.accent : "transparent",
                                borderWidth: active ? 0 : 1.5, borderColor: "#d0d0d0",
                                alignItems: "center", justifyContent: "center",
                              }}
                            >
                              {active && <Icon name="check" size="sm" color="#ffffff" />}
                            </View>
                            <Typography type="body-sm" style={{ flex: 1 }}>
                              {opt.label}
                            </Typography>
                          </Pressable>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {/* Done — only for multi-select, sticky below the capped list */}
                  {fd.isArray && (
                    <Pressable
                      onPress={() => onTogglePicker("value")}
                      style={{
                        padding: 11, alignItems: "center",
                        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e4e4e7",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Typography style={{ color: TONE_HEX.accent, fontWeight: "600", fontSize: 13 }}>
                        Done
                      </Typography>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Main FilterSheet
 * ------------------------------------------------------------------ */

export function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
  organizations,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
  organizations: string[];
}): JSX.Element {
  const [f, setF] = useState<FilterState>(initialFilters);
  const [openRows, setOpenRows] = useState<Set<RowId>>(new Set());
  const [advConditions, setAdvConditions] = useState<AdvancedCondition[]>([]);
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  // Re-sync on open
  useEffect(() => {
    if (visible) {
      setF(initialFilters);
      // Derive advanced conditions from initialFilters (covers moved and original fields)
      const conditions: AdvancedCondition[] = [];
      ADVANCED_FIELDS.forEach((fd) => {
        const val = (initialFilters as Record<string, unknown>)[fd.id];
        if (fd.isArray) {
          if (Array.isArray(val) && val.length > 0) {
            conditions.push({ id: newId(), fieldId: fd.id, operator: "is", values: val as string[] });
          }
        } else {
          if (typeof val === "string" && val) {
            conditions.push({ id: newId(), fieldId: fd.id, operator: "is", values: [val] });
          }
        }
      });
      setAdvConditions(conditions);
      setOpenPicker(null);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- row accordion helpers ---- */
  const toggleRow = (id: RowId) =>
    setOpenRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const isOpen = (id: RowId) => openRows.has(id);

  /* ---- common filter helpers ---- */
  const toggleArr = (key: keyof FilterState, value: string) => {
    const arr = f[key] as string[];
    setF((prev) => ({
      ...prev,
      [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    }));
  };

  /* ---- condition helpers ---- */
  // Exclude empty-fieldId rows from "used" set so they don't block the picker list
  const usedFieldIds = advConditions.filter((c) => c.fieldId !== "").map((c) => c.fieldId);

  const togglePicker = (conditionId: string, type: "field" | "operator" | "value") =>
    setOpenPicker((prev) =>
      prev?.conditionId === conditionId && prev?.type === type
        ? null
        : { conditionId, type },
    );

  const addCondition = () => {
    if (allAdvFieldsUsed) return;
    const id = newId();
    // Start blank — user picks field first, then operator, then value
    setAdvConditions((prev) => [...prev, { id, fieldId: "", operator: "", values: [] }]);
    setOpenPicker({ conditionId: id, type: "field" });
  };

  const removeCondition = (id: string) => {
    setAdvConditions((prev) => prev.filter((c) => c.id !== id));
    if (openPicker?.conditionId === id) setOpenPicker(null);
  };

  const changeConditionField = (conditionId: string, newFieldId: string) => {
    setAdvConditions((prev) =>
      prev.map((c) =>
        // Reset operator + values when field changes — fresh guided flow
        c.id === conditionId ? { ...c, fieldId: newFieldId, operator: "", values: [] } : c,
      ),
    );
    // Auto-open operator picker after field is chosen
    setOpenPicker({ conditionId, type: "operator" });
  };

  const changeConditionOperator = (conditionId: string, newOp: string) => {
    const needsVal = operatorNeedsValue(newOp);
    setAdvConditions((prev) =>
      prev.map((c) =>
        c.id === conditionId ? { ...c, operator: newOp, values: needsVal ? c.values : [] } : c,
      ),
    );
    // Open value picker when operator needs one; close otherwise
    setOpenPicker(needsVal ? { conditionId, type: "value" } : null);
  };

  const toggleConditionValue = (conditionId: string, value: string) => {
    const cond = advConditions.find((c) => c.id === conditionId);
    if (!cond) return;
    const fd = ADVANCED_FIELDS.find((f) => f.id === cond.fieldId);
    if (!fd) return;

    setAdvConditions((prev) =>
      prev.map((c) => {
        if (c.id !== conditionId) return c;
        if (fd.isArray) {
          return {
            ...c,
            values: c.values.includes(value)
              ? c.values.filter((v) => v !== value)
              : [...c.values, value],
          };
        }
        // single-select: toggle off if same value
        return { ...c, values: c.values[0] === value ? [] : [value] };
      }),
    );
    // Close for single-select immediately
    if (!fd.isArray) setOpenPicker(null);
  };

  const setConditionText = (conditionId: string, value: string) =>
    setAdvConditions((prev) =>
      prev.map((c) =>
        c.id === conditionId ? { ...c, values: value ? [value] : [] } : c,
      ),
    );

  /* ---- apply ---- */
  const buildFinalFilters = (): FilterState => {
    // Start from common filter state, reset all advanced-managed fields, then apply conditions.
    const result: FilterState = {
      ...f,
      // Reset all fields managed via advanced conditions
      stages: [], leadSources: [], investedIn: [], dataRoomStatus: [],
      tags: [], classifications: [],
      country: [], staticLists: [], emailMarketing: "",
      lastInteraction: "", createdOn: "", lastLoginDate: "",
      customDate1: "", customDate2: "", dateOfBirth: "",
      location: "", idPassport: "", mainTaxId: "",
      totalInvestedRange: "", totalBalanceRange: "", totalContributedRange: "",
      totalDistributedRange: "", totalInvestmentsCount: "",
    };
    advConditions.forEach((cond) => {
      // Only "is" and "is_not" map to FilterState values for now
      if (!operatorNeedsValue(cond.operator) || cond.values.length === 0) return;
      const fd = ADVANCED_FIELDS.find((f) => f.id === cond.fieldId);
      if (!fd) return;
      if (fd.isArray) {
        (result as Record<string, unknown>)[cond.fieldId] = cond.values;
      } else {
        (result as Record<string, unknown>)[cond.fieldId] = cond.values[0] ?? "";
      }
    });
    return result;
  };

  const handleClearAll = () => {
    setF(EMPTY_FILTERS);
    setAdvConditions([]);
    setOpenPicker(null);
  };

  /* ---- counts ---- */
  // Only count conditions that have a field selected and are either filled or use a no-value operator
  const advActiveCount = advConditions.filter((c) =>
    c.fieldId !== "" && (c.values.length > 0 || (c.operator !== "" && !operatorNeedsValue(c.operator)))
  ).length;
  const totalCount = countCommonFilters(f) + advActiveCount;
  const allAdvFieldsUsed = usedFieldIds.length >= ADVANCED_FIELDS.length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Backdrop */}
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.35)" }]}
            onPress={onClose}
          />

          {/* Sheet — fixed 90% height so accordions never resize the drawer */}
          <View
            style={{
              height: "95%", backgroundColor: "#ffffff",
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
            }}
          >
            {/* Drag handle */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#e4e4e7" }} />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Typography weight="semibold" style={{ fontSize: 16 }}>Filters</Typography>
                {totalCount > 0 && <AccentBadge n={totalCount} />}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {totalCount > 0 && (
                  <Pressable onPress={handleClearAll} hitSlop={8}>
                    <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>Clear all</Typography>
                  </Pressable>
                )}
                <Pressable
                  onPress={onClose}
                  style={{
                    height: 32, width: 32, borderRadius: 999,
                    backgroundColor: "#f5f5f5", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon name="close" size="md" tone="muted" />
                </Pressable>
              </View>
            </View>

            <Separator />

            {/* Scrollable rows — flex:1 fills whatever height is left between header and footer */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 0 }}
              style={{ flex: 1 }}
            >
              {/* ── Quick filters (3 only) ── */}
              <SectionLabel title="Filter By" />

              <AccordionRow
                label="Staff Member"
                summary={summarizeArr(f.staffMembers)}
                activeCount={f.staffMembers.length}
                isOpen={isOpen("staffMember")}
                onToggle={() => toggleRow("staffMember")}
              >
                <CheckList
                  options={STAFF_MEMBERS}
                  selected={f.staffMembers}
                  onToggle={(v) => toggleArr("staffMembers", v)}
                />
              </AccordionRow>

              <AccordionRow
                label="Organization"
                summary={summarizeArr(f.organizations)}
                activeCount={f.organizations.length}
                isOpen={isOpen("organization")}
                onToggle={() => toggleRow("organization")}
              >
                <CheckList
                  options={organizations}
                  selected={f.organizations}
                  onToggle={(v) => toggleArr("organizations", v)}
                />
              </AccordionRow>

              <AccordionRow
                label="Type"
                summary={summarizeArr(f.types)}
                activeCount={f.types.length}
                isOpen={isOpen("type")}
                onToggle={() => toggleRow("type")}
              >
                <CheckList
                  options={TYPES}
                  selected={f.types}
                  onToggle={(v) => toggleArr("types", v)}
                />
              </AccordionRow>

              {/* ── Advanced Filters — same structure as AccordionRow ── */}
              <Pressable
                onPress={() => {
                  const willOpen = !isOpen("advanced");
                  toggleRow("advanced");
                  // When opening with no conditions, auto-insert one blank row
                  if (willOpen && advConditions.length === 0) {
                    const id = newId();
                    setAdvConditions([{ id, fieldId: "", operator: "", values: [] }]);
                  }
                }}
                style={{
                  flexDirection: "row", alignItems: "center",
                  paddingHorizontal: 20, paddingVertical: 15,
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  style={{ flex: 1, fontSize: 15, color: TONE_HEX.foreground, fontWeight: "500" }}
                >
                  Advanced Filters
                </Typography>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {advActiveCount > 0
                    ? <AccentBadge n={advActiveCount} />
                    : (
                      <Typography style={{ fontSize: 13, color: TONE_HEX.muted }}>
                        {advConditions.length > 0 ? `${advConditions.length} rules` : "None"}
                      </Typography>
                    )
                  }
                  <Icon
                    name={isOpen("advanced") ? "chevronUp" : "chevronDown"}
                    size="sm"
                    color={isOpen("advanced") ? TONE_HEX.accent : TONE_HEX.muted}
                  />
                </View>
              </Pressable>

              {isOpen("advanced") && (
                <View
                  style={{
                    backgroundColor: "#f7f7f7",
                    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
                    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e8e8e8",
                  }}
                >
                  {/* WHERE label */}
                  {advConditions.length > 0 && (
                    <Typography
                      style={{
                        fontSize: 11, fontWeight: "700", color: TONE_HEX.muted,
                        letterSpacing: 0.8, textTransform: "uppercase",
                        marginBottom: 12,
                      }}
                    >
                      Where
                    </Typography>
                  )}

                  {/* Condition rows */}
                  {advConditions.map((cond) => (
                    <ConditionRow
                      key={cond.id}
                      condition={cond}
                      usedFieldIds={usedFieldIds}
                      openType={openPicker?.conditionId === cond.id ? openPicker.type : null}
                      onTogglePicker={(type) => togglePicker(cond.id, type)}
                      onChangeField={(fieldId) => changeConditionField(cond.id, fieldId)}
                      onChangeOperator={(op) => changeConditionOperator(cond.id, op)}
                      onToggleValue={(value) => toggleConditionValue(cond.id, value)}
                      onSetText={(value) => setConditionText(cond.id, value)}
                      onRemove={() => removeCondition(cond.id)}
                    />
                  ))}

                  {/* Add filter rule */}
                  {!allAdvFieldsUsed && (
                    <Pressable
                      onPress={addCondition}
                      style={{
                        flexDirection: "row", alignItems: "center",
                        gap: 6, paddingVertical: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20, height: 20, borderRadius: 10,
                          backgroundColor: `${TONE_HEX.accent}1a`,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Typography
                          style={{ fontSize: 16, color: TONE_HEX.accent, lineHeight: 20, fontWeight: "600" }}
                        >
                          +
                        </Typography>
                      </View>
                      <Typography style={{ fontSize: 14, color: TONE_HEX.accent, fontWeight: "500" }}>
                        Add filter rule
                      </Typography>
                    </Pressable>
                  )}
                </View>
              )}
              {/* Single trailing hairline — same as AccordionRow */}
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#e4e4e7" }} />
            </ScrollView>

            {/* Sticky footer */}
            <View
              style={{
                paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
                borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e4e4e7",
                backgroundColor: "#ffffff",
              }}
            >
              <Pressable
                onPress={() => { onApply(buildFinalFilters()); onClose(); }}
                style={{
                  backgroundColor: TONE_HEX.accent, borderRadius: 12,
                  paddingVertical: 14, alignItems: "center",
                }}
              >
                <Typography style={{ color: "#ffffff", fontWeight: "600", fontSize: 15 }}>
                  Apply Filters
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </ScopedTheme>
    </Modal>
  );
}
