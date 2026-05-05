import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";
const STAR_COLOR = "#F5A623";

export function RatePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = isDark ? "rgba(240,235,216,0.55)" : "var(--on-card-muted)";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "var(--hairline)";

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
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
    toast.success("Thanks for your review!");
    navigate({ to: "/bookings" });
  };

  const ratingLabels = ["", "Not great", "Could be better", "Good", "Great", "Amazing"];

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: "var(--card)", borderBottom: `1px solid ${subtleBorder}` }}
      >
        <button onClick={() => navigate({ to: "/bookings" })} className="shrink-0 p-1" style={{ color: text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)" }}>Rate your experience</h1>
      </header>

      <div className="flex-1 px-5 pt-8 pb-28">
        {/* Pro avatar + name */}
        <div className="flex flex-col items-center">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 26, fontWeight: 700 }}
          >
            {initials}
          </div>
          <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: "var(--card-foreground)" }}>{pro.name}</p>
          <p style={{ marginTop: 4, fontSize: 13, color: muted }}>
            {booking.service.name} · {new Date(booking.when).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Stars */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoveredStar || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-transform active:scale-110"
                style={{ padding: 4 }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={filled ? STAR_COLOR : "none"}
                  stroke={filled ? STAR_COLOR : isDark ? "rgba(240,235,216,0.3)" : "#D1D5DB"}
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
          <p className="mt-2 text-center" style={{ fontSize: 14, fontWeight: 600, color: STAR_COLOR }}>
            {ratingLabels[rating]}
          </p>
        )}

        {/* Review text */}
        {rating > 0 && (
          <div className="mt-8">
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--card-foreground)" }}>
              Leave a note (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`How was your ${booking.service.name} with ${pro.name.split(" ")[0]}?`}
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border-none px-3.5 py-3 outline-none"
              style={{
                backgroundColor: isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8",
                color: "var(--card-foreground)",
                fontSize: 14,
                fontFamily: SANS_STACK,
                lineHeight: 1.5,
              }}
            />
          </div>
        )}
      </div>

      {/* Sticky submit */}
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
