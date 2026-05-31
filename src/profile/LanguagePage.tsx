import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Check } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const STORAGE_KEY = "ewa.language.v1";

type Language = {
  id: string;
  label: string;
  native: string;
  status?: "soon";
};

const LANGUAGES: Language[] = [
  { id: "en-US", label: "English (United States)", native: "English" },
  { id: "en-GB", label: "English (United Kingdom)", native: "English" },
  { id: "yo", label: "Yoruba", native: "Yorùbá", status: "soon" },
  { id: "ig", label: "Igbo", native: "Igbo", status: "soon" },
  { id: "ha", label: "Hausa", native: "Hausa", status: "soon" },
  { id: "fr", label: "French", native: "Français", status: "soon" },
  { id: "es", label: "Spanish", native: "Español", status: "soon" },
  { id: "pt-BR", label: "Portuguese (Brazil)", native: "Português", status: "soon" },
  { id: "sw", label: "Swahili", native: "Kiswahili", status: "soon" },
];

function loadLang(): string {
  if (typeof window === "undefined") return "en-US";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "en-US";
  } catch {
    return "en-US";
  }
}

function saveLang(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

export function LanguagePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("en-US");

  useEffect(() => {
    setSelected(loadLang());
  }, []);

  const pick = (lang: Language) => {
    if (lang.status === "soon") {
      toast(`${lang.label} is coming soon — we'll email you when it's ready`);
      return;
    }
    setSelected(lang.id);
    saveLang(lang.id);
    toast.success(`Language set to ${lang.label}`);
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
          Language
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-4 pb-12">
        <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Pick a language for the Ewà app. Stylist conversations stay in whichever language you write to them in.
        </p>

        <div
          className="mt-4 overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          {LANGUAGES.map((lang, i) => {
            const active = selected === lang.id;
            const soon = lang.status === "soon";
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => pick(lang)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
                style={{
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  opacity: soon ? 0.65 : 1,
                }}
              >
                <span className="min-w-0 flex-1">
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>{lang.label}</p>
                  <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
                    {lang.native}
                  </p>
                </span>
                {soon ? (
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--muted-foreground)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Soon
                  </span>
                ) : active ? (
                  <Check size={16} style={{ color: ORANGE }} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
