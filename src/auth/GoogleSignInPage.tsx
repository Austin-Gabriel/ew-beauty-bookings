import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Check } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";

type Account = {
  id: string;
  name: string;
  email: string;
  initial: string;
  color: string;
};

const ACCOUNTS: Account[] = [
  { id: "g1", name: "Amaka Okafor", email: "amaka.okafor@gmail.com", initial: "A", color: "#EA4335" },
  { id: "g2", name: "Amaka Work", email: "amaka@kindredstudio.co", initial: "A", color: "#1F8E3D" },
  { id: "g3", name: "Personal", email: "amaka.iyabo@gmail.com", initial: "A", color: "#1A73E8" },
];

export function GoogleSignInPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { set } = useDevState();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choose = (id: string) => {
    setSelected(id);
    setBusy(true);
    window.setTimeout(() => {
      set("authState", "signed-in");
      const acc = ACCOUNTS.find((a) => a.id === id);
      toast.success(`Signed in as ${acc?.email ?? "Google account"}`);
      navigate({ to: "/discover" });
    }, 900);
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "#FFFFFF", color: "#202124", fontFamily: SANS_STACK }}
    >
      <header
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: "rgba(60,64,67,0.10)" }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ color: "#5F6368" }}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#3C4043" }}>Google</span>
        </div>
        <span className="w-9" />
      </header>

      <div className="px-6 pt-8 pb-10">
        <h1 style={{ fontSize: 24, fontWeight: 400, color: "#202124", letterSpacing: "-0.005em" }}>
          Choose an account
        </h1>
        <p className="mt-1.5" style={{ fontSize: 14, color: "#5F6368" }}>
          to continue to <span style={{ color: "#202124", fontWeight: 500 }}>Ewà</span>
        </p>

        <div
          className="mt-6 overflow-hidden rounded-xl border"
          style={{ borderColor: "rgba(60,64,67,0.12)" }}
        >
          {ACCOUNTS.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => choose(a.id)}
              disabled={busy}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(60,64,67,0.04)] disabled:opacity-60"
              style={{
                borderTop: i === 0 ? "none" : "1px solid rgba(60,64,67,0.08)",
              }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: a.color, color: "#fff", fontSize: 15, fontWeight: 500 }}
              >
                {a.initial}
              </span>
              <span className="min-w-0 flex-1">
                <p style={{ fontSize: 14, fontWeight: 500, color: "#202124" }}>{a.name}</p>
                <p className="truncate" style={{ fontSize: 13, color: "#5F6368" }}>
                  {a.email}
                </p>
              </span>
              {selected === a.id && busy ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full"
                  style={{ border: "2px solid #1A73E8", borderTopColor: "transparent" }}
                />
              ) : selected === a.id ? (
                <Check size={16} style={{ color: "#1A73E8" }} />
              ) : null}
            </button>
          ))}

          <button
            type="button"
            onClick={() => toast("Add Google account flow coming soon")}
            disabled={busy}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(60,64,67,0.04)] disabled:opacity-60"
            style={{ borderTop: "1px solid rgba(60,64,67,0.08)" }}
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: "rgba(60,64,67,0.06)", color: "#5F6368", fontSize: 18, fontWeight: 400 }}
            >
              +
            </span>
            <span className="flex-1">
              <p style={{ fontSize: 14, fontWeight: 500, color: "#202124" }}>Use another account</p>
            </span>
          </button>
        </div>

        <p
          className="mt-6"
          style={{ fontSize: 12, color: "#5F6368", lineHeight: 1.55 }}
        >
          To continue, Google will share your name, email address, language preference, and profile picture with Ewà.
          Before using this app, review Ewà's{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/privacy" })}
            style={{ background: "none", border: "none", color: "#1A73E8", padding: 0, fontFamily: SANS_STACK, fontSize: 12 }}
          >
            privacy policy
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/terms" })}
            style={{ background: "none", border: "none", color: "#1A73E8", padding: 0, fontFamily: SANS_STACK, fontSize: 12 }}
          >
            terms of service
          </button>
          .
        </p>
      </div>

      <div className="flex-1" />

      <footer
        className="flex items-center justify-between px-6 py-4 border-t"
        style={{ borderColor: "rgba(60,64,67,0.08)", fontSize: 12, color: "#5F6368" }}
      >
        <span>English (United States)</span>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => toast("Google help coming soon")}
            style={{ background: "none", border: "none", color: "#5F6368", fontFamily: SANS_STACK, fontSize: 12 }}
          >
            Help
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/privacy" })}
            style={{ background: "none", border: "none", color: "#5F6368", fontFamily: SANS_STACK, fontSize: 12 }}
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/terms" })}
            style={{ background: "none", border: "none", color: "#5F6368", fontFamily: SANS_STACK, fontSize: 12 }}
          >
            Terms
          </button>
        </div>
      </footer>
    </div>
  );
}
