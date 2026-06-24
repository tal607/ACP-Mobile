import { router } from "expo-router";
import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "@/components";

/**
 * Co-pilot — AI voice cowork screen (placeholder).
 * Presented as a modal from the bottom-nav center button. The real voice
 * experience is a separate future task.
 */
export default function Copilot(): JSX.Element {
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      {/* Close affordance */}
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border"
        >
          <Icon name="close" size="lg" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Icon name="copilot" size={36} color="#ffffff" />
        </View>
        <Typography className="text-2xl" weight="bold">
          Co-pilot
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          Your AI voice cowork assistant. Coming soon.
        </Typography>
      </View>
    </SafeAreaView>
  );
}
