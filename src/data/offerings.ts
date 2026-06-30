/* ------------------------------------------------------------------ *
 * Offering types
 * ------------------------------------------------------------------ */

export type OfferingType =
  | "Reservations & Investments"
  | "Investments Only"
  | "Reservations Only";

export type OfferingStatus = "Active" | "Closed" | "Draft";

export type SubscriptionStage =
  | "Hasn't Started"
  | "Started"
  | "Counter Sign"
  | "Waitlist"
  | "Completed"
  | "Signed";

/* ------------------------------------------------------------------ *
 * Prospect — a contact's subscription record inside an offering
 * ------------------------------------------------------------------ */

export type Prospect = {
  id: string;
  offeringId: string;
  name: string;
  stage: SubscriptionStage;
  subscriptionStep: string;
  daysInStage: number;
  subscriptionAmount?: number;
  softCommitment?: number;
  organization?: string;
  staffMember?: string;
  dataRoomAccess: boolean;
};

/* ------------------------------------------------------------------ *
 * Stage configuration — color + label for the kanban
 * ------------------------------------------------------------------ */

export const STAGE_CONFIG: Record<SubscriptionStage, { color: string; label: string }> = {
  "Hasn't Started": { color: "#8C8C8C", label: "Hasn't Started" },
  "Started":        { color: "#531DAB", label: "Started" },
  "Counter Sign":   { color: "#0958D9", label: "Counter Sign" },
  "Waitlist":       { color: "#D46B08", label: "Waitlist" },
  "Completed":      { color: "#389E0D", label: "Completed" },
  "Signed":         { color: "#389E0D", label: "Signed" },
};

/** Ordered stages shown in the kanban board. */
export const KANBAN_STAGES: SubscriptionStage[] = [
  "Hasn't Started",
  "Started",
  "Counter Sign",
  "Waitlist",
  "Completed",
];

export type Offering = {
  id: string;
  name: string;
  type: OfferingType;
  status: OfferingStatus;
  prospectsCount: number;
  visibility: string;       // e.g. "Data Room"
  commitments: number;
  raiseTarget: number;
};

/** Per-contact subscription to an offering (used in ContactDetailData). */
export type ContactOffering = {
  offeringId: string;
  prospectName: string;
  stage: SubscriptionStage;
  subscriptionAmount?: number;
  dataRoomAccess: boolean;
};

/* ------------------------------------------------------------------ *
 * Sample offerings
 * ------------------------------------------------------------------ */

export const OFFERINGS: Offering[] = [
  {
    id: "off-1",
    name: "Agora Multifamily Fund III",
    type: "Reservations & Investments",
    status: "Active",
    prospectsCount: 24,
    visibility: "Data Room",
    commitments: 8_750_000,
    raiseTarget: 15_000_000,
  },
  {
    id: "off-2",
    name: "Coastal Retail Portfolio",
    type: "Investments Only",
    status: "Active",
    prospectsCount: 12,
    visibility: "Data Room",
    commitments: 3_200_000,
    raiseTarget: 10_000_000,
  },
  {
    id: "off-3",
    name: "Industrial Value-Add Fund II",
    type: "Investments Only",
    status: "Active",
    prospectsCount: 18,
    visibility: "Data Room",
    commitments: 6_400_000,
    raiseTarget: 8_000_000,
  },
  {
    id: "off-4",
    name: "Downtown Mixed-Use Development",
    type: "Reservations & Investments",
    status: "Active",
    prospectsCount: 9,
    visibility: "Data Room",
    commitments: 1_100_000,
    raiseTarget: 5_000_000,
  },
  {
    id: "off-5",
    name: "Self-Storage Portfolio IV",
    type: "Investments Only",
    status: "Active",
    prospectsCount: 31,
    visibility: "Data Room",
    commitments: 12_300_000,
    raiseTarget: 12_000_000,
  },
  {
    id: "off-6",
    name: "Suburban Office Park Redevelopment",
    type: "Reservations Only",
    status: "Active",
    prospectsCount: 6,
    visibility: "Data Room",
    commitments: 900_000,
    raiseTarget: 4_000_000,
  },
  {
    id: "off-7",
    name: "Medical Office Building Fund",
    type: "Reservations & Investments",
    status: "Active",
    prospectsCount: 15,
    visibility: "Data Room",
    commitments: 5_600_000,
    raiseTarget: 7_500_000,
  },
  {
    id: "off-8",
    name: "Luxury Residential Tower — Phase 1",
    type: "Investments Only",
    status: "Closed",
    prospectsCount: 42,
    visibility: "Data Room",
    commitments: 22_000_000,
    raiseTarget: 20_000_000,
  },
];

/* ------------------------------------------------------------------ *
 * Sample prospects (for off-1)
 * ------------------------------------------------------------------ */

export const PROSPECTS: Prospect[] = [
  {
    id: "pr-1",
    offeringId: "off-1",
    name: "David Kim",
    stage: "Hasn't Started",
    subscriptionStep: "Not Started",
    daysInStage: 5,
    dataRoomAccess: true,
  },
  {
    id: "pr-2",
    offeringId: "off-1",
    name: "Sarah Johnson",
    stage: "Started",
    subscriptionStep: "Investing Profile",
    daysInStage: 13,
    subscriptionAmount: 50_000,
    dataRoomAccess: true,
  },
  {
    id: "pr-3",
    offeringId: "off-1",
    name: "Michael Chen",
    stage: "Started",
    subscriptionStep: "Sign and Upload Docs",
    daysInStage: 21,
    subscriptionAmount: 100_000,
    dataRoomAccess: true,
  },
  {
    id: "pr-4",
    offeringId: "off-1",
    name: "Alina Nemirovski",
    stage: "Started",
    subscriptionStep: "Sign and Upload Docs",
    daysInStage: 21,
    subscriptionAmount: 100,
    organization: "Nemirovski Capital",
    dataRoomAccess: true,
  },
  {
    id: "pr-5",
    offeringId: "off-1",
    name: "Robert Davis",
    stage: "Started",
    subscriptionStep: "Investment Amount",
    daysInStage: 18,
    dataRoomAccess: true,
  },
  {
    id: "pr-6",
    offeringId: "off-1",
    name: "Jessica Wong",
    stage: "Started",
    subscriptionStep: "Investing Profile",
    daysInStage: 7,
    subscriptionAmount: 25_000,
    dataRoomAccess: true,
  },
  {
    id: "pr-7",
    offeringId: "off-1",
    name: "Tom Goldstein",
    stage: "Started",
    subscriptionStep: "Funding Instructions",
    daysInStage: 30,
    subscriptionAmount: 200_000,
    organization: "Goldstein Family Office",
    dataRoomAccess: true,
  },
  {
    id: "pr-8",
    offeringId: "off-1",
    name: "Priya Sharma",
    stage: "Counter Sign",
    subscriptionStep: "Completed",
    daysInStage: 4,
    subscriptionAmount: 75_000,
    dataRoomAccess: true,
  },
  {
    id: "pr-9",
    offeringId: "off-1",
    name: "Carlos Rivera",
    stage: "Waitlist",
    subscriptionStep: "Completed",
    daysInStage: 12,
    subscriptionAmount: 150_000,
    softCommitment: 150_000,
    dataRoomAccess: true,
  },
  {
    id: "pr-10",
    offeringId: "off-1",
    name: "Emma Larsen",
    stage: "Completed",
    subscriptionStep: "Completed",
    daysInStage: 22,
    subscriptionAmount: 2_222,
    dataRoomAccess: true,
  },
  {
    id: "pr-11",
    offeringId: "off-1",
    name: "Mark Sabati",
    stage: "Completed",
    subscriptionStep: "Completed",
    daysInStage: 21,
    subscriptionAmount: 10_000,
    organization: "Sabati Investments",
    dataRoomAccess: true,
  },
];

export function getProspectsForOffering(offeringId: string): Prospect[] {
  return PROSPECTS.filter((p) => p.offeringId === offeringId);
}
