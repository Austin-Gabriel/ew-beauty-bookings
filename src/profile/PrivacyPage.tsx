import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Shield } from "lucide-react";

/**
 * Stub — replace the placeholder body below with the real Privacy Policy
 * document link or embedded content when available.
 * Target URL: https://ewatheapp.com/privacy (or wherever legal hosts it).
 */
export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center justify-center px-4">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="absolute left-4 grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-muted/30"
          aria-label="Back"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <span className="text-[17px] font-semibold text-foreground">
          Privacy policy
        </span>
      </div>

      {/* Centered placeholder — swap for real document link */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-20">
        <Shield size={32} className="text-muted-foreground" />
        <p className="text-center text-[17px] font-semibold text-foreground">
          Privacy policy
        </p>
        <p className="text-center text-[14px] leading-relaxed text-muted-foreground">
          Document link coming soon.
        </p>
      </div>
    </div>
  );
}
