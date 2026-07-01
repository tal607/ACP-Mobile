import type { JSX } from "react";
import { SectionList, View } from "react-native";
import { Typography } from "heroui-native";
import { ProspectRow } from "./ProspectRow";
import { TONE_HEX } from "@/theme/tokens";
import type { Prospect, SubscriptionStage } from "@/data/offerings";

type ProspectSection = {
  stage: SubscriptionStage;
  color: string;
  data: Prospect[];
};

type Props = {
  stages: SubscriptionStage[];
  stageColors: Record<string, string>;
  prospects: Prospect[];
  onPressProspect: (prospectId: string) => void;
};

/**
 * Grouped list view of prospects, ordered by pipeline stage.
 * Sections with zero matching prospects are hidden (e.g. during search).
 * Stage headers mirror the kanban column header style for visual consistency.
 */
export function ProspectListView({
  stages,
  stageColors,
  prospects,
  onPressProspect,
}: Props): JSX.Element {
  const sections: ProspectSection[] = stages
    .map((stage) => ({
      stage,
      color: stageColors[stage] ?? "#8C8C8C",
      data: prospects.filter((p) => p.stage === stage),
    }))
    .filter((s) => s.data.length > 0);

  return (
    <SectionList<Prospect, ProspectSection>
      sections={sections}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderSectionHeader={({ section }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 16,
            paddingTop: 18,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: section.color,
            }}
          />
          <Typography
            weight="semibold"
            style={{ fontSize: 13, color: TONE_HEX.foreground, flex: 1 }}
          >
            {section.stage}
          </Typography>
          <View
            style={{
              backgroundColor: "#F5F5F5",
              borderRadius: 10,
              paddingHorizontal: 7,
              paddingVertical: 2,
            }}
          >
            <Typography
              style={{ fontSize: 11, color: TONE_HEX.muted, fontWeight: "600" }}
            >
              {section.data.length}
            </Typography>
          </View>
        </View>
      )}
      renderItem={({ item, section }) => (
        <View style={{ paddingHorizontal: 16, paddingBottom: 7 }}>
          <ProspectRow
            prospect={item}
            stageColor={section.color}
            onPress={() => onPressProspect(item.id)}
          />
        </View>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingTop: 64 }}>
          <Typography style={{ fontSize: 14, color: TONE_HEX.muted }}>
            No prospects found
          </Typography>
        </View>
      }
    />
  );
}
