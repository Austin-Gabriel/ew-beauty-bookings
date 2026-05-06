/**
 * PendingApprovalPage — shown after customer confirms a booking with
 * a pro who has auto-accept OFF.
 */
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { MOCK_PROS } from "@/data/mock-pros";
import { useBookings } from "@/data/bookings-store";
import { SANS_STACK } from "@/auth/auth-shell";

function formatDateAndTime(ts: number): string {
  const d = new Date(ts);
  const month = d.toLocaleDateString(undefined, { month: "short" });
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const time = m === "00" ? `${h12} ${ampm}` : `${h12}:${m} ${ampm}`;
  return `${month} ${day} · ${time}`;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PendingApprovalPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { getBooking } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

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

  const proFirst = pro.name.split(" ")[0];
  const initials = initialsOf(pro.name);

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-6 pt-16">
        {/* Pro avatar + clock overlay */}
        <div className="relative">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{
              backgroundColor: "var(--cream-elevated)",
              color: "var(--midnight)",
              fontSize: 26,
              fontWeight: 700,
              border: "3px solid var(--card)",
              boxShadow: "0 2px 8px rgba(6,28,39,0.08)",
            }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full"
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--muted-foreground)",
              border: "2px solid var(--card)",
            }}
          >
            <Clock size={14} />
          </div>
        </div>

        <h1
          className="mt-6 text-center"
          style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em" }}
        >
          Waiting on {proFirst}
        </h1>
        <p
          className="mt-2 text-center"
          style={{ fontSize: 15, color: "var(--muted-foreground)", maxWidth: 280, lineHeight: 1.5 }}
        >
          {proFirst} has up to 24 hours to confirm. We'll let you know as soon as they accept.
        </p>

        {/* Booking summary card */}
        <div
          className="mt-8 w-full rounded-2xl p-4"
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--hairline)",
          }}
        >
          <div className="flex items-center justify-between" style={{ fontSize: 14 }}>
            <span style={{ color: "var(--on-card-muted)" }}>Service</span>
            <span style={{ color: "var(--card-foreground)", fontWeight: 600 }}>
              {booking.service.name}
            </span>
          </div>
          <div
            className="my-2.5"
            style={{ height: 1, backgroundColor: "var(--hairline)" }}
          />
          <div className="flex items-center justify-between" style={{ fontSize: 14 }}>
            <span style={{ color: "var(--on-card-muted)" }}>When</span>
            <span className="tabular" style={{ color: "var(--card-foreground)", fontWeight: 600 }}>
              {formatDateAndTime(booking.when)}
            </span>
          </div>
          <div
            className="my-2.5"
            style={{ height: 1, backgroundColor: "var(--hairline)" }}
          />
          <div className="flex items-center justify-between" style={{ fontSize: 14 }}>
            <span style={{ color: "var(--on-card-muted)" }}>Total</span>
            <span className="tabular" style={{ color: "var(--card-foreground)", fontWeight: 600 }}>
              ${(booking.total ?? booking.service.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3">
        <button
          type="button"
          onClick={() => navigate({ to: "/bookings" })}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl text-[16px] font-semibold transition-opacity"
          style={{
            backgroundColor: "var(--cream-elevated)",
            color: "var(--midnight)",
            border: "1px solid var(--hairline)",
          }}
        >
          View in bookings
        </button>
      </div>
    </div>
  );
}
