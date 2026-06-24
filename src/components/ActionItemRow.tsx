import { Checkbox, Separator, Typography } from "heroui-native";
import type { JSX } from "react";
import { Pressable, View } from "react-native";

/** A single action-item row with a checkbox; strikes through when done. */
export function ActionItemRow({
  label,
  selected,
  onToggle,
  showSeparator,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  showSeparator: boolean;
}): JSX.Element {
  return (
    <View>
      {showSeparator && <Separator />}
      <Pressable className="flex-row items-center gap-3 px-4 py-3.5" onPress={onToggle}>
        <Checkbox isSelected={selected} onSelectedChange={onToggle} />
        <Typography
          type="body"
          className={selected ? "flex-1 text-sm line-through text-muted" : "flex-1 text-sm"}
        >
          {label}
        </Typography>
      </Pressable>
    </View>
  );
}
