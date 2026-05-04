import { Camera, ImageIcon, Trash2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Avatar Action Sheet                                                 */
/* ------------------------------------------------------------------ */

export function AvatarActionSheet({
  hasPhoto,
  onTakePhoto,
  onChooseFromLibrary,
  onRemovePhoto,
  onDismiss,
}: {
  hasPhoto: boolean;
  onTakePhoto: () => void;
  onChooseFromLibrary: () => void;
  onRemovePhoto: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9997] flex items-end justify-center">
      {/* Backdrop */}
      <button
        aria-label="Dismiss"
        onClick={onDismiss}
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-[420px] space-y-2 p-4 pb-8">
        {/* Drag handle */}
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-foreground/15" />

        {/* Actions card */}
        <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
          <ActionRow
            icon={Camera}
            label="Take photo"
            onClick={onTakePhoto}
          />
          <div className="ml-[52px] border-b border-hairline" />
          <ActionRow
            icon={ImageIcon}
            label="Choose from library"
            onClick={onChooseFromLibrary}
          />
          {hasPhoto && (
            <>
              <div className="ml-[52px] border-b border-hairline" />
              <ActionRow
                icon={Trash2}
                label="Remove photo"
                onClick={onRemovePhoto}
                destructive
              />
            </>
          )}
        </div>

        {/* Cancel card */}
        <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
          <button
            onClick={onDismiss}
            className="w-full py-3.5 text-center text-[15px] font-semibold text-card-foreground transition-colors active:bg-muted/30"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors active:bg-muted/30"
    >
      <Icon
        size={20}
        className={destructive ? "text-destructive" : "text-card-foreground"}
      />
      <span
        className={`text-[15px] font-medium ${
          destructive ? "text-destructive" : "text-card-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
