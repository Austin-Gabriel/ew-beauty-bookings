import { createFileRoute, Link } from "@tanstack/react-router";
import { EwaMark } from "@/components/EwaLogo";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Ewà" },
      {
        name: "description",
        content: "Find trusted beauty pros near you.",
      },
    ],
  }),
  component: DiscoverPlaceholder,
});

function DiscoverPlaceholder() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pt-10 pb-8">
        <header className="flex items-center justify-between">
          <EwaMark size={32} className="text-foreground" />
          <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            Discover
          </span>
        </header>

        <section className="mt-24 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Coming soon
          </p>
          <h1 className="mt-3 font-display text-[40px] leading-[1.05] tracking-tight">
            Discover, on the way.
          </h1>
          <p className="mt-5 max-w-[32ch] text-[15px] leading-relaxed text-muted-foreground">
            This is the home tab for returning customers. We'll surface
            hand-picked pros, recent favourites, and what's available right
            now near you.
          </p>
        </section>

        <footer className="space-y-3">
          <Link
            to="/welcome"
            className="flex h-12 w-full items-center justify-center rounded-full border border-hairline text-[14px] font-medium text-foreground"
          >
            Back to welcome
          </Link>
        </footer>
      </div>
    </main>
  );
}
