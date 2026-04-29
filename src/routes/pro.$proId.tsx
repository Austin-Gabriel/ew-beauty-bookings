import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { GhostCta } from "@/auth/AuthFrame";
import { MOCK_PROS } from "@/data/mock-pros";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

export const Route = createFileRoute("/pro/$proId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.proId} — Ewà` },
      { name: "description", content: "Pro profile coming soon on Ewà." },
    ],
  }),
  component: ProProfilePlaceholder,
});

function ProProfilePlaceholder() {
  const { proId } = Route.useParams();
  const { text } = useAuthTheme();
  const navigate = useNavigate();
  const pro = MOCK_PROS.find((p) => p.id === proId);

  return (
    <AppShell topLabel="PRO PROFILE">
      <section className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          style={{
            fontFamily: SANS_STACK,
            fontSize: 10,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: text,
            opacity: 0.5,
            fontWeight: 600,
          }}
        >
          Coming soon
        </div>
        <h1
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.08,
            color: text,
            margin: 0,
            marginTop: 14,
          }}
        >
          {pro ? pro.name : "Pro profile"}, <span style={{ fontStyle: "italic" }}>on the way</span>.
        </h1>
        <p
          style={{
            fontFamily: SANS_STACK,
            fontSize: 14,
            color: text,
            opacity: 0.62,
            marginTop: 14,
            maxWidth: 320,
          }}
        >
          Full portfolio, services, reviews, and booking flow will live here.
        </p>
        <div className="mt-8 w-full max-w-[280px]">
          <GhostCta onClick={() => navigate({ to: "/discover" })}>Back to Discover</GhostCta>
        </div>
      </section>
    </AppShell>
  );
}
