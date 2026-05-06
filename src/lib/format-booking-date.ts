/**
 * formatBookingDate — single source of truth for all booking date/time display.
 *
 * Every screen that shows a booking date MUST use this function.
 * No ad-hoc date formatting anywhere else in the codebase.
 *
 * Behavior (computed against Date.now() at call time):
 * - Same day:         "Today, 3:00 PM"
 * - Next calendar day: "Tomorrow, 3:00 PM"
 * - Within 7 days:     "Friday, 3:00 PM"
 * - Beyond 7 days:     "Wed, May 22 · 3:00 PM"
 */

function formatTimeOnly(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  const aStart = startOfDay(a).getTime();
  const bStart = startOfDay(b).getTime();
  return Math.round((bStart - aStart) / (24 * 60 * 60 * 1000));
}

/**
 * Full date + time for booking cards, detail screens, etc.
 */
export function formatBookingDate(timestamp: number, now?: number): string {
  const d = new Date(timestamp);
  const ref = new Date(now ?? Date.now());
  const diff = daysBetween(ref, d);
  const time = formatTimeOnly(d);

  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Tomorrow, ${time}`;
  if (diff > 1 && diff <= 6) {
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    return `${dayName}, ${time}`;
  }
  // Past or > 7 days out
  const short = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${short} · ${time}`;
}

/**
 * Date-only label for section headers (uppercase by convention).
 * - Same day:         "TODAY"
 * - Next calendar day: "TOMORROW"
 * - Within 7 days:     "FRIDAY"
 * - Beyond 7 days:     "WED, MAY 22"
 */
export function formatBookingDateHeader(timestamp: number, now?: number): string {
  const d = new Date(timestamp);
  const ref = new Date(now ?? Date.now());
  const diff = daysBetween(ref, d);

  if (diff === 0) return "TODAY";
  if (diff === 1) return "TOMORROW";
  if (diff > 1 && diff <= 6) {
    return d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  }
  const short = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return short.toUpperCase();
}

/**
 * Time-only helper — still uses the same time formatting logic.
 */
export function formatBookingTime(timestamp: number): string {
  return formatTimeOnly(new Date(timestamp));
}
