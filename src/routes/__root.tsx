import { Outlet, Link, ScriptOnce, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { DevStateProvider } from "../dev-state/devState";
import { DevStateToggle } from "../dev-state/DevStateToggle";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Ewà — Beauty, where you are" },
      {
        name: "description",
        content:
          "Ewà brings trusted barbers, stylists, braiders, nail techs, makeup artists and locticians to your door. Book on your terms.",
      },
      { name: "author", content: "Ewà" },
      { property: "og:title", content: "Ewà — Beauty, where you are" },
      {
        property: "og:description",
        content: "Premium mobile beauty, booked on your terms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Ewà — Beauty, where you are" },
      { name: "description", content: "Ewà Beauty Bookings connects clients with independent beauty professionals who travel to them." },
      { property: "og:description", content: "Ewà Beauty Bookings connects clients with independent beauty professionals who travel to them." },
      { name: "twitter:description", content: "Ewà Beauty Bookings connects clients with independent beauty professionals who travel to them." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e1b6ca4e-a18f-49e1-873f-a2042f6676f0/id-preview-93e6ecb9--f8e7024a-6570-468e-a917-02928fc3389e.lovable.app-1777452817828.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e1b6ca4e-a18f-49e1-873f-a2042f6676f0/id-preview-93e6ecb9--f8e7024a-6570-468e-a917-02928fc3389e.lovable.app-1777452817828.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

/**
 * Pre-hydration script — reads dev-state from localStorage and applies the
 * dark class to <html> BEFORE React hydrates. Eliminates the FOUC where the
 * page would render light then flip to dark on mount.
 */
const themeBootstrap = `(function(){try{
  var raw = localStorage.getItem("ewa.devstate.v1");
  var mode = "system";
  if (raw) { try { mode = (JSON.parse(raw).themeMode) || "system"; } catch(e){} }
  var resolved = mode === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : mode;
  var root = document.documentElement;
  if (resolved === "dark") root.classList.add("dark"); else root.classList.remove("dark");
  root.style.colorScheme = resolved;
}catch(e){}})();`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce>{themeBootstrap}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <DevStateProvider>
      <Outlet />
      <DevStateToggle />
      <Toaster />
    </DevStateProvider>
  );
}

