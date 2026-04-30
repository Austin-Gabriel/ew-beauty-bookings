import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCollections, type FavCollection, type FavItem } from "./store";
import { NewCollectionSheet } from "./NewCollectionSheet";

const ORANGE = "#FF823F";

export function MoveToCollectionSheet({
  item,
  collections,
  onClose,
  onPick,
}: {
  item: FavItem | null;
  collections: FavCollection[];
  onClose: () => void;
  onPick: (toCollectionId: string) => void;
}) {
  const { create } = useCollections();
  const [newOpen, setNewOpen] = useState(false);
  const currentId = item?.collectionId;

  return (
    <>
      <Sheet open={!!item && !newOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>Move to collection</SheetTitle>
            <SheetDescription>Pick a destination, or make a new one.</SheetDescription>
          </SheetHeader>
          <ul className="mt-3 flex max-h-[55vh] flex-col gap-1 overflow-y-auto pb-2">
            {collections.map((c) => {
              const active = c.id === currentId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onPick(c.id)}
                    disabled={active}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--accent)] disabled:opacity-50"
                    style={{ fontSize: 14.5, fontWeight: 600, color: "var(--foreground)" }}
                  >
                    <span>{c.name}</span>
                    {active && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Current</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 transition-transform active:scale-95"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 14, fontWeight: 700, marginBottom: "calc(env(safe-area-inset-bottom)+8px)" }}
          >
            + New collection
          </button>
        </SheetContent>
      </Sheet>
      <NewCollectionSheet
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(name) => {
          const c = create(name);
          setNewOpen(false);
          onPick(c.id);
        }}
      />
    </>
  );
}
