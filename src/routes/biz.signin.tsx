import { createFileRoute } from "@tanstack/react-router";
import { BizSignInPage } from "@/biz/BizSignInPage";

export const Route = createFileRoute("/biz/signin")({
  head: () => ({
    meta: [
      { title: "Sign in to Ewà Biz" },
      { name: "description", content: "Sign in to manage your Ewà Biz calendar, payouts, and clients." },
    ],
  }),
  component: BizSignInPage,
});
