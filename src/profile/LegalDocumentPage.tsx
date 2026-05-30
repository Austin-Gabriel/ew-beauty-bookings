import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

export type LegalSection = {
  heading: string;
  body: string[];
};

/**
 * Shared scrollable document shell for Terms / Privacy. Each section gets
 * an anchored eyebrow heading + a stack of paragraph bodies. Mobile-first
 * type scale; respects light/dark via design tokens.
 */
export function LegalDocumentPage({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--bg, var(--background))", borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        <span className="w-9" />
      </header>

      <article className="px-5 pt-5 pb-16">
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          {title}
        </h2>
        <p
          className="mt-1"
          style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          Effective {effectiveDate}
        </p>
        <p className="mt-4" style={{ fontSize: 14, color: "var(--foreground)", opacity: 0.85, lineHeight: 1.6 }}>
          {intro}
        </p>

        <div className="mt-8 flex flex-col gap-7">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                Section {String(i + 1).padStart(2, "0")}
              </h3>
              <h4 className="mt-1.5" style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.015em" }}>
                {s.heading}
              </h4>
              <div className="mt-3 flex flex-col gap-3">
                {s.body.map((p, j) => (
                  <p key={j} style={{ fontSize: 14, color: "var(--foreground)", opacity: 0.85, lineHeight: 1.6 }}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p
          className="mt-10 text-center"
          style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}
        >
          Questions? Email{" "}
          <a href="mailto:legal@ewatheapp.com" style={{ color: "var(--bagel)", fontWeight: 600 }}>
            legal@ewatheapp.com
          </a>
        </p>
      </article>
    </div>
  );
}
