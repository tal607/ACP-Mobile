import { Avatar, Chip, Surface, Typography } from "heroui-native";
import { useState, type JSX } from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import {
  ActionItemRow,
  type Activity,
  ActivityCard,
  Icon,
  InitialsAvatar,
  type Meeting,
  MeetingCard,
  type MultiPrepData,
  MultiPrepSheet,
  PillButton,
  type PrepData,
  PrepSheet,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SectionHeader,
  Tag,
} from "@/components";

/* ------------------------------------------------------------------ *
 * Sample data — easy to edit while we design.
 * ------------------------------------------------------------------ */

const HEADER = {
  date: "Wednesday, June 4",
  greeting: "Good Morning, Tal",
};

const QUICK_ACTIONS = [
  { key: "add", label: "Add Contact", icon: "addContact" as const },
  { key: "note", label: "Log Note", icon: "logNote" as const },
  { key: "invite", label: "Send Invite", icon: "sendInvite" as const },
];

const NEXT_MEETING = {
  countdown: "In 25 min",
  time: "10:00 AM",
  duration: "30 min",
  type: "Intro call",
  name: "David Mayers",
  initials: "DM",
  company: "Meridian Capital",
  tag: "Prospect",
  meetingUrl: "https://zoom.us/j/123456789",
  email: "david@meridiancapital.com",
};

/* ── Later Today card list (Meeting fields only — just for display) ── */

const LATER_TODAY: Meeting[] = [
  {
    id: "m2",
    time: "11:00 AM",
    duration: "30 min",
    type: "Intro call",
    name: "David Mayers",
    initials: "DM",
    company: "Meridian Capital",
    tag: "Prospect",
  },
  {
    id: "m3",
    time: "2:00 PM",
    duration: "45 min",
    type: "Portfolio review",
    name: "Sarah Kim & James Chen",
    initials: "SK",
    company: "Initech Ventures",
    tag: "Investor",
  },
];

/* ── Single-contact prep data: David Mayers ── */

const DAVID_PREP: PrepData = {
  id: "m2",
  time: "11:00 AM",
  duration: "30 min",
  type: "Intro call",
  name: "David Mayers",
  initials: "DM",
  company: "Meridian Capital",
  tag: "Prospect",
  aiBrief:
    "First meeting with David — referred by John Kessler at Summit RE. No prior CRM contact. He is evaluating 2-3 CRE funds this quarter with a target commitment of $500K+. Lead with fund thesis and have data room ready to send at end of call.",
  email: "david@meridiancapital.com",
  phone: "+1-212-555-0142",
  dataRoomUrl: "https://app.agora.com/data-room/meridian",
  lastNote: {
    date: "First contact",
    title: "New prospect — inbound via referral",
    desc: "David Mayers was referred by John Kessler at Summit RE Partners. He is actively evaluating 2-3 CRE funds this quarter and has a target first commitment of $500K+.",
  },
  actionItems: [
    { id: "p1", label: "Prepare fund thesis one-pager", overdue: false },
    { id: "p2", label: "Send data room invite after call", overdue: false },
  ],
  status: {
    stage: "First Touch",
    offering: "Agora Fund III",
    dataRoom: "not_sent",
  },
};

/* ── Multi-contact prep data: Sarah Kim & James Chen ── */

const SARAH_MULTI: MultiPrepData = {
  id: "m3",
  time: "2:00 PM",
  duration: "45 min",
  type: "Portfolio review",
  aiBrief:
    "Quarterly review with Sarah and James. Sarah expressed co-invest interest in the Austin logistics deal twice last quarter — bring it up if she doesn't. James was introduced by Sarah in March and is evaluating a first commitment alongside her. Goal: align both on the co-invest opportunity and confirm Q2 distribution timing.",
  contacts: [
    {
      id: "c1",
      name: "Sarah Kim",
      initials: "SK",
      company: "Initech Ventures",
      tag: "Investor",
      email: "sarah.kim@initech.com",
      phone: "+1-415-555-0198",
      lastNote: {
        date: "May 28",
        title: "Q1 fund performance call",
        desc: "Called to review Q1 returns. Sarah is pleased with the 14.2% net IRR and expressed strong interest in the co-invest opportunity in the Austin logistics deal. Asked for an update in 4-6 weeks.",
      },
      actionItems: [
        {
          id: "p3",
          label: "Send Austin logistics co-invest deck",
          overdue: true,
        },
        { id: "p4", label: "Confirm Q2 distribution schedule", overdue: false },
      ],
      status: {
        stage: "Active LP",
        offering: "Agora Fund III",
        dataRoom: "opened",
      },
    },
    {
      id: "c2",
      name: "James Chen",
      initials: "JC",
      company: "Initech Ventures",
      tag: "Prospect",
      email: "james.chen@initech.com",
      phone: "+1-415-555-0271",
      dataRoomUrl: "https://app.agora.com/data-room/initech-james",
      lastNote: {
        date: "March 14",
        title: "Introduction via Sarah Kim",
        desc: "First conversation with James. He is Initech's new investment director and is evaluating a first commitment to Fund III alongside Sarah. Requested the fund overview deck and data room access.",
      },
      actionItems: [
        { id: "p5", label: "Send fund overview deck", overdue: true },
        { id: "p6", label: "Grant data room access", overdue: false },
      ],
      status: {
        stage: "In Discussion",
        offering: "Agora Fund III",
        dataRoom: "not_sent",
      },
    },
  ],
};

const ACTION_ITEMS = [
  { id: "a1", label: "Send data room invite to Jane Doe" },
  { id: "a2", label: "Follow up with Mark Lee re: subscription" },
  { id: "a3", label: "Prepare Q2 deck for Meridian Capital" },
];

const RECENT_ACTIVITY: Activity[] = [
  {
    id: "act1",
    kind: "note",
    actor: "Tal",
    action: "added a",
    noun: "Note",
    time: "11:30",
    title: "Q2 fund performance",
    desc: "Called to review quarterly returns. Sarah is pleased with the 14.2% net IRR and expressed strong interest in the…",
  },
  {
    id: "act2",
    kind: "meeting",
    actor: "Tal",
    action: "logged a",
    noun: "Meeting",
    time: "11:30",
    title: "Q2 fund performance",
    desc: "Called to review quarterly returns. Sarah is pleased with the 14.2% net IRR and expressed strong interest in the…",
  },
];

/* ------------------------------------------------------------------ *
 * Home / Today screen
 * ------------------------------------------------------------------ */

export default function HomeTab(): JSX.Element {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  // Single-contact prep sheet state
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  // Multi-contact prep sheet state
  const [multiPrepData, setMultiPrepData] = useState<MultiPrepData | null>(null);

  const m = NEXT_MEETING;

  // Map meeting id → which prep sheet to open
  const handlePrep = (meetingId: string) => {
    if (meetingId === "m2") setPrepData(DAVID_PREP);
    else if (meetingId === "m3") setMultiPrepData(SARAH_MULTI);
  };

  return (
    <Screen>
      {/* Prep sheets — rendered outside the scroll tree */}
      <PrepSheet data={prepData} onClose={() => setPrepData(null)} />
      <MultiPrepSheet
        data={multiPrepData}
        onClose={() => setMultiPrepData(null)}
      />

      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1">
          <Typography type="body-sm" color="muted">
            {HEADER.date}
          </Typography>
          <Typography className="text-3xl" weight="bold">
            {HEADER.greeting}
          </Typography>
        </View>
        <View className="flex-row items-center gap-2 ml-3 mt-1">
          <View>
            <Pressable className="h-10 w-10 rounded-full border border-border items-center justify-center">
              <Icon name="bell" size="lg" />
            </Pressable>
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger" />
          </View>
          <Avatar size="sm" variant="default" color="warning">
            <Avatar.Fallback>
              <Icon name="person" size="md" color="#434343" />
            </Avatar.Fallback>
          </Avatar>
        </View>
      </View>

      {/* Quick actions — horizontal scroll, content-sized pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {QUICK_ACTIONS.map((a) => (
          <PillButton key={a.key} icon={a.icon}>
            {a.label}
          </PillButton>
        ))}
      </ScrollView>

      {/* Next-meeting hero card */}
      <Surface className="gap-4 rounded-2xl">
        <View className="flex-row items-center justify-between">
          <Chip variant="soft" color="accent" size="sm">
            <Chip.Label className="text-xs">{m.countdown}</Chip.Label>
          </Chip>
          <Typography type="body-sm" color="muted">
            {m.time} · {m.duration}
          </Typography>
        </View>

        <View className="gap-3">
          <Typography type="h4">{m.type}</Typography>
          <View className="flex-row items-center gap-3">
            <InitialsAvatar initials={m.initials} />
            <View className="flex-1 gap-1">
              <Typography weight="semibold" className="text-sm">
                {m.name}
              </Typography>
              <View className="flex-row items-center gap-2">
                <Typography type="body-sm" color="muted">
                  {m.company}
                </Typography>
                <Tag label={m.tag} />
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <PrimaryButton
            size="sm"
            className="flex-1"
            icon="video"
            onPress={() => Linking.openURL(m.meetingUrl)}
          >
            Join meeting
          </PrimaryButton>
          <SecondaryButton
            size="sm"
            className="flex-1"
            icon="email"
            onPress={() => Linking.openURL(`mailto:${m.email}`)}
          >
            Email
          </SecondaryButton>
        </View>
      </Surface>

      {/* Later today */}
      <View>
        <SectionHeader title="Later today" count={LATER_TODAY.length} linkLabel="Calendar" />
        <View className="gap-3">
          {LATER_TODAY.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              m={meeting}
              onPrep={() => handlePrep(meeting.id)}
            />
          ))}
        </View>
      </View>

      {/* Action items */}
      <View>
        <SectionHeader title="Action items" count={ACTION_ITEMS.length} />
        <Surface className="p-0 rounded-2xl">
          {ACTION_ITEMS.map((item, i) => (
            <ActionItemRow
              key={item.id}
              label={item.label}
              selected={!!done[item.id]}
              onToggle={() => toggle(item.id)}
              showSeparator={i > 0}
            />
          ))}
        </Surface>
      </View>

      {/* Recent activity */}
      <View>
        <SectionHeader title="Recent Activity" count={RECENT_ACTIVITY.length} linkLabel="See all" />
        <Typography type="body-sm" color="muted" className="mb-3 text-xs">
          Today
        </Typography>
        <View className="gap-3">
          {RECENT_ACTIVITY.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
