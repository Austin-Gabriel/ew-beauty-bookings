/**
 * CustomerProfileProvider — single source of truth for all customer data.
 * Pure in-session React state, no localStorage/sessionStorage.
 * Dev-state toggles drive this store via useEffect syncing.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type Address = {
  id: string;
  label: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

export type PaymentCard = {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type TippingPref = {
  type: "percent" | "custom" | "ask";
  value?: number; // percent value when type is "percent" or "custom"
};

export type NotificationToggles = {
  confirmations: boolean;
  statusUpdates: boolean;
  reminders: boolean;
  messages: boolean;
  ratingPrompts: boolean;
  newPros: boolean;
};

export type ThemePref = "system" | "light" | "dark";

export type Identity = {
  name: string;
  email: string;
  phone: string;
  avatarPhotoUrl: string | null;
};

export type CustomerProfile = {
  identity: Identity;
  savedAddresses: Address[];
  paymentMethods: PaymentCard[];
  tippingPreference: TippingPref;
  themePreference: ThemePref;
  notificationPreferences: NotificationToggles;
};

/* ------------------------------------------------------------------ */
/*  Setters interface                                                   */
/* ------------------------------------------------------------------ */

export type CustomerProfileActions = {
  setIdentity: (identity: Identity) => void;
  updateIdentity: (partial: Partial<Identity>) => void;

  setSavedAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  setPaymentMethods: (cards: PaymentCard[]) => void;
  addCard: (card: PaymentCard) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;

  setTippingPreference: (pref: TippingPref) => void;
  setThemePreference: (pref: ThemePref) => void;
  setNotificationPreferences: (prefs: NotificationToggles) => void;

  /** Replace the entire profile (used by dev-state resets). */
  replaceProfile: (profile: CustomerProfile) => void;
};

type Ctx = {
  profile: CustomerProfile;
} & CustomerProfileActions;

/* ------------------------------------------------------------------ */
/*  Defaults                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_NOTIFICATIONS_ALL_ON: NotificationToggles = {
  confirmations: true,
  statusUpdates: true,
  reminders: true,
  messages: true,
  ratingPrompts: true,
  newPros: false,
};

export const DEFAULT_NOTIFICATIONS_BOOKING_ONLY: NotificationToggles = {
  confirmations: true,
  statusUpdates: true,
  reminders: true,
  messages: false,
  ratingPrompts: false,
  newPros: false,
};

export const DEFAULT_NOTIFICATIONS_ALL_OFF: NotificationToggles = {
  confirmations: false,
  statusUpdates: false,
  reminders: false,
  messages: false,
  ratingPrompts: false,
  newPros: false,
};

export const DEFAULT_PROFILE: CustomerProfile = {
  identity: {
    name: "Imani Okafor",
    email: "imani@example.com",
    phone: "5551234",
    avatarPhotoUrl: null,
  },
  savedAddresses: [
    {
      id: "mock-home",
      label: "Home",
      street: "456 Halsey St",
      apt: "",
      city: "Brooklyn",
      state: "NY",
      zip: "11233",
      isDefault: true,
    },
  ],
  paymentMethods: [
    {
      id: "mock-visa",
      brand: "visa",
      last4: "4421",
      expMonth: 12,
      expYear: 2027,
      isDefault: true,
    },
  ],
  tippingPreference: { type: "percent", value: 20 },
  themePreference: "system",
  notificationPreferences: DEFAULT_NOTIFICATIONS_ALL_ON,
};

/* ------------------------------------------------------------------ */
/*  Seed helpers — create profiles from dev-state                       */
/* ------------------------------------------------------------------ */

export function buildProfileFromDevState(devState: {
  profileState: string;
  editProfileState: string;
  avatarState: string;
  tippingPreference: string;
  tippingCustomValue: number;
  themeMode: string;
  notificationsProfile: string;
  bookingConfirmState: string;
}): CustomerProfile {
  const isEdited = devState.editProfileState === "edited";
  const isNew = devState.profileState === "new";
  const isPartial = devState.profileState === "partial";

  const identity: Identity = {
    name: isEdited ? "Imani O." : "Imani Okafor",
    email: "imani@example.com",
    phone: isEdited ? "2125551234" : "5551234",
    avatarPhotoUrl:
      devState.avatarState === "photo"
        ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
        : null,
  };

  let savedAddresses: Address[] = [];
  if (!isNew && devState.bookingConfirmState !== "missing-address") {
    savedAddresses = [
      {
        id: "mock-home",
        label: "Home",
        street: "456 Halsey St",
        apt: "",
        city: "Brooklyn",
        state: "NY",
        zip: "11233",
        isDefault: true,
      },
    ];
    if (!isPartial) {
      savedAddresses.push({
        id: "mock-studio",
        label: "Studio",
        street: "789 Dekalb Ave",
        apt: "2F",
        city: "Brooklyn",
        state: "NY",
        zip: "11216",
        isDefault: false,
      });
    }
  }

  let paymentMethods: PaymentCard[] = [];
  if (!isNew && devState.bookingConfirmState !== "missing-payment") {
    paymentMethods = [
      {
        id: "mock-visa",
        brand: "visa",
        last4: "4421",
        expMonth: 12,
        expYear: 2027,
        isDefault: true,
      },
    ];
  }

  // Tipping
  let tippingPreference: TippingPref;
  const tipPrefFromConfirm =
    devState.bookingConfirmState === "always-ask-tip"
      ? "ask"
      : devState.bookingConfirmState === "custom-tip"
        ? "custom"
        : null;
  const effectiveTipPref = tipPrefFromConfirm ?? devState.tippingPreference;

  if (effectiveTipPref === "ask") {
    tippingPreference = { type: "ask" };
  } else if (effectiveTipPref === "custom") {
    tippingPreference = {
      type: "custom",
      value: devState.bookingConfirmState === "custom-tip" ? 22 : devState.tippingCustomValue,
    };
  } else {
    tippingPreference = { type: "percent", value: parseInt(effectiveTipPref, 10) };
  }

  // Notifications
  let notificationPreferences: NotificationToggles;
  switch (devState.notificationsProfile) {
    case "booking-only":
      notificationPreferences = DEFAULT_NOTIFICATIONS_BOOKING_ONLY;
      break;
    case "all-off":
      notificationPreferences = DEFAULT_NOTIFICATIONS_ALL_OFF;
      break;
    default:
      notificationPreferences = DEFAULT_NOTIFICATIONS_ALL_ON;
  }

  return {
    identity,
    savedAddresses,
    paymentMethods,
    tippingPreference,
    themePreference: devState.themeMode as ThemePref,
    notificationPreferences,
  };
}

/* ------------------------------------------------------------------ */
/*  Context + Provider                                                  */
/* ------------------------------------------------------------------ */

const CustomerProfileCtx = createContext<Ctx | null>(null);

export function CustomerProfileProvider({
  initial,
  children,
}: {
  initial?: CustomerProfile;
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<CustomerProfile>(initial ?? DEFAULT_PROFILE);

  const setIdentity = useCallback(
    (identity: Identity) => setProfile((p) => ({ ...p, identity })),
    [],
  );

  const updateIdentity = useCallback(
    (partial: Partial<Identity>) =>
      setProfile((p) => ({ ...p, identity: { ...p.identity, ...partial } })),
    [],
  );

  const setSavedAddresses = useCallback(
    (savedAddresses: Address[]) => setProfile((p) => ({ ...p, savedAddresses })),
    [],
  );

  const addAddress = useCallback(
    (address: Address) =>
      setProfile((p) => {
        const addrs = [...p.savedAddresses];
        if (addrs.length === 0) address = { ...address, isDefault: true };
        if (address.isDefault) {
          for (let i = 0; i < addrs.length; i++) addrs[i] = { ...addrs[i], isDefault: false };
        }
        addrs.push(address);
        return { ...p, savedAddresses: addrs };
      }),
    [],
  );

  const updateAddress = useCallback(
    (address: Address) =>
      setProfile((p) => {
        let addrs = p.savedAddresses.map((a) => (a.id === address.id ? address : a));
        if (address.isDefault) {
          addrs = addrs.map((a) => (a.id === address.id ? a : { ...a, isDefault: false }));
        }
        return { ...p, savedAddresses: addrs };
      }),
    [],
  );

  const removeAddress = useCallback(
    (id: string) =>
      setProfile((p) => {
        const removed = p.savedAddresses.find((a) => a.id === id);
        let next = p.savedAddresses.filter((a) => a.id !== id);
        if (removed?.isDefault && next.length > 0) {
          next = [{ ...next[0], isDefault: true }, ...next.slice(1)];
        }
        return { ...p, savedAddresses: next };
      }),
    [],
  );

  const setDefaultAddress = useCallback(
    (id: string) =>
      setProfile((p) => ({
        ...p,
        savedAddresses: p.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        })),
      })),
    [],
  );

  const setPaymentMethods = useCallback(
    (paymentMethods: PaymentCard[]) => setProfile((p) => ({ ...p, paymentMethods })),
    [],
  );

  const addCard = useCallback(
    (card: PaymentCard) =>
      setProfile((p) => {
        const cards = [...p.paymentMethods];
        if (cards.length === 0) card = { ...card, isDefault: true };
        cards.push(card);
        return { ...p, paymentMethods: cards };
      }),
    [],
  );

  const removeCard = useCallback(
    (id: string) =>
      setProfile((p) => {
        const removed = p.paymentMethods.find((c) => c.id === id);
        let next = p.paymentMethods.filter((c) => c.id !== id);
        if (removed?.isDefault && next.length > 0) {
          next = [{ ...next[0], isDefault: true }, ...next.slice(1)];
        }
        return { ...p, paymentMethods: next };
      }),
    [],
  );

  const setDefaultCard = useCallback(
    (id: string) =>
      setProfile((p) => ({
        ...p,
        paymentMethods: p.paymentMethods.map((c) => ({
          ...c,
          isDefault: c.id === id,
        })),
      })),
    [],
  );

  const setTippingPreference = useCallback(
    (tippingPreference: TippingPref) => setProfile((p) => ({ ...p, tippingPreference })),
    [],
  );

  const setThemePreference = useCallback(
    (themePreference: ThemePref) => setProfile((p) => ({ ...p, themePreference })),
    [],
  );

  const setNotificationPreferences = useCallback(
    (notificationPreferences: NotificationToggles) =>
      setProfile((p) => ({ ...p, notificationPreferences })),
    [],
  );

  const replaceProfile = useCallback(
    (profile: CustomerProfile) => setProfile(profile),
    [],
  );

  const ctx = useMemo<Ctx>(
    () => ({
      profile,
      setIdentity,
      updateIdentity,
      setSavedAddresses,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      setPaymentMethods,
      addCard,
      removeCard,
      setDefaultCard,
      setTippingPreference,
      setThemePreference,
      setNotificationPreferences,
      replaceProfile,
    }),
    [
      profile,
      setIdentity,
      updateIdentity,
      setSavedAddresses,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      setPaymentMethods,
      addCard,
      removeCard,
      setDefaultCard,
      setTippingPreference,
      setThemePreference,
      setNotificationPreferences,
      replaceProfile,
    ],
  );

  return (
    <CustomerProfileCtx.Provider value={ctx}>
      {children}
    </CustomerProfileCtx.Provider>
  );
}

export function useCustomerProfile() {
  const ctx = useContext(CustomerProfileCtx);
  if (!ctx) {
    throw new Error("useCustomerProfile must be used within CustomerProfileProvider");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  ID generator                                                        */
/* ------------------------------------------------------------------ */

let _nextId = 1;
export function genId(prefix = "id") {
  return `${prefix}-${Date.now()}-${_nextId++}`;
}
