import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";

export function CallPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { text } = useAuthTheme();
  const { getBooking } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;
  const [elapsed, setElapsed] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Simulate ringing then connecting
    const ringTimer = setTimeout(() => setConnected(true), 2500);
    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [connected]);

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
  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-between px-5 py-16"
      style={{ background: "linear-gradient(180deg, #0B1220 0%, #1A2535 100%)", fontFamily: SANS_STACK }}
    >
      {/* Top: Pro info */}
      <div className="flex flex-col items-center pt-12">
        <div
          className="grid h-24 w-24 place-items-center rounded-full"
          style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 32, fontWeight: 700 }}
        >
          {initials}
        </div>
        <p style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: "#fff" }}>{pro.name}</p>
        <p style={{ marginTop: 6, fontSize: 14, color: "rgba(255,239,230,0.70)" }}>
          {connected ? `${mins}:${secs}` : "Calling..."}
        </p>
        {!connected && (
          <div className="mt-6 flex items-center gap-2">
            <span className="ewa-pulse h-2 w-2 rounded-full" style={{ backgroundColor: ORANGE }} />
            <span style={{ fontSize: 13, color: "rgba(255,239,230,0.55)" }}>Ringing</span>
          </div>
        )}
      </div>

      {/* Bottom: End call */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => navigate({ to: "/bookings" })}
          className="grid h-16 w-16 place-items-center rounded-full transition-transform active:scale-95"
          style={{ backgroundColor: "#DC2626" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
        <span style={{ fontSize: 13, color: "rgba(255,239,230,0.55)" }}>End call</span>
      </div>
    </div>
  );
}
