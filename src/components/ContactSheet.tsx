import { Card, Chip, Separator, Surface, Typography } from "heroui-native";
import { useEffect, useState, type JSX } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ScopedTheme } from "uniwind";
import { TONE_HEX } from "@/theme/tokens";
import { ActionItemRow } from "./ActionItemRow";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";
import { PillButton } from "./ui/PillButton";
import { Tag } from "./ui/Tag";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type ContactActionItem = {
  id: string;
  label: string;
  overdue?: boolean;
};

export type ContactLastNote = {
  date: string;
  title: string;
  desc: string;
};

export type ContactStatus = {
  stage: string;
  offering?: string;
  dataRoom?: "not_sent" | "sent" | "opened";
};

export type ContactData = {
  id: string;
  name: string;
  initials: string;
  company: string;
  tag: string;
  email?: string;
  phone?: string;
  dataRoomUrl?: string;
  /** Display string shown in list row (e.g. "Today", "3d ago", "Jun 12"). */
  lastActivity?: string;
  aiBrief?: string;
  lastNote?: ContactLastNote;
  actionItems?: ContactActionItem[];
  status?: ContactStatus;
  /** Assigned team member (e.g. "Tal", "Roee"). */
  assignedTo?: string;
  /** Custom tags (e.g. ["High Net Worth", "Co-invest Interest"]). */
  tags?: string[];
  /** How the contact was sourced (e.g. "Referral", "Website"). */
  leadSource?: string;
  /** Contact classification (e.g. "Individual", "Family Office"). */
  classification?: string;
  /** Country of residence (e.g. "United States"). */
  country?: string;
};

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

const DATA_ROOM_LABEL: Record<NonNullable<ContactStatus["dataRoom"]>, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  opened: "Opened",
};

const DATA_ROOM_COLOR: Record<
  NonNullable<ContactStatus["dataRoom"]>,
  "danger" | "warning" | "success"
> = {
  not_sent: "danger",
  sent: "warning",
  opened: "success",
};

/* ------------------------------------------------------------------ *
 * ContactSheet
 * ------------------------------------------------------------------ */

export function ContactSheet({
  data,
  onClose,
}: {
  data: ContactData | null;
  onClose: () => void;
}): JSX.Element | null {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDone({});
  }, [data?.id]);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  if (!data) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <ScopedTheme theme="light">
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          {/* Tap-to-dismiss backdrop */}
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.35)" },
            ]}
            onPress={onClose}
          />

          {/* Sheet panel */}
          <View
            className="bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "88%" }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-separator" />
            </View>

            {/* Header: avatar + name/company/tag + last activity + close */}
            <View className="px-5 pt-3 pb-4">
              <View className="flex-row items-start">
                <InitialsAvatar initials={data.initials} size="md" />
                <View className="flex-1 gap-1 ml-3">
                  <Typography weight="semibold" className="text-base">
                    {data.name}
                  </Typography>
                  <View className="flex-row items-center gap-2">
                    <Typography type="body-sm" color="muted">
                      {data.company}
                    </Typography>
                    <Tag label={data.tag} />
                  </View>
                </View>
                <Pressable
                  onPress={onClose}
                  className="h-8 w-8 rounded-full bg-surface-secondary items-center justify-center ml-2 mt-0.5"
                >
                  <Icon name="close" size="md" tone="muted" />
                </Pressable>
              </View>

              {/* Last activity row */}
              {data.lastActivity && (
                <View className="flex-row items-center gap-1.5 mt-3">
                  <Icon name="activity" size="sm" tone="muted" />
                  <Typography type="body-sm" color="muted">
                    Last activity: {data.lastActivity}
                  </Typography>
                </View>
              )}
            </View>

            <Separator />

            {/* Scrollable content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
              {/* Copilot brief */}
              {data.aiBrief && (
                <View className="mb-6">
                  <Surface className="gap-2 rounded-2xl">
                    <View className="flex-row items-center gap-2">
                      <Icon name="copilot" size="sm" tone="accent" />
                      <Typography type="body-xs" color="muted">
                        Copilot Brief
                      </Typography>
                    </View>
                    <Typography type="body-sm">{data.aiBrief}</Typography>
                  </Surface>
                </View>
              )}

              {/* Quick actions */}
              <View className="mb-6">
                <Typography type="body-sm" color="muted" className="mb-3 text-xs">
                  Quick Actions
                </Typography>
                <View className="flex-row gap-2 flex-wrap">
                  {data.email && (
                    <PillButton
                      icon="email"
                      onPress={() => Linking.openURL(`mailto:${data.email}`)}
                    >
                      Email
                    </PillButton>
                  )}
                  {data.phone && (
                    <PillButton
                      icon="call"
                      onPress={() => Linking.openURL(`tel:${data.phone}`)}
                    >
                      Call
                    </PillButton>
                  )}
                  {data.dataRoomUrl && (
                    <PillButton
                      icon="sendInvite"
                      onPress={() => Linking.openURL(data.dataRoomUrl!)}
                    >
                      Data Room
                    </PillButton>
                  )}
                  <PillButton icon="logNote">Log Note</PillButton>
                </View>
              </View>

              {/* Last interaction */}
              {data.lastNote && (
                <View className="mb-6">
                  <Typography type="body-sm" color="muted" className="mb-3 text-xs">
                    Last Interaction
                  </Typography>
                  <Card className="gap-1.5 rounded-2xl">
                    <View className="flex-row items-center justify-between mb-1">
                      <Typography type="body-xs" color="muted">
                        {data.lastNote.date}
                      </Typography>
                      <View className="flex-row items-center gap-1">
                        <Icon name="note" size="sm" tone="muted" />
                        <Typography type="body-xs" color="muted">
                          Note
                        </Typography>
                      </View>
                    </View>
                    <Typography weight="semibold" className="text-sm">
                      {data.lastNote.title}
                    </Typography>
                    <Typography type="body-sm" color="muted" numberOfLines={3}>
                      {data.lastNote.desc}
                    </Typography>
                  </Card>
                </View>
              )}

              {/* Open action items */}
              {data.actionItems && data.actionItems.length > 0 && (
                <View className="mb-6">
                  <Typography type="body-sm" color="muted" className="mb-3 text-xs">
                    Open Action Items
                  </Typography>
                  <Surface className="p-0 rounded-2xl">
                    {data.actionItems.map((item, i) => (
                      <ActionItemRow
                        key={item.id}
                        label={item.overdue ? `⚠ ${item.label}` : item.label}
                        selected={!!done[item.id]}
                        onToggle={() => toggle(item.id)}
                        showSeparator={i > 0}
                      />
                    ))}
                  </Surface>
                </View>
              )}

              {/* Status snapshot */}
              {data.status && (
                <View className="mb-6">
                  <Typography type="body-sm" color="muted" className="mb-3 text-xs">
                    Status
                  </Typography>
                  <Surface className="p-0 rounded-2xl">
                    <View className="flex-row items-center justify-between px-4 py-3">
                      <Typography type="body-sm" color="muted">
                        Stage
                      </Typography>
                      <Typography type="body-sm" weight="semibold">
                        {data.status.stage}
                      </Typography>
                    </View>
                    {data.status.offering && (
                      <>
                        <Separator />
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Typography type="body-sm" color="muted">
                            Offering
                          </Typography>
                          <Typography type="body-sm" weight="semibold">
                            {data.status.offering}
                          </Typography>
                        </View>
                      </>
                    )}
                    {data.status.dataRoom && (
                      <>
                        <Separator />
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Typography type="body-sm" color="muted">
                            Data Room
                          </Typography>
                          <Chip
                            variant="soft"
                            color={DATA_ROOM_COLOR[data.status.dataRoom]}
                            size="sm"
                          >
                            <Chip.Label className="text-xs">
                              {DATA_ROOM_LABEL[data.status.dataRoom]}
                            </Chip.Label>
                          </Chip>
                        </View>
                      </>
                    )}
                  </Surface>
                </View>
              )}

              {/* Footer CTA */}
              <Pressable
                className="flex-row items-center justify-center gap-1.5 py-2"
                onPress={onClose}
              >
                <Typography
                  type="body-sm"
                  weight="semibold"
                  style={{ color: TONE_HEX.accent }}
                >
                  View full contact
                </Typography>
                <Icon name="chevron" size="sm" tone="accent" />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </ScopedTheme>
    </Modal>
  );
}
