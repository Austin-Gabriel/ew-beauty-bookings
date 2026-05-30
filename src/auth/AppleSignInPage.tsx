import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";

const APPLE_BLACK = "#0B1220";

export function AppleSignInPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { set } = useDevState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const canSubmit = /.+@.+\..+/.test(email) && password.length >= 4;

  const submit = () => {
    if (!canSubmit) return;
    setBusy(true);
    window.setTimeout(() => {
      set("authState", "signed-in");
      toast.success("Signed in with Apple");
      navigate({ to: "/discover" });
    }, 900);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: APPLE_BLACK, color: "#fff", fontFamily: SANS_STACK }}>
      {/* Top bar */}
      <header className="flex items-center gap-3 px-5 py-3.5">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff" }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600 }}>Sign in with Apple</h1>
        <span className="w-9" />
      </header>

      <div className="flex flex-1 flex-col px-6 pt-6 pb-10">
        {/* Apple glyph */}
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff" className="mx-auto">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <h2 className="mt-4" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.025em" }}>
            Use your Apple ID
          </h2>
          <p className="mx-auto mt-2 max-w-[280px]" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
            Sign in to Ewà with the Apple ID you use on this device. We'll never see your password.
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Apple ID email"
            className="w-full rounded-xl px-3.5 py-3.5 outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "#fff",
              fontSize: 15,
              fontFamily: SANS_STACK,
            }}
          />
          <div
            className="flex items-center rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}
          >
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
        </div>

        <button
          type="button"
          onClick={() => toast("Password reset link sent if your Apple ID is on file")}
          className="mt-3 self-center"
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: 500, fontFamily: SANS_STACK }}
        >
          Forgot your Apple ID or password?
        </button>

        <div className="flex-1" />

        {/* Trust card */}
        <div className="rounded-2xl px-4 py-3.5" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} style={{ color: "#fff", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              Apple ID is verified by Apple. Ewà only receives a unique token — not your password. You can hide your email from Ewà on the next screen.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || busy}
          className="mt-4 w-full rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "#fff", color: APPLE_BLACK, fontSize: 15, fontWeight: 700, fontFamily: SANS_STACK }}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
