import { Card, Typography } from "heroui-native";
import type { JSX } from "react";
import { View } from "react-native";
import { ACTIVITY, TONE_SOFT_BG, type ActivityKind } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

export type Activity = {
  id: string;
  kind: ActivityKind;
  actor: string;
  action: string;
  noun: string;
  time: string;
  title: string;
  desc: string;
};

/** An activity-feed card with a colored icon circle, headline, title and description. */
export function ActivityCard({ item }: { item: Activity }): JSX.Element {
  const meta = ACTIVITY[item.kind];
  return (
    <Card className="gap-2 rounded-2xl">
      <View className="flex-row items-center gap-3">
        <View
          className={`h-9 w-9 rounded-full items-center justify-center ${TONE_SOFT_BG[meta.tone]}`}
        >
          <Icon name={meta.icon} size={17} tone={meta.tone} />
        </View>
        <Typography type="body" className="flex-1 text-sm">
          {item.actor} {item.action}{" "}
          <Typography type="body" weight="semibold" className="text-sm">
            {item.noun}
          </Typography>
        </Typography>
        <Typography type="body-xs" color="muted">
          {item.time}
        </Typography>
      </View>
      <View className="gap-0.5">
        <Typography type="body-sm" weight="semibold">
          {item.title}
        </Typography>
        <Typography type="body-sm" color="muted" numberOfLines={2}>
          {item.desc}
        </Typography>
      </View>
    </Card>
  );
}
