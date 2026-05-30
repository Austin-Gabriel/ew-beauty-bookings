import { useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { ContactSupportSheet } from "./ContactSupportSheet";

const ORANGE = "#FF823F";

type FaqCategory = "bookings" | "payment" | "safety" | "account";

type FaqItem = {
  id: string;
  category: FaqCategory;
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  // Bookings
  {
    id: "bk-1",
    category: "bookings",
    q: "How do I book a stylist?",
    a: "Tap any pro from Discover, choose a service, then pick a time. You'll see a confirmation with your arrival PIN once the pro accepts.",
  },
  {
    id: "bk-2",
    category: "bookings",
    q: "What's the arrival PIN?",
    a: "When the pro arrives, they'll ask for the 4-digit PIN on your booking. It confirms you're the right customer and starts the session. Read it out loud — never type it for them.",
  },
  {
    id: "bk-3",
    category: "bookings",
    q: "Can I reschedule a confirmed booking?",
    a: "Yes — open the booking and tap Reschedule. You'll pick a new time within the pro's availability. Last-minute changes inside the cancellation window may incur a fee.",
  },
  {
    id: "bk-4",
    category: "bookings",
    q: "What if the pro cancels on me?",
    a: "You're fully refunded automatically, and we'll surface alternative pros available the same day right inside the booking detail.",
  },

  // Payment
  {
    id: "pay-1",
    category: "payment",
    q: "When does my card get charged?",
    a: "Your card is authorized at booking and charged when the service completes. For cancellations within the free window, the authorization is released within 1–2 business days.",
  },
  {
    id: "pay-2",
    category: "payment",
    q: "Can I tip in the app?",
    a: "Yes. After your appointment ends, you'll be prompted to rate your time with the pro and optionally add a tip — 100% of tips go directly to the stylist.",
  },
  {
    id: "pay-3",
    category: "payment",
    q: "How do I update my payment method?",
    a: "Go to Profile → Payment methods. You can add a new card or remove one anytime — just keep at least one card on file for active bookings.",
  },
  {
    id: "pay-4",
    category: "payment",
    q: "What's the booking fee?",
    a: "It's a flat $3 service fee that keeps the lights on and supports verified-pro screening. You'll always see it broken out before you book.",
  },

  // Safety
  {
    id: "sf-1",
    category: "safety",
    q: "How does Ewà verify pros?",
    a: "Every Ewà pro completes ID verification and a background check before they can take bookings. You can toggle 'Only book verified pros' in Safety to enforce this on every search.",
  },
  {
    id: "sf-2",
    category: "safety",
    q: "What is SOS?",
    a: "Hold the SOS button on the Safety screen during an appointment to alert Ewà support and your emergency contacts. They'll receive your live location and appointment details instantly.",
  },
  {
    id: "sf-3",
    category: "safety",
    q: "Can I share my appointment with someone?",
    a: "Yes. Open Safety → Share appointment to send the pro's name, ETA, and license details to a trusted contact via text — no app install needed on their end.",
  },

  // Account
  {
    id: "ac-1",
    category: "account",
    q: "How do I change my email or phone?",
    a: "Go to Profile → Personal info to update your name, email, or phone. We'll send a verification code to confirm changes.",
  },
  {
    id: "ac-2",
    category: "account",
    q: "How do I delete my account?",
    a: "Contact support and we'll help you close your account and remove your data within 30 days, in line with our Privacy Policy.",
  },
  {
    id: "ac-3",
    category: "account",
    q: "Where do I find my receipts?",
    a: "Every past booking has a 'View receipt' link in the Bookings tab. We also email receipts to the email on file within 24 hours of a completed appointment.",
  },
];

const CATEGORIES: { id: FaqCategory; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "bookings", label: "Bookings", icon: Sparkles },
  { id: "payment", label: "Payment & tipping", icon: CreditCard },
  { id: "safety", label: "Safety", icon: ShieldCheck },
  { id: "account", label: "Account", icon: HelpCircle },
];

export function HelpCenterPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [showSupport, setShowSupport] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (!q) return true;
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    });
  }, [query, activeCategory]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
          Help center
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-12">
        {/* Search */}
        <div className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3" style={{ backgroundColor: "var(--surface-elevated)" }}>
          <Search size={16} style={{ color: "var(--on-card-muted)" }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles"
            className="flex-1 bg-transparent outline-none"
            style={{ color: "var(--foreground)", fontSize: 14, fontFamily: SANS_STACK }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="grid h-5 w-5 place-items-center rounded-full"
              style={{ backgroundColor: "var(--border)", color: "var(--card-foreground)" }}
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
          <CategoryChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")} label="All" />
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
              label={c.label}
              icon={<c.icon size={13} />}
            />
          ))}
        </div>

        <p
          className="pt-6 pb-3"
          style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
        </p>

        {filtered.length === 0 ? (
          <div
            className="grid place-items-center rounded-2xl py-10 text-center"
            style={{ border: "2px dashed var(--border)", color: "var(--muted-foreground)", fontSize: 13.5 }}
          >
            <p style={{ fontWeight: 600, color: "var(--foreground)" }}>No matches</p>
            <p className="mt-1">Try a different search or reach out to support below.</p>
          </div>
        ) : (
          <ul
            className="overflow-hidden rounded-2xl border bg-card"
            style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
          >
            {filtered.map((f, i) => (
              <FaqRow key={f.id} item={f} open={expanded.has(f.id)} onToggle={() => toggle(f.id)} last={i === filtered.length - 1} />
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setShowSupport(true)}
          className="mt-6 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-transform active:scale-[0.99]"
          style={{ backgroundColor: "rgba(255,130,63,0.10)", borderColor: "rgba(255,130,63,0.22)" }}
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: ORANGE, color: "#1A0E08" }}>
            <MessageSquare size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)" }}>Still need help?</p>
            <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--card-foreground)", opacity: 0.75 }}>
              Message our support team — we usually reply within an hour.
            </p>
          </div>
          <ChevronRight size={14} style={{ color: ORANGE }} />
        </button>

        <ul className="mt-6 space-y-2">
          <QuickLink label="Safety center" onClick={() => navigate({ to: "/safety" })} />
          <QuickLink label="Terms of service" onClick={() => navigate({ to: "/profile/terms" })} />
          <QuickLink label="Privacy policy" onClick={() => navigate({ to: "/profile/privacy" })} />
        </ul>
      </div>

      {showSupport && <ContactSupportSheet onDismiss={() => setShowSupport(false)} />}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 transition-colors"
      style={{
        backgroundColor: active ? ORANGE : "var(--surface-elevated)",
        borderColor: active ? ORANGE : "transparent",
        color: active ? "#1A0E08" : "var(--foreground)",
        fontFamily: SANS_STACK,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function FaqRow({
  item,
  open,
  onToggle,
  last,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
  last: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
      >
        <span className="min-w-0 flex-1">
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em", lineHeight: 1.35 }}>
            {item.q}
          </p>
          {open && (
            <p className="mt-2" style={{ fontSize: 13, color: "var(--card-foreground)", opacity: 0.78, lineHeight: 1.55 }}>
              {item.a}
            </p>
          )}
        </span>
        <span
          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform"
          style={{
            backgroundColor: "var(--surface-elevated)",
            color: "var(--card-foreground)",
            transform: open ? "rotate(180deg)" : undefined,
          }}
        >
          <ChevronDown size={13} />
        </span>
      </button>
      {!last && <div className="ml-4 border-b" style={{ borderColor: "var(--border)" }} />}
    </li>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-3.5 text-left transition-colors active:bg-muted/30"
        style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>
          {label}
        </span>
        <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
      </button>
    </li>
  );
}
