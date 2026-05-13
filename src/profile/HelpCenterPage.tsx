import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { ContactSupportSheet } from "./ContactSupportSheet";

export function HelpCenterPage() {
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

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
          Help center
        </span>
      </div>

      {/* Centered placeholder */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-20">
        <HelpCircle size={32} className="text-muted-foreground" />
        <p className="text-center text-[17px] font-semibold text-foreground">
          Help center coming soon
        </p>
        <p className="text-center text-[14px] leading-relaxed text-muted-foreground">
          We're working on it. In the meantime, reach out to support and we'll help you out.
        </p>
        <button
          type="button"
          onClick={openSupportMail}
          className="mt-1 text-[15px] font-semibold text-bagel transition-opacity active:opacity-60"
        >
          Contact support
        </button>
      </div>
    </div>
  );
}
