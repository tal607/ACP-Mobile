import type { JSX } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScopedTheme } from "uniwind";

import "../global.css";

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Lock the app to light mode for now (overrides system dark mode). */}
      <ScopedTheme theme="light">
        <HeroUINativeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="copilot" options={{ presentation: "modal" }} />
          </Stack>
          <StatusBar style="dark" />
        </HeroUINativeProvider>
      </ScopedTheme>
    </GestureHandlerRootView>
  );
}
