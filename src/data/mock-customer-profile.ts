/**
 * Mock customer profile — single source of truth for the signed-in
 * customer in dev mode. Toggled via dev-state customerState.
 */
export type CustomerProfile = {
  id: string;
  name: string;
  savedAddresses: { label: string; address: string }[];
  favoriteProIds: string[];
  pastBookingProIds: string[];
};

export const NEW_CUSTOMER: CustomerProfile = {
  id: "cust-new",
  name: "Friend",
  savedAddresses: [],
  favoriteProIds: [],
  pastBookingProIds: [],
};

export const RETURNING_CUSTOMER: CustomerProfile = {
  id: "cust-returning",
  name: "Amara",
  savedAddresses: [{ label: "Home", address: "Bed-Stuy, Brooklyn" }],
  favoriteProIds: ["amara-okafor", "joelle-pierre"],
  pastBookingProIds: ["joelle-pierre"],
};

export const POWER_CUSTOMER: CustomerProfile = {
  id: "cust-power",
  name: "Zola",
  savedAddresses: [
    { label: "Home", address: "Crown Heights, Brooklyn" },
    { label: "Studio", address: "Fort Greene, Brooklyn" },
  ],
  favoriteProIds: ["amara-okafor", "joelle-pierre", "kemi-adesanya", "tomi-balogun"],
  pastBookingProIds: ["amara-okafor", "joelle-pierre"],
};
