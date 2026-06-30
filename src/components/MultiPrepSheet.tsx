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
import { AiBrief } from "./ui/AiBrief";
import type { PrepActionItem, PrepLastNote, PrepStatus } from "./PrepSheet";
import { Icon } from "./ui/Icon";
import { InitialsAvatar } from "./ui/InitialsAvatar";
import { PillButton } from "./ui/PillButton";
import { Tag } from "./ui/Tag";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type MultiPrepContact = {
  id: string;
  name: string;
  initials: string;
  company: string;
  tag: string;
  email?: string;
  phone?: string;
  dataRoomUrl?: string;
  lastNote?: PrepLastNote;
  actionItems?: PrepActionItem[];
  status?: PrepStatus;
};

export type MultiPrepData = {
  /** Matches the Meeting.id on the card that opens this sheet. */
  id: string;
  time: string;
  duration: string;
  type: string;
  /** Meeting-level Copilot brief (spans all contacts). */
  aiBrief?: string;
  contacts: MultiPrepContact[];
};

/* ------------------------------------------------------------------ *
 * Constants (shared with PrepSheet)
 * ------------------------------------------------------------------ */

const DATA_ROOM_LABEL: Record<NonNullable<PrepStatus["dataRoom"]>, string> = {
  not_sent: "Not sent",
  sent: "Sent",
  opened: "Opened",
};

const DATA_ROOM_COLOR: Record<
  NonNullable<PrepStatus["dataRoom"]>,
  "danger" | "warning" | "success"
> = {
  not_sent: "danger",
  sent: "warning",
  opened: "success",
};

/* ------------------------------------------------------------------ *
 * MultiPrepSheet
 * ------------------------------------------------------------------ */

export function MultiPrepSheet({
  data,
  onClose,
}: {
  data: MultiPrepData | null;
  onClose: () => void;
}): JSX.Element | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  // Reset selection and checkboxes when a new meeting opens.
  useEffect(() => {
    if (data?.contacts[0]) setActiveId(data.contacts[0].id);
    setDone({});
  }, [data?.id]);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  if (!data) return null;

  const contact =
    data.contacts.find((c) => c.id === activeId) ?? data.contacts[0];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      {/* Re-apply light theme inside the Modal portal — see PrepSheet.tsx for explanation. */}
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

          {/* Sheet panel */}
          <View
            className="bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "92%" }}
          >
            {/* Drag handle */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-separator" />
            </View>

            {/* Meeting-level header */}
            <View className="px-5 pt-3 pb-4">
              <View className="flex-row items-start">
                <View className="flex-1 gap-1">
                  <Typography weight="semibold" className="text-base">
                    {data.type}
                  </Typography>
                  <View className="flex-row items-center gap-1.5">
                    <Icon name="calendar" size="sm" tone="muted" />
                    <Typography type="body-sm" color="muted">
                      {data.time} · {data.duration}
                    </Typography>
                  </View>
                </View>
                {/* Close button */}
                <Pressable
                  onPress={onClose}
                  className="h-8 w-8 rounded-full bg-surface-secondary items-center justify-center ml-2 mt-0.5"
                >
                  <Icon name="close" size="md" tone="muted" />
                </Pressable>
              </View>

              {/* Contact switcher */}
              <View className="flex-row gap-2 mt-4 flex-wrap">
                {data.contacts.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setActiveId(c.id)}
                      className={`flex-row items-center gap-2 px-3 py-1.5 rounded-full border ${
                        isActive ? "border-accent bg-surface" : "border-border bg-surface"
                      }`}
                    >
                      <InitialsAvatar initials={c.initials} size="sm" />
                      <Typography
                        type="body-sm"
                        weight={isActive ? "semibold" : "regular"}
                        style={isActive ? { color: TONE_HEX.accent } : undefined}
                      >
                        {c.name.split(" ")[0]}
                      </Typography>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Separator />

            {/* Scrollable content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
              {/* Zone 2: AI brief (meeting-level) */}
              {data.aiBrief && (
                <View className="mb-6">
                  <AiBrief text={data.aiBrief} />
                </View>
              )}

              {/* Active contact mini-header */}
              <View className="flex-row items-center gap-3 mb-6">
                <InitialsAvatar initials={contact.initials} />
                <View className="flex-1 gap-1">
                  <Typography weight="semibold" className="text-sm">
                    {contact.name}
                  </Typography>
                  <View className="flex-row items-center gap-2">
                    <Typography type="body-sm" color="muted">
                      {contact.company}
                    </Typography>
                    <Tag label={contact.tag} />
                  </View>
                </View>
              </View>

              {/* Zone 3: Quick actions */}
              <View className="mb-6">
                <Typography
                  type="body-sm"
                  color="muted"
                  className="mb-3 text-xs"
                >
                  Quick Actions
                </Typography>
                <View className="flex-row gap-2 flex-wrap">
                  {contact.email && (
                    <PillButton
                      icon="email"
                      onPress={() => Linking.openURL(`mailto:${contact.email}`)}
                    >
                      Email
                    </PillButton>
                  )}
                  {contact.phone && (
                    <PillButton
                      icon="call"
                      onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                    >
                      Call
                    </PillButton>
                  )}
                  {contact.dataRoomUrl && (
                    <PillButton
                      icon="sendInvite"
                      onPress={() => Linking.openURL(contact.dataRoomUrl!)}
                    >
                      Data Room
                    </PillButton>
                  )}
                  <PillButton icon="logNote">Log Note</PillButton>
                </View>
              </View>

              {/* Zone 4: Last interaction */}
              {contact.lastNote && (
                <View className="mb-6">
                  <Typography
                    type="body-sm"
                    color="muted"
                    className="mb-3 text-xs"
                  >
                    Last Interaction
                  </Typography>
                  <Card className="gap-1.5 rounded-2xl">
                    <View className="flex-row items-center justify-between mb-1">
                      <Typography type="body-xs" color="muted">
                        {contact.lastNote.date}
                      </Typography>
                      <View className="flex-row items-center gap-1">
                        <Icon name="note" size="sm" tone="muted" />
                        <Typography type="body-xs" color="muted">
                          Note
                        </Typography>
                      </View>
                    </View>
                    <Typography weight="semibold" className="text-sm">
                      {contact.lastNote.title}
                    </Typography>
                    <Typography
                      type="body-sm"
                      color="muted"
                      numberOfLines={3}
                    >
                      {contact.lastNote.desc}
                    </Typography>
                  </Card>
                </View>
              )}

              {/* Zone 5: Open action items */}
              {contact.actionItems && contact.actionItems.length > 0 && (
                <View className="mb-6">
                  <Typography
                    type="body-sm"
                    color="muted"
                    className="mb-3 text-xs"
                  >
                    Open Action Items
                  </Typography>
                  <Surface className="p-0 rounded-2xl">
                    {contact.actionItems.map((item, i) => (
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

              {/* Zone 6: Status snapshot */}
              {contact.status && (
                <View className="mb-6">
                  <Typography
                    type="body-sm"
                    color="muted"
                    className="mb-3 text-xs"
                  >
                    Status
                  </Typography>
                  <Surface className="p-0 rounded-2xl">
                    <View className="flex-row items-center justify-between px-4 py-3">
                      <Typography type="body-sm" color="muted">
                        Stage
                      </Typography>
                      <Typography type="body-sm" weight="semibold">
                        {contact.status.stage}
                      </Typography>
                    </View>
                    {contact.status.offering && (
                      <>
                        <Separator />
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Typography type="body-sm" color="muted">
                            Offering
                          </Typography>
                          <Typography type="body-sm" weight="semibold">
                            {contact.status.offering}
                          </Typography>
                        </View>
                      </>
                    )}
                    {contact.status.dataRoom && (
                      <>
                        <Separator />
                        <View className="flex-row items-center justify-between px-4 py-3">
                          <Typography type="body-sm" color="muted">
                            Data Room
                          </Typography>
                          <Chip
                            variant="soft"
                            color={DATA_ROOM_COLOR[contact.status.dataRoom]}
                            size="sm"
                          >
                            <Chip.Label className="text-xs">
                              {DATA_ROOM_LABEL[contact.status.dataRoom]}
                            </Chip.Label>
                          </Chip>
                        </View>
                      </>
                    )}
                  </Surface>
                </View>
              )}

              {/* Zone 7: Footer CTA */}
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
