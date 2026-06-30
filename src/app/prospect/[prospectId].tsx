import { router, useLocalSearchParams } from "expo-router";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "heroui-native";
import { Icon } from "@/components/ui/Icon";
import { PROSPECTS } from "@/data/offerings";
import { TONE_HEX } from "@/theme/tokens";

export default function ProspectPage(): JSX.Element {
  const { prospectId } = useLocalSearchParams<{ prospectId: string }>();
  const prospect = PROSPECTS.find((p) => p.id === prospectId);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FCFCFC" }}>
      {/* Nav header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 8,
          gap: 8,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 0.5,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.dismiss())}
          style={{
            width: 30,
            height: 30,
            backgroundColor: "#F5F5F5",
            borderRadius: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <Icon name="back" size="md" tone="foreground" />
        </Pressable>

        <Typography
          weight="semibold"
          numberOfLines={1}
          style={{
            flex: 1,
            fontSize: 14,
            color: TONE_HEX.foreground,
            textAlign: "center",
          }}
        >
          {prospect?.name ?? "Prospect"}
        </Typography>

        <Pressable
          style={{
            width: 30,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          hitSlop={8}
        >
          <Icon name="more" size="md" tone="muted" />
        </Pressable>
      </View>

      {/* Placeholder body */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#F5F5F5",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="person" size="lg" tone="muted" />
        </View>
        <Typography weight="semibold" style={{ fontSize: 16, color: TONE_HEX.foreground }}>
          {prospect?.name ?? "Prospect"}
        </Typography>
        <Typography style={{ fontSize: 13, color: TONE_HEX.muted }}>
          {prospect?.stage} · {prospect?.subscriptionStep}
        </Typography>
        <Typography
          style={{ fontSize: 12, color: TONE_HEX.muted, marginTop: 4 }}
        >
          Prospect detail coming soon
        </Typography>
      </View>
    </SafeAreaView>
  );
}
