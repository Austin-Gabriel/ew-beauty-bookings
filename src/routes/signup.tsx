import { createFileRoute, Link } from "@tanstack/react-router";
import { EwaMark } from "@/components/EwaLogo";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Ewà" }] }),
  component: SignupStub,
});

function SignupStub() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pt-10 pb-8">
        <header><EwaMark size={32} className="text-foreground" /></header>
        <section className="mt-16 flex-1">
          <h1 className="font-display text-4xl tracking-tight">Sign up</h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            Account creation lands here next.
          </p>
        </section>
        <Link
          to="/welcome"
          className="flex h-12 w-full items-center justify-center rounded-full border border-hairline text-[14px] font-medium"
        >
          Back
        </Link>
      </div>
    </main>
  );
}
