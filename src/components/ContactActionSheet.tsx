import { Typography } from "heroui-native";
import type { JSX } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ScopedTheme } from "uniwind";
import { TONE_HEX, type IconName } from "@/theme/tokens";
import { Icon } from "./ui/Icon";

type ActionItem = {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export function ContactActionSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}): JSX.Element | null {
  if (!visible) return null;

  const actions: ActionItem[] = [
    {
      icon: "portal",
      label: "Investor portal view",
      onPress: () => {},
    },
    {
      icon: "lockOpen",
      label: "Remove Portal Access",
      onPress: () => {},
    },
    {
      icon: "bell",
      label: "Manage email communication",
      onPress: () => {},
    },
    {
      icon: "apps",
      label: "Manage indexes",
      onPress: () => {},
    },
    {
      icon: "shield",
      label: "Verify via OTP",
      onPress: () => {},
    },
  ];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Tap-to-dismiss backdrop */}
          <Pressable
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(0,0,0,0.35)" },
            ]}
            onPress={onClose}
          />

          <View
            className="bg-background rounded-t-3xl overflow-hidden"
            style={{ paddingBottom: 34 }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-2">
              <View className="w-10 h-1 rounded-full bg-separator" />
            </View>

            {/* Standard actions */}
            {actions.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => {
                  action.onPress();
                  onClose();
                }}
                className="flex-row items-center px-5 py-3.5 gap-4 active:bg-surface-secondary"
              >
                <View
                  className="h-9 w-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#f5f5f5" }}
                >
                  <Icon name={action.icon} size="md" tone="foreground" />
                </View>
                <Typography type="body-sm">{action.label}</Typography>
              </Pressable>
            ))}

            {/* Separator before danger */}
            <View
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginHorizontal: 20,
                marginVertical: 4,
              }}
            />

            {/* Delete contact — danger */}
            <Pressable
              onPress={onClose}
              className="flex-row items-center px-5 py-3.5 gap-4 active:bg-surface-secondary"
            >
              <View
                className="h-9 w-9 rounded-full items-center justify-center"
                style={{ backgroundColor: "#fff0f0" }}
              >
                <Icon name="trash" size="md" tone="danger" />
              </View>
              <Typography type="body-sm" style={{ color: TONE_HEX.danger }}>
                Delete contact
              </Typography>
            </Pressable>
          </View>
        </View>
      </ScopedTheme>
    </Modal>
  );
}
