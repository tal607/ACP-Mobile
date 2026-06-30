import type { JSX } from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "heroui-native";
import { ProspectCard } from "./ProspectCard";
import { TONE_HEX } from "@/theme/tokens";
import type { Prospect, SubscriptionStage } from "@/data/offerings";

type Props = {
  stage: SubscriptionStage;
  stageColor: string;
  prospects: Prospect[];
  columnWidth: number;
  onPressProspect: (prospectId: string) => void;
};

/**
 * A single stage column in the kanban board.
 * Renders a sticky column header and a vertically-scrollable list of ProspectCards.
 * Pass columnWidth explicitly so KanbanBoard controls the peek calculation.
 */
export function KanbanColumn({
  stage,
  stageColor,
  prospects,
  columnWidth,
  onPressProspect,
}: Props): JSX.Element {
  return (
    <View style={{ width: columnWidth, alignSelf: "stretch", flexDirection: "column" }}>
      {/* Column header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: stageColor,
          }}
        />
        <Typography
          weight="semibold"
          numberOfLines={1}
          style={{ fontSize: 13, color: TONE_HEX.foreground, flex: 1 }}
        >
          {stage}
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
            {prospects.length}
          </Typography>
        </View>
      </View>

      {/* Cards */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ gap: 8, paddingBottom: 32 }}
      >
        {prospects.length === 0 ? (
          <View
            style={{
              borderWidth: 0.5,
              borderColor: "#E8E8E8",
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Typography style={{ fontSize: 12, color: TONE_HEX.muted }}>
              No prospects
            </Typography>
          </View>
        ) : (
          prospects.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              stageColor={stageColor}
              onPress={() => onPressProspect(p.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
