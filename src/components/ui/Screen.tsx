import type { JSX, ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Standard screen wrapper — owns page background, safe area, scrolling, and the
 * app's standard outer padding + section spacing. Every screen should use this
 * so layout/margins stay consistent. Change padding/gap here → all screens update.
 */
export function Screen({ children }: { children: ReactNode }): JSX.Element {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2 pb-12 gap-7">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
