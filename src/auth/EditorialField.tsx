import { type ChangeEvent, type ReactNode } from "react";
import { useAuthTheme, SANS_STACK } from "./auth-shell";

/**
 * EditorialField — quiet, brand-correct text input for auth flows.
 * Label (small caps eyebrow) + oversized input on a hairline underline.
 * Uses AuthShell theme tokens so it reads correctly on cream + midnight.
 */
export function EditorialField({
  label,
  hint,
  error,
  prefix,
  inputMode = "text",
  type = "text",
  value,
  onChange,
  placeholder,
  autoFocus,
  autoComplete,
  maxLength,
  name,
}: {
  label: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  inputMode?: "text" | "tel" | "email" | "numeric";
  type?: "text" | "tel" | "email";
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  name?: string;
}) {
  const { text, borderCol } = useAuthTheme();
  const errCol = "#E0563B";
  const underline = error ? errCol : borderCol;

  return (
    <label className="block">
      <span
        style={{
          fontFamily: SANS_STACK,
          fontSize: 10,
          letterSpacing: "1.6px",
          textTransform: "uppercase",
          color: text,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <div
        className="mt-3 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${underline}` }}
      >
        {prefix && (
          <span
            className="tabular pb-2"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 18,
              fontWeight: 500,
              color: text,
              opacity: 0.7,
            }}
          >
            {prefix}
          </span>
        )}
        <input
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className="tabular w-full bg-transparent pb-2 focus:outline-none"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 18,
            fontWeight: 500,
            color: text,
          }}
        />
      </div>
      {(hint || error) && (
        <p
          className="mt-2"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 12,
            lineHeight: 1.4,
            color: error ? errCol : text,
            opacity: error ? 1 : 0.55,
          }}
        >
          {error ?? hint}
        </p>
      )}
    </label>
  );
}
