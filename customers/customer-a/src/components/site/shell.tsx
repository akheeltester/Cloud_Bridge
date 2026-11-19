import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Mark } from "@/components/mark";

const LINKS = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/careers", label: "Careers" },
  { to: "/trust", label: "Trust" },
  { to: "/contact", label: "Contact" },
] as const;

function AuthSlot({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <span className="inline-block h-11 w-24 animate-pulse rounded-md bg-bone-deep" />;
  }
  if (user) {
    return (
      <Link
        to="/portal"
        onClick={onNavigate}
        className="inline-flex min-h-11 items-center rounded-md bg-jade px-4 text-sm font-medium text-paper"
      >
        Portal
      </Link>
    );
  }
  return (
    <Link
      to="/login"
      onClick={onNavigate}
      className="inline-flex min-h-11 items-center rounded-md bg-ink px-4 text-sm font-medium text-paper"
    >
      Sign in
    </Link>
  );
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-bone text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-bone/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-medium tracking-tight">
            <Mark className="size-7 text-jade" />
            Jigsaw
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-ink-soft hover:text-ink"
                activeProps={{ className: "text-jade" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            <AuthSlot />
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md border border-line md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div className="space-y-1 border-t border-line px-4 py-3 md:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-3 text-base"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <AuthSlot onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}
      </header>
      <main>{children}</main>
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl">Jigsaw</p>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Workplace systems for companies that are done with shared drives and mystery spreadsheets.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium">Studios</p>
            <p className="mt-2 text-muted">Lisbon</p>
            <p className="text-muted">Singapore</p>
            <p className="text-muted">Chicago</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-ink-soft hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-14 pb-8 sm:px-6 sm:pt-20">
      <p className="text-sm font-medium tracking-wide text-copper">{kicker}</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-ink sm:text-6xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{lede}</p>
    </header>
  );
}
