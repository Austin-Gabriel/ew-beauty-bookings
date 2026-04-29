import { AppShell } from "./AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

export function PlaceholderTab({
  pageTitle,
  headline,
  subhead,
}: {
  pageTitle: string;
  headline: string;
  subhead: string;
}) {
  const { text } = useAuthTheme();
  return (
    <AppShell topLabel={pageTitle.toUpperCase()}>
      <header className="px-6 pt-6">
        <h1
          style={{
            fontFamily: SANS_STACK,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
          }}
        >
          {pageTitle}
        </h1>
      </header>

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
        <h2
          className="ewa-rise"
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
            marginTop: 14,
            maxWidth: 320,
          }}
        >
          {headline}
        </h2>
        <p
          className="ewa-rise"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 14,
            lineHeight: 1.5,
            color: text,
            opacity: 0.62,
            marginTop: 14,
            maxWidth: 300,
            animationDelay: "120ms",
          }}
        >
          {subhead}
        </p>
      </section>
    </AppShell>
  );
}
