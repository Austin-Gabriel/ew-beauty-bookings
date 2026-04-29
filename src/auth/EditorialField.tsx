import { type ChangeEvent, type ReactNode } from "react";

/**
 * EditorialField — a quiet, brand-correct text input for auth flows.
 * No bordered "white box" — just a label, a generous oversized text input
 * sitting on a subtle hairline underline. Editorial, not Material.
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
  return (
    <label className="block">
      <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </span>
      <div
        className={`mt-3 flex items-center gap-2 border-b ${
          error ? "border-destructive" : "border-foreground/15 focus-within:border-bagel"
        } transition-colors`}
      >
        {prefix && (
          <span className="pb-2 text-[22px] font-medium text-foreground/70 tabular">
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
          className="w-full bg-transparent pb-2 text-[22px] font-medium text-foreground placeholder:text-foreground/30 focus:outline-none tabular"
        />
      </div>
      {(hint || error) && (
        <p
          className={`mt-2 text-[12px] leading-snug ${
            error ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {error ?? hint}
        </p>
      )}
    </label>
  );
}
