/**
 * Mock reviews — extended set used by both Pro Profile (first 2 shown) and
 * the full Reviews page. Replace with real customer ratings when backend
 * lands. Generated deterministically per pro so the list stays stable.
 */
import type { Pro } from "@/data/mock-pros";

export type ReviewItem = {
  id: string;
  initials: string;
  name: string;
  when: string;
  service: string;
  rating: number; // 1-5
  text: string;
};

const SAMPLE: Omit<ReviewItem, "id" | "service">[] = [
  { initials: "MO", name: "Maya Okafor", when: "2 days ago", rating: 5, text: "Honestly the best. So gentle, so professional, and my hair was bouncing for two weeks straight. Will rebook every month." },
  { initials: "TB", name: "Tasha B.", when: "1 week ago", rating: 5, text: "Came right to my apartment, set up was so professional. Looked amazing and didn't pull at all. 10/10." },
  { initials: "JR", name: "Jasmine R.", when: "2 weeks ago", rating: 5, text: "On time, kind, and a true artist. I felt completely taken care of." },
  { initials: "CN", name: "Chiamaka N.", when: "3 weeks ago", rating: 4, text: "Really happy with the result — took a little longer than expected but worth it." },
  { initials: "AD", name: "Asha D.", when: "1 month ago", rating: 5, text: "My scalp has never felt better. The aftercare tips were 🔥. Booked my next session already." },
  { initials: "KL", name: "Kemi L.", when: "1 month ago", rating: 5, text: "She really listens. Showed her a couple references and the result was even better than the photos." },
  { initials: "SN", name: "Simone N.", when: "2 months ago", rating: 5, text: "Comfortable, clean, professional. Felt like I was at a spa." },
  { initials: "RA", name: "Rachelle A.", when: "2 months ago", rating: 4, text: "Great experience overall. Would recommend booking earlier in the day if you have a busy schedule." },
  { initials: "YE", name: "Yara E.", when: "3 months ago", rating: 5, text: "My go-to. Always consistent." },
  { initials: "BO", name: "Bisi O.", when: "3 months ago", rating: 5, text: "She made me feel beautiful. Will keep coming back." },
  { initials: "ID", name: "Imani D.", when: "4 months ago", rating: 5, text: "Wonderful energy and an incredible eye for detail." },
  { initials: "FN", name: "Folake N.", when: "5 months ago", rating: 3, text: "Service was solid — wished communication was a little faster before the appointment." },
];

export function buildFullReviews(pro: Pro): ReviewItem[] {
  const services = pro.services.map((s) => s.name);
  return SAMPLE.map((r, i) => ({
    ...r,
    id: `rev-${i + 1}`,
    service: services[i % Math.max(1, services.length)] ?? pro.category,
  }));
}

export function ratingBreakdownFor(reviews: ReviewItem[]): number[] {
  // Returns percentages for 5★, 4★, 3★, 2★, 1★ (in that order).
  if (reviews.length === 0) return [0, 0, 0, 0, 0];
  const buckets = [0, 0, 0, 0, 0];
  for (const r of reviews) {
    const idx = 5 - Math.max(1, Math.min(5, r.rating));
    buckets[idx]! += 1;
  }
  return buckets.map((c) => Math.round((c / reviews.length) * 100));
}
