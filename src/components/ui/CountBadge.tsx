import { Typography } from "heroui-native";
import type { JSX } from "react";
import { View } from "react-native";

/** Small gray count pill used next to section titles. */
export function CountBadge({ count }: { count: number }): JSX.Element {
  return (
    <View className="h-5 min-w-5 px-1.5 rounded-full bg-default items-center justify-center">
      <Typography type="body-xs" color="muted" weight="medium">
        {String(count)}
      </Typography>
    </View>
  );
}
