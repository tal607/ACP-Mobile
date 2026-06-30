import { router, useLocalSearchParams } from "expo-router";
import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components";
import { OFFERINGS } from "@/data/offerings";
import { TONE_HEX } from "@/theme/tokens";

export default function OfferingPage(): JSX.Element {
  const { offeringId } = useLocalSearchParams<{ offeringId: string }>();
  const offering = OFFERINGS.find((o) => o.id === offeringId);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Nav bar */}
      <View className="flex-row items-center px-4 py-2 gap-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/offerings"))}
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>
        <Typography
          weight="semibold"
          className="text-base flex-1 text-center"
          numberOfLines={1}
        >
          {offering?.name ?? "Offering"}
        </Typography>
        <View className="h-9 w-9" />
      </View>

      {/* Placeholder */}
      <View className="flex-1 items-center justify-center gap-3">
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#f4f4f5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="org" size="lg" tone="muted" />
        </View>
        <Typography weight="semibold" style={{ fontSize: 16 }}>
          {offering?.name ?? "Offering"}
        </Typography>
        <Typography type="body-sm" color="muted">
          Offering detail coming soon
        </Typography>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/offerings"))}
          style={{ marginTop: 8 }}
        >
          <Typography style={{ fontSize: 14, color: TONE_HEX.accent }}>
            Go back
          </Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
