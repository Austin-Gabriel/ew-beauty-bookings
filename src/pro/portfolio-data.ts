/**
 * Builds the "full portfolio" set for a pro. Mock data has 3–4 photos per
 * pro; we expand to a richer grid by repeating the source set so the new
 * Portfolio page and lightbox feel populated. Replace with real data once
 * the backend lands.
 */
export function buildFullPortfolio(portfolio: string[], target = 16): string[] {
  if (portfolio.length === 0) return [];
  const out: string[] = [];
  let i = 0;
  while (out.length < target) {
    out.push(portfolio[i % portfolio.length]!);
    i += 1;
  }
  return out;
}
