import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, MapPin, Star, Heart, List, Navigation } from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";

// Simple deterministic placement on a fake map grid based on a pro's id.
function placementFor(id: string): { left: string; top: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const x = Math.abs(hash % 70) + 15;
  const y = Math.abs((hash >> 4) % 60) + 15;
  return { left: `${x}%`, top: `${y}%` };
}

export function MapViewPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const [selectedId, setSelectedId] = useState<string>(MOCK_PROS[0]?.id ?? "");

  const pros = MOCK_PROS.slice(0, 8);
  const selected = pros.find((p) => p.id === selectedId) ?? pros[0];

  const subtleBorder = "var(--border)";

  return (
    <AppShell>
      <div className="relative" style={{ fontFamily: SANS_STACK }}>
        {/* Faux map canvas */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: "calc(100vh - 84px)",
            background:
              "linear-gradient(135deg, #E8EFF5 0%, #F2EAE0 50%, #E5EBE4 100%)",
          }}
          aria-hidden={false}
          role="img"
          aria-label="Map of stylists near you"
        >
          {/* Grid lines */}
          <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.35 }}>
            <defs>
              <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(11,18,32,0.08)" strokeWidth="1" />
              </pattern>
              <pattern id="map-grid-major" width="240" height="240" patternUnits="userSpaceOnUse">
                <path d="M 240 0 L 0 0 0 240" fill="none" stroke="rgba(11,18,32,0.12)" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
            <rect width="100%" height="100%" fill="url(#map-grid-major)" />
          </svg>

          {/* Faux roads */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <path d="M 0 35% Q 30% 30%, 60% 45% T 100% 50%" stroke="rgba(255,255,255,0.85)" strokeWidth="10" fill="none" />
            <path d="M 0 35% Q 30% 30%, 60% 45% T 100% 50%" stroke="rgba(11,18,32,0.12)" strokeWidth="11" fill="none" strokeDasharray="2 6" />
            <path d="M 25% 0 L 28% 100%" stroke="rgba(255,255,255,0.85)" strokeWidth="8" fill="none" />
            <path d="M 75% 0 L 70% 100%" stroke="rgba(255,255,255,0.75)" strokeWidth="6" fill="none" />
          </svg>

          {/* "You are here" pulse */}
          <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <span
              className="absolute -inset-3 rounded-full"
              style={{ backgroundColor: "rgba(26,115,232,0.20)", animation: "pulse 2.2s ease-in-out infinite" }}
            />
            <span
              className="relative block h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: "#1A73E8", boxShadow: "0 0 0 3px #fff" }}
            />
          </div>

          {/* Pro pins */}
          {pros.map((p) => {
            const { left, top } = placementFor(p.id);
            const active = p.id === selectedId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className="absolute -translate-x-1/2 -translate-y-full transition-transform active:scale-95"
                style={{ left, top, transform: `translate(-50%, -100%) ${active ? "scale(1.1)" : "scale(1)"}` }}
                aria-label={`${p.name} — ${p.neighborhood}`}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full"
                  style={{
                    backgroundColor: active ? ORANGE : "#fff",
                    color: active ? "#fff" : ORANGE,
                    border: `2px solid ${active ? "#fff" : ORANGE}`,
                    boxShadow: "0 4px 14px rgba(11,18,32,0.18)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ${p.priceFrom}
                </span>
                <span
                  aria-hidden
                  className="mx-auto block"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "5px solid transparent",
                    borderRight: "5px solid transparent",
                    borderTop: `7px solid ${active ? ORANGE : "#fff"}`,
                    marginTop: -1,
                  }}
                />
              </button>
            );
          })}

          {/* Top overlay header */}
          <header
            className="absolute left-0 right-0 top-0 flex items-center gap-2 px-4 py-3"
            style={{ pointerEvents: "none" }}
          >
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full"
              style={{
                pointerEvents: "auto",
                backgroundColor: "#fff",
                color: "#0B1220",
                boxShadow: "0 4px 14px rgba(11,18,32,0.18)",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <div
              className="flex-1 rounded-full px-4 py-2.5 text-center"
              style={{
                pointerEvents: "auto",
                backgroundColor: "#fff",
                boxShadow: "0 4px 14px rgba(11,18,32,0.18)",
                fontSize: 13,
                fontWeight: 600,
                color: "#0B1220",
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} style={{ color: ORANGE }} />
                Brooklyn · 5 mi
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="List view"
              className="grid h-10 w-10 place-items-center rounded-full"
              style={{
                pointerEvents: "auto",
                backgroundColor: "#fff",
                color: "#0B1220",
                boxShadow: "0 4px 14px rgba(11,18,32,0.18)",
              }}
            >
              <List size={16} />
            </button>
          </header>

          {/* Recenter FAB */}
          <button
            type="button"
            onClick={() => setSelectedId(pros[0]?.id ?? "")}
            aria-label="Recenter map"
            className="absolute right-4 grid h-11 w-11 place-items-center rounded-full"
            style={{
              bottom: 180,
              backgroundColor: "#fff",
              color: ORANGE,
              boxShadow: "0 6px 18px rgba(11,18,32,0.20)",
            }}
          >
            <Navigation size={16} />
          </button>

          {/* Pro card */}
          {selected && (
            <div
              className="absolute left-4 right-4 rounded-2xl bg-card p-3"
              style={{
                bottom: 16,
                boxShadow: "0 12px 30px rgba(11,18,32,0.18)",
                border: `1px solid ${subtleBorder}`,
              }}
            >
              <div className="flex gap-3">
                <img
                  src={selected.avatar}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
                        {selected.name}
                      </p>
                      <p className="truncate" style={{ fontSize: 12, color: "var(--on-card-muted)", marginTop: 1 }}>
                        {selected.headline}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Save"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                      style={{ backgroundColor: "var(--surface-elevated)", color: "var(--muted-foreground)" }}
                    >
                      <Heart size={14} />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2.5" style={{ fontSize: 12, color: "var(--on-card-muted)" }}>
                    <span className="inline-flex items-center gap-1">
                      <Star size={11} style={{ color: ORANGE, fill: ORANGE }} />
                      {selected.rating}
                    </span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} />
                      {selected.distanceMi.toFixed(1)} mi
                    </span>
                    <span>·</span>
                    <span>${selected.priceFrom}+</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate({ to: "/pro/$proId", params: { proId: selected.id } })}
                className="mt-2.5 w-full rounded-xl py-2.5 transition-transform active:scale-[0.98]"
                style={{
                  backgroundColor: ORANGE,
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  fontFamily: SANS_STACK,
                }}
              >
                View profile
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(0.6); opacity: 0; }
        }
      `}</style>
    </AppShell>
  );
}
