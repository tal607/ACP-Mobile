import { router, useLocalSearchParams } from "expo-router";
import { Chip, Separator, Surface, Typography } from "heroui-native";
import { useState, type JSX } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, MetricCard } from "@/components";
import {
  CONTACTS,
  type AmlStatus,
  type AccreditationStatus,
  type InvestingProfile,
  type ProfileAttachedContact,
} from "@/data/contacts";
import { TONE_HEX } from "@/theme/tokens";

/* ------------------------------------------------------------------ *
 * Helpers
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

const PROFILE_TYPE_STYLE: Record<
  InvestingProfile["type"],
  { bg: string; color: string; chipColor: "accent" | "success" | "warning" | "default" }
> = {
  Individual: { bg: "#eef4ff", color: "#1d4ed8", chipColor: "accent"   },
  Entity:     { bg: "#fdf4ff", color: "#7e22ce", chipColor: "default"  },
  Trust:      { bg: "#f0fdf4", color: "#166534", chipColor: "success"  },
  Joint:      { bg: "#fff7ed", color: "#c2410c", chipColor: "warning"  },
};

const AML_STYLE: Record<AmlStatus, { bg: string; color: string; label: string; chipColor: "success" | "warning" | "danger" }> = {
  cleared: { bg: "#f0fdf4", color: "#15803d", label: "Cleared",     chipColor: "success" },
  review:  { bg: "#fff7ed", color: "#c2410c", label: "Under Review", chipColor: "warning" },
  flagged: { bg: "#fef2f2", color: "#dc2626", label: "Flagged",      chipColor: "danger"  },
};

const ACCRED_STYLE: Record<
  AccreditationStatus,
  { bg: string; color: string; label: string; chipColor: "success" | "warning" | "default" }
> = {
  verified:     { bg: "#f0fdf4", color: "#15803d", label: "Verified",     chipColor: "success" },
  pending:      { bg: "#fff7ed", color: "#c2410c", label: "Pending",      chipColor: "warning" },
  not_verified: { bg: "#f4f4f5", color: "#71717a", label: "Not Verified", chipColor: "default" },
};

/* ------------------------------------------------------------------ *
 * Sub-components
 * ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: string }): JSX.Element {
  return (
    <Typography
      style={{
        fontSize: 11,
        fontWeight: "600",
        color: TONE_HEX.muted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 6,
      }}
    >
      {children}
    </Typography>
  );
}

function DetailRow({
  label,
  value,
  showSeparator,
}: {
  label: string;
  value: string;
  showSeparator?: boolean;
}): JSX.Element {
  return (
    <>
      {showSeparator && <Separator />}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 12,
        }}
      >
        <Typography type="body-sm" color="muted">
          {label}
        </Typography>
        <Typography
          type="body-sm"
          weight="semibold"
          style={{ textAlign: "right", flexShrink: 1 }}
        >
          {value}
        </Typography>
      </View>
    </>
  );
}

/** Tappable address row. */
function AddressRow({ address }: { address: string }): JSX.Element {
  return (
    <Pressable
      onPress={() =>
        Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`)
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "#f5f5f5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="location" size="sm" tone="muted" />
      </View>
      <Typography
        type="body-sm"
        style={{ color: TONE_HEX.accent, flex: 1, lineHeight: 20 }}
      >
        {address.replace("\n", "\n")}
      </Typography>
      <Icon name="chevron" size="sm" tone="muted" />
    </Pressable>
  );
}

/** Read-only toggle display. */
function ToggleRow({
  label,
  value,
  showSeparator,
}: {
  label: string;
  value: boolean;
  showSeparator?: boolean;
}): JSX.Element {
  const [on, setOn] = useState(value);

  return (
    <>
      {showSeparator && <Separator />}
      <Pressable
        onPress={() => setOn((v) => !v)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 11,
        }}
      >
        <Typography type="body-sm" color="muted">
          {label}
        </Typography>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 38,
              height: 22,
              borderRadius: 11,
              backgroundColor: on ? TONE_HEX.accent : "#d1d5db",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#ffffff",
                position: "absolute",
                left: on ? 18 : 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </View>
          <Typography type="body-sm" weight="semibold">
            {on ? "Yes" : "No"}
          </Typography>
        </View>
      </Pressable>
    </>
  );
}

/** Inline setting row for attached contact — read-only, no chevron tap. */
function SettingRow({
  iconName,
  label,
  value,
  valueColor,
  showSeparator,
}: {
  iconName: keyof typeof import("@/theme/tokens").ICONS;
  label: string;
  value: string;
  valueColor?: string;
  showSeparator?: boolean;
}): JSX.Element {
  return (
    <>
      {showSeparator && <Separator />}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 9,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            backgroundColor: "#f5f5f5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={iconName} size={14} tone="muted" />
        </View>
        <Typography type="body-sm" color="muted" style={{ flex: 1 }}>
          {label}
        </Typography>
        <Typography
          type="body-sm"
          weight="semibold"
          style={{
            color: valueColor ?? TONE_HEX.foreground,
            textAlign: "right",
            flexShrink: 1,
            maxWidth: "60%",
          }}
          numberOfLines={2}
        >
          {value}
        </Typography>
      </View>
    </>
  );
}

function AttachedContactCard({
  contact,
  isFirst,
}: {
  contact: ProfileAttachedContact;
  isFirst: boolean;
}): JSX.Element {
  const channelsValue =
    contact.channels === "all"
      ? "All channels"
      : contact.channels === "none"
      ? "None"
      : (contact.channelList ?? []).join(", ") || "Custom";

  const sensitiveValue =
    contact.sensitiveData === "edit"
      ? "Edit"
      : contact.sensitiveData === "view"
      ? "View"
      : "No access";

  const sensitiveColor =
    contact.sensitiveData === "no_access" ? TONE_HEX.danger : undefined;

  const positionValue =
    contact.positionAccess === "all"
      ? "All positions"
      : contact.positionAccess === "none"
      ? "None"
      : (contact.customPositions ?? []).join(", ") || "Custom";

  const positionColor =
    contact.positionAccess === "none"
      ? TONE_HEX.danger
      : contact.positionAccess === "all"
      ? TONE_HEX.accent
      : undefined;

  return (
    <>
      {!isFirst && <Separator />}
      {/* Contact header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: contact.isPrimary ? "#eef4ff" : "#f4f4f5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: contact.isPrimary ? TONE_HEX.accent : TONE_HEX.muted,
            }}
          >
            {contact.initials}
          </Typography>
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 3,
            }}
          >
            <Typography weight="semibold" style={{ fontSize: 14 }}>
              {contact.name}
            </Typography>
            <Chip variant="soft" color={contact.isPrimary ? "accent" : "default"} size="sm">
              <Chip.Label className="text-xs">
                {contact.isPrimary ? "To · Primary" : "CC · Secondary"}
              </Chip.Label>
            </Chip>
          </View>
          {contact.relationshipType && (
            <Typography type="body-xs" color="muted">
              {contact.relationshipType}
            </Typography>
          )}
        </View>
      </View>

      {/* Setting rows */}
      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "#f0f0f0",
          marginHorizontal: 14,
        }}
      />
      <SettingRow iconName="email" label="Channels" value={channelsValue} />
      <SettingRow
        iconName="lockOpen"
        label="Sensitive Data"
        value={sensitiveValue}
        valueColor={sensitiveColor}
        showSeparator
      />
      <SettingRow
        iconName="portal"
        label="Position Access"
        value={positionValue}
        valueColor={positionColor}
        showSeparator
      />
      <View style={{ height: 4 }} />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Profile detail page
 * ------------------------------------------------------------------ */

export default function ProfilePage(): JSX.Element {
  const { profileId, contactId } = useLocalSearchParams<{
    profileId: string;
    contactId: string;
  }>();

  const contact = CONTACTS.find((c) => c.id === contactId);
  const profile = contact?.profiles?.find((p) => p.id === profileId);

  if (!profile) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-background items-center justify-center gap-3"
      >
        <Typography type="body-sm" color="muted">
          Profile not found
        </Typography>
        <Pressable onPress={() => router.back()}>
          <Typography type="body-sm" style={{ color: TONE_HEX.accent }}>
            Go back
          </Typography>
        </Pressable>
      </SafeAreaView>
    );
  }

  const typeStyle = PROFILE_TYPE_STYLE[profile.type];
  const aml       = AML_STYLE[profile.amlStatus];
  const accred    = ACCRED_STYLE[profile.accreditationStatus];

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

  const fundedPct =
    profile.totalCommitment > 0
      ? Math.min(profile.totalContribution / profile.totalCommitment, 1)
      : 0;

  const mainDetails = [
    { label: "Profile Name", value: profile.name },
    { label: "Tax ID",        value: profile.taxId ?? "—" },
    { label: "Type",          value: profile.type },
    ...(profile.placeOfBirth
      ? [{ label: "Place of Birth", value: profile.placeOfBirth }]
      : []),
    ...(profile.citizenship
      ? [{ label: "Citizenship", value: profile.citizenship }]
      : []),
    ...(profile.residency
      ? [{ label: "Residency", value: profile.residency }]
      : []),
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Nav bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#f0f0f0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>
        <View style={{ flex: 1 }} />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
      >
        {/* Profile header */}
        <View
          style={{
            alignItems: "center",
            gap: 6,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: typeStyle.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              weight="semibold"
              style={{ fontSize: 22, color: typeStyle.color }}
            >
              {initials}
            </Typography>
          </View>
          <Typography weight="bold" style={{ fontSize: 18 }}>
            {profile.name}
          </Typography>
          <Chip variant="soft" color={typeStyle.chipColor} size="sm" style={{ alignSelf: "center" }}>
            <Chip.Label className="text-xs">{profile.type}</Chip.Label>
          </Chip>
        </View>

        {/* 4 metric cards */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <MetricCard
            label="Offering subs"
            value={String(profile.offeringSubscriptions)}
            valueColor={TONE_HEX.accent}
            style={{ flex: 1, minWidth: "45%" }}
          />
          <MetricCard
            label="Active positions"
            value={String(profile.activePositions)}
            style={{ flex: 1, minWidth: "45%" }}
          />
          <MetricCard
            label="Distributions"
            value={profile.totalDistributions > 0 ? fmtShort(profile.totalDistributions) : "—"}
            valueColor={profile.totalDistributions > 0 ? TONE_HEX.success : undefined}
            style={{ flex: 1, minWidth: "45%" }}
          />
          <MetricCard
            label="Contrib / commit"
            value={profile.totalCommitment > 0 ? fmtShort(profile.totalContribution) : "—"}
            progress={profile.totalCommitment > 0 ? fundedPct : undefined}
            style={{ flex: 1, minWidth: "45%" }}
          />
        </View>

        {/* Main Details */}
        <SectionLabel>Main Details</SectionLabel>
        <Surface className="p-0 rounded-2xl">
          {mainDetails.map((d, i) => (
            <DetailRow
              key={d.label}
              label={d.label}
              value={d.value}
              showSeparator={i > 0}
            />
          ))}
        </Surface>

        {/* Mailing Address */}
        {profile.mailingAddress && (
          <>
            <SectionLabel>Mailing Address</SectionLabel>
            <Surface className="p-0 rounded-2xl">
              <AddressRow address={profile.mailingAddress} />
            </Surface>
          </>
        )}

        {/* Tax Details */}
        <SectionLabel>Tax Details</SectionLabel>
        <Surface className="p-0 rounded-2xl">
          <ToggleRow label="Electronic K-1 Consent" value={profile.electronicK1Consent} />
          <ToggleRow
            label="Disregarded Entity"
            value={profile.disregardedEntity}
            showSeparator
          />
        </Surface>

        {/* Compliance */}
        <SectionLabel>Compliance</SectionLabel>
        <Surface className="p-0 rounded-2xl">
          {/* Risk score */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 11,
              gap: 10,
            }}
          >
            <Typography type="body-sm" color="muted" style={{ flex: 0 }}>
              Risk Score
            </Typography>
            <View
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#f0f0f0",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${profile.riskScore}%`,
                  borderRadius: 3,
                  backgroundColor:
                    profile.riskScore < 40
                      ? TONE_HEX.success
                      : profile.riskScore < 70
                      ? TONE_HEX.warning
                      : TONE_HEX.danger,
                }}
              />
            </View>
            <Typography
              weight="semibold"
              style={{
                fontSize: 13,
                color:
                  profile.riskScore < 40
                    ? TONE_HEX.success
                    : profile.riskScore < 70
                    ? TONE_HEX.warning
                    : TONE_HEX.danger,
                minWidth: 24,
                textAlign: "right",
              }}
            >
              {profile.riskScore}
            </Typography>
          </View>

          <Separator />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 14,
              paddingVertical: 11,
            }}
          >
            <Typography type="body-sm" color="muted">
              AML
            </Typography>
            <Chip variant="soft" color={aml.chipColor} size="sm">
              <Chip.Label className="text-xs">{aml.label}</Chip.Label>
            </Chip>
          </View>

          <Separator />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 14,
              paddingVertical: 11,
            }}
          >
            <Typography type="body-sm" color="muted">
              Verified Accreditation
            </Typography>
            <Chip variant="soft" color={accred.chipColor} size="sm">
              <Chip.Label className="text-xs">{accred.label}</Chip.Label>
            </Chip>
          </View>
        </Surface>

        {/* Attached Contacts */}
        {profile.attachedContacts.length > 0 && (
          <>
            <SectionLabel>Attached Contacts</SectionLabel>
            <Surface className="p-0 rounded-2xl overflow-hidden">
              {profile.attachedContacts.map((c, i) => (
                <AttachedContactCard key={c.id} contact={c} isFirst={i === 0} />
              ))}
            </Surface>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
