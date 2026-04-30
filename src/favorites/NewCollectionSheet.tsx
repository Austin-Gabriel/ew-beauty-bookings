import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const ORANGE = "#FF823F";

export function NewCollectionSheet({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) setName(""); onOpenChange(v); }}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>New collection</SheetTitle>
          <SheetDescription>Give it a name. You can always rename it later.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 px-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="e.g. Birthday glam, Wedding inspo, My regulars"
            maxLength={40}
            className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-[var(--ring)]"
            style={{ fontSize: 15, borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <div className="mt-2 flex justify-end" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {name.length}/40
          </div>
        </div>
        <div className="mt-4 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <button
            type="button"
            onClick={() => { setName(""); onOpenChange(false); }}
            className="flex-1 rounded-full px-4 py-3 transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "var(--foreground)", fontSize: 14, fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="flex-1 rounded-full px-4 py-3 transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 14, fontWeight: 700 }}
          >
            Create
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
