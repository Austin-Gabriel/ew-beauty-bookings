import { createFileRoute } from "@tanstack/react-router";
import { PaymentMethodsPage } from "@/profile/PaymentMethodsPage";

export const Route = createFileRoute("/profile/payment-methods")({
  component: PaymentMethodsPage,
});
