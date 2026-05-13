/**
 * BookIntentProvider — shared "Book now" vs "Book later" intent.
 * Set on Discover via the mode switch; read on the pro profile so service
 * taps and the Book button respect the customer's most recent choice.
 * Defaults to "now" when the customer arrives without ever toggling.
 */
import { createContext, useContext, useState, useMemo, type ReactNode } from "react";

export type BookIntent = "now" | "later";

type Ctx = {
  intent: BookIntent;
  setIntent: (i: BookIntent) => void;
};

const BookIntentContext = createContext<Ctx | null>(null);

export function BookIntentProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<BookIntent>("now");
  const value = useMemo(() => ({ intent, setIntent }), [intent]);
  return <BookIntentContext.Provider value={value}>{children}</BookIntentContext.Provider>;
}

export function useBookIntent(): Ctx {
  const ctx = useContext(BookIntentContext);
  if (!ctx) throw new Error("useBookIntent must be used within BookIntentProvider");
  return ctx;
}
