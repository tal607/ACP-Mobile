import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import type { JSX } from "react";
import { Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "heroui-native";
import { Icon } from "@/components/ui/Icon";
import { MetricCard } from "@/components/ui/MetricCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { KanbanBoard } from "@/components/KanbanBoard";
import { ProspectListView } from "@/components/ProspectListView";
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

const VIEW_OPTIONS: [
  { value: string; iconName: "viewList" },
  { value: string; iconName: "viewBoard" },
] = [
  { value: "list", iconName: "viewList" },
  { value: "kanban", iconName: "viewBoard" },
];

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

  const [view, setView] = useState<"list" | "kanban">("list");
  const [query, setQuery] = useState("");

  // Metrics always reflect totals — not affected by search
  const softCommitted = prospects.reduce(
    (sum, p) => sum + (p.softCommitment ?? 0),
    0
  );

  // Search filters by name (case-insensitive), drives both views
  const filteredProspects =
    query.trim() === ""
      ? prospects
      : prospects.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

  const navigateToProspect = (id: string): void => {
    router.push({
      pathname: "/prospect/[prospectId]",
      params: { prospectId: id },
    });
  };

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
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 0.5,
            borderBottomColor: "#F0F0F0",
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
            value={`${offering.prospectsCount}`}
            style={{ flex: 1 }}
          />
          <MetricCard
            label="Soft committed"
            value={fmt(softCommitted)}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Toolbar: search bar + view toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 0.5,
          borderBottomColor: "#F0F0F0",
        }}
      >
        {/* Search bar */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: 10,
            paddingHorizontal: 10,
            height: 36,
            gap: 6,
          }}
        >
          <Icon name="search" size="sm" tone="muted" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search prospects..."
            placeholderTextColor={TONE_HEX.muted}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={{
              flex: 1,
              fontSize: 14,
              color: TONE_HEX.foreground,
              padding: 0,
            }}
          />
        </View>

        {/* View toggle */}
        <SegmentedControl
          options={VIEW_OPTIONS}
          value={view}
          onChange={(v) => setView(v as "list" | "kanban")}
        />
      </View>

      {/* Content — swaps between list and kanban */}
      {view === "list" ? (
        <ProspectListView
          stages={KANBAN_STAGES}
          stageColors={STAGE_COLORS}
          prospects={filteredProspects}
          onPressProspect={navigateToProspect}
        />
      ) : (
        <KanbanBoard
          stages={KANBAN_STAGES}
          stageColors={STAGE_COLORS}
          prospects={filteredProspects}
          onPressProspect={navigateToProspect}
        />
      )}
    </SafeAreaView>
  );
}
