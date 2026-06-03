/**
 * BookingDetailPage — /bookings/[bookingId]
 *
 * Four visually distinct surfaces driven by booking.status:
 *
 *   1. On-the-way (enroute / getting-ready / arrived) — dark navy hero,
 *      live pulsing pill, big ETA / arrival headline, stylist row at the
 *      bottom of the hero with Message + Call inline. PIN card surfaces
 *      below the hero ONLY for "enroute" / "arrived" (post-acceptance).
 *
 *   2. Confirmed future — light surface-muted top with Confirmed pill,
 *      stylist row, Message + Call CTA row, then an orange countdown
 *      card "In 18 hours · Tomorrow at 1:00 PM".
 *
 *   3. In progress — green gradient hero with timer + progress bar.
 *      PIN is gone (no longer needed), payment shifts to "will be
 *      charged when service completes".
 *
 *   4. Completed — light hero with check circle, All done headline,
 *      Completed-at pill, then an orange "Rate your time" prompt card,
 *      then details + receipt link + "Book again" CTA.
 *
 * Cancelled / declined statuses route to /booking/cancelled/$bookingId
 * (the trust-recovery surface); pending_pro_approval routes to
 * /booking/pending/$bookingId. This page is only for live / future /
 * in-progress / completed.
 */
import { useEffect, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  CreditCard,
  FileText,
  Lock,
  MapPin,
  MessageSquare,
  Shield,
  Phone,
  Star,
  XCircle,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useBookings, type Booking, type BookingStatus } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";
import { useCustomerProfile } from "@/data/customer-store";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const PROGRESS_GRADIENT = "linear-gradient(135deg, #15A03A 0%, #0E7A2A 100%)";

/* ------------------------------------------------------------------ */
/*  Status grouping — drives which "mode" to render                    */
/* ------------------------------------------------------------------ */

type Mode = "live" | "future" | "in-progress" | "completed";

function modeFor(status: BookingStatus): Mode | null {
  switch (status) {
    case "getting-ready":
    case "enroute":
    case "arrived":
      return "live";
    case "confirmed":
      return "future";
    case "in-progress":
      return "in-progress";
    case "completed":
      return "completed";
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { getBooking, setBookings, bookings } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Reroute statuses that have their own dedicated page.
  useEffect(() => {
    if (!booking) return;
    if (booking.status === "pending_pro_approval") {
      navigate({ to: "/booking/pending/$bookingId", params: { bookingId } });
    } else if (booking.status === "cancelled" || booking.status === "declined") {
      navigate({ to: "/booking/cancelled/$bookingId", params: { bookingId } });
    } else if (booking.status === "searching") {
      navigate({ to: "/booking/searching/$bookingId", params: { bookingId } });
    }
  }, [booking, bookingId, navigate]);

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6" style={{ fontFamily: SANS_STACK }}>
        <p className="text-[17px] font-semibold text-foreground">Booking not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/bookings" })}
          className="mt-4 rounded-full bg-bagel px-5 py-2.5 text-[14px] font-semibold text-bagel-foreground"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const mode = modeFor(booking.status);
  if (!mode) {
    // Status is being routed elsewhere via the effect above — render nothing
    // for the split-second before navigate fires.
    return <div className="min-h-screen bg-background" />;
  }

  const proFirst = pro.name.split(" ")[0] ?? pro.name;
  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const card = booking.paymentMethodId
    ? profile.paymentMethods.find((c) => c.id === booking.paymentMethodId)
    : profile.paymentMethods.find((c) => c.isDefault) ?? profile.paymentMethods[0];

  const servicePrice = booking.service.price;
  const bookingFee = 3;
  const total = booking.total ?? servicePrice + bookingFee + (booking.tipAmount ?? 0);

  const isLive = mode === "live";
  const isInProgress = mode === "in-progress";
  const isComplete = mode === "completed";
  const isFuture = mode === "future";
  const showPin = !!booking.pin && (booking.status === "enroute" || booking.status === "arrived");
  const canEditNotes = isFuture || booking.status === "getting-ready" || booking.status === "enroute";

  const navBarVariant: "dark" | "green" | "light" = isLive ? "dark" : isInProgress ? "green" : "light";

  const handleSaveNotes = () => {
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, notes: notesValue.trim() || undefined } : b)),
    );
    setEditingNotes(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <TopNav
        variant={navBarVariant}
        onBack={() => router.history.back()}
        onMenu={() => setMenuOpen(true)}
      />

      <div className="flex-1 overflow-y-auto pb-32">
        {/* ─── HERO ──────────────────────────────────────────────────── */}
        {isLive && <LiveHero booking={booking} initials={initials} proFirst={proFirst} pro={pro} bookingId={bookingId} navigate={navigate} />}
        {isFuture && <FutureHero booking={booking} initials={initials} pro={pro} bookingId={bookingId} navigate={navigate} />}
        {isInProgress && <ProgressHero booking={booking} />}
        {isComplete && <CompletedHero booking={booking} />}

        {/* ─── PIN (live only, post-accept) ─────────────────────────── */}
        {showPin && <PinCard pin={booking.pin!} proFirst={proFirst} />}

        {/* ─── Review prompt (completed, not yet rated) ─────────────── */}
        {isComplete && !booking.rating && (
          <ReviewPromptCard
            proFirst={proFirst}
            onTap={() => navigate({ to: "/booking/rate/$bookingId", params: { bookingId } })}
          />
        )}

        {/* ─── Details ───────────────────────────────────────────────── */}
        <DetailsList
          booking={booking}
          pro={pro}
          proFirst={proFirst}
          card={card}
          mode={mode}
          editingNotes={editingNotes}
          notesValue={notesValue}
          canEditNotes={canEditNotes}
          onEditStart={() => {
            setNotesValue(booking.notes ?? "");
            setEditingNotes(true);
          }}
          onEditCancel={() => setEditingNotes(false)}
          onEditSave={handleSaveNotes}
          onNotesChange={setNotesValue}
          navigate={navigate}
        />

        {/* ─── Cost summary ─────────────────────────────────────────── */}
        <CostCard
          servicePrice={servicePrice}
          bookingFee={bookingFee}
          totalLabel={isComplete ? "Total paid" : "Total"}
          total={total}
        />

        {/* ─── Book again (completed only) ──────────────────────────── */}
        {isComplete && (
          <div className="px-5 pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: ORANGE,
                color: "#1A0E08",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              Book {proFirst} again
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ─── Cancel booking (future + live only, not in-progress / completed) ─ */}
        {(isFuture || isLive) && (
          <div className="px-5 pt-5">
            <button
              type="button"
              onClick={() => navigate({ to: "/booking/cancel/$bookingId", params: { bookingId } })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
              style={{
                backgroundColor: "transparent",
                border: "1px solid rgba(220,38,38,0.30)",
                color: "#DC2626",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              <XCircle size={15} />
              Cancel booking
            </button>
          </div>
        )}
      </div>

      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        mode={mode}
        bookingId={bookingId}
        navigate={navigate}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TopNav                                                              */
/* ------------------------------------------------------------------ */

function TopNav({
  variant,
  onBack,
  onMenu,
}: {
  variant: "dark" | "green" | "light";
  onBack: () => void;
  onMenu: () => void;
}) {
  const dark = variant !== "light";
  const bg =
    variant === "dark" ? "#0B1220" : variant === "green" ? PROGRESS_GRADIENT : "var(--bg, var(--background))";
  const fg = dark ? "#fff" : "var(--foreground)";
  const btnBg = dark ? "rgba(255,255,255,0.10)" : "var(--surface-elevated)";

  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-3 px-5 py-3.5"
      style={{ background: bg, borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--border)" }}
    >
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="grid h-9 w-9 place-items-center rounded-full"
        style={{ backgroundColor: btnBg, color: fg }}
      >
        <ChevronLeft size={16} />
      </button>
      <h1
        className="flex-1 text-center"
        style={{ fontSize: 16, fontWeight: 600, color: fg, letterSpacing: "-0.01em" }}
      >
        Your booking
      </h1>
      <button
        type="button"
        onClick={onMenu}
        aria-label="Safety"
        className="grid h-9 w-9 place-items-center rounded-full"
        style={{ backgroundColor: btnBg, color: fg }}
      >
        <Shield size={15} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LiveHero (on the way / getting ready / arrived)                    */
/* ------------------------------------------------------------------ */

function LiveHero({
  booking,
  initials,
  proFirst,
  pro,
  bookingId,
  navigate,
}: {
  booking: Booking;
  initials: string;
  proFirst: string;
  pro: { id: string; name: string; certified: boolean };
  bookingId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const status = booking.status;
  const eta = booking.etaMinutes ?? 12;
  const headline = status === "arrived" ? "Arrived" : `${eta} min`;
  const headlineLabel = status === "arrived" ? "Status" : status === "getting-ready" ? "Leaving in" : "Arriving in";
  const headlineSub =
    status === "arrived"
      ? `${proFirst} is at your door — share the PIN below`
      : status === "getting-ready"
        ? `${proFirst} is prepping their kit`
        : `${proFirst} left her last appointment at ${shortTime(Date.now() - 14 * 60 * 1000)}`;
  const pillText = status === "arrived" ? "Arrived" : status === "getting-ready" ? "Getting ready" : "On the way";

  return (
    <div
      className="relative overflow-hidden px-5 pb-6 pt-6"
      style={{ background: "#0B1220", color: "#fff" }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,130,63,0.18) 0%, transparent 60%)" }}
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,130,63,0.18)", color: ORANGE, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: ORANGE }} />
          {pillText}
        </span>

        <div className="mt-5">
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            {headlineLabel}
          </p>
          <p className="mt-1.5" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1 }}>
            {headline}
          </p>
          <p className="mt-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.45 }}>
            {headlineSub}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
          <button
            type="button"
            onClick={() => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
            className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity active:opacity-80"
          >
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)",
                color: "#7C2D12",
                fontSize: 15,
                fontWeight: 700,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5" style={{ fontSize: 15.5, fontWeight: 700, color: "#fff", letterSpacing: "-0.015em" }}>
                <span className="truncate">{pro.name}</span>
                {pro.certified && (
                  <span
                    aria-hidden
                    className="inline-grid place-items-center rounded-full"
                    style={{ width: 14, height: 14, backgroundColor: SUCCESS, color: "#fff" }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                {booking.service.name} · {booking.service.durationLabel}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/booking/message/$bookingId", params: { bookingId } })}
            aria-label="Message"
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.10)", color: "#fff" }}
          >
            <MessageSquare size={16} />
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/booking/call/$bookingId", params: { bookingId } })}
            aria-label="Call"
            className="grid h-10 w-10 place-items-center rounded-full"
            style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
          >
            <Phone size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FutureHero (confirmed future)                                       */
/* ------------------------------------------------------------------ */

function FutureHero({
  booking,
  initials,
  pro,
  bookingId,
  navigate,
}: {
  booking: Booking;
  initials: string;
  pro: { id: string; name: string; certified: boolean };
  bookingId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="border-b px-5 pb-6 pt-6" style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border)" }}>
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{ backgroundColor: "rgba(22,163,74,0.12)", color: SUCCESS, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Confirmed
      </span>

      <button
        type="button"
        onClick={() => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
        className="mt-4 flex w-full items-center gap-3.5 text-left transition-opacity active:opacity-80"
      >
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)",
            color: "#7C2D12",
            fontSize: 18,
            fontWeight: 700,
            border: "3px solid #fff",
            boxShadow: "0 1px 3px rgba(20,25,40,0.06)",
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5" style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
            <span className="truncate">{pro.name}</span>
            {pro.certified && (
              <span
                aria-hidden
                className="inline-grid place-items-center rounded-full"
                style={{ width: 14, height: 14, backgroundColor: ORANGE, color: "#1A0E08" }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </p>
          <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 2 }}>
            {booking.service.name} · {booking.service.durationLabel}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/booking/message/$bookingId", params: { bookingId } })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5"
          style={{ backgroundColor: "#fff", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}
        >
          <MessageSquare size={14} />
          Message
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/booking/call/$bookingId", params: { bookingId } })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5"
          style={{ backgroundColor: "#fff", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, fontWeight: 600 }}
        >
          <Phone size={14} />
          Call
        </button>
      </div>

      {/* Countdown card */}
      <div
        className="mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3.5"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "rgba(255,130,63,0.12)", color: ORANGE }}
        >
          <Clock size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)" }}>{relativeCountdown(booking.when)}</p>
          <p style={{ fontSize: 11.5, color: "var(--on-card-muted)", marginTop: 2 }}>{absoluteLabel(booking.when)}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProgressHero (in progress)                                          */
/* ------------------------------------------------------------------ */

function ProgressHero({ booking }: { booking: Booking }) {
  const startedAt = booking.startedAt ?? booking.when;
  const durationMin = parseDurationMin(booking.service.durationLabel);
  const endsAt = startedAt + durationMin * 60_000;
  const now = Date.now();
  const remaining = Math.max(0, endsAt - now);
  const remainingLabel = mmss(remaining);
  const progressPct = Math.min(100, Math.max(0, ((now - startedAt) / (durationMin * 60_000)) * 100));

  return (
    <div className="relative overflow-hidden px-5 pb-6 pt-6" style={{ background: PROGRESS_GRADIENT, color: "#fff" }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
      />
      <div className="relative">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "#fff" }} />
          In progress
        </span>

        <div className="mt-5">
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Time remaining
          </p>
          <p className="tabular mt-1.5" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {remainingLabel}
          </p>
          <p className="mt-1.5" style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.45 }}>
            Service ends around {shortTime(endsAt)}
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-full" style={{ height: 6, backgroundColor: "rgba(255,255,255,0.20)" }}>
          <div className="h-full rounded-full" style={{ width: `${progressPct}%`, backgroundColor: "#fff" }} />
        </div>
        <div className="mt-2 flex justify-between" style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
          <span>Started {shortTime(startedAt)}</span>
          <span>Ends {shortTime(endsAt)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CompletedHero                                                       */
/* ------------------------------------------------------------------ */

function CompletedHero({ booking }: { booking: Booking }) {
  const completedAt = booking.startedAt
    ? booking.startedAt + parseDurationMin(booking.service.durationLabel) * 60_000
    : booking.when;
  return (
    <div className="border-b px-5 pt-6 pb-5 text-center" style={{ borderColor: "var(--border)" }}>
      <div
        className="mx-auto grid place-items-center rounded-full"
        style={{ width: 64, height: 64, backgroundColor: "rgba(22,163,74,0.14)", color: SUCCESS }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="mt-3.5" style={{ fontSize: 19, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
        All done
      </h2>
      <p className="mt-1" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
        Hope you loved your {booking.service.name.toLowerCase()}
      </p>
      <span
        className="mt-4 inline-flex items-center rounded-full px-3 py-1.5"
        style={{
          backgroundColor: "var(--surface-elevated)",
          color: "var(--ink-700, var(--card-foreground))",
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Completed {todayOrDay(completedAt)} at {shortTime(completedAt)}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PinCard (visible only enroute / arrived)                            */
/* ------------------------------------------------------------------ */

function PinCard({ pin, proFirst }: { pin: string; proFirst: string }) {
  return (
    <div className="mx-5 mt-4 flex items-center gap-4 rounded-2xl border p-4" style={{ background: "linear-gradient(135deg, #FFF2EC 0%, #FFE6D8 100%)", borderColor: "rgba(255,130,63,0.22)" }}>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 10.5, color: ORANGE, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Verify {proFirst} when she arrives
        </p>
        <p
          className="tabular mt-1.5"
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "#0B1220",
            letterSpacing: "0.18em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {pin.split("").join(" ")}
        </p>
        <p className="mt-2" style={{ fontSize: 12, color: "#2A3544", lineHeight: 1.45 }}>
          Read this PIN aloud so {proFirst} can confirm it's you.
        </p>
      </div>
      <div
        className="grid shrink-0 place-items-center rounded-2xl"
        style={{ width: 56, height: 56, backgroundColor: "#fff", color: ORANGE, boxShadow: "0 4px 12px rgba(255,130,63,0.12)" }}
      >
        <Lock size={26} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReviewPromptCard (completed only)                                   */
/* ------------------------------------------------------------------ */

function ReviewPromptCard({ proFirst, onTap }: { proFirst: string; onTap: () => void }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-center gap-3.5 rounded-2xl p-4 text-left transition-transform active:scale-[0.99]"
      style={{ backgroundColor: "rgba(255,130,63,0.14)" }}
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
        style={{ backgroundColor: "#1A0E08", color: ORANGE }}
      >
        <Star size={18} fill="currentColor" />
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          Rate your time with {proFirst}
        </p>
        <p className="mt-0.5" style={{ fontSize: 12.5, color: "var(--card-foreground)", opacity: 0.72 }}>
          Tell her how it went — and add a tip
        </p>
      </div>
      <ChevronRight size={16} style={{ color: "var(--card-foreground)", opacity: 0.6 }} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  DetailsList                                                         */
/* ------------------------------------------------------------------ */

function DetailsList({
  booking,
  pro,
  proFirst,
  card,
  mode,
  editingNotes,
  notesValue,
  canEditNotes,
  onEditStart,
  onEditCancel,
  onEditSave,
  onNotesChange,
  navigate,
}: {
  booking: Booking;
  pro: { id: string; name: string };
  proFirst: string;
  card: { brand: string; last4: string } | undefined;
  mode: Mode;
  editingNotes: boolean;
  notesValue: string;
  canEditNotes: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  onNotesChange: (v: string) => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const showEdit = mode === "future";
  const whenLabel =
    mode === "completed"
      ? `${shortTime(booking.startedAt ?? booking.when)} — ${shortTime((booking.startedAt ?? booking.when) + parseDurationMin(booking.service.durationLabel) * 60_000)}`
      : mode === "in-progress"
        ? `Started ${shortTime(booking.startedAt ?? booking.when)}`
        : mode === "live"
          ? `Today, ${shortTime(booking.when)}`
          : null;
  const whenSub =
    mode === "future"
      ? shortTime(booking.when)
      : mode === "completed"
        ? `${todayOrDay(booking.when)}`
        : null;

  // In progress and completed surfaces show the stylist row inline (no top hero stylist row)
  const showStylistRow = mode === "in-progress" || mode === "completed";

  return (
    <div className="px-5 pt-5">
      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {showStylistRow && (
          <DetailRow
            icon={
              <div
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)", color: "#7C2D12", fontSize: 12, fontWeight: 700 }}
              >
                {initialsOf(pro.name)}
              </div>
            }
            label="Stylist"
            value={pro.name}
            valueSub={`${booking.service.name} · ${booking.service.durationLabel}`}
            chevron
            onRowClick={() => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
          />
        )}

        {/* When / Started */}
        {mode === "future" ? (
          <DetailRow
            icon={<CalendarDays size={16} />}
            label="When"
            value={dayDateLabel(booking.when)}
            valueSub={whenSub ?? undefined}
            action={showEdit ? "Edit" : undefined}
          />
        ) : (
          <DetailRow
            icon={<CalendarDays size={16} />}
            label={mode === "in-progress" ? "Started" : mode === "completed" ? "When" : "When"}
            value={whenLabel ?? ""}
          />
        )}

        {/* Address — only for live + future */}
        {(mode === "live" || mode === "future") && (
          <DetailRow
            icon={<MapPin size={16} />}
            label="Address"
            value={booking.location.label}
            valueSub="142 Lafayette Ave, Brooklyn"
            action={showEdit ? "Edit" : undefined}
          />
        )}

        {/* Payment */}
        <DetailRow
          icon={<CreditCard size={16} />}
          label="Payment"
          value={
            card
              ? mode === "completed"
                ? `${brandLabel(card.brand)} · charged $${(booking.total ?? booking.service.price + 3).toFixed(0)}`
                : brandLabel(card.brand)
              : "—"
          }
          valueSub={
            card
              ? mode === "completed"
                ? "View receipt"
                : mode === "in-progress"
                  ? "Will be charged when service completes"
                  : `Ending in ${card.last4}`
              : undefined
          }
          chevron={mode === "completed"}
          onRowClick={
            mode === "completed"
              ? () => navigate({ to: "/booking/receipt/$bookingId", params: { bookingId: booking.id } })
              : undefined
          }
        />

        {/* Notes — only for live + future */}
        {(mode === "live" || mode === "future") && (
          editingNotes ? (
            <li className="py-3.5">
              <div className="flex items-center gap-3">
                <span style={{ color: "var(--on-card-muted)", flexShrink: 0 }}><FileText size={16} /></span>
                <p style={{ fontSize: 11, color: "var(--on-card-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Note for {proFirst}
                </p>
              </div>
              <textarea
                value={notesValue}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder={`Add a note for ${proFirst}`}
                rows={3}
                autoFocus
                className="mt-2 w-full resize-none rounded-xl border-none px-3 py-2.5 outline-none"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", fontSize: 14, fontFamily: SANS_STACK, lineHeight: 1.5 }}
              />
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={onEditCancel} style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", background: "none", border: "none", fontFamily: SANS_STACK }}>
                  Cancel
                </button>
                <button type="button" onClick={onEditSave} style={{ fontSize: 13, fontWeight: 600, color: ORANGE, background: "none", border: "none", fontFamily: SANS_STACK }}>
                  Save
                </button>
              </div>
            </li>
          ) : (
            <DetailRow
              icon={<FileText size={16} />}
              label={`Note for ${proFirst}`}
              value={booking.notes || (canEditNotes ? "Add a note (optional)" : "—")}
              valuePlaceholder={!booking.notes}
              action={canEditNotes ? "Edit" : undefined}
              onAction={canEditNotes ? onEditStart : undefined}
            />
          )
        )}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DetailRow                                                           */
/* ------------------------------------------------------------------ */

function DetailRow({
  icon,
  label,
  value,
  valueSub,
  valuePlaceholder,
  action,
  onAction,
  chevron,
  onRowClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueSub?: string;
  valuePlaceholder?: boolean;
  action?: string;
  onAction?: () => void;
  chevron?: boolean;
  onRowClick?: () => void;
}) {
  const inner = (
    <>
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 10.5, fontWeight: 600, color: "var(--on-card-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 14.5,
            fontWeight: valuePlaceholder ? 500 : 600,
            color: valuePlaceholder ? "var(--on-card-muted)" : "var(--card-foreground)",
            letterSpacing: "-0.005em",
            marginTop: 3,
          }}
        >
          {value}
        </p>
        {valueSub && (
          <p className="mt-0.5" style={{ fontSize: 12.5, color: "var(--on-card-muted)", fontWeight: 400 }}>
            {valueSub}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer", fontFamily: SANS_STACK }}
        >
          {action}
        </button>
      )}
      {chevron && !action && <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />}
    </>
  );

  if (onRowClick) {
    return (
      <li>
        <button
          type="button"
          onClick={onRowClick}
          className="flex w-full items-center gap-3.5 py-3.5 text-left transition-opacity active:opacity-80"
        >
          {inner}
        </button>
      </li>
    );
  }

  return <li className="flex items-center gap-3.5 py-3.5">{inner}</li>;
}

/* ------------------------------------------------------------------ */
/*  CostCard                                                            */
/* ------------------------------------------------------------------ */

function CostCard({
  servicePrice,
  bookingFee,
  totalLabel,
  total,
}: {
  servicePrice: number;
  bookingFee: number;
  totalLabel: string;
  total: number;
}) {
  return (
    <div
      className="mx-5 mt-5 rounded-2xl p-4"
      style={{ backgroundColor: "var(--surface-elevated)" }}
    >
      <div className="flex items-baseline justify-between" style={{ fontSize: 13, color: "#2A3544" }}>
        <span>Service</span>
        <span className="tabular" style={{ fontWeight: 600, color: "var(--card-foreground)" }}>${servicePrice.toFixed(2)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between" style={{ fontSize: 13, color: "#2A3544" }}>
        <span>Booking fee</span>
        <span className="tabular" style={{ fontWeight: 600, color: "var(--card-foreground)" }}>${bookingFee.toFixed(2)}</span>
      </div>
      <div className="my-3" style={{ height: 1, backgroundColor: "var(--border)" }} />
      <div className="flex items-baseline justify-between">
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)" }}>{totalLabel}</span>
        <span className="tabular" style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.015em" }}>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MenuSheet — Safety sheet (shield → share location, support, 911)    */
/* ------------------------------------------------------------------ */

function MenuSheet({
  open,
  onClose,
  mode,
  bookingId,
  navigate,
}: {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  bookingId: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  if (!open) return null;
  void mode;
  void bookingId;
  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-label="Safety"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-t-3xl bg-card"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <div className="mx-auto mt-2 mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(127,127,127,0.2)" }} />
        <div className="px-6 pb-2">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: "var(--card-foreground)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>Safety</h2>
          </div>
          <p className="mt-1.5" style={{ fontSize: 13, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
            Tools to keep you safe on every booking.
          </p>
        </div>
        <ul className="mt-3 px-2">
          <SafetyRow
            label="Share my location"
            sub="Live share with your emergency contact"
            onClick={() => {
              onClose();
              navigate({ to: "/safety" });
            }}
          />
          <SafetyRow
            label="Message Ewà support"
            sub="Urgent chat with our team"
            onClick={() => {
              onClose();
              navigate({ to: "/profile/help" });
            }}
          />
          <SafetyRow
            label="Call 911"
            sub="For immediate emergencies only"
            danger
            onClick={() => {
              onClose();
              if (typeof window !== "undefined") window.location.href = "tel:911";
            }}
          />
        </ul>
      </div>
    </div>
  );
}

function SafetyRow({
  label,
  sub,
  onClick,
  danger,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="block w-full rounded-2xl px-4 py-3.5 text-left transition-colors active:bg-muted/30"
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: danger ? "#DC2626" : "var(--card-foreground)", letterSpacing: "-0.005em" }}>
          {label}
        </p>
        <p className="mt-1" style={{ fontSize: 12.5, color: danger ? "rgba(220,38,38,0.70)" : "var(--on-card-muted)", lineHeight: 1.4 }}>
          {sub}
        </p>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */

function initialsOf(name: string): string {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

function shortTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${ampm}`;
}

function dayDateLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function absoluteLabel(ts: number): string {
  const d = new Date(ts);
  const isToday = isSameDay(d, new Date());
  if (isToday) return `Today at ${shortTime(ts)}`;
  const isTomorrow = isSameDay(d, new Date(Date.now() + 86400000));
  if (isTomorrow) return `Tomorrow at ${shortTime(ts)}`;
  return `${d.toLocaleDateString(undefined, { month: "long", day: "numeric" })} at ${shortTime(ts)}`;
}

function relativeCountdown(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return "Starting soon";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `In ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `In ${hrs} hour${hrs === 1 ? "" : "s"}`;
  const days = Math.round(hrs / 24);
  return `In ${days} day${days === 1 ? "" : "s"}`;
}

function todayOrDay(ts: number): string {
  const d = new Date(ts);
  if (isSameDay(d, new Date())) return "today";
  return d.toLocaleDateString(undefined, { weekday: "long" }).toLowerCase();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function parseDurationMin(label: string): number {
  // Accepts "90 min", "1 hr", "1h 30m", "75 min" — best-effort
  const lower = label.toLowerCase();
  const min = lower.match(/(\d+)\s*min/);
  const hr = lower.match(/(\d+)\s*h(r|our)?/);
  let total = 0;
  if (hr) total += parseInt(hr[1] ?? "0", 10) * 60;
  if (min) total += parseInt(min[1] ?? "0", 10);
  return total > 0 ? total : 60;
}

function mmss(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function brandLabel(brand: string): string {
  switch (brand.toLowerCase()) {
    case "visa": return "Visa";
    case "mastercard": return "Mastercard";
    case "amex": return "Amex";
    default: return brand;
  }
}
