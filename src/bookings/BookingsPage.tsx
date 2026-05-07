import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS, type Pro } from "@/data/mock-pros";
import {
  useBookings,
  ACTIVE_STATUSES,
  PAST_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/data/bookings-store";
import {
  formatBookingDate,
  formatBookingDateHeader,
  formatBookingTime,
} from "@/lib/format-booking-date";
import { CancelSheet } from "@/bookings/CancelSheet";

const ORANGE = "var(--bagel)";
const MUTED_PILL_BG = "rgba(11,18,32,0.06)";
const MUTED_PILL_FG = "var(--on-card-muted)";
const DANGER = "#DC2626";
const STAR = "#F5A623";

type Tab = "upcoming" | "past";

export function BookingsPage() {
  const { bookings, activeBookings, pastBookings } = useBookings();
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const muted = "var(--muted-foreground)";
  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";
  const cardShadow = isDark ? "none" : "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)";
  const surfaceBg = isDark ? "transparent" : "var(--card)";

  const active = activeBookings.find((b) =>
    (["getting-ready", "enroute", "arrived", "in-progress"] as BookingStatus[]).includes(b.status),
  );
  const upcomingRest = activeBookings.filter((b) => b !== active);

  const past = pastBookings;

  const upcomingCount = (active ? 1 : 0) + upcomingRest.length;
  const pastCount = past.length;

  const goBooking = (b: Booking) => {
    if (b.status === "pending_pro_approval") {
      navigate({ to: "/booking/pending/$bookingId", params: { bookingId: b.id } });
    } else {
      navigate({ to: "/bookings/$bookingId", params: { bookingId: b.id } });
    }
  };

  return (
    <AppShell editorial>
      {/* STICKY HEADER ----------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 px-5 pt-5"
        style={{
          backgroundColor: surfaceBg,
          borderBottom: `1px solid ${subtleBorder}`,
          fontFamily: SANS_STACK,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: text,
            margin: 0,
            marginBottom: 16,
          }}
        >
          Bookings
        </h1>
        <Tabs value={tab} onChange={setTab} totals={{ upcoming: upcomingCount, past: pastCount }} text={text} muted={muted} />
      </header>

      {/* BODY -------------------------------------------------------------- */}
      {tab === "upcoming" ? (
        upcomingCount === 0 ? (
          <BookingsEmpty
            heading="No bookings yet"
            body="Find a stylist you love and book your first appointment. Your upcoming and past bookings will live here."
            ctaLabel="Browse stylists"
            onCta={() => navigate({ to: "/discover" })}
            text={text}
            muted={muted}
          />
        ) : (
          <div className="px-5 pt-5 pb-6">
            {active && (
              <ActiveBookingHero
                booking={active}
                pro={MOCK_PROS.find((p) => p.id === active.proId)!}
                onMessage={() => navigate({ to: "/booking/message/$bookingId", params: { bookingId: active.id } })}
                onCall={() => navigate({ to: "/booking/call/$bookingId", params: { bookingId: active.id } })}
                onTap={() => goBooking(active)}
                onCancel={() => setCancelTarget(active.id)}
              />
            )}
            <UpcomingList
              bookings={upcomingRest}
              text={text}
              muted={muted}
              subtleBorder={subtleBorder}
              subtleSurface={subtleSurface}
              cardShadow={cardShadow}
              onTap={(b) => goBooking(b)}
              onCancel={(b) => setCancelTarget(b.id)}
            />
          </div>
        )
      ) : pastCount === 0 ? (
        <BookingsEmpty
          heading="No past bookings"
          body="Once you've completed a session, it'll show up here so you can rebook in one tap or grab a receipt."
          ctaLabel="Browse stylists"
          onCta={() => navigate({ to: "/discover" })}
          text={text}
          muted={muted}
        />
      ) : (
        <div className="px-5 pt-5 pb-6">
          <PastList
            bookings={past}
            text={text}
            muted={muted}
            subtleBorder={subtleBorder}
            cardShadow={cardShadow}
            onTap={(b) => goBooking(b)}
          />
        </div>
      )}

      {/* Cancel confirmation sheet */}
      <CancelSheet
        bookingId={cancelTarget}
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
      />
    </AppShell>
  );
}

/* ───────── Tabs ───────── */

function Tabs({
  value,
  onChange,
  totals,
  text,
  muted,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
  totals: { upcoming: number; past: number };
  text: string;
  muted: string;
}) {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: totals.upcoming },
    { id: "past", label: "Past", count: totals.past },
  ];
  return (
    <div className="flex" style={{ gap: 2 }}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 py-3"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? text : muted,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>{t.label}</span>
            <span style={{ color: "var(--on-card-muted)", fontWeight: 500, fontSize: 12.5 }}>{t.count}</span>
            {active && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "25%",
                  right: "25%",
                  bottom: -1,
                  height: 2,
                  borderRadius: 2,
                  backgroundColor: ORANGE,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Active booking hero (dark gradient card) ───────── */

function ActiveBookingHero({
  booking,
  pro,
  onMessage,
  onCall,
  onTap,
  onCancel,
}: {
  booking: Booking;
  pro: Pro;
  onMessage: () => void;
  onCall: () => void;
  onTap: () => void;
  onCancel: () => void;
}) {
  const status = booking.status;
  const livePill = livePillFor(status);

  // Big-number content varies by lifecycle stage
  let bigLabel = "";
  let bigSub = "";
  if (status === "getting-ready") {
    bigLabel = `${booking.etaMinutes ?? 5} min`;
    bigSub = `Getting ready · leaves in ${booking.etaMinutes ?? 5} min`;
  } else if (status === "enroute") {
    bigLabel = `${booking.etaMinutes ?? 12} min`;
    bigSub = `Estimated arrival · ${formatBookingTime(booking.when)} appointment`;
  } else if (status === "arrived") {
    bigLabel = booking.pin ?? "—";
    bigSub = `Share PIN with ${pro.name.split(" ")[0]} to start`;
  } else if (status === "in-progress") {
    bigLabel = formatBookingTime(booking.startedAt ?? booking.when);
    bigSub = `Service started · ${booking.service.name} · ${booking.service.durationLabel}`;
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="relative mb-5 cursor-pointer overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0B1220 0%, #2A3544 100%)",
        color: "#fff",
        boxShadow: "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)",
        fontFamily: SANS_STACK,
        padding: 18,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 80% 100%, rgba(255,130,63,0.20) 0%, transparent 60%)",
        }}
      />

      <span
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
        style={{
          backgroundColor: livePill.bg,
          color: livePill.fg,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          zIndex: 1,
        }}
      >
        <span aria-hidden className="ewa-pulse" style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: livePill.dot }} />
        {livePill.text}
      </span>

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontSize: 10.5,
            color: "rgba(255,239,230,0.70)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          Happening now
        </p>

        <div className="mb-3.5 flex items-center gap-2.5">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
            style={{
              backgroundColor: avatarBg(),
              color: avatarFg(),
              fontSize: 13,
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.20)",
            }}
          >
            {initialsOf(pro.name)}
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{pro.name}</p>
            <p style={{ fontSize: 12, color: "rgba(255,239,230,0.70)" }}>
              {booking.service.name} · {booking.service.durationLabel}
            </p>
          </div>
        </div>

        <div
          style={{
            fontSize: status === "arrived" ? 36 : 26,
            fontWeight: 700,
            letterSpacing: status === "arrived" ? "0.12em" : "-0.025em",
            color: "#fff",
            lineHeight: 1,
            fontVariantNumeric: status === "arrived" ? "tabular-nums" : undefined,
          }}
        >
          {bigLabel}
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,239,230,0.70)", marginTop: 6, marginBottom: 14 }}>{bigSub}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMessage();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.20)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCall();
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 transition-transform active:scale-95"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </button>
        </div>
        {/* Cancel link — only before in-progress */}
        {(["confirmed", "getting-ready", "enroute", "arrived"] as BookingStatus[]).includes(status) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="mt-3 w-full text-center"
            style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, fontFamily: SANS_STACK, opacity: 0.8, background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel booking
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── Upcoming list (day-grouped) ───────── */

function UpcomingList({
  bookings,
  text,
  muted,
  subtleBorder,
  subtleSurface,
  cardShadow,
  onTap,
  onCancel,
}: {
  bookings: Booking[];
  text: string;
  muted: string;
  subtleBorder: string;
  subtleSurface: string;
  cardShadow: string;
  onTap: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}) {
  const groups = useMemo(() => groupByDay(bookings), [bookings]);

  if (bookings.length === 0) return null;

  return (
    <div className="flex flex-col">
      {groups.map((g) => (
        <div key={g.label}>
          <h3
            className="pt-4 pb-2"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 11.5,
              fontWeight: 700,
              color: muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            {g.label}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {g.items.map((b) => (
              <li key={b.id}>
                <UpcomingCard
                  booking={b}
                  pro={MOCK_PROS.find((p) => p.id === b.proId)!}
                  onTap={() => onTap(b)}
                  onCancel={() => onCancel(b)}
                  text={text}
                  muted={muted}
                  subtleBorder={subtleBorder}
                  subtleSurface={subtleSurface}
                  cardShadow={cardShadow}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function UpcomingCard({
  booking,
  pro,
  onTap,
  onCancel,
  text,
  muted,
  subtleBorder,
  subtleSurface,
  cardShadow,
}: {
  booking: Booking;
  pro: Pro;
  onTap: () => void;
  onCancel: () => void;
  text: string;
  muted: string;
  subtleBorder: string;
  subtleSurface: string;
  cardShadow: string;
}) {
  const navigate = useNavigate();
  const status = booking.status;
  const isPending = status === "pending_pro_approval";
  const pill = statusPillFor(status);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid ${subtleBorder}`,
        boxShadow: cardShadow,
        padding: 14,
        fontFamily: SANS_STACK,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: avatarBg(), border: "0.5px solid rgba(6,28,39,0.08)",
            color: avatarFg(),
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initialsOf(pro.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1" style={{ fontSize: 14.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.015em" }}>
            <span className="truncate">{pro.name}</span>
            {pro.certified && <VerifiedTick />}
          </div>
          <p style={{ fontSize: 12, color: "var(--on-card-muted)", marginTop: 2 }}>
            {booking.service.name} · {booking.service.durationLabel}
          </p>
          {isPending && (
            <p style={{ fontSize: 11.5, color: "var(--on-card-muted)", marginTop: 3, fontStyle: "italic" }}>
              Awaiting {pro.name.split(" ")[0]}&apos;s response
            </p>
          )}
        </div>
        <span
          className="shrink-0 rounded-full"
          style={{
            backgroundColor: pill.bg,
            color: pill.fg,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 9px",
          }}
        >
          {pill.text}
        </span>
      </div>

      <div
        className="mt-3 flex items-center gap-3.5 border-t pt-3"
        style={{ borderColor: subtleBorder, fontSize: 12, color: "var(--card-foreground)" }}
      >
        <span className="inline-flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={"var(--on-card-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <strong style={{ color: "var(--card-foreground)", fontWeight: 600 }}>{formatBookingDate(booking.when)}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={"var(--on-card-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {locationLabel(booking)}
        </span>
      </div>

      {/* PIN — visible on confirmed upcoming bookings, NOT pending */}
      {booking.pin && !isPending && (
        <div
          className="mt-3 flex items-center justify-between rounded-xl px-3 py-2.5"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--hairline)" }}
        >
          <div>
            <p style={{ fontSize: 10, color: "var(--on-card-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Arrival PIN
            </p>
            <p
              style={{
                fontFamily: SANS_STACK,
                fontSize: 18,
                fontWeight: 700,
                color: "var(--card-foreground)",
                letterSpacing: "0.18em",
                fontVariantNumeric: "tabular-nums",
                marginTop: 2,
              }}
            >
              {booking.pin}
            </p>
          </div>
          <p style={{ fontSize: 11, color: "var(--on-card-muted)", maxWidth: 130, lineHeight: 1.35, textAlign: "right" }}>
            Share with your stylist when they arrive.
          </p>
        </div>
      )}

      {/* Pending: Cancel request only. Confirmed+: Message + Reschedule + Cancel */}
      {isPending ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="mt-3 w-full text-center"
          style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, fontFamily: SANS_STACK, background: "none", border: "none", cursor: "pointer" }}
        >
          Cancel request
        </button>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: "/booking/message/$bookingId", params: { bookingId: booking.id } });
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${subtleBorder}`,
                color: "var(--card-foreground)",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Message
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: "/booking/reschedule/$bookingId", params: { bookingId: booking.id } });
              }}
              className="inline-flex flex-1 items-center justify-center rounded-xl py-2"
              style={{
                backgroundColor: "transparent",
                border: `1px solid ${subtleBorder}`,
                color: "var(--card-foreground)",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              Reschedule
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="mt-2 w-full text-center"
            style={{ color: "#DC2626", fontSize: 12, fontWeight: 600, fontFamily: SANS_STACK, background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel booking
          </button>
        </>
      )}
    </div>
  );
}

/* ───────── Past list (month-grouped) ───────── */

function PastList({
  bookings,
  text,
  muted,
  subtleBorder,
  cardShadow,
  onTap,
}: {
  bookings: Booking[];
  text: string;
  muted: string;
  subtleBorder: string;
  cardShadow: string;
  onTap: (b: Booking) => void;
}) {
  const groups = useMemo(() => groupByMonth(bookings), [bookings]);

  return (
    <div className="flex flex-col">
      {groups.map((g) => (
        <div key={g.label}>
          <h3
            className="pt-4 pb-2"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 11.5,
              fontWeight: 700,
              color: muted,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            {g.label}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {g.items.map((b) => (
              <li key={b.id}>
                <PastCard
                  booking={b}
                  pro={MOCK_PROS.find((p) => p.id === b.proId)!}
                  onTap={() => onTap(b)}
                  text={text}
                  muted={muted}
                  subtleBorder={subtleBorder}
                  cardShadow={cardShadow}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PastCard({
  booking,
  pro,
  onTap,
  text,
  muted,
  subtleBorder,
  cardShadow,
}: {
  booking: Booking;
  pro: Pro;
  onTap: () => void;
  text: string;
  muted: string;
  subtleBorder: string;
  cardShadow: string;
}) {
  const navigate = useNavigate();
  const isCancelled = booking.status === "cancelled" || booking.status === "declined";
  const pill = statusPillFor(booking.status);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid ${subtleBorder}`,
        boxShadow: cardShadow,
        padding: 14,
        fontFamily: SANS_STACK,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{
            backgroundColor: avatarBg(), border: "0.5px solid rgba(6,28,39,0.08)",
            color: avatarFg(),
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initialsOf(pro.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1" style={{ fontSize: 14.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.015em" }}>
            <span className="truncate">{pro.name}</span>
            {pro.certified && <VerifiedTick />}
          </div>
          <p style={{ fontSize: 12, color: "var(--on-card-muted)", marginTop: 2 }}>
            {booking.service.name} · ${booking.service.price}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full"
          style={{
            backgroundColor: pill.bg,
            color: pill.fg,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 9px",
          }}
        >
          {pill.text}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3.5 border-t pt-3" style={{ borderColor: subtleBorder, fontSize: 12, color: "var(--card-foreground)" }}>
        <span className="inline-flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={"var(--on-card-muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatBookingDate(booking.when)}
        </span>
        {isCancelled ? (
          <span style={{ color: DANGER }}>
            {booking.refundUsd ? `Refunded $${booking.refundUsd}` : "Cancelled"}
          </span>
        ) : booking.rating ? (
          <span className="inline-flex items-center gap-1.5" style={{ color: ORANGE, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            You rated {booking.rating} star{booking.rating === 1 ? "" : "s"}
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/booking/rate/$bookingId", params: { bookingId: booking.id } });
            }}
            className="inline-flex items-center gap-1.5"
            style={{ color: ORANGE, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: SANS_STACK }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Rate this booking
          </button>
        )}
      </div>

      {!isCancelled && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/booking/receipt/$bookingId", params: { bookingId: booking.id } });
            }}
            className="inline-flex flex-1 items-center justify-center rounded-xl py-2"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${subtleBorder}`,
              color: "var(--card-foreground)",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            View receipt
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTap();
            }}
            className="inline-flex flex-1 items-center justify-center rounded-xl py-2 transition-transform active:scale-95"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            Book again
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── Empty state ───────── */

function BookingsEmpty({
  heading,
  body,
  ctaLabel,
  onCta,
  text,
  muted,
}: {
  heading: string;
  body: string;
  ctaLabel: string;
  onCta: () => void;
  text: string;
  muted: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 pt-12 pb-10 text-center" style={{ fontFamily: SANS_STACK }}>
      <div
        className="grid h-22 w-22 place-items-center rounded-full"
        style={{ width: 88, height: 88, backgroundColor: "rgba(255,130,63,0.10)", color: ORANGE }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h2 style={{ marginTop: 18, fontSize: 18, fontWeight: 700, color: text, letterSpacing: "-0.015em" }}>
        {heading}
      </h2>
      <p style={{ marginTop: 8, fontSize: 13.5, color: muted, lineHeight: 1.5, maxWidth: 280 }}>{body}</p>
      <button
        type="button"
        onClick={onCta}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
        style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 14, fontWeight: 600, fontFamily: SANS_STACK }}
      >
        {ctaLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

/* ───────── Atoms / helpers ───────── */

function VerifiedTick() {
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full"
      style={{ width: 13, height: 13, backgroundColor: ORANGE, color: "#fff" }}
    >
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function statusPillFor(status: BookingStatus): { text: string; bg: string; fg: string } {
  const BAGEL_PILL = { bg: "rgba(255,130,63,0.14)", fg: ORANGE };
  const NEUTRAL_PILL = { bg: MUTED_PILL_BG, fg: MUTED_PILL_FG };

  switch (status) {
    case "searching":
      return { text: "Searching", ...BAGEL_PILL };
    case "pending_pro_approval":
      return { text: "Pending", ...BAGEL_PILL };
    case "confirmed":
      return { text: "Confirmed", ...BAGEL_PILL };
    case "getting-ready":
      return { text: "Getting ready", ...BAGEL_PILL };
    case "enroute":
      return { text: "On the way", ...BAGEL_PILL };
    case "arrived":
      return { text: "Arrived", ...BAGEL_PILL };
    case "in-progress":
      return { text: "In progress", ...BAGEL_PILL };
    case "completed":
      return { text: "Completed", ...NEUTRAL_PILL };
    case "cancelled":
      return { text: "Cancelled", ...NEUTRAL_PILL };
    case "declined":
      return { text: "Declined", ...NEUTRAL_PILL };
    default:
      return { text: String(status), ...NEUTRAL_PILL };
  }
}

function livePillFor(status: BookingStatus): { text: string; bg: string; fg: string; dot: string } {
  // The pill on the dark hero card — uses solid orange for active states,
  // solid red for cancelled (which shouldn't really hit the active hero,
  // but defensible default).
  switch (status) {
    case "getting-ready":
      return { text: "Getting ready", bg: ORANGE, fg: "#1A0E08", dot: "#1A0E08" };
    case "enroute":
      return { text: "On the way", bg: ORANGE, fg: "#1A0E08", dot: "#1A0E08" };
    case "arrived":
      return { text: "Arrived", bg: ORANGE, fg: "#1A0E08", dot: "#1A0E08" };
    case "in-progress":
      return { text: "In progress", bg: ORANGE, fg: "#1A0E08", dot: "#1A0E08" };
    default:
      return { text: status, bg: ORANGE, fg: "#1A0E08", dot: "#1A0E08" };
  }
}

/* Avatar: cream-elevated fill, midnight initials — locked brand pattern */
function avatarBg(): string {
  return "var(--cream-elevated)";
}
function avatarFg(): string {
  return "var(--midnight)";
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// formatTime and formatDateAndTime removed — use formatBookingDate / formatBookingTime from @/lib/format-booking-date

function locationLabel(b: Booking): string {
  // All Ewà bookings come to the customer — no need to label "Mobile" anywhere
  if (b.location.type === "mobile") return b.location.label;
  return `${b.location.label} · ${b.location.distanceMi} mi`;
}

function groupByDay(bookings: Booking[]): { label: string; items: Booking[] }[] {
  const sorted = [...bookings].sort((a, b) => a.when - b.when);
  const groups = new Map<string, { label: string; items: Booking[] }>();
  for (const b of sorted) {
    const dayKey = new Date(b.when).toDateString();
    if (!groups.has(dayKey)) {
      groups.set(dayKey, { label: formatBookingDateHeader(b.when), items: [] });
    }
    groups.get(dayKey)!.items.push(b);
  }
  return Array.from(groups.values());
}

function groupByMonth(bookings: Booking[]): { label: string; items: Booking[] }[] {
  const sorted = [...bookings].sort((a, b) => b.when - a.when);
  const groups = new Map<string, Booking[]>();
  for (const b of sorted) {
    const d = new Date(b.when);
    const key = d.toLocaleDateString(undefined, { month: "long" });
    const arr = groups.get(key) ?? [];
    arr.push(b);
    groups.set(key, arr);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// Suppress unused-var warning for STAR (reserved for any future star rating row)
const __STAR = STAR;
void __STAR;
