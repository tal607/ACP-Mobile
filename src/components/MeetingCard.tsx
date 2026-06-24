import { Card, Typography } from "heroui-native";
import type { JSX } from "react";
import { View } from "react-native";
import { InitialsAvatar } from "./ui/InitialsAvatar";
import { PillButton } from "./ui/PillButton";
import { Tag } from "./ui/Tag";

export type Meeting = {
  id: string;
  time: string;
  duration: string;
  type: string;
  name: string;
  initials: string;
  company: string;
  tag: string;
};

/** A meeting list row (avatar, name, company + tag, meta line, Prep action). */
export function MeetingCard({ m, onPrep }: { m: Meeting; onPrep?: () => void }): JSX.Element {
  return (
    <Card className="flex-row items-center gap-3 rounded-2xl">
      <InitialsAvatar initials={m.initials} />
      <View className="flex-1 gap-1">
        <Typography weight="semibold" className="text-sm">
          {m.name}
        </Typography>
        <View className="flex-row items-center gap-2">
          <Typography type="body-sm" color="muted">
            {m.company}
          </Typography>
          <Tag label={m.tag} />
        </View>
        <Typography type="body-xs" color="muted">
          {m.time} · {m.duration} · {m.type}
        </Typography>
      </View>
      <PillButton onPress={onPrep}>Prep</PillButton>
    </Card>
  );
}
