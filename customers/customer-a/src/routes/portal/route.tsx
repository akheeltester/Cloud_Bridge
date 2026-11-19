import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ActorProvider, NightSkeleton, PortalChrome } from "@/components/portal/shell";
import { errorText } from "@/lib/jigsaw/format";
import { getMe } from "@/lib/jigsaw/server";
import type { Actor } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal")({ component: PortalLayout });

function PortalLayout() {
  const { user, isPending } = useCurrentUserState();
  const [actor, setActor] = useState<Actor | null>(null);
  const [error, setError] = useState("");
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getMe()
      .then((me) => {
        if (!cancelled) setActor(me);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isPending || (user && !actor && !error)) return <NightSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (error || !actor) {
    return (
      <div className="dark grid min-h-screen place-items-center bg-night px-6 text-center text-night-fg">
        <p className="max-w-md text-sm text-night-muted">{error || "The portal could not open."}</p>
      </div>
    );
  }

  return (
    <ActorProvider actor={actor} setActor={setActor}>
      <PortalChrome>
        <Outlet />
      </PortalChrome>
    </ActorProvider>
  );
}
