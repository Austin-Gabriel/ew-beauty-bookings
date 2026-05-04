import { createFileRoute } from "@tanstack/react-router";
import { SavedAddressesPage } from "@/profile/SavedAddressesPage";

export const Route = createFileRoute("/profile/addresses")({
  component: SavedAddressesPage,
});
