import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "heroui-native";
import { Icon } from "./Icon";
import { TONE_HEX, type IconName } from "@/theme/tokens";

type Option = {
  value: string;
  /** Text label — used when no iconName is provided. */
  label?: string;
  /** Icon from the ICONS token map — renders instead of a text label. */
  iconName?: IconName;
};

type Props = {
  /** Exactly two options — left and right segments. */
  options: [Option, Option];
  /** Currently active value. */
  value: string;
  onChange: (value: string) => void;
};

/**
 * Two-segment pill toggle. Accepts either icon names or text labels per segment.
 * Active segment: white fill + subtle shadow.
 * Inactive segment: transparent on the gray container.
 * Reusable across any page that needs a view switcher.
 */
export function SegmentedControl({ options, value, onChange }: Props): JSX.Element {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#EFEFEF",
        borderRadius: 9,
        padding: 2,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 7,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#FFFFFF" : "transparent",
              ...(active
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                : undefined),
            }}
          >
            {opt.iconName != null ? (
              <Icon
                name={opt.iconName}
                size={18}
                color={active ? TONE_HEX.foreground : TONE_HEX.muted}
              />
            ) : (
              <Typography
                weight="semibold"
                style={{
                  fontSize: 12,
                  color: active ? TONE_HEX.foreground : TONE_HEX.muted,
                }}
              >
                {opt.label}
              </Typography>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
