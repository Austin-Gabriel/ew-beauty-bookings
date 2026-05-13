/**
 * SchedulePage — date/time picker for "Schedule for later" flow.
 * /booking/schedule/:proId
 */
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, CalendarDays } from "lucide-react";
import { MOCK_PROS, PRO_SCHEDULES, type ProSchedule } from "@/data/mock-pros";
import { SANS_STACK } from "@/auth/auth-shell";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function generateDates(count: number): Date[] {
  const dates: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1); // exclude today
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function generateSlots(
  date: Date,
  schedule: ProSchedule,
): { time: string; available: boolean }[] {
  const dow = date.getDay();
  const hours = schedule.hours[dow];
  if (!hours) return []; // day off

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

      // Lead time: filter out slots within 1 hour from now
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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SchedulePage({ proId }: { proId: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const router = useRouter();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const search = (router.state.location.search as { service?: string }) ?? {};
  const service = search.service ?? "";

  const schedule = PRO_SCHEDULES[proId] ?? {
    hours: { 0: null, 1: { start: 9, end: 18 }, 2: { start: 9, end: 18 }, 3: { start: 9, end: 18 }, 4: { start: 9, end: 18 }, 5: { start: 9, end: 18 }, 6: null },
    blockedDates: [],
    bookedSlots: [],
  };

  const dates = useMemo(() => generateDates(60), []);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedDate = selectedDateIdx !== null ? dates[selectedDateIdx] : null;

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return generateSlots(selectedDate, schedule);
  }, [selectedDate, schedule]);

  const isBlockedDate = (date: Date) => {
    const key = toDateKey(date);
    const dow = date.getDay();
    const hours = schedule.hours[dow];
    return !hours || schedule.blockedDates.includes(key);
  };

  // Clear selected time when date changes
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDateIdx]);

  const canContinue = selectedDate !== null && selectedTime !== null;

  const handleContinue = () => {
    if (!selectedDate || !selectedTime || !pro) return;
    const when = slotToTimestamp(selectedDate, selectedTime);
    navigate({
      to: "/booking/confirm/$proId",
      params: { proId },
      search: { scheduledWhen: when, service },
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

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="pointer-events-none absolute inset-x-0 text-center text-[17px] font-semibold text-foreground">
          Pick a time
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Date pill row */}
        <div
          ref={scrollRef}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-4 pt-2"
          style={{ scrollbarWidth: "none" }}
        >
          {dates.map((d, i) => {
            const blocked = isBlockedDate(d);
            const selected = i === selectedDateIdx;
            return (
              <button
                key={i}
                type="button"
                disabled={blocked}
                onClick={() => setSelectedDateIdx(i)}
                className="flex shrink-0 flex-col items-center rounded-2xl px-3 py-2.5 transition-colors"
                style={{
                  minWidth: 56,
                  backgroundColor: selected
                    ? "var(--bagel)"
                    : "var(--card)",
                  color: selected
                    ? "var(--bagel-foreground)"
                    : blocked
                      ? "var(--on-card-muted)"
                      : "var(--card-foreground)",
                  opacity: blocked ? 0.35 : 1,
                  border: selected ? "none" : "1px solid var(--hairline)",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 500 }}>
                  {DAY_NAMES[d.getDay()]}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <>
            <p
              className="mb-3 mt-2"
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--muted-foreground)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Available times
            </p>

            {slots.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center py-12 text-center">
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
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const isSelected = selectedTime === s.time;
                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedTime(s.time)}
                      className="rounded-xl py-2.5 text-center transition-colors"
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        backgroundColor: isSelected
                          ? "var(--bagel)"
                          : "var(--card)",
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

        {!selectedDate && (
          <div className="flex flex-col items-center py-12 text-center">
            <CalendarDays
              size={32}
              style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
            />
            <p
              className="mt-3"
              style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)" }}
            >
              Select a date above
            </p>
            <p
              className="mt-1.5"
              style={{ fontSize: 14, color: "var(--muted-foreground)" }}
            >
              Pick a day to see available times.
            </p>
          </div>
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
