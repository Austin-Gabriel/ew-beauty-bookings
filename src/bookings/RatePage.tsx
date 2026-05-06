import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";
const STAR_FILLED = "var(--bagel)";
const STAR_EMPTY_LIGHT = "#D1D5DB";
const STAR_EMPTY_DARK = "rgba(240,235,216,0.3)";

export function RatePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking, setBookings, bookings } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = "var(--muted-foreground)";
  const subtleBorder = "var(--border)";

  const [rating, setRating] = useState(booking?.rating ?? 0);
  const [review, setReview] = useState("");

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

  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const handleSubmit = () => {
    if (rating > 0) {
      setBookings(
        bookings.map((b) => b.id === bookingId ? { ...b, rating } : b)
      );
    }
    toast.success("Thanks for your review!");
    navigate({ to: "/bookings" });
  };

  const ratingLabels = ["", "Not great", "Could be better", "Good", "Great", "Amazing"];

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
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>Rate your experience</h1>
      </header>

      <div className="flex-1 px-5 pt-8 pb-28">
        <div className="flex flex-col items-center">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 26, fontWeight: 700 }}
          >
            {initials}
          </div>
          <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>{pro.name}</p>
          <p style={{ marginTop: 4, fontSize: 13, color: muted }}>
            {booking.service.name} · {new Date(booking.when).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform active:scale-110"
                style={{ padding: 4 }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={filled ? STAR_FILLED : "none"}
                  stroke={filled ? STAR_FILLED : isDark ? STAR_EMPTY_DARK : STAR_EMPTY_LIGHT}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-center" style={{ fontSize: 14, fontWeight: 600, color: ORANGE }}>
            {ratingLabels[rating]}
          </p>
        )}

        {rating > 0 && (
          <div className="mt-8">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Add a note about your visit (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border-none px-3.5 py-3 outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--foreground)",
                fontSize: 14,
                fontFamily: SANS_STACK,
                lineHeight: 1.5,
              }}
            />
            <p style={{ marginTop: 6, fontSize: 11.5, color: muted, textAlign: "center" }}>
              Your rating helps other customers find great pros.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-4" style={{ backgroundColor: "var(--background)" }}>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full rounded-2xl py-3.5 text-center transition-transform active:scale-[0.98] disabled:opacity-40"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
          }}
        >
          Submit review
        </button>
      </div>
    </div>
  );
}
