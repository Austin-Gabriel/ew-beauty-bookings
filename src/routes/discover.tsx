import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthFrame, AuthHeadline, AuthSubhead, AuthEyebrow, GhostCta } from "@/auth/AuthFrame";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Ewà" },
      { name: "description", content: "Find trusted beauty pros near you." },
    ],
  }),
  component: DiscoverPlaceholder,
});

function DiscoverPlaceholder() {
  const navigate = useNavigate();
  return (
    <AuthFrame topRightLabel="Discover">
      <section className="mt-20 flex-1">
        <AuthEyebrow>Coming soon</AuthEyebrow>
        <div className="mt-3">
          <AuthHeadline>Discover, on the way.</AuthHeadline>
        </div>
        <AuthSubhead>
          This is the home tab for returning customers. We'll surface hand-picked pros, recent
          favourites, and what's available right now near you.
        </AuthSubhead>
      </section>

      <footer className="mt-6" style={{ paddingBottom: 8 }}>
        <GhostCta onClick={() => navigate({ to: "/welcome" })}>Back to welcome</GhostCta>
      </footer>
    </AuthFrame>
  );
}
