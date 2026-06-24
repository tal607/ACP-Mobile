import { Tabs } from "expo-router";
import type { JSX } from "react";
import { BottomNav } from "@/components";

export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="contacts" options={{ title: "Contacts" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
    </Tabs>
  );
}
