import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

export function ReschedulePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking, setBookings, bookings } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = isDark ? "rgba(240,235,216,0.55)" : "var(--on-card-muted)";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "var(--hairline)";

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5" style={{ fontFamily: SANS_STACK }}>
        <p style={{ color: text, fontSize: 16, fontWeight: 600 }}>Booking not found</p>
        <button onClick={() => navigate({ to: "/bookings" })} className="mt-4" style={{ color: ORANGE, fontSize: 14, fontWeight: 600 }}>
          Back to Bookings
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selectedTime) return;

    const newDate = days[selectedDay];
    // Parse time slot
    const [timePart, ampm] = selectedTime.split(" ");
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const mins = mStr ? parseInt(mStr, 10) : 0;
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    newDate.setHours(hours, mins, 0, 0);
    const newWhen = newDate.getTime();

    setBookings(
      bookings.map((b) => b.id === bookingId ? { ...b, when: newWhen } : b)
    );

    const dateLabel = newDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    toast.success(`Booking rescheduled to ${dateLabel}, ${selectedTime}`);
    navigate({ to: "/bookings" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: "var(--card)", borderBottom: `1px solid ${subtleBorder}` }}
      >
        <button onClick={() => navigate({ to: "/bookings" })} className="shrink-0 p-1" style={{ color: text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)" }}>Reschedule</h1>
      </header>

      <div className="flex-1 px-5 pt-5 pb-28">
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8" }}
        >
          <p style={{ fontSize: 10.5, color: muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Current booking
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--card-foreground)", marginTop: 4 }}>
            {booking.service.name} with {pro.name}
          </p>
          <p style={{ fontSize: 12.5, color: muted, marginTop: 2 }}>
            {new Date(booking.when).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {formatTime(booking.when)}
          </p>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", marginTop: 24, marginBottom: 12 }}>
          Pick a new date
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {days.map((d, i) => {
            const active = selectedDay === i;
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className="flex shrink-0 flex-col items-center rounded-xl px-3.5 py-2.5 transition-colors"
                style={{
                  backgroundColor: active ? ORANGE : isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8",
                  color: active ? "#1A0E08" : "var(--card-foreground)",
                  border: active ? "none" : `1px solid ${subtleBorder}`,
                  minWidth: 56,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", marginTop: 24, marginBottom: 12 }}>
          Pick a time
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((t) => {
            const active = selectedTime === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className="rounded-xl py-2.5 text-center transition-colors"
                style={{
                  backgroundColor: active ? ORANGE : isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8",
                  color: active ? "#1A0E08" : "var(--card-foreground)",
                  border: active ? "none" : `1px solid ${subtleBorder}`,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: SANS_STACK,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-4" style={{ backgroundColor: "var(--background)" }}>
        <button
          onClick={handleConfirm}
          disabled={!selectedTime}
          className="w-full rounded-2xl py-3.5 text-center transition-transform active:scale-[0.98] disabled:opacity-40"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
          }}
        >
          Confirm reschedule
        </button>
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`;
}
