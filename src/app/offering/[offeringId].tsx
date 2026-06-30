import { router, useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "heroui-native";
import { Icon } from "@/components/ui/Icon";
import { MetricCard } from "@/components/ui/MetricCard";
import { KanbanBoard } from "@/components/KanbanBoard";
import {
  OFFERINGS,
  KANBAN_STAGES,
  STAGE_CONFIG,
  getProspectsForOffering,
} from "@/data/offerings";
import { TONE_HEX } from "@/theme/tokens";

const STAGE_COLORS = Object.fromEntries(
  Object.entries(STAGE_CONFIG).map(([stage, cfg]) => [stage, cfg.color])
);

function fmt(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `$${v % 1 === 0 ? v : v.toFixed(1)}K`;
  }
  return `$${n.toLocaleString()}`;
}

export default function OfferingPage(): JSX.Element {
  const { offeringId } = useLocalSearchParams<{ offeringId: string }>();
  const offering = OFFERINGS.find((o) => o.id === offeringId);
  const prospects = getProspectsForOffering(offeringId ?? "");
  const completedCount = prospects.filter((p) => p.stage === "Completed").length;
  const softCommitted = prospects.reduce(
    (sum, p) => sum + (p.softCommitment ?? 0),
    0
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FCFCFC" }}>
      {/* Nav header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 8,
          gap: 8,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 0.5,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)/offerings")
          }
          style={{
            width: 30,
            height: 30,
            backgroundColor: "#F5F5F5",
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>

        <Typography
          weight="semibold"
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 14,
            color: TONE_HEX.foreground,
            textAlign: "center",
          }}
        >
          {offering?.name ?? "Offering"}
        </Typography>

        <Pressable
          style={{
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <Icon name="more" size="md" tone="muted" />
        </Pressable>
      </View>

      {/* Metric cards */}
      {offering != null && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
          }}
        >
          <MetricCard
            label="Raised"
            value={fmt(offering.commitments)}
            progress={
              offering.raiseTarget > 0
                ? offering.commitments / offering.raiseTarget
                : 0
            }
            style={{ flex: 1 }}
          />
          <MetricCard
            label="Prospects"
            value={String(offering.prospectsCount)}
            subtitle={`${completedCount} completed`}
            style={{ flex: 1 }}
          />
          <MetricCard
            label="Soft committed"
            value={fmt(softCommitted)}
            subtitle={`of ${fmt(offering.raiseTarget)} target`}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Kanban board — fills remaining screen height */}
      <KanbanBoard
        stages={KANBAN_STAGES}
        stageColors={STAGE_COLORS}
        prospects={prospects}
        onPressProspect={(id) =>
          router.push({
            pathname: "/prospect/[prospectId]",
            params: { prospectId: id },
          })
        }
      />
    </SafeAreaView>
  );
}
