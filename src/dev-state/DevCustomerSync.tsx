/**
 * DevCustomerSync — bridges dev-state toggles to the shared CustomerProfileProvider.
 *
 * NON-DESTRUCTIVE CONTRACT: dev toggles only update scalar prefs (identity,
 * tipping, theme, notifications) and the MOCK-seeded addresses/payment cards.
 * Any address or card the user added during the session (id does NOT start
 * with "mock-") is preserved across every toggle change.
 *
 * "New" / "Partial" / "Complete" profileState → controls how many *mock*
 * addresses/cards appear. User-added items survive untouched.
 */
import { useEffect, useRef } from "react";
import { useDevState } from "./devState";
import { useCustomerProfile, buildProfileFromDevState } from "@/data/customer-store";

const isMockId = (id: string) => id.startsWith("mock-");

export function DevCustomerSync() {
  const { state } = useDevState();
  const { profile, replaceProfile } = useCustomerProfile();
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const prevKey = useRef("");

  useEffect(() => {
    const key = [
      state.profileState,
      state.editProfileState,
      state.avatarState,
      state.tippingPreference,
      state.tippingCustomValue,
      state.themeMode,
      state.notificationsProfile,
      state.bookingConfirmState,
    ].join("|");

    if (key === prevKey.current) return;
    prevKey.current = key;

    const builtFromDev = buildProfileFromDevState(state);
    const current = profileRef.current;

    // Preserve any user-added items (ids not in the "mock-" namespace).
    const userAddresses = current.savedAddresses.filter((a) => !isMockId(a.id));
    const userCards = current.paymentMethods.filter((c) => !isMockId(c.id));

    replaceProfile({
      ...builtFromDev,
      savedAddresses: [...builtFromDev.savedAddresses, ...userAddresses],
      paymentMethods: [...builtFromDev.paymentMethods, ...userCards],
    });
  }, [
    state.profileState,
    state.editProfileState,
    state.avatarState,
    state.tippingPreference,
    state.tippingCustomValue,
    state.themeMode,
    state.notificationsProfile,
    state.bookingConfirmState,
    replaceProfile,
    state,
  ]);

  return null;
}
