import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";

export function MessagePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; fromMe: boolean; ts: number }[]>([]);

  const muted = "var(--muted-foreground)";
  const subtleBorder = "var(--border)";

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

  const send = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { text: message.trim(), fromMe: true, ts: Date.now() }]);
    setMessage("");
    // Simulate pro reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "Thanks for your message! I'll get back to you shortly. 💛", fromMe: false, ts: Date.now() },
      ]);
    }, 1500);
  };

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
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 12, fontWeight: 700 }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{pro.name}</p>
          <p style={{ fontSize: 11, color: muted }}>{booking.service.name}</p>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-16 text-center">
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 20, fontWeight: 700 }}
            >
              {initials}
            </div>
            <p style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{pro.name}</p>
            <p style={{ marginTop: 4, fontSize: 13, color: muted, maxWidth: 240, lineHeight: 1.4 }}>
              Send a message about your upcoming {booking.service.name} appointment.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[75%] rounded-2xl px-3.5 py-2.5"
                style={{
                  backgroundColor: m.fromMe ? ORANGE : "var(--surface-elevated)",
                  color: m.fromMe ? "#1A0E08" : "var(--card-foreground)",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div
        className="sticky bottom-0 flex items-center gap-2 px-4 py-3"
        style={{ backgroundColor: "var(--card)", borderTop: `1px solid ${subtleBorder}` }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-xl border-none px-3.5 py-2.5 outline-none"
          style={{
            backgroundColor: "var(--surface-elevated)",
            color: "var(--foreground)",
            fontSize: 14,
            fontFamily: SANS_STACK,
          }}
        />
        <button
          onClick={send}
          disabled={!message.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
