export type StaffMember = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

export const STAFF_MEMBERS: StaffMember[] = [
  { id: "s1", name: "Tal Yanay",      initials: "TY", role: "CEO"       },
  { id: "s2", name: "Lior Cohen",     initials: "LC", role: "Product"   },
  { id: "s3", name: "Maya Shapiro",   initials: "MS", role: "CS"        },
  { id: "s4", name: "Oren Katz",      initials: "OK", role: "Sales"     },
  { id: "s5", name: "Dana Levi",      initials: "DL", role: "Marketing" },
];

/** Returns the staff member matching the current user's name */
export const CURRENT_USER = STAFF_MEMBERS[0];
