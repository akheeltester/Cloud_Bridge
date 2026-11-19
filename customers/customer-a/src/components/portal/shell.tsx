import { createContext, useContext, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { Mark } from "@/components/mark";
import { roleLabel } from "@/lib/jigsaw/permissions";
import type { Actor } from "@/lib/jigsaw/types";

type ActorState = {
  actor: Actor;
  setActor: (actor: Actor) => void;
};

const ActorContext = createContext<ActorState | null>(null);

export function ActorProvider({
  actor,
  setActor,
  children,
}: ActorState & { children: React.ReactNode }) {
  return <ActorContext.Provider value={{ actor, setActor }}>{children}</ActorContext.Provider>;
}

export function useActorState(): ActorState {
  const value = useContext(ActorContext);
  if (!value) throw new Error("Portal is not ready.");
  return value;
}

const LINKS: { to: string; label: string; exact?: boolean; audit?: boolean }[] = [
  { to: "/portal", label: "Overview", exact: true },
  { to: "/portal/directory", label: "Directory" },
  { to: "/portal/departments", label: "Departments" },
  { to: "/portal/documents", label: "Documents" },
  { to: "/portal/audit", label: "Audit", audit: true },
];

export function PortalChrome({ children }: { children: React.ReactNode }) {
  const { actor } = useActorState();
  const [open, setOpen] = useState(false);
  const links = LINKS.filter((link) => !link.audit || actor.role !== "employee");

  return (
    <div className="dark min-h-screen bg-night text-night-fg">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-night-line px-4 py-6 md:flex">
          <Link to="/" className="flex items-center gap-2 px-2 font-display text-xl">
            <Mark className="size-7 text-jade-bright" />
            Jigsaw
          </Link>
          <p className="mt-1 px-2 text-xs text-night-muted">Employee portal</p>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={link.exact ? { exact: true } : undefined}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-night-muted hover:bg-night-raise hover:text-night-fg data-[status=active]:bg-night-raise data-[status=active]:text-night-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-night-line px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-md border border-night-line px-3 text-sm md:hidden"
                onClick={() => setOpen((value) => !value)}
              >
                Menu
              </button>
              <div className="hidden sm:block">
                <p className="text-sm">{actor.fullName}</p>
                <p className="text-xs text-night-muted">
                  {roleLabel(actor.role)} · {actor.departmentName}
                </p>
              </div>
            </div>
            <UserButton />
          </header>
          {open ? (
            <nav className="grid gap-1 border-b border-night-line px-4 py-3 md:hidden">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  activeOptions={link.exact ? { exact: true } : undefined}
                  className="flex min-h-11 items-center rounded-md px-3 text-sm data-[status=active]:bg-night-raise"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <div className="flex-1 px-4 py-6 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function NightSkeleton() {
  return (
    <div className="dark min-h-screen bg-night px-6 py-10 text-night-fg">
      <div className="h-8 w-40 animate-pulse rounded-md bg-night-raise" />
      <div className="mt-6 h-40 animate-pulse rounded-lg bg-night-raise" />
    </div>
  );
}
