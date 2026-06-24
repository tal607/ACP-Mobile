import { router, Tabs } from "expo-router";
import { Typography } from "heroui-native";
import type { ComponentProps, JSX } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type IconName, TONE_HEX } from "@/theme/tokens";
import { Icon } from "./Icon";

/** The props Expo Router passes to a custom `tabBar` (derived from <Tabs>). */
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

/**
 * App bottom navigation bar — custom `tabBar` for Expo Router's <Tabs>.
 * Four tabs split 2-and-2 around a raised accent center button that launches
 * the AI voice Co-pilot. Built from RN primitives + our <Icon> (HeroUI Native
 * has no bottom-nav component); active tint = accent, inactive = muted.
 */

/** Route name → label + icon. Order here is the render order of the side tabs. */
const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Home", icon: "home" },
  contacts: { label: "Contacts", icon: "contacts" },
  calendar: { label: "Calendar", icon: "calendar" },
  activity: { label: "Activity", icon: "activity" },
};

function TabButton({
  routeKey,
  routeName,
  focused,
  onPress,
}: {
  routeKey: string;
  routeName: string;
  focused: boolean;
  onPress: () => void;
}): JSX.Element {
  const meta = TABS[routeName];
  const tone = focused ? "accent" : "muted";
  return (
    <Pressable
      key={routeKey}
      onPress={onPress}
      className="flex-1 items-center justify-center gap-1 py-1"
    >
      <Icon name={meta.icon} size="lg" tone={tone} />
      <Typography
        className="text-[10px]"
        weight={focused ? "semibold" : "normal"}
        style={{ color: TONE_HEX[tone] }}
      >
        {meta.label}
      </Typography>
    </Pressable>
  );
}

export function BottomNav({ state, navigation }: BottomTabBarProps): JSX.Element {
  const insets = useSafeAreaInsets();

  const tab = (routeIndex: number): JSX.Element => {
    const route = state.routes[routeIndex];
    const focused = state.index === routeIndex;
    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };
    return (
      <TabButton
        key={route.key}
        routeKey={route.key}
        routeName={route.name}
        focused={focused}
        onPress={onPress}
      />
    );
  };

  return (
    <View
      className="flex-row items-start border-t border-border bg-surface px-2"
      style={{ paddingBottom: insets.bottom, paddingTop: 8, minHeight: 60 + insets.bottom }}
    >
      {tab(0)}
      {tab(1)}

      {/* Center Co-pilot button — raised, accent fill, launches the AI voice Co-pilot. */}
      <View className="w-16 items-center gap-1">
        <Pressable
          onPress={() => router.push("/copilot")}
          className="h-[52px] w-[52px] items-center justify-center rounded-full bg-accent"
          style={{ marginTop: -22 }}
        >
          <Icon name="copilot" size={28} color="#ffffff" />
        </Pressable>
        <Typography className="text-[10px]" weight="semibold" style={{ color: TONE_HEX.accent }}>
          Co-pilot
        </Typography>
      </View>

      {tab(2)}
      {tab(3)}
    </View>
  );
}
