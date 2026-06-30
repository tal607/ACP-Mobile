import type { JSX } from "react";
import { Dimensions, ScrollView } from "react-native";
import { KanbanColumn } from "./KanbanColumn";
import type { Prospect, SubscriptionStage } from "@/data/offerings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Column width leaves ~50px of the next column peeking on the right,
 * signaling to the user that there are more stages to scroll to.
 * Formula: SCREEN_WIDTH - PADDING_H - COLUMN_GAP / 2 - PEEK
 * i.e.     SCREEN_WIDTH - 16        - 5              - 51
 */
const COLUMN_WIDTH = SCREEN_WIDTH - 72;
const COLUMN_GAP = 10;
const PADDING_H = 16;

type Props = {
  stages: SubscriptionStage[];
  stageColors: Record<string, string>;
  prospects: Prospect[];
  onPressProspect: (prospectId: string) => void;
};

/**
 * Horizontal kanban board — one column per stage with a visible peek of the
 * next column. Pass stages + stageColors to control what appears and in what
 * order. Generic enough to power any pipeline kanban in the app.
 */
export function KanbanBoard({
  stages,
  stageColors,
  prospects,
  onPressProspect,
}: Props): JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: PADDING_H,
        paddingTop: 14,
        gap: COLUMN_GAP,
      }}
    >
      {stages.map((stage) => {
        const stageProspects = prospects.filter((p) => p.stage === stage);
        return (
          <KanbanColumn
            key={stage}
            stage={stage}
            stageColor={stageColors[stage] ?? "#8C8C8C"}
            prospects={stageProspects}
            columnWidth={COLUMN_WIDTH}
            onPressProspect={onPressProspect}
          />
        );
      })}
    </ScrollView>
  );
}
