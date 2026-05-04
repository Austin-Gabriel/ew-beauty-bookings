import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "@/profile/EditProfilePage";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfilePage,
});
