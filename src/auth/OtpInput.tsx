import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

/**
 * OtpInput — six big editorial digit slots. Auto-advances, paste-friendly,
 * fires onComplete when 6 digits are filled.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  autoFocus = true,
  length = 6,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  autoFocus?: boolean;
  length?: number;
  error?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const set = (i: number, char: string) => {
    const next = (value + "".padEnd(length, " ")).slice(0, length).split("");
    next[i] = char;
    const joined = next.join("").replace(/\s/g, "");
    onChange(joined);
    if (joined.length === length) onComplete?.(joined);
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = value.slice(0, Math.max(0, i)) + value.slice(i + 1);
      onChange(next);
      if (i > 0) refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    } else if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      set(i, e.key);
      if (i < length - 1) refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    if (text.length === length) onComplete?.(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`tabular h-14 w-full min-w-0 flex-1 rounded-xl border bg-foreground/[0.03] text-center text-[24px] font-semibold text-foreground transition-colors focus:outline-none ${
            error
              ? "border-destructive"
              : "border-hairline focus:border-bagel focus:bg-foreground/[0.06]"
          }`}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
