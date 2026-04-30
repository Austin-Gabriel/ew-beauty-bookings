import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FavItem } from "./store";

export function ItemActionSheet({
  item,
  onClose,
  onMove,
  onRemove,
}: {
  item: FavItem | null;
  onClose: () => void;
  onMove: () => void;
  onRemove: () => void;
}) {
  return (
    <Sheet open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>{item?.meta?.name ?? "Item options"}</SheetTitle>
        </SheetHeader>
        <ul className="mt-3 flex flex-col gap-1 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <li>
            <button
              type="button"
              onClick={onMove}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--accent)]"
              style={{ fontSize: 14.5, fontWeight: 600, color: "var(--foreground)" }}
            >
              <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
              Move to collection
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={onRemove}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--accent)]"
              style={{ fontSize: 14.5, fontWeight: 600, color: "var(--destructive)" }}
            >
              <Icon><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></Icon>
              Remove
            </button>
          </li>
        </ul>
      </SheetContent>
    </Sheet>
  );
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
