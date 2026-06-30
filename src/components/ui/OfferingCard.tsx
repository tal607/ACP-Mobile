import { router } from "expo-router";
import { Chip, Surface, Typography } from "heroui-native";
import type { JSX } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TONE_HEX } from "@/theme/tokens";
import type { ContactOffering, Offering, SubscriptionStage } from "@/data/offerings";
import { Icon } from "./Icon";

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

const STAGE_COLOR: Record<
  SubscriptionStage,
  "default" | "accent" | "warning" | "success"
> = {
  "Hasn't Started": "default",
  "Started":        "accent",
  "Counter Sign":   "warning",
  "Waitlist":       "warning",
  "Completed":      "success",
  "Signed":         "success",
};

/* ------------------------------------------------------------------ *
 * OfferingCard
 * ------------------------------------------------------------------ */

type OfferingCardProps = {
  offering: Offering;
  /** When provided (contact offerings tab), renders the subscription band. */
  subscription?: ContactOffering;
};

/**
 * Shared card used on both the main Offerings tab and the contact Offerings tab.
 * Tapping navigates to the offering detail page (to be designed).
 */
export function OfferingCard({ offering, subscription }: OfferingCardProps): JSX.Element {
  const progress =
    offering.raiseTarget > 0
      ? Math.min(offering.commitments / offering.raiseTarget, 1)
      : 0;
  const progressPct = Math.round(progress * 100);
  const isOverSubscribed = offering.commitments > offering.raiseTarget;

  const statusColor = offering.status === "Active" ? "success" : "default";

  const raisedSentence = `${fmtShort(offering.commitments)} raised of ${fmtShort(offering.raiseTarget)} target`;
  const prospectsLabel = `${offering.prospectsCount} prospect${offering.prospectsCount !== 1 ? "s" : ""}`;
  const summaryParts = `${raisedSentence} · ${prospectsLabel}`;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/offering/[offeringId]",
          params: { offeringId: offering.id },
        })
      }
    >
      <Surface className="p-0 rounded-2xl overflow-hidden">
        {/* Main body */}
        <View style={{ padding: 12, gap: 0 }}>
          {/* Top row: name + status chip + chevron */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Typography
                weight="semibold"
                style={{ fontSize: 15, marginBottom: 0 }}
                numberOfLines={1}
              >
                {offering.name}
              </Typography>
              {!subscription && (
                <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
                  {offering.type}
                </Typography>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Chip variant="soft" color={statusColor} size="sm">
                <Chip.Label className="text-xs">{offering.status}</Chip.Label>
              </Chip>
              <Icon name="chevron" size="sm" tone="muted" />
            </View>
          </View>

          {/* Progress bar + summary */}
          <View style={{ gap: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={{
                  flex: 1,
                  height: 5,
                  marginBottom: 0,
                  borderRadius: 3,
                  backgroundColor: "#f0f0f0",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 5,
                    width: `${progressPct}%`,
                    borderRadius: 3,
                    backgroundColor: isOverSubscribed
                      ? TONE_HEX.success
                      : TONE_HEX.accent,
                  }}
                />
              </View>
              <Typography
                style={{ fontSize: 10, color: TONE_HEX.muted, fontWeight: "500" }}
              >
                {progressPct}%
              </Typography>
            </View>
            <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
              {summaryParts}
            </Typography>
          </View>
        </View>

        {/* Subscription band — contact view only */}
        {subscription && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: `${TONE_HEX.accent}08`,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: "#e4e4e7",
            }}
          >
            <Chip variant="soft" color={STAGE_COLOR[subscription.stage]} size="sm">
              <Chip.Label className="text-xs">{subscription.stage}</Chip.Label>
            </Chip>
            {subscription.subscriptionAmount != null ? (
              <Typography weight="medium" style={{ fontSize: 12 }}>
                {fmtShort(subscription.subscriptionAmount)}
              </Typography>
            ) : (
              <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
                —
              </Typography>
            )}
          </View>
        )}
      </Surface>
    </Pressable>
  );
}
