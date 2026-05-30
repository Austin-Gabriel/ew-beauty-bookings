import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  Phone,
  PhoneOff,
  Volume2,
  MicOff,
  Grid3x3,
  Plus,
  Pause,
  Video,
  ShieldCheck,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const SAFETY_GREEN = "#16A34A";
const DANGER = "#DC2626";

type Phase = "preview" | "ringing" | "in-call" | "ended";

const DISGUISE_CONTACTS = [
  { id: "mom", label: "Mom", number: "Mobile" },
  { id: "kelechi", label: "Kelechi", number: "Mobile · Friend" },
  { id: "salon", label: "Salon Front Desk", number: "Work" },
  { id: "rideshare", label: "Rideshare Driver", number: "Other" },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function DiscreetCallPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("preview");
  const [contactId, setContactId] = useState<string>("mom");
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const tickerRef = useRef<number | null>(null);

  const contact = DISGUISE_CONTACTS.find((c) => c.id === contactId) ?? DISGUISE_CONTACTS[0]!;

  useEffect(() => {
    if (phase === "ringing") {
      const t = window.setTimeout(() => setPhase("in-call"), 2400);
      return () => window.clearTimeout(t);
    }
    if (phase === "in-call") {
      tickerRef.current = window.setInterval(() => setDuration((d) => d + 1), 1000);
      return () => {
        if (tickerRef.current !== null) window.clearInterval(tickerRef.current);
      };
    }
  }, [phase]);

  const startCall = () => {
    setDuration(0);
    setPhase("ringing");
  };

  const endCall = () => {
    setPhase("ended");
    toast("Call ended — Ewà support stays with you");
    window.setTimeout(() => router.history.back(), 1100);
  };

  if (phase === "preview") {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={{ backgroundColor: "#0B1220", color: "#fff", fontFamily: SANS_STACK }}
      >
        <header className="flex items-center gap-3 px-5 py-3.5">
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.10)", color: "#fff" }}
          >
            <ChevronLeft size={16} />
          </button>
          <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600 }}>
            Discreet support call
          </h1>
          <span className="w-9" />
        </header>

        <div className="flex flex-1 flex-col px-6 pb-10 pt-6">
          <div className="text-center">
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(22,163,74,0.18)", color: SAFETY_GREEN }}
            >
              <ShieldCheck size={22} />
            </span>
            <h2 className="mt-4" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Looks like a normal call
            </h2>
            <p className="mx-auto mt-2 max-w-[300px]" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
              You'll be connected to a trained Ewà safety specialist. The screen will show whoever you choose below — anyone glancing over will just see a regular call.
            </p>
          </div>

          <div className="mt-7">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Display the call as
            </p>
            <div
              className="mt-2 overflow-hidden rounded-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              {DISGUISE_CONTACTS.map((c, i) => {
                const active = c.id === contactId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContactId(c.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                      style={{
                        backgroundColor: active ? SAFETY_GREEN : "rgba(255,255,255,0.10)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {c.label.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{c.label}</p>
                      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                        {c.number}
                      </p>
                    </span>
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                      style={{
                        border: active ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                        backgroundColor: active ? SAFETY_GREEN : "transparent",
                      }}
                    >
                      {active && (
                        <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "#fff" }} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1" />

          <div
            className="rounded-2xl px-4 py-3.5"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              On call, tap the volume rocker 3× to silently send your live location to Ewà.
              We never charge for safety calls.
            </p>
          </div>

          <button
            type="button"
            onClick={startCall}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: SAFETY_GREEN,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: SANS_STACK,
              boxShadow: "0 8px 24px rgba(22,163,74,0.28)",
            }}
          >
            <Phone size={15} />
            Start discreet call
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/safety" })}
            className="mt-2 w-full py-2"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500, fontFamily: SANS_STACK }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Ringing / in-call / ended — iOS-like call screen
  const isRinging = phase === "ringing";
  const isEnded = phase === "ended";
  const statusLabel = isRinging
    ? "Calling…"
    : isEnded
      ? "Call ended"
      : formatDuration(duration);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        background:
          "linear-gradient(180deg, #0E1626 0%, #0B1220 100%)",
        color: "#fff",
        fontFamily: SANS_STACK,
      }}
    >
      <div className="flex flex-col items-center pt-16 pb-6">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
          {contact.number}
        </p>
        <h2 className="mt-2" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {contact.label}
        </h2>
        <p className="mt-1.5" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
          {statusLabel}
        </p>

        <span
          className="mt-8 grid h-32 w-32 place-items-center rounded-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.10)",
            color: "#fff",
            fontSize: 44,
            fontWeight: 600,
          }}
        >
          {contact.label.slice(0, 1)}
        </span>

        {!isEnded && (
          <div
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{ backgroundColor: "rgba(22,163,74,0.15)", color: SAFETY_GREEN }}
          >
            <ShieldCheck size={11} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Ewà safety on the line
            </span>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Call controls */}
      <div className="px-6 pb-10">
        {!isRinging && !isEnded && (
          <div className="mb-8 grid grid-cols-3 gap-x-6 gap-y-6 px-2">
            <CallControl
              icon={muted ? MicOff : MicOff}
              label="Mute"
              active={muted}
              onClick={() => setMuted((v) => !v)}
            />
            <CallControl icon={Grid3x3} label="Keypad" onClick={() => toast("Keypad")} />
            <CallControl
              icon={Volume2}
              label="Speaker"
              active={speakerOn}
              onClick={() => setSpeakerOn((v) => !v)}
            />
            <CallControl icon={Plus} label="Add Call" onClick={() => toast("Add call")} />
            <CallControl icon={Video} label="FaceTime" onClick={() => toast("FaceTime")} />
            <CallControl icon={Pause} label="Hold" onClick={() => toast("On hold")} />
          </div>
        )}

        {!isEnded ? (
          <button
            type="button"
            onClick={endCall}
            aria-label="End call"
            className="mx-auto grid h-16 w-16 place-items-center rounded-full transition-transform active:scale-95"
            style={{ backgroundColor: DANGER, color: "#fff", boxShadow: "0 12px 28px rgba(220,38,38,0.30)" }}
          >
            <PhoneOff size={22} />
          </button>
        ) : (
          <p className="text-center" style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            Returning to Safety…
          </p>
        )}
      </div>
    </div>
  );
}

function CallControl({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 transition-transform active:scale-95"
    >
      <span
        className="grid h-16 w-16 place-items-center rounded-full"
        style={{
          backgroundColor: active ? "#fff" : "rgba(255,255,255,0.10)",
          color: active ? "#0B1220" : "#fff",
        }}
      >
        <Icon size={20} />
      </span>
      <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.78)" }}>{label}</span>
    </button>
  );
}
