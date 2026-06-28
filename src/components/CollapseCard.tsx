import { Surface, Typography } from "heroui-native";
import { useState, type JSX } from "react";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "./ui/Icon";

type CollapseCardProps = {
  title: string;
  /** Optional count shown next to the title. */
  badge?: number;
  children: ReactNode;
  /** Start expanded. @default false */
  defaultOpen?: boolean;
};

/**
 * A Surface card with a tappable header row that toggles showing/hiding its
 * children. Used for "More Details", "Related Contacts", etc.
 */
export function CollapseCard({
  title,
  badge,
  children,
  defaultOpen = false,
}: CollapseCardProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Surface className="p-0 rounded-2xl overflow-hidden">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center justify-between px-4 py-3.5 active:bg-surface-secondary"
      >
        <View className="flex-row items-center gap-2">
          <Typography weight="semibold" className="text-sm">
            {title}
          </Typography>
          {badge !== undefined && badge > 0 && (
            <View
              className="rounded-full items-center justify-center"
              style={{
                backgroundColor: "#f0f0f0",
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
              }}
            >
              <Typography style={{ fontSize: 11, color: "#8c8c8c" }}>
                {badge}
              </Typography>
            </View>
          )}
        </View>
        <Icon
          name={open ? "chevronUp" : "chevronDown"}
          size="md"
          tone="muted"
        />
      </Pressable>
      {open && <>{children}</>}
    </Surface>
  );
}
