import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FileText, Shield, Mail } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";

export function LegalPage() {
  const router = useRouter();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
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
          Terms & privacy
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-12">
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.55 }}>
          The rules of the road for using Ewà and how we handle your data.
          Last updated 2026-05-30.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <DocRow
            icon={FileText}
            iconBg="rgba(255,130,63,0.12)"
            iconColor={ORANGE}
            title="Terms of Service"
            body="Booking, cancellation, payments, user content, and liability."
            onClick={() => navigate({ to: "/profile/terms" })}
          />
          <DocRow
            icon={Shield}
            iconBg="rgba(22,163,74,0.12)"
            iconColor="#16A34A"
            title="Privacy Policy"
            body="What data we collect, how we use it, who we share it with, and your choices."
            onClick={() => navigate({ to: "/profile/privacy" })}
          />
        </div>

        <div
          className="mt-6 rounded-2xl px-4 py-3.5 flex items-start gap-3"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          <Mail size={16} style={{ color: ORANGE, marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--card-foreground)" }}>
              Questions about your data?
            </p>
            <a
              href="mailto:legal@ewatheapp.com"
              style={{
                fontSize: 12.5,
                color: ORANGE,
                fontWeight: 600,
                marginTop: 2,
                display: "inline-block",
              }}
            >
              legal@ewatheapp.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocRow({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  body,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition-colors active:bg-muted/30"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          {title}
        </p>
        <p className="mt-1" style={{ fontSize: 12.5, color: "var(--on-card-muted)", lineHeight: 1.5 }}>
          {body}
        </p>
      </span>
      <ChevronRight size={14} style={{ color: "var(--on-card-muted)", marginTop: 12 }} />
    </button>
  );
}
