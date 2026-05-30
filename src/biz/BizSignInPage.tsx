import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff, Scissors, Briefcase } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const BIZ_DARK = "#0B1220";
const ORANGE = "#FF823F";

export function BizSignInPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSubmit = /.+@.+\..+/.test(email) && password.length >= 4;

  const submit = () => {
    if (!canSubmit) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      toast.success("Welcome back — opening Ewà Biz");
    }, 1100);
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: BIZ_DARK, color: "#fff", fontFamily: SANS_STACK }}
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
        <div className="flex flex-1 items-center justify-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{ backgroundColor: ORANGE }}
          >
            <Scissors size={14} style={{ color: "#fff" }} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Ewà <span style={{ color: ORANGE }}>Biz</span>
          </span>
        </div>
        <span className="w-9" />
      </header>

      <div className="px-6 pt-6 pb-10 flex flex-col flex-1">
        <div>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: ORANGE,
            }}
          >
            Pros only
          </span>
          <h1 className="mt-2" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Sign in to your Biz account
          </h1>
          <p className="mt-2" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
            Manage your calendar, payouts, and clients in one place.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.60)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Business email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourstudio.com"
              className="w-full rounded-xl px-3.5 py-3.5 outline-none focus:ring-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#fff",
                fontSize: 15,
                fontFamily: SANS_STACK,
              }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.60)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Password
            </span>
            <div
              className="flex items-center rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="flex-1 bg-transparent px-3.5 py-3.5 outline-none"
                style={{ color: "#fff", fontSize: 15, fontFamily: SANS_STACK }}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="px-3.5 py-2"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2" style={{ fontSize: 13, color: "rgba(255,255,255,0.78)" }}>
              <input type="checkbox" defaultChecked className="accent-current" style={{ accentColor: ORANGE }} />
              Remember this device
            </label>
            <button
              type="button"
              onClick={() => toast("Password reset link sent if your account exists")}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: 500, fontFamily: SANS_STACK }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || busy}
          className="mt-5 w-full rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: ORANGE,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
            boxShadow: "0 8px 24px rgba(255,130,63,0.28)",
          }}
        >
          {busy ? "Signing in…" : "Sign in to Biz"}
        </button>

        <div
          className="my-5 flex items-center gap-3"
          style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: SANS_STACK, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          <span className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <span>New here?</span>
          <span className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/join-as-pro" })}
          className="w-full rounded-2xl py-3.5"
          style={{
            backgroundColor: "transparent",
            border: "1px solid rgba(255,255,255,0.20)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          Join the Biz waitlist
        </button>

        <div className="flex-1" />

        <div
          className="mt-8 rounded-2xl px-4 py-3.5 flex items-start gap-3"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <Briefcase size={16} style={{ color: ORANGE, marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 12.5, color: "#fff", fontWeight: 600 }}>Looking to book, not work?</p>
            <button
              type="button"
              onClick={() => navigate({ to: "/welcome" })}
              className="mt-0.5"
              style={{
                background: "none",
                border: "none",
                color: ORANGE,
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: SANS_STACK,
                padding: 0,
              }}
            >
              Go to the client app →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
