import { createFileRoute } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/booking/searching/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    const router = useRouter();
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="relative flex h-12 items-center px-4">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="absolute inset-x-0 text-center text-[17px] font-semibold text-foreground pointer-events-none">
            Searching
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-bagel/20 grid place-items-center mb-4">
            <div className="h-5 w-5 rounded-full border-2 border-bagel border-t-transparent animate-spin" />
          </div>
          <p className="text-[17px] font-semibold text-foreground">
            Searching — coming soon
          </p>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Booking {bookingId} is being matched. This screen will be built in Phase 3.
          </p>
        </div>
      </div>
    );
  },
});
