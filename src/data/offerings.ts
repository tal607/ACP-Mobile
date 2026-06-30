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
  | "Completed"
  | "Signed";

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
