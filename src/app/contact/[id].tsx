import { router, useLocalSearchParams } from "expo-router";
import { Card, Chip, Separator, Surface, Typography } from "heroui-native";
import { useEffect, useState, type JSX } from "react";
import { Linking, Pressable, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityCard, Icon, Tag } from "@/components";
import { recordRecent } from "@/data/recents";
import { CONTACTS, type ContactDetailData, type Position } from "@/data/contacts";
import { TONE_HEX, type IconName } from "@/theme/tokens";

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

const TABS = [
  { id: "details", label: "Details" },
  { id: "activity", label: "Activity" },
  { id: "investments", label: "Investments" },
  { id: "offerings", label: "Offerings" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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

/** Tappable info row (email, phone, org, location). */
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

/** Details tab content. */
function DetailsTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  const hasContactInfo =
    contact.email || contact.phone || contact.website || contact.location;

  return (
    <View className="gap-6">
      {/* Copilot brief */}
      {contact.aiBrief && (
        <Surface className="gap-2 rounded-2xl">
          <View className="flex-row items-center gap-2">
            <Icon name="copilot" size="sm" tone="accent" />
            <Typography type="body-xs" color="muted">
              Copilot Brief
            </Typography>
          </View>
          <Typography type="body-sm">{contact.aiBrief}</Typography>
        </Surface>
      )}

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
            {contact.website && (
              <InfoRow
                icon="org"
                label={contact.company}
                onPress={() => Linking.openURL(contact.website!)}
                showSeparator={!!(contact.email || contact.phone)}
              />
            )}
            {contact.location && (
              <InfoRow
                icon="location"
                label={contact.location}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${encodeURIComponent(contact.location!)}`
                  )
                }
                showSeparator={!!(contact.email || contact.phone || contact.website)}
              />
            )}
          </Surface>
        </View>
      )}

      {/* Next meeting */}
      {contact.nextMeeting && (
        <View className="gap-2">
          <Typography className="text-xs" weight="semibold">
            Next Meeting
          </Typography>
          <Card className="gap-2 rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name="calendar" size="sm" tone="accent" />
                <Typography type="body-sm" weight="semibold">
                  {contact.nextMeeting.type}
                </Typography>
              </View>
            </View>
            <Typography type="body-sm" color="muted">
              {contact.nextMeeting.date} · {contact.nextMeeting.time} ·{" "}
              {contact.nextMeeting.duration}
            </Typography>
          </Card>
        </View>
      )}

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
    </View>
  );
}

/** Activity tab content. */
function ActivityTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  if (!contact.activity || contact.activity.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="activity" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">
          No activity yet
        </Typography>
      </View>
    );
  }
  return (
    <View className="gap-3">
      <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
        Recent
      </Typography>
      {contact.activity.map((item) => (
        <ActivityCard key={item.id} item={item} />
      ))}
    </View>
  );
}

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
  const unfunded = position.commitment - position.contribution;

  return (
    <Surface className="p-0 rounded-2xl overflow-hidden">
      {/* Header: fund name + status */}
      <View className="px-4 pt-4 pb-3 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Typography weight="semibold" className="text-base flex-1" numberOfLines={2}>
            {position.fundName}
          </Typography>
          <Chip
            variant="soft"
            color={position.status === "Active" ? "success" : "default"}
            size="sm"
          >
            <Chip.Label className="text-xs">{position.status}</Chip.Label>
          </Chip>
        </View>
        <Typography type="body-xs" color="muted">
          {position.fundType} · Est. {position.vintage}
        </Typography>
        <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>
          {position.profile} · {position.class}
        </Typography>
      </View>

      <Separator />

      {/* 2×2 metrics */}
      <View className="px-4 py-3 gap-3">
        <View className="flex-row gap-4">
          <View className="flex-1 gap-0.5">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>COMMITTED</Typography>
            <Typography weight="semibold" className="text-sm">{fmtShort(position.commitment)}</Typography>
          </View>
          <View className="flex-1 gap-0.5">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>CONTRIBUTED</Typography>
            <Typography weight="semibold" className="text-sm">{fmtShort(position.contribution)}</Typography>
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-0.5">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>DISTRIBUTIONS</Typography>
            <Typography weight="semibold" className="text-sm" style={{ color: TONE_HEX.success }}>
              {fmtShort(position.distributions)}
            </Typography>
          </View>
          <View className="flex-1 gap-0.5">
            <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>OWNERSHIP</Typography>
            <Typography weight="semibold" className="text-sm">
              {(position.ownership * 100).toFixed(1)}%
            </Typography>
          </View>
        </View>
        {unfunded > 0 && (
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TONE_HEX.warning }} />
            <Typography type="body-xs" style={{ color: TONE_HEX.warning, fontSize: 11 }}>
              {fmtShort(unfunded)} unfunded
            </Typography>
          </View>
        )}
      </View>

      <Separator />

      {/* Transactions link */}
      <Pressable
        className="flex-row items-center justify-between px-4 py-3 active:bg-surface-secondary"
        onPress={() =>
          router.push({
            pathname: "/position/[positionId]",
            params: { positionId: position.id, contactId, contactName },
          })
        }
      >
        <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
          {position.transactions.length} Transaction{position.transactions.length !== 1 ? "s" : ""}
        </Typography>
        <Icon name="chevron" size="sm" tone="accent" />
      </Pressable>
    </Surface>
  );
}

function InvestmentsTab({ contact }: { contact: ContactDetailData }): JSX.Element {
  if (!contact.positions || contact.positions.length === 0) {
    return (
      <View className="items-center justify-center py-16 gap-2">
        <Icon name="note" size="lg" tone="muted" />
        <Typography type="body-sm" color="muted">No investments yet</Typography>
      </View>
    );
  }

  const totalCommitted = contact.positions.reduce((sum, p) => sum + p.commitment, 0);
  const totalDistributions = contact.positions.reduce((sum, p) => sum + p.distributions, 0);

  return (
    <View className="gap-4">
      {/* Summary header */}
      <View className="flex-row gap-3">
        <Surface className="flex-1 gap-1 rounded-2xl">
          <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>TOTAL COMMITTED</Typography>
          <Typography weight="bold" className="text-lg">{fmtShort(totalCommitted)}</Typography>
        </Surface>
        <Surface className="flex-1 gap-1 rounded-2xl">
          <Typography type="body-xs" color="muted" style={{ fontSize: 11 }}>DISTRIBUTIONS</Typography>
          <Typography weight="bold" className="text-lg" style={{ color: TONE_HEX.success }}>
            {fmtShort(totalDistributions)}
          </Typography>
        </Surface>
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
  const [isFavorite, setIsFavorite] = useState(false);

  // Record this contact as recently viewed
  useEffect(() => {
    if (id) recordRecent(id);
  }, [id]);

  /* Not-found fallback */
  if (!contact) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background items-center justify-center gap-3">
        <Typography type="body-sm" color="muted">
          Contact not found
        </Typography>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/contacts")}>
          <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
            Go back
          </Typography>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* ── Fixed nav bar ────────────────────────────────────────── */}
      <View className="flex-row items-center px-4 py-2 gap-2">
        {/* Back */}
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)/contacts")}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>

        {/* Title */}
        <Typography weight="semibold" className="text-base flex-1 text-center" numberOfLines={1}>
          {contact.name}
        </Typography>

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
            onPress={() => setIsFavorite((f) => !f)}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <Icon
              name={isFavorite ? "favoriteFilled" : "favorite"}
              size="md"
              tone={isFavorite ? "danger" : "foreground"}
            />
          </Pressable>

          {/* More options */}
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#f0f0f0" }}
          >
            <Icon name="more" size="md" tone="foreground" />
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
              icon="sendInvite"
              label="Data Room"
              onPress={() => contact.dataRoomUrl && Linking.openURL(contact.dataRoomUrl)}
              disabled={!contact.dataRoomUrl}
            />
          </View>
        </View>

        {/* [1] Tab bar — STICKY */}
        <View className="bg-background" style={{ borderBottomWidth: 1, borderBottomColor: "#e4e4e7" }}>
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
        <View className="px-5 pt-5">
          {activeTab === "details" && <DetailsTab contact={contact} />}
          {activeTab === "activity" && <ActivityTab contact={contact} />}
          {activeTab === "investments" && <InvestmentsTab contact={contact} />}
          {activeTab === "offerings" && <PlaceholderTab label="Offerings" />}
          {activeTab === "documents" && <PlaceholderTab label="Documents" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
