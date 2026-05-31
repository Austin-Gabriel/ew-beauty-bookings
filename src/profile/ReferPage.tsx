import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Gift, Check, Copy, Share2 } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";

const REFERRAL_CODE = "IMANI20";

const HISTORY = [
  { name: "Tasha B.", state: "Joined — you both got $20" as const, when: "Apr 28" },
  { name: "Kelechi A.", state: "Joined — you both got $20" as const, when: "Apr 12" },
  { name: "Adaeze O.", state: "Invited — waiting for first booking" as const, when: "May 18" },
];

export function ReferPage() {
  const router = useRouter();

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?invite=${REFERRAL_CODE}` : "";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_CODE);
      toast.success("Code copied");
    } catch {
      toast(REFERRAL_CODE);
    }
  };

  const share = async () => {
    const text = `Use my Ewà code ${REFERRAL_CODE} and we both get $20 toward our next booking. ${shareUrl}`;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Try Ewà",
          text,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Invite copied");
    } catch {
      toast(text);
    }
  };

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
          Refer friends
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-6 pb-12">
        {/* HERO */}
        <div className="flex flex-col items-center text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, #6B3520 0%, #C97744 100%)", color: "#fff" }}
          >
            <Gift size={26} />
          </span>
          <h2 className="mt-4" style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.025em" }}>
            Give $20, get $20
          </h2>
          <p className="mt-2 max-w-[320px]" style={{ fontSize: 13.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            Send your friends $20 toward their first Ewà booking. When they book, we drop $20 in your credits too.
          </p>
        </div>

        {/* Code card */}
        <div
          className="mt-7 rounded-2xl border bg-card p-4"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--on-card-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Your invite code
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--card-foreground)",
                letterSpacing: "0.18em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {REFERRAL_CODE}
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--card-foreground)",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={share}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
            boxShadow: "0 8px 24px rgba(255,130,63,0.28)",
          }}
        >
          <Share2 size={15} />
          Share your invite
        </button>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Invited" value="6" />
          <Stat label="Joined" value="2" />
          <Stat label="You've earned" value="$40" accent />
        </div>

        {/* History */}
        <p
          className="pt-6 pb-2.5"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Recent invites
        </p>
        <ul
          className="overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          {HISTORY.map((h, i) => {
            const joined = h.state.startsWith("Joined");
            return (
              <li
                key={h.name}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                  style={{
                    background: joined
                      ? "linear-gradient(135deg, #DCFCE7 0%, #86EFAC 100%)"
                      : "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    color: joined ? "#166534" : "#92400E",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {h.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>{h.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
                    {joined && <Check size={11} style={{ color: SUCCESS }} />}
                    {h.state}
                  </p>
                </div>
                <span style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>{h.when}</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-center" style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Each friend gets $20 off their first booking of $80+.
          You receive $20 in Ewà credits after their booking completes.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl border bg-card px-3 py-3 text-center"
      style={{ borderColor: "var(--border)" }}
    >
      <p
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: accent ? "#FF823F" : "var(--card-foreground)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        className="mt-1"
        style={{
          fontSize: 10.5,
          color: "var(--muted-foreground)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
    </div>
  );
}
