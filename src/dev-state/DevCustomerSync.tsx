/**
 * DevCustomerSync — bridges dev-state toggles to the shared CustomerProfileProvider.
 * Whenever dev-state changes, recomputes the customer profile and replaces it.
 */
import { useEffect, useRef } from "react";
import { useDevState } from "./devState";
import { useCustomerProfile, buildProfileFromDevState } from "@/data/customer-store";

export function DevCustomerSync() {
  const { state } = useDevState();
  const { replaceProfile } = useCustomerProfile();
  const prevKey = useRef("");

  useEffect(() => {
    // Build a cache key from the dev-state fields that affect the customer profile
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

    if (key !== prevKey.current) {
      prevKey.current = key;
      replaceProfile(buildProfileFromDevState(state));
    }
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
