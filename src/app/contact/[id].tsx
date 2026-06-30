import { router, useLocalSearchParams } from "expo-router";
import { Chip, Separator, Surface, Typography } from "heroui-native";
import { Fragment, useEffect, useState, type JSX } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityCard,
  AiBrief,
  FeedDateSep,
  CollapseCard,
  ContactActionSheet,
  Icon,
  Tag,
  type Activity,
  CreateActivitySheet,
  type CreateActivityKind,
  ActivityFormSheet,
  type ActivityFormKind,
  CreateTaskSheet,
  MetricCard,
  OfferingCard,
} from "@/components";
import { OFFERINGS } from "@/data/offerings";
import type { FeedActivity } from "@/data/activities";
import { recordRecent } from "@/data/recents";
import { toggleFavorite, isFavorite as getIsFavorite } from "@/data/favorites";
import { CONTACTS, type ContactDetailData, type InvestingProfile, type Position } from "@/data/contacts";
import { FAVORITE_GOLD, TONE_HEX, type IconName } from "@/theme/tokens";

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

const TABS = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
  { id: "profiles", label: "Profiles" },
  { id: "investments", label: "Investments" },
  { id: "offerings", label: "Offerings" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const pageStyles = StyleSheet.create({
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

const DATA_ROOM_LABEL = {
  not_sent: "Not sent",
  sent: "Sent",
  opened: "Opened",
} as const;

const DATA_ROOM_COLOR = {
  not_sent: "danger",
  sent: "warning",
  opened: "success",
} as const satisfies Record<string, "danger" | "warning" | "success">;

/* ------------------------------------------------------------------ *
 * Sub-components
 * ------------------------------------------------------------------ */

/** Icon + label button used in the action bar. */
function ActionButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className="items-center gap-1.5"
      style={{ opacity: disabled ? 0.35 : 1, width: 64 }}
    >
      <View
        className="h-12 w-12 rounded-full items-center justify-center"
        style={{ backgroundColor: "#f0f0f0" }}
      >
        <Icon name={icon} size="md" tone="foreground" />
      </View>
      <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
        {label}
      </Typography>
    </Pressable>
  );
}

/** Tappable info row (email, phone, location). */
function InfoRow({
  icon,
  label,
  onPress,
  showSeparator,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  showSeparator?: boolean;
}): JSX.Element {
  return (
    <>
      {showSeparator && <Separator />}
      <Pressable
        className="flex-row items-center px-4 py-3 gap-3 active:bg-surface-secondary"
        onPress={onPress}
      >
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <Icon name={icon} size="sm" tone="muted" />
        </View>
        <Typography
          type="body-sm"
          className="flex-1"
          numberOfLines={1}
          style={{ color: TONE_HEX.accent }}
        >
          {label}
        </Typography>
        <Icon name="chevron" size="sm" tone="muted" />
      </Pressable>
    </>
  );
}

/** Non-interactive row — same visual as InfoRow but no tap, no chevron, no accent. */
function StaticInfoRow({
  icon,
  label,
  showSeparator,
}: {
  icon: IconName;
  label: string;
  showSeparator?: boolean;
}): JSX.Element {
  return (
    <>
      {showSeparator && <Separator />}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: "#f5f5f5" }}
        >
          <Icon name={icon} size="sm" tone="muted" />
        </View>
        <Typography type="body-sm" className="flex-1" numberOfLines={1}>
          {label}
        </Typography>
      </View>
    </>
  );
}

/** Details tab content. */
function DetailsTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  const [localTags, setLocalTags] = useState<string[]>(contact.tags ?? []);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const hasContactInfo =
    contact.email || contact.phone || contact.location;

  const moreDetails = [
    { label: "Title", value: contact.title },
    { label: "Organization", value: contact.company },
    { label: "Classification", value: contact.classification },
    { label: "Residency", value: contact.residency },
    { label: "ID / Passport", value: contact.passportId },
    { label: "Tax ID", value: contact.taxId },
    { label: "Date of Birth", value: contact.dateOfBirth },
    { label: "Staff Member", value: contact.assignedTo },
    { label: "Preferred Name", value: contact.preferredName },
    { label: "Job Title", value: contact.jobTitle },
    { label: "Lead Source", value: contact.leadSource },
    { label: "Country", value: contact.country },
    { label: "Notes", value: contact.contactNotes },
  ].filter((d): d is { label: string; value: string } => !!d.value);

  const removeTag = (tag: string) =>
    setLocalTags((prev) => prev.filter((t) => t !== tag));

  const confirmAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !localTags.includes(trimmed)) {
      setLocalTags((prev) => [...prev, trimmed]);
    }
    setNewTag("");
    setAddingTag(false);
  };

  return (
    <View className="gap-6">
      {/* AI brief */}
      {contact.aiBrief && <AiBrief text={contact.aiBrief} />}

      {/* Contact info */}
      {hasContactInfo && (
        <View className="gap-2">
          <Typography className="text-xs" weight="semibold">
            Contact Info
          </Typography>
          <Surface className="p-0 rounded-2xl">
            {contact.email && (
              <InfoRow
                icon="email"
                label={contact.email}
                onPress={() => Linking.openURL(`mailto:${contact.email}`)}
              />
            )}
            {contact.phone && (
              <InfoRow
                icon="call"
                label={contact.phone}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                showSeparator={!!contact.email}
              />
            )}
            {contact.location && (
              <InfoRow
                icon="location"
                label={contact.location}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${encodeURIComponent(
                      contact.location!
                    )}`
                  )
                }
                showSeparator={!!(contact.email || contact.phone)}
              />
            )}
          </Surface>
        </View>
      )}

      {/* Tags */}
      <View className="gap-2">
        <Typography className="text-xs" weight="semibold">
          Tags
        </Typography>
        <View className="flex-row flex-wrap gap-2 items-center">
          {localTags.map((tag) => (
            <View
              key={tag}
              className="flex-row items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1.5"
            >
              <Typography style={{ fontSize: 13 }}>{tag}</Typography>
              <Pressable onPress={() => removeTag(tag)} hitSlop={8}>
                <Icon name="close" size={12} tone="muted" />
              </Pressable>
            </View>
          ))}
          {!addingTag ? (
            <Pressable
              onPress={() => setAddingTag(true)}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ borderWidth: 1, borderStyle: "dashed", borderColor: "#d9d9d9" }}
            >
              <Icon name="addTag" size={12} tone="muted" />
              <Typography type="body-xs" color="muted">
                Add tag
              </Typography>
            </Pressable>
          ) : (
            <View
              className="flex-row items-center gap-2 rounded-full px-3 py-1"
              style={{ borderWidth: 1, borderColor: TONE_HEX.accent }}
            >
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Tag name"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={confirmAddTag}
                style={{
                  fontSize: 13,
                  minWidth: 80,
                  color: TONE_HEX.foreground,
                  padding: 0,
                }}
              />
              <Pressable onPress={confirmAddTag} hitSlop={8}>
                <Icon name="check" size={14} tone="accent" />
              </Pressable>
              <Pressable
                onPress={() => {
                  setAddingTag(false);
                  setNewTag("");
                }}
                hitSlop={8}
              >
                <Icon name="close" size={14} tone="muted" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Status snapshot */}
      {contact.status && (
        <View className="gap-2">
          <Typography className="text-xs" weight="semibold">
            Status
          </Typography>
          <Surface className="p-0 rounded-2xl">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Typography type="body-sm" color="muted">
                Stage
              </Typography>
              <Typography type="body-sm" weight="semibold">
                {contact.status.stage}
              </Typography>
            </View>
            {contact.status.offering && (
              <>
                <Separator />
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Typography type="body-sm" color="muted">
                    Offering
                  </Typography>
                  <Typography type="body-sm" weight="semibold">
                    {contact.status.offering}
                  </Typography>
                </View>
              </>
            )}
            {contact.status.dataRoom && (
              <>
                <Separator />
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Typography type="body-sm" color="muted">
                    Data Room
                  </Typography>
                  <Chip
                    variant="soft"
                    color={DATA_ROOM_COLOR[contact.status.dataRoom]}
                    size="sm"
                  >
                    <Chip.Label className="text-xs">
                      {DATA_ROOM_LABEL[contact.status.dataRoom]}
                    </Chip.Label>
                  </Chip>
                </View>
              </>
            )}
          </Surface>
        </View>
      )}

      {/* More Details */}
      {moreDetails.length > 0 && (
        <CollapseCard title="More Details" badge={moreDetails.length}>
          {moreDetails.map((d) => (
            <Fragment key={d.label}>
              <Separator />
              <View className="flex-row items-start justify-between px-4 py-3 gap-4">
                <Typography type="body-sm" color="muted">
                  {d.label}
                </Typography>
                <Typography
                  type="body-sm"
                  style={{ textAlign: "right", flexShrink: 1 }}
                >
                  {d.value}
                </Typography>
              </View>
            </Fragment>
          ))}
        </CollapseCard>
      )}

      {/* Related Contacts */}
      {contact.relatedContacts && contact.relatedContacts.length > 0 && (
        <CollapseCard
          title="Related Contacts"
          badge={contact.relatedContacts.length}
        >
          {contact.relatedContacts.map((rc) => (
            <Fragment key={rc.id}>
              <Separator />
              <View className="flex-row items-center px-4 py-3 gap-2">
                <View className="flex-1 gap-0.5">
                  <Typography type="body-sm" weight="semibold">
                    {rc.name}
                  </Typography>
                  {rc.note && (
                    <Typography type="body-xs" color="muted">
                      {rc.note}
                    </Typography>
                  )}
                </View>
                <Pressable
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#f5f5f5" }}
                >
                  <Icon name="edit" size="sm" tone="muted" />
                </Pressable>
                <Pressable
                  className="h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#fff0f0" }}
                >
                  <Icon name="trash" size="sm" tone="danger" />
                </Pressable>
              </View>
            </Fragment>
          ))}
          <Separator />
          <Pressable className="flex-row items-center px-4 py-3.5 gap-2 active:bg-surface-secondary">
            <Icon name="addContact" size="sm" tone="accent" />
            <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
              Add Related Contact
            </Typography>
          </Pressable>
        </CollapseCard>
      )}
    </View>
  );
}

/** Activity tab content. */
function ActivityTab({
  activities,
  onActivityPress,
}: {
  activities: Activity[];
  onActivityPress: (item: Activity) => void;
}): JSX.Element {
  if (activities.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="activity" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">
          No activity yet
        </Typography>
        <Typography type="body-xs" color="muted">
          Tap + to log an activity
        </Typography>
      </View>
    );
  }
  return (
    <View>
      <FeedDateSep label="Recent" />
      <View style={{ position: "relative" }}>
        <View style={activityTabStyles.spine} />
        {activities.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            onPress={() => onActivityPress(item)}
          />
        ))}
      </View>
    </View>
  );
}

const activityTabStyles = StyleSheet.create({
  spine: {
    position: "absolute",
    left: 11,
    top: 10,
    bottom: 10,
    width: 1,
    backgroundColor: "#ebebeb",
  },
});

/** Stub tab for Offerings, Documents. */
function PlaceholderTab({ label }: { label: string }): JSX.Element {
  return (
    <View className="items-center justify-center py-16 gap-2">
      <Icon name="note" size="lg" tone="muted" />
      <Typography type="body-sm" color="muted">
        {label} coming soon
      </Typography>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Profiles tab
 * ------------------------------------------------------------------ */

const PROFILE_TYPE_STYLE: Record<
  InvestingProfile["type"],
  { bg: string; color: string; chipColor: "accent" | "success" | "warning" | "default" }
> = {
  Individual: { bg: "#eef4ff", color: "#1d4ed8", chipColor: "accent" },
  Entity:     { bg: "#fdf4ff", color: "#7e22ce", chipColor: "default" },
  Trust:      { bg: "#f0fdf4", color: "#166534", chipColor: "success" },
  Joint:      { bg: "#fff7ed", color: "#c2410c", chipColor: "warning" },
};

const ACCRED_STYLE: Record<
  InvestingProfile["accreditationStatus"],
  { bg: string; color: string; icon: IconName; label: string; chipColor: "success" | "warning" | "default" }
> = {
  verified:     { bg: "#f0fdf4", color: "#15803d", icon: "shield", label: "Accredited",   chipColor: "success" },
  pending:      { bg: "#fff7ed", color: "#c2410c", icon: "time",   label: "Pending",      chipColor: "warning" },
  not_verified: { bg: "#f4f4f5", color: "#71717a", icon: "portal", label: "Not verified", chipColor: "default" },
};

function ProfileCard({
  profile,
  contactId,
}: {
  profile: InvestingProfile;
  contactId: string;
}): JSX.Element {
  const typeStyle = PROFILE_TYPE_STYLE[profile.type];
  const accred   = ACCRED_STYLE[profile.accreditationStatus];

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const summaryParts = [
    profile.totalCommitment > 0 && `${fmtShort(profile.totalCommitment)} committed`,
    `${profile.activePositions} position${profile.activePositions !== 1 ? "s" : ""}`,
    `${profile.attachedContacts.length} contact${profile.attachedContacts.length !== 1 ? "s" : ""}`,
  ].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/profile/[profileId]",
          params: { profileId: profile.id, contactId },
        })
      }
    >
      <Surface className="rounded-2xl">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: typeStyle.bg,
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography weight="semibold" style={{ fontSize: 15, color: typeStyle.color }}>
              {initials}
            </Typography>
          </View>

          {/* Info */}
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Typography weight="semibold" style={{ fontSize: 14, lineHeight: 16 }} numberOfLines={1}>
              {profile.name}
            </Typography>
            <Typography style={{ fontSize: 12, color: TONE_HEX.muted }} numberOfLines={1}>
              {summaryParts}
            </Typography>
            <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap" }}>
              <Chip variant="soft" color={typeStyle.chipColor} size="sm">
                <Chip.Label className="text-xs">{profile.type}</Chip.Label>
              </Chip>
            </View>
          </View>

          {/* Chevron */}
          <Icon name="chevron" size="sm" tone="muted" />
        </View>
      </Surface>
    </Pressable>
  );
}

function ProfilesTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  if (!contact.profiles || contact.profiles.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="person" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">
          No profiles yet
        </Typography>
        <Typography type="body-xs" color="muted">
          Profiles are created on the desktop
        </Typography>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {contact.profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} contactId={contact.id} />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Investments tab
 * ------------------------------------------------------------------ */

const fmtShort = (n: number): string => {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}K`;
  }
  return `$${n.toLocaleString()}`;
};


function PositionCard({
  position,
  contactId,
  contactName,
}: {
  position: Position;
  contactId: string;
  contactName: string;
}): JSX.Element {
  const fundedPct =
    position.commitment > 0 ? position.contribution / position.commitment : 1;

  const summaryParts = [
    `${fmtShort(position.contribution)} contributed`,
    position.distributions > 0 && `${fmtShort(position.distributions)} distributed`,
    `${(position.ownership * 100).toFixed(1)}% ownership`,
  ].filter(Boolean).join(" · ");

  return (
    <Surface className="p-0 rounded-2xl overflow-hidden">
      {/* Main body */}
      <View style={{ padding: 14, gap: 11 }}>
        {/* Top row: name left · commitment right */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Typography
              weight="semibold"
              style={{ fontSize: 15, marginBottom: 3 }}
              numberOfLines={2}
            >
              {position.fundName}
            </Typography>
            <Typography type="body-xs" color="muted" style={{ marginBottom: 8 }}>
              {position.fundType} · {position.class}
            </Typography>
            <Chip
              variant="soft"
              color={position.status === "Active" ? "success" : "default"}
              size="sm"
            >
              <Chip.Label className="text-xs">{position.status} · {position.vintage}</Chip.Label>
            </Chip>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Typography weight="bold" style={{ fontSize: 18 }}>
              {fmtShort(position.commitment)}
            </Typography>
            <Typography style={{ fontSize: 10, color: TONE_HEX.muted, fontWeight: "500" }}>
              COMMITTED
            </Typography>
          </View>
        </View>

        {/* Progress bar + summary */}
        <View style={{ gap: 5 }}>
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: "#f0f0f0",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 5,
                width: `${Math.min(fundedPct * 100, 100)}%`,
                backgroundColor: fundedPct >= 1 ? TONE_HEX.accent : TONE_HEX.warning,
                borderRadius: 3,
              }}
            />
          </View>
          <Typography style={{ fontSize: 11, color: TONE_HEX.muted }}>
            {summaryParts}
          </Typography>
        </View>
      </View>

      {/* Transactions CTA */}
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: `${TONE_HEX.accent}0a`,
        }}
        onPress={() =>
          router.push({
            pathname: "/position/[positionId]",
            params: { positionId: position.id, contactId, contactName },
          })
        }
      >
        <Typography style={{ color: TONE_HEX.accent, fontWeight: "600", fontSize: 14 }}>
          {position.transactions.length} Transaction
          {position.transactions.length !== 1 ? "s" : ""}
        </Typography>
        <Icon name="chevron" size="sm" tone="accent" />
      </Pressable>
    </Surface>
  );
}

/* ------------------------------------------------------------------ *
 * Offerings tab
 * ------------------------------------------------------------------ */

function OfferingsTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  const subs = contact.offeringSubscriptions ?? [];

  if (subs.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="org" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">
          No offering subscriptions
        </Typography>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {subs.map((sub) => {
        const offering = OFFERINGS.find((o) => o.id === sub.offeringId);
        if (!offering) return null;
        return (
          <OfferingCard key={sub.offeringId} offering={offering} subscription={sub} />
        );
      })}
    </View>
  );
}

function InvestmentsTab({
  contact,
}: {
  contact: ContactDetailData;
}): JSX.Element {
  if (!contact.positions || contact.positions.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="note" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">
          No investments yet
        </Typography>
      </View>
    );
  }

  const totalCommitted = contact.positions.reduce((sum, p) => sum + p.commitment, 0);
  const totalContributed = contact.positions.reduce((sum, p) => sum + p.contribution, 0);
  const totalDistributions = contact.positions.reduce((sum, p) => sum + p.distributions, 0);

  return (
    <View className="gap-4">
      {/* Summary header — 3 metric cards */}
      <View className="flex-row gap-2">
        <MetricCard label="Committed" value={fmtShort(totalCommitted)} style={{ flex: 1 }} />
        <MetricCard label="Contributed" value={fmtShort(totalContributed)} style={{ flex: 1 }} />
        <MetricCard
          label="Distributions"
          value={fmtShort(totalDistributions)}
          valueColor={TONE_HEX.success}
          style={{ flex: 1 }}
        />
      </View>

      {/* Position cards */}
      {contact.positions.map((pos) => (
        <PositionCard
          key={pos.id}
          position={pos}
          contactId={contact.id}
          contactName={contact.name}
        />
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Contact page
 * ------------------------------------------------------------------ */

export default function ContactPage(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contact = CONTACTS.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [isFavorite, setIsFavorite] = useState(() => getIsFavorite(id));
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  // Activity state
  const [localActivities, setLocalActivities] = useState<Activity[]>(() => contact?.activity ?? []);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [activityFormKind, setActivityFormKind] = useState<ActivityFormKind | null>(null);
  const [activityFormInitial, setActivityFormInitial] = useState<Activity | null>(null);
  const [activityFormReadOnly, setActivityFormReadOnly] = useState(false);
  const [showActivityTask, setShowActivityTask] = useState(false);
  const [taskInitial, setTaskInitial] = useState<Activity | null>(null);

  // Record this contact as recently viewed
  useEffect(() => {
    if (id) recordRecent(id);
  }, [id]);

  const handleActivityPickerSelect = (kind: CreateActivityKind) => {
    setShowActivityPicker(false);
    if (kind === "task") {
      setShowActivityTask(true);
    } else {
      setActivityFormKind(kind as ActivityFormKind);
    }
  };

  const handleActivitySave = (feedActivity: FeedActivity) => {
    const isEdit = localActivities.some((a) => a.id === feedActivity.id);
    if (isEdit) {
      setLocalActivities((prev) =>
        prev.map((a) => (a.id === feedActivity.id ? (feedActivity as Activity) : a))
      );
    } else {
      setLocalActivities((prev) => [feedActivity as Activity, ...prev]);
    }
    setActivityFormKind(null);
    setActivityFormInitial(null);
    setActivityFormReadOnly(false);
    setShowActivityTask(false);
    setTaskInitial(null);
  };

  const handleActivityDelete = (id: string) => {
    setLocalActivities((prev) => prev.filter((a) => a.id !== id));
    setActivityFormKind(null);
    setActivityFormInitial(null);
    setShowActivityTask(false);
    setTaskInitial(null);
  };

  const openActivityDetail = (item: Activity) => {
    if (item.kind === "task") {
      setTaskInitial(item);
      setShowActivityTask(true);
    } else if (item.kind === "synced-meeting") {
      setActivityFormInitial(item);
      setActivityFormReadOnly(true);
      setActivityFormKind("meeting");
    } else if (item.kind === "synced-email") {
      setActivityFormInitial(item);
      setActivityFormReadOnly(true);
      setActivityFormKind("email");
    } else {
      setActivityFormInitial(item);
      setActivityFormReadOnly(false);
      setActivityFormKind(item.kind as ActivityFormKind);
    }
  };

  /* Not-found fallback */
  if (!contact) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background items-center justify-center gap-3"
      >
        <Typography type="body-sm" color="muted">
          Contact not found
        </Typography>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/contacts")
          }
        >
          <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
            Go back
          </Typography>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Action sheet — rendered as a modal, lives outside the scroll tree */}
      <ContactActionSheet
        visible={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
      />

      {/* ── Fixed nav bar ────────────────────────────────────────── */}
      <View className="flex-row items-center px-4 py-2 gap-2">
        {/* Back */}
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/contacts")
          }
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>

        {/* Spacer (name shown in profile header below) */}
        <View className="flex-1" />

        {/* Right actions */}
        <View className="flex-row items-center gap-1">
          {/* Share */}
          <Pressable
            onPress={() =>
              Share.share({
                title: contact.name,
                message: [
                  contact.name,
                  contact.company,
                  contact.email,
                  contact.phone,
                ]
                  .filter(Boolean)
                  .join("\n"),
              })
            }
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <Icon name="share" size="md" tone="foreground" />
          </Pressable>

          {/* Favorite */}
          <Pressable
            onPress={() => setIsFavorite(toggleFavorite(id))}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <Icon
              name={isFavorite ? "favoriteFilled" : "favorite"}
              size="md"
              tone="foreground"
              color={isFavorite ? FAVORITE_GOLD : undefined}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Scrollable body (tab bar sticks at index 1) ──────────── */}
      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* [0] Profile header */}
        <View className="items-center px-5 pt-5 pb-6 gap-3">
          {/* Large avatar */}
          <View
            className="h-20 w-20 rounded-full items-center justify-center"
            style={{ backgroundColor: `${TONE_HEX.accent}18` }}
          >
            <Typography
              weight="semibold"
              style={{ fontSize: 26, color: TONE_HEX.accent }}
            >
              {contact.initials}
            </Typography>
          </View>

          {/* Name + company + tag */}
          <View className="items-center gap-1">
            <Typography weight="bold" style={{ fontSize: 22 }}>
              {contact.name}
            </Typography>
            <Typography type="body-sm" color="muted">
              {contact.company}
            </Typography>
            <View className="mt-1">
              <Tag label={contact.tag} />
            </View>
          </View>

          {/* 4 action buttons */}
          <View className="flex-row pt-1 justify-center gap-3">
            <ActionButton
              icon="call"
              label="Call"
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              disabled={!contact.phone}
            />
            <ActionButton
              icon="email"
              label="Email"
              onPress={() => Linking.openURL(`mailto:${contact.email}`)}
              disabled={!contact.email}
            />
            <ActionButton
              icon="logNote"
              label="Note"
              onPress={() => {}}
            />
            <ActionButton
              icon="more"
              label="More"
              onPress={() => setActionSheetOpen(true)}
            />
          </View>
        </View>

        {/* [1] Tab bar — STICKY */}
        <View
          className="bg-background"
          style={{ borderBottomWidth: 1, borderBottomColor: "#e4e4e7" }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 4,
                    marginRight: 24,
                    borderBottomWidth: 2,
                    borderBottomColor: active ? TONE_HEX.accent : "transparent",
                  }}
                >
                  <Typography
                    style={{
                      fontSize: 14,
                      color: active ? TONE_HEX.accent : TONE_HEX.muted,
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* [2] Tab content */}
        <View className="px-5 pt-5" style={{ paddingBottom: activeTab === "activity" ? 100 : 0 }}>
          {activeTab === "details" && <DetailsTab contact={contact} />}
          {activeTab === "activity" && (
            <ActivityTab
              activities={localActivities}
              onActivityPress={openActivityDetail}
            />
          )}
          {activeTab === "profiles" && <ProfilesTab contact={contact} />}
          {activeTab === "investments" && <InvestmentsTab contact={contact} />}
          {activeTab === "offerings" && <OfferingsTab contact={contact} />}
          {activeTab === "documents" && <PlaceholderTab label="Documents" />}
        </View>
      </ScrollView>

      {/* FAB — only on activity tab */}
      {activeTab === "activity" && (
        <Pressable
          onPress={() => setShowActivityPicker(true)}
          style={pageStyles.fab}
        >
          <Icon name="add" size={28} color="#ffffff" />
        </Pressable>
      )}

      {/* Activity creation sheets */}
      <CreateActivitySheet
        visible={showActivityPicker}
        onClose={() => setShowActivityPicker(false)}
        onSelect={handleActivityPickerSelect}
      />
      <ActivityFormSheet
        kind={activityFormKind}
        visible={activityFormKind !== null}
        onClose={() => { setActivityFormKind(null); setActivityFormInitial(null); setActivityFormReadOnly(false); }}
        onSave={handleActivitySave}
        onDelete={handleActivityDelete}
        defaultContact={activityFormInitial ? undefined : contact}
        initialActivity={activityFormInitial ?? undefined}
        readOnly={activityFormReadOnly}
      />
      <CreateTaskSheet
        visible={showActivityTask}
        onClose={() => { setShowActivityTask(false); setTaskInitial(null); }}
        onSave={handleActivitySave}
        onDelete={handleActivityDelete}
        defaultContact={taskInitial ? undefined : contact}
        initialActivity={taskInitial ?? undefined}
      />
    </SafeAreaView>
  );
}
