/**
 * SchedulePage — date/time picker for "Schedule for later" flow.
 * /booking/schedule/:proId
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Scissors, CalendarDays } from "lucide-react";
import { MOCK_PROS, PRO_SCHEDULES, type ProSchedule } from "@/data/mock-pros";
import { SANS_STACK } from "@/auth/auth-shell";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


function generateSlots(
  date: Date,
  schedule: ProSchedule,
): { time: string; available: boolean }[] {
  const dow = date.getDay();
  const hours = schedule.hours[dow];
  if (!hours) return [];

  const dateKey = toDateKey(date);
  const isBlocked = schedule.blockedDates.includes(dateKey);
  if (isBlocked) return [];

  const slots: { time: string; available: boolean }[] = [];
  const now = new Date();

  for (let h = hours.start; h < hours.end; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const slotKey = `${dateKey} ${hh}:${mm}`;
      const isBooked = schedule.bookedSlots.includes(slotKey);

      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);
      const tooSoon = slotDate.getTime() - now.getTime() < 60 * 60 * 1000;

      slots.push({
        time: formatSlotTime(h, m),
        available: !isBooked && !tooSoon,
      });
    }
  }
  return slots;
}

function formatSlotTime(h: number, m: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m === 0 ? "00" : String(m).padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

function slotToTimestamp(date: Date, timeLabel: string): number {
  const [timePart, ampm] = timeLabel.split(" ");
  const [hStr, mStr] = timePart.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}


/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SchedulePage({ proId }: { proId: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const router = useRouter();
  const navigate = useNavigate();
  const search = (router.state.location.search as { service?: string }) ?? {};
  const serviceName = search.service ?? "";

  const schedule = PRO_SCHEDULES[proId] ?? {
    hours: { 0: null, 1: { start: 9, end: 18 }, 2: { start: 9, end: 18 }, 3: { start: 9, end: 18 }, 4: { start: 9, end: 18 }, 5: { start: 9, end: 18 }, 6: null },
    blockedDates: [],
    bookedSlots: [],
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const slots = useMemo(
    () => (selectedDate ? generateSlots(selectedDate, schedule) : []),
    [selectedDate, schedule],
  );

  const isDateDisabled = (d: Date) => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    if (day < today) return true;
    const last = new Date(today);
    last.setDate(last.getDate() + 60);
    if (day > last) return true;
    const dow = d.getDay();
    const hours = schedule.hours[dow];
    if (!hours) return true;
    if (schedule.blockedDates.includes(toDateKey(d))) return true;
    return false;
  };

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDate]);

  const canContinue = !!selectedDate && !!selectedTime;

  // Service info (price)
  const serviceInfo = pro?.services.find((s) => s.name === serviceName);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !pro) return;
    const when = slotToTimestamp(selectedDate, selectedTime);
    navigate({
      to: "/booking/confirm/$proId",
      params: { proId },
      search: { scheduledWhen: when, service: serviceName },
    });
  };

  if (!pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <p className="text-[17px] font-semibold text-foreground">Pro not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/discover" })}
          className="mt-4 rounded-full bg-bagel px-5 py-2.5 text-[14px] font-semibold text-bagel-foreground"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  // Build a rolling 14-day window starting today; user can scroll horizontally
  const dayStrip = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push(d);
    }
    return out;
  }, [today]);

  // Default-select first available day if nothing selected
  useEffect(() => {
    if (selectedDate) return;
    const firstAvailable = dayStrip.find((d) => !isDateDisabled(d));
    if (firstAvailable) setSelectedDate(firstAvailable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayStrip]);

  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      style={{ fontFamily: SANS_STACK }}
    >
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <span className="pointer-events-none absolute inset-x-0 text-center text-[17px] font-semibold text-foreground">
          Pick a time
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Service summary chip */}
        {serviceName && (
          <div
            className="mt-2 flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--hairline)",
              color: "var(--card-foreground)",
            }}
          >
            <Scissors size={16} style={{ color: "var(--on-card-muted)" }} />
            <p className="flex-1 truncate text-[14px] font-medium">{serviceName}</p>
            {serviceInfo && (
              <p className="tabular text-[14px] font-semibold">${serviceInfo.priceFrom}</p>
            )}
          </div>
        )}

        {/* Horizontal day strip */}
        <div
          className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {dayStrip.map((d, i) => {
            const disabled = isDateDisabled(d);
            const selected = selectedDate ? isSameDay(d, selectedDate) : false;
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedDate(new Date(d))}
                className="flex shrink-0 flex-col items-center justify-center rounded-2xl transition-colors"
                style={{
                  width: 64,
                  height: 80,
                  backgroundColor: selected ? "var(--bagel)" : "var(--card)",
                  border: selected ? "none" : "1px solid var(--hairline)",
                  color: selected
                    ? "var(--bagel-foreground)"
                    : disabled
                      ? "var(--muted-foreground)"
                      : "var(--card-foreground)",
                  opacity: disabled ? 0.45 : 1,
                }}
              >
                <span
                  className="tabular"
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: "capitalize",
                    marginBottom: 4,
                    color: selected
                      ? "var(--bagel-foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span
                  className="tabular"
                  style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Times */}
        {selectedDate && (
          <>
            <p
              className="mb-4 mt-7"
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Available times
            </p>

            {slots.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CalendarDays
                  size={32}
                  style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
                />
                <p
                  className="mt-3"
                  style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}
                >
                  No availability on this day
                </p>
                <p
                  className="mt-1.5"
                  style={{ fontSize: 14, color: "var(--muted-foreground)" }}
                >
                  Try another day or check back soon.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((s) => {
                  const isSelected = selectedTime === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedTime(s.time)}
                      className="tabular rounded-full py-3 text-center transition-colors"
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        backgroundColor: isSelected ? "var(--bagel)" : "var(--card)",
                        color: isSelected
                          ? "var(--bagel-foreground)"
                          : !s.available
                            ? "var(--on-card-muted)"
                            : "var(--card-foreground)",
                        opacity: !s.available ? 0.4 : 1,
                        textDecoration: !s.available ? "line-through" : "none",
                        border: isSelected ? "none" : "1px solid var(--hairline)",
                      }}
                    >
                      {s.time}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3">
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-bagel text-[16px] font-semibold text-bagel-foreground transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
