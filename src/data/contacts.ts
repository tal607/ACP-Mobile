import type { Activity } from "@/components";
import type { ContactActionItem, ContactData, ContactLastNote, ContactStatus } from "@/components";

/* ------------------------------------------------------------------ *
 * Investment / cap-table types
 * ------------------------------------------------------------------ */

export type Transaction = {
  id: string;
  type: "Distribution" | "Contribution" | "Capital Call";
  dateLabel: string; // e.g. "Dec 15, 2024"
  year: number;
  amount: number; // always positive
  status: "Completed" | "Pending";
  note?: string;

  // Distribution-specific
  paymentMethod?: string;      // e.g. "ACH" | "Wire" | "Check"
  remainingToPay?: number;     // 0 when fully paid, amount when pending

  // Capital Call-specific
  period?: string;             // e.g. "Q3 2023"
  dueDate?: string;            // e.g. "Sep 15, 2023"
  contributionReceived?: number;
  balanceRemaining?: number;

  // Contribution / Capital Flow-specific
  receivedDate?: string;       // e.g. "Sep 15, 2023"
  allocationType?: string;     // e.g. "Amount" | "Percentage"
};

export type Position = {
  id: string;
  fundName: string; // e.g. "Agora Fund II"
  fundType: string; // e.g. "Multifamily Value-Add"
  profile: string; // investing-profile display name
  class: string; // e.g. "LP Class A"
  commitment: number;
  contribution: number; // amount actually funded
  distributions: number; // sum of completed distributions
  ownership: number; // decimal, e.g. 0.034 = 3.4 %
  status: "Active" | "Exited";
  vintage: number; // fund close year
  transactions: Transaction[];
};

/* ------------------------------------------------------------------ *
 * Extended type — ContactData + detail-page fields
 * ------------------------------------------------------------------ */

export type ContactNextMeeting = {
  date: string;
  time: string;
  duration: string;
  type: string;
};

export type RelatedContact = {
  id: string;
  name: string;
  note?: string;
};

export type ContactDetailData = ContactData & {
  location?: string;
  website?: string;
  nextMeeting?: ContactNextMeeting;
  activity?: Activity[];
  positions?: Position[];
  relatedContacts?: RelatedContact[];
};

/* ------------------------------------------------------------------ *
 * Contacts — shared source of truth for list + detail screens
 * ------------------------------------------------------------------ */

export const CONTACTS: ContactDetailData[] = [
  {
    id: "c-at",
    name: "Alex Thompson",
    initials: "AT",
    company: "Pinnacle Capital Group",
    tag: "Investor",
    email: "alex.t@pinnaclecp.com",
    phone: "+1-212-555-0181",
    website: "https://pinnaclecp.com",
    location: "New York, NY",
    lastActivity: "Today",
    dataRoomUrl: "https://app.agora.com/data-room/pinnacle",
    aiBrief:
      "Alex has been an LP in Fund II and committed $1.2M. He has been asking about co-invest opportunities this quarter and expressed interest in the Denver multifamily deal. Follow up on the Q2 distribution schedule he emailed about last week.",
    nextMeeting: {
      date: "Jun 25",
      time: "10:00 AM",
      duration: "30 min",
      type: "Q2 Distribution Call",
    },
    lastNote: {
      date: "Jun 20",
      title: "Q2 distribution inquiry",
      desc: "Alex called to confirm Q2 distribution timing and asked about deal flow for Fund III co-invest opportunities. Wants the Denver multifamily one-pager by end of month.",
    },
    actionItems: [
      { id: "at-1", label: "Send Denver multifamily one-pager", overdue: false },
      { id: "at-2", label: "Confirm Q2 distribution date", overdue: false },
    ],
    status: { stage: "Active LP", offering: "Fund III", dataRoom: "opened" },
    assignedTo: "Tal",
    tags: ["High Net Worth", "Co-invest Interest"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    title: "Mr.",
    preferredName: "Al",
    jobTitle: "Managing Partner",
    residency: "US Citizen",
    passportId: "US-A12345678",
    taxId: "XXX-XX-1234",
    dateOfBirth: "Jan 15, 1975",
    contactNotes: "Prefers calls on Tuesday mornings.",
    relatedContacts: [
      { id: "rc-at-1", name: "Margaret Thompson", note: "Spouse" },
      { id: "rc-at-2", name: "Pinnacle Capital LLC", note: "Entity account" },
    ],
    activity: [
      {
        id: "at-a1",
        kind: "note",
        actor: "Tal",
        action: "added a",
        noun: "Note",
        time: "Jun 20",
        title: "Q2 distribution inquiry",
        desc: "Alex called to confirm Q2 distribution timing and asked about co-invest opportunities in Fund III.",
      },
      {
        id: "at-a2",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 10",
        title: "Fund III portfolio review",
        desc: "Quarterly review. Alex pleased with 14.2% net IRR. Expressed strong interest in the Denver multifamily deal.",
      },
      {
        id: "at-a3",
        kind: "call",
        actor: "Tal",
        action: "logged a",
        noun: "Call",
        time: "May 28",
        title: "Intro to Fund III co-invest opportunity",
        desc: "Brief call to introduce the co-invest deal structure. Alex asked for the full deck and data room access.",
      },
    ],
    positions: [
      {
        id: "pos-at-1",
        fundName: "Agora Fund II",
        fundType: "Multifamily Value-Add",
        profile: "Alex Thompson Individual",
        class: "LP Class A",
        commitment: 1_200_000,
        contribution: 1_200_000,
        distributions: 133_200,
        ownership: 0.034,
        status: "Active",
        vintage: 2022,
        transactions: [
          { id: "tx-at-1", type: "Contribution", dateLabel: "Jan 15, 2022", year: 2022, amount: 1_200_000, status: "Completed", note: "Initial capital contribution", receivedDate: "Jan 15, 2022", allocationType: "Amount" },
          { id: "tx-at-2", type: "Distribution", dateLabel: "Jun 30, 2022", year: 2022, amount: 18_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-3", type: "Distribution", dateLabel: "Dec 15, 2022", year: 2022, amount: 21_600, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-4", type: "Distribution", dateLabel: "Jun 30, 2023", year: 2023, amount: 22_200, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-5", type: "Distribution", dateLabel: "Dec 15, 2023", year: 2023, amount: 24_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-6", type: "Distribution", dateLabel: "Jun 30, 2024", year: 2024, amount: 22_800, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-7", type: "Distribution", dateLabel: "Dec 15, 2024", year: 2024, amount: 24_600, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-at-8", type: "Distribution", dateLabel: "Mar 31, 2025", year: 2025, amount: 30_600, status: "Pending", paymentMethod: "ACH", remainingToPay: 30_600 },
        ],
      },
    ],
  },
  {
    id: "c-bc",
    name: "Barbara Chen",
    initials: "BC",
    company: "Coastal Real Estate LP",
    tag: "Investor",
    email: "bchen@coastalre.com",
    phone: "+1-415-555-0234",
    website: "https://coastalrealestatelp.com",
    location: "San Francisco, CA",
    lastActivity: "2d ago",
    lastNote: {
      date: "Jun 18",
      title: "Annual review call",
      desc: "Reviewed Fund II performance. Barbara is satisfied with 12.8% net IRR. Evaluating re-up in Fund III.",
    },
    actionItems: [
      { id: "bc-1", label: "Send updated waterfall model", overdue: true },
    ],
    status: { stage: "Active LP", offering: "Fund III", dataRoom: "sent" },
    assignedTo: "Roee",
    tags: ["High Net Worth", "Re-up Candidate"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    activity: [
      {
        id: "bc-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 18",
        title: "Annual review call",
        desc: "Reviewed Fund II performance. 12.8% net IRR. Barbara evaluating a re-up commitment in Fund III.",
      },
      {
        id: "bc-a2",
        kind: "note",
        actor: "Tal",
        action: "added a",
        noun: "Note",
        time: "Jun 5",
        title: "Follow-up: waterfall model request",
        desc: "Barbara requested the updated waterfall model showing Fund III distribution scenarios before committing.",
      },
    ],
    positions: [
      {
        id: "pos-bc-1",
        fundName: "Agora Fund II",
        fundType: "Multifamily Value-Add",
        profile: "Barbara Chen Individual",
        class: "LP Class A",
        commitment: 800_000,
        contribution: 800_000,
        distributions: 88_800,
        ownership: 0.023,
        status: "Active",
        vintage: 2022,
        transactions: [
          { id: "tx-bc-1", type: "Contribution", dateLabel: "Jan 15, 2022", year: 2022, amount: 800_000, status: "Completed", note: "Initial capital contribution", receivedDate: "Jan 15, 2022", allocationType: "Amount" },
          { id: "tx-bc-2", type: "Distribution", dateLabel: "Jun 30, 2022", year: 2022, amount: 12_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-3", type: "Distribution", dateLabel: "Dec 15, 2022", year: 2022, amount: 14_400, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-4", type: "Distribution", dateLabel: "Jun 30, 2023", year: 2023, amount: 14_800, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-5", type: "Distribution", dateLabel: "Dec 15, 2023", year: 2023, amount: 16_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-6", type: "Distribution", dateLabel: "Jun 30, 2024", year: 2024, amount: 15_200, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-7", type: "Distribution", dateLabel: "Dec 15, 2024", year: 2024, amount: 16_400, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-bc-8", type: "Distribution", dateLabel: "Mar 31, 2025", year: 2025, amount: 20_400, status: "Pending", paymentMethod: "ACH", remainingToPay: 20_400 },
        ],
      },
    ],
  },
  {
    id: "c-cb",
    name: "Caroline Blake",
    initials: "CB",
    company: "Greenfield Partners",
    tag: "Prospect",
    email: "caroline@greenfieldp.com",
    phone: "+1-312-555-0097",
    website: "https://greenfieldpartners.com",
    location: "Chicago, IL",
    lastActivity: "Today",
    nextMeeting: {
      date: "Jun 24",
      time: "2:00 PM",
      duration: "45 min",
      type: "Follow-up call",
    },
    aiBrief:
      "New prospect introduced by Barbara Chen. Caroline manages a $50M family office actively diversifying into CRE. She reviewed the fund overview and requested a follow-up call and LP reference.",
    lastNote: {
      date: "Jun 22",
      title: "Intro call - referred by Barbara Chen",
      desc: "First call. She liked the thesis and asked for a data room invite and LP reference call.",
    },
    actionItems: [
      { id: "cb-1", label: "Send data room invite", overdue: false },
      { id: "cb-2", label: "Arrange LP reference call", overdue: false },
    ],
    status: { stage: "First Touch", offering: "Fund III", dataRoom: "not_sent" },
    assignedTo: "Tal",
    tags: ["Family Office"],
    leadSource: "Referral",
    classification: "Family Office",
    country: "United States",
    activity: [
      {
        id: "cb-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 22",
        title: "Intro call - referred by Barbara Chen",
        desc: "First contact. Caroline manages a $50M family office evaluating CRE. Positive reaction to the fund thesis.",
      },
    ],
  },
  {
    id: "c-dm",
    name: "David Mayers",
    initials: "DM",
    company: "Meridian Capital",
    tag: "Prospect",
    email: "david@meridiancapital.com",
    phone: "+1-212-555-0142",
    website: "https://meridiancapital.com",
    location: "New York, NY",
    lastActivity: "3d ago",
    dataRoomUrl: "https://app.agora.com/data-room/meridian",
    aiBrief:
      "Referred by John Kessler. David is evaluating 2-3 CRE funds with a $500K+ target commitment. Key priority: send data room and follow up before end of month.",
    lastNote: {
      date: "Jun 19",
      title: "Post-intro follow-up",
      desc: "Sent fund thesis one-pager. David responded positively and asked for the data room link.",
    },
    actionItems: [
      { id: "dm-1", label: "Send data room invite", overdue: false },
      { id: "dm-2", label: "Schedule reference call", overdue: false },
    ],
    status: { stage: "In Discussion", offering: "Fund III", dataRoom: "not_sent" },
    assignedTo: "Tal",
    tags: ["Active Evaluator"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    activity: [
      {
        id: "dm-a1",
        kind: "note",
        actor: "Tal",
        action: "added a",
        noun: "Note",
        time: "Jun 19",
        title: "Post-intro follow-up",
        desc: "Sent fund thesis one-pager after intro call. David responded positively.",
      },
      {
        id: "dm-a2",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 12",
        title: "Intro call — referred by John Kessler",
        desc: "First meeting. David evaluating 2-3 CRE funds. Liked the thesis. Requested data room access.",
      },
    ],
  },
  {
    id: "c-em",
    name: "Eric Moss2",
    initials: "EM",
    company: "Summit RE Partners",
    tag: "Prospect",
    email: "emoss@summitre.com",
    phone: "+1-303-555-0056",
    location: "Denver, CO",
    lastActivity: "3d ago",
    lastNote: {
      date: "Jun 19",
      title: "Second meeting",
      desc: "Comparing Fund III against two other managers. Opened data room twice. Price sensitivity noted.",
    },
    status: { stage: "In Discussion", offering: "Fund III", dataRoom: "opened" },
    assignedTo: "Miriam",
    tags: ["Active Evaluator", "Price Sensitive"],
    leadSource: "Conference",
    classification: "Individual",
    country: "United States",
    activity: [
      {
        id: "em-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 19",
        title: "Second meeting",
        desc: "Eric comparing Fund III against two other managers. Price sensitivity on fees noted.",
      },
    ],
  },
  {
    id: "c-fg",
    name: "Fiona Grant",
    initials: "FG",
    company: "Redwood Capital",
    tag: "Prospect",
    email: "fgrant@redwoodcap.com",
    location: "Los Angeles, CA",
    lastActivity: "1w ago",
    status: { stage: "First Touch", offering: "Fund III", dataRoom: "not_sent" },
    assignedTo: "Dana",
    tags: [],
    leadSource: "LinkedIn",
    classification: "Individual",
    country: "United States",
  },
  {
    id: "c-hc",
    name: "Helen Cruz",
    initials: "HC",
    company: "Metro Equity Fund",
    tag: "Lead",
    email: "hcruz@metroequity.com",
    phone: "+1-646-555-0189",
    location: "New York, NY",
    lastActivity: "2d ago",
    lastNote: {
      date: "Jun 20",
      title: "Inbound - website inquiry",
      desc: "Filled out contact form asking about fund minimums and deal structure. Needs qualification call.",
    },
    status: { stage: "Lead", dataRoom: "not_sent" },
    assignedTo: "Roee",
    tags: ["Inbound"],
    leadSource: "Website",
    classification: "Entity",
    country: "United States",
    activity: [
      {
        id: "hc-a1",
        kind: "note",
        actor: "Tal",
        action: "added a",
        noun: "Note",
        time: "Jun 20",
        title: "Inbound website inquiry",
        desc: "Helen submitted a form on the website asking about fund minimums. Warm lead — needs qualification.",
      },
    ],
  },
  {
    id: "c-jc",
    name: "James Chen",
    initials: "JC",
    company: "Initech Ventures",
    tag: "Prospect",
    email: "james.chen@initech.com",
    phone: "+1-415-555-0271",
    website: "https://initechventures.com",
    location: "San Francisco, CA",
    lastActivity: "1w ago",
    dataRoomUrl: "https://app.agora.com/data-room/initech-james",
    lastNote: {
      date: "Jun 14",
      title: "Introduction via Sarah Kim",
      desc: "Initech's new investment director. Evaluating Fund III alongside Sarah.",
    },
    actionItems: [
      { id: "jc-1", label: "Send fund overview deck", overdue: true },
      { id: "jc-2", label: "Grant data room access", overdue: false },
    ],
    status: { stage: "In Discussion", offering: "Fund III", dataRoom: "not_sent" },
    assignedTo: "Miriam",
    tags: ["Active Evaluator"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    activity: [
      {
        id: "jc-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 14",
        title: "Introduction via Sarah Kim",
        desc: "First meeting. James is Initech's new investment director evaluating Fund III.",
      },
    ],
  },
  {
    id: "c-kl",
    name: "Kevin Lee",
    initials: "KL",
    company: "Riverfront Partners",
    tag: "Lead",
    email: "kevin.lee@riverfrontp.com",
    lastActivity: "Jun 15",
    status: { stage: "Lead", dataRoom: "not_sent" },
    assignedTo: "Dana",
    tags: [],
    leadSource: "Cold Outreach",
    classification: "Individual",
    country: "United States",
  },
  {
    id: "c-lw",
    name: "Linda Walsh",
    initials: "LW",
    company: "Pacific Capital",
    tag: "Lead",
    email: "lwalsh@pacificcap.com",
    phone: "+1-206-555-0312",
    location: "Seattle, WA",
    lastActivity: "Jun 12",
    status: { stage: "Lead", dataRoom: "not_sent" },
    assignedTo: "Tal",
    tags: [],
    leadSource: "Conference",
    classification: "Individual",
    country: "United States",
  },
  {
    id: "c-mp",
    name: "Michael Park",
    initials: "MP",
    company: "Harbor Ventures",
    tag: "Prospect",
    email: "mpark@harborventures.com",
    phone: "+1-617-555-0074",
    location: "Boston, MA",
    lastActivity: "Jun 8",
    lastNote: {
      date: "Jun 8",
      title: "Demo call",
      desc: "Walked Michael through the investor portal. Impressed with waterfall modeling. Needs internal approval.",
    },
    status: { stage: "In Discussion", offering: "Fund III", dataRoom: "sent" },
    assignedTo: "Roee",
    tags: ["Institutional"],
    leadSource: "Conference",
    classification: "Entity",
    country: "United States",
    activity: [
      {
        id: "mp-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 8",
        title: "Demo call",
        desc: "Investor portal demo. Michael impressed with waterfall modeling. Internal approval needed before committing.",
      },
    ],
  },
  {
    id: "c-sk",
    name: "Sarah Kim",
    initials: "SK",
    company: "Initech Ventures",
    tag: "Investor",
    email: "sarah.kim@initech.com",
    phone: "+1-415-555-0198",
    website: "https://initechventures.com",
    location: "San Francisco, CA",
    lastActivity: "May 28",
    nextMeeting: {
      date: "Jun 30",
      time: "2:00 PM",
      duration: "45 min",
      type: "Portfolio review",
    },
    aiBrief:
      "Active LP in Fund III. Strong co-invest interest in the Austin logistics deal. James Chen is evaluating alongside her. Goal: align both on co-invest and confirm Q2 distribution timing.",
    lastNote: {
      date: "May 28",
      title: "Q1 fund performance call",
      desc: "Pleased with 14.2% net IRR. Expressed strong interest in the Austin logistics co-invest deal.",
    },
    actionItems: [
      { id: "sk-1", label: "Send Austin logistics co-invest deck", overdue: true },
      { id: "sk-2", label: "Confirm Q2 distribution schedule", overdue: false },
    ],
    status: { stage: "Active LP", offering: "Fund III", dataRoom: "opened" },
    assignedTo: "Tal",
    tags: ["High Net Worth", "Co-invest Interest"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    jobTitle: "Principal",
    relatedContacts: [
      { id: "rc-sk-1", name: "James Chen", note: "CC'd to personal emails" },
    ],
    activity: [
      {
        id: "sk-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "May 28",
        title: "Q1 fund performance call",
        desc: "Reviewed Q1 returns. Sarah pleased with 14.2% net IRR. Strong interest in Austin logistics co-invest.",
      },
      {
        id: "sk-a2",
        kind: "call",
        actor: "Tal",
        action: "logged a",
        noun: "Call",
        time: "May 10",
        title: "Co-invest interest follow-up",
        desc: "Sarah confirmed her interest in co-investing. Asked for updated deal financials by end of May.",
      },
      {
        id: "sk-a3",
        kind: "note",
        actor: "Tal",
        action: "added a",
        noun: "Note",
        time: "Apr 22",
        title: "Q4 distribution confirmed",
        desc: "Q4 distribution processed. Sarah confirmed receipt and expressed interest in increasing position in Fund III.",
      },
    ],
    positions: [
      {
        id: "pos-sk-1",
        fundName: "Agora Fund III",
        fundType: "Industrial & Logistics",
        profile: "Sarah Kim Individual",
        class: "LP Class A",
        commitment: 500_000,
        contribution: 300_000,
        distributions: 42_000,
        ownership: 0.018,
        status: "Active",
        vintage: 2023,
        transactions: [
          { id: "tx-sk-1", type: "Capital Call", dateLabel: "Sep 1, 2023", year: 2023, amount: 300_000, status: "Completed", note: "First tranche — 60% of commitment", period: "Q3 2023", dueDate: "Sep 15, 2023", contributionReceived: 300_000, balanceRemaining: 0 },
          { id: "tx-sk-2", type: "Contribution", dateLabel: "Sep 15, 2023", year: 2023, amount: 300_000, status: "Completed", receivedDate: "Sep 15, 2023", allocationType: "Amount" },
          { id: "tx-sk-3", type: "Distribution", dateLabel: "Dec 15, 2023", year: 2023, amount: 18_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-sk-4", type: "Distribution", dateLabel: "Jun 30, 2024", year: 2024, amount: 24_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-sk-5", type: "Capital Call", dateLabel: "Feb 1, 2025", year: 2025, amount: 200_000, status: "Pending", note: "Second tranche — remaining 40% of commitment", period: "Q1 2025", dueDate: "Feb 28, 2025", contributionReceived: 0, balanceRemaining: 200_000 },
        ],
      },
    ],
  },
  {
    id: "c-wf",
    name: "William Foster",
    initials: "WF",
    company: "Apex Investments",
    tag: "Investor",
    email: "wfoster@apexinv.com",
    phone: "+1-713-555-0229",
    website: "https://apexinvestments.com",
    location: "Houston, TX",
    lastActivity: "Jun 10",
    lastNote: {
      date: "Jun 10",
      title: "Re-up discussion for Fund III",
      desc: "Interested in re-upping at $750K. Wants to review the updated PPM before committing.",
    },
    actionItems: [{ id: "wf-1", label: "Send updated PPM", overdue: false }],
    status: { stage: "Active LP", offering: "Fund III", dataRoom: "opened" },
    assignedTo: "Miriam",
    tags: ["Re-up Candidate"],
    leadSource: "Referral",
    classification: "Individual",
    country: "United States",
    activity: [
      {
        id: "wf-a1",
        kind: "meeting",
        actor: "Tal",
        action: "logged a",
        noun: "Meeting",
        time: "Jun 10",
        title: "Re-up discussion",
        desc: "William interested in re-upping at $750K in Fund III. Wants updated PPM before signing.",
      },
    ],
    positions: [
      {
        id: "pos-wf-1",
        fundName: "Agora Fund II",
        fundType: "Multifamily Value-Add",
        profile: "William Foster Individual",
        class: "LP Class A",
        commitment: 600_000,
        contribution: 600_000,
        distributions: 66_600,
        ownership: 0.017,
        status: "Active",
        vintage: 2022,
        transactions: [
          { id: "tx-wf-1", type: "Contribution", dateLabel: "Jan 15, 2022", year: 2022, amount: 600_000, status: "Completed", note: "Initial capital contribution", receivedDate: "Jan 15, 2022", allocationType: "Amount" },
          { id: "tx-wf-2", type: "Distribution", dateLabel: "Jun 30, 2022", year: 2022, amount: 9_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-3", type: "Distribution", dateLabel: "Dec 15, 2022", year: 2022, amount: 10_800, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-4", type: "Distribution", dateLabel: "Jun 30, 2023", year: 2023, amount: 11_100, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-5", type: "Distribution", dateLabel: "Dec 15, 2023", year: 2023, amount: 12_000, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-6", type: "Distribution", dateLabel: "Jun 30, 2024", year: 2024, amount: 11_400, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-7", type: "Distribution", dateLabel: "Dec 15, 2024", year: 2024, amount: 12_300, status: "Completed", paymentMethod: "ACH", remainingToPay: 0 },
          { id: "tx-wf-8", type: "Distribution", dateLabel: "Mar 31, 2025", year: 2025, amount: 15_000, status: "Pending", paymentMethod: "ACH", remainingToPay: 15_000 },
        ],
      },
    ],
  },
];
