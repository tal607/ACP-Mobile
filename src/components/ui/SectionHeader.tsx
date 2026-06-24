import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { CountBadge } from "./CountBadge";

type SectionHeaderProps = {
  title: string;
  count?: number;
  /** Optional right-aligned link label (rendered in accent color with a → ). */
  linkLabel?: string;
  onLinkPress?: () => void;
};

/** Section title row: title + optional count badge + optional accent link. */
export function SectionHeader({ title, count, linkLabel, onLinkPress }: SectionHeaderProps): JSX.Element {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <View className="flex-row items-center gap-2">
        <Typography className="text-xs" weight="semibold">
          {title}
        </Typography>
        {count !== undefined && <CountBadge count={count} />}
      </View>
      {linkLabel && (
        <Pressable hitSlop={8} onPress={onLinkPress}>
          <Typography type="body-sm" weight="medium" className="text-accent text-xs">
            {linkLabel} →
          </Typography>
        </Pressable>
      )}
    </View>
  );
}
