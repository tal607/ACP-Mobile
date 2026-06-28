import type { Activity } from "@/components";

/**
 * A global-feed activity entry. Extends the per-contact Activity with feed-level
 * metadata: which contact it belongs to, whether it was synced from an external
 * source, and which date group it lives in for sectioned rendering.
 */
export type FeedActivity = Activity & {
  contactId?: string;
  contactName?: string;
  /** "manual" = user-created in ACP; "synced" = pulled from Calendar or Gmail. */
  source?: "manual" | "synced";
  /** Human-readable date bucket used for section headers: "Today", "Yesterday", "Jun 22", etc. */
  dateGroup: string;
};

export const FEED_ACTIVITIES: FeedActivity[] = [
  /* ── Today ── */
  {
    id: "f-sm-1",
    kind: "synced-meeting",
    source: "synced",
    actor: "Calendar",
    action: "synced a",
    noun: "Meeting",
    time: "2:00 PM",
    title: "Q2 Investor Update Call",
    desc: "Quarterly LP update with the Pinnacle Capital group. Zoom link in calendar invite.",
    contactName: "Alex Thompson",
    contactId: "c-at",
    dateGroup: "Today",
  },
  {
    id: "f-se-1",
    kind: "synced-email",
    source: "synced",
    actor: "Gmail",
    action: "synced an",
    noun: "Email",
    time: "10:15 AM",
    title: "RE: Fund III data room access",
    desc: "David confirmed he would review the data room materials this week and follow up on Thursday.",
    contactName: "David Mayers",
    contactId: "c-dm",
    dateGroup: "Today",
  },
  {
    id: "f-n-1",
    kind: "note",
    source: "manual",
    actor: "Tal",
    action: "added a",
    noun: "Note",
    time: "9:30 AM",
    title: "Q2 distribution inquiry",
    desc: "Alex called to confirm Q2 distribution timing and asked about co-invest opportunities in Fund III.",
    contactName: "Alex Thompson",
    contactId: "c-at",
    dateGroup: "Today",
  },

  /* ── Yesterday ── */
  {
    id: "f-c-1",
    kind: "call",
    source: "manual",
    actor: "Tal",
    action: "logged a",
    noun: "Call",
    time: "4:45 PM",
    title: "Co-invest interest follow-up",
    desc: "Sarah confirmed her interest in the Austin logistics co-invest. Asked for updated deal financials by end of month.",
    contactName: "Sarah Kim",
    contactId: "c-sk",
    dateGroup: "Yesterday",
  },
  {
    id: "f-m-1",
    kind: "meeting",
    source: "manual",
    actor: "Tal",
    action: "logged a",
    noun: "Meeting",
    time: "2:00 PM",
    title: "Annual review call",
    desc: "Reviewed Fund II performance. Barbara satisfied with 12.8% net IRR. Evaluating a re-up in Fund III.",
    contactName: "Barbara Chen",
    contactId: "c-bc",
    dateGroup: "Yesterday",
  },
  {
    id: "f-t-1",
    kind: "task",
    source: "manual",
    actor: "Tal",
    action: "created a",
    noun: "Task",
    time: "11:20 AM",
    title: "Send updated waterfall model",
    desc: "Due today. Barbara requested the updated waterfall model showing Fund III distribution scenarios.",
    contactName: "Barbara Chen",
    contactId: "c-bc",
    dateGroup: "Yesterday",
  },

  /* ── Jun 22 ── */
  {
    id: "f-e-1",
    kind: "email",
    source: "manual",
    actor: "Tal",
    action: "logged an",
    noun: "Email",
    time: "Jun 22",
    title: "Fund III term sheet follow-up",
    desc: "Sent the term sheet to Caroline. Waiting for feedback before the scheduled follow-up call.",
    contactName: "Caroline Blake",
    contactId: "c-cb",
    dateGroup: "Jun 22",
  },
  {
    id: "f-m-2",
    kind: "meeting",
    source: "manual",
    actor: "Tal",
    action: "logged a",
    noun: "Meeting",
    time: "Jun 22",
    title: "Intro call — referred by Barbara Chen",
    desc: "First contact. Caroline manages a $50M family office evaluating CRE. Strong positive reaction to the fund thesis.",
    contactName: "Caroline Blake",
    contactId: "c-cb",
    dateGroup: "Jun 22",
  },

  /* ── Jun 20 ── */
  {
    id: "f-n-2",
    kind: "note",
    source: "manual",
    actor: "Tal",
    action: "added a",
    noun: "Note",
    time: "Jun 20",
    title: "Inbound website inquiry",
    desc: "Helen submitted a form asking about fund minimums. Warm lead — needs a qualification call.",
    contactName: "Helen Cruz",
    contactId: "c-hc",
    dateGroup: "Jun 20",
  },
  {
    id: "f-se-2",
    kind: "synced-email",
    source: "synced",
    actor: "Gmail",
    action: "synced an",
    noun: "Email",
    time: "Jun 20",
    title: "Q2 distribution schedule inquiry",
    desc: "Alex emailed asking about Q2 distribution timing and co-invest opportunities in Fund III.",
    contactName: "Alex Thompson",
    contactId: "c-at",
    dateGroup: "Jun 20",
  },

  /* ── Jun 19 ── */
  {
    id: "f-n-3",
    kind: "note",
    source: "manual",
    actor: "Tal",
    action: "added a",
    noun: "Note",
    time: "Jun 19",
    title: "Post-intro follow-up",
    desc: "Sent fund thesis one-pager after intro call. David responded positively and requested data room access.",
    contactName: "David Mayers",
    contactId: "c-dm",
    dateGroup: "Jun 19",
  },
  {
    id: "f-m-3",
    kind: "meeting",
    source: "manual",
    actor: "Tal",
    action: "logged a",
    noun: "Meeting",
    time: "Jun 19",
    title: "Second meeting",
    desc: "Eric comparing Fund III against two other managers. Noted sensitivity on management fees.",
    contactName: "Eric Moss2",
    contactId: "c-em",
    dateGroup: "Jun 19",
  },
];
