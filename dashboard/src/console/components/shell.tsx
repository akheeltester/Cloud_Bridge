import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GitMerge,
  LayoutDashboard,
  Menu,
  Radar,
  Search,
  Server,
  Shield,
  Users,
  Workflow,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { nav, searchHits, GITHUB, LIVE_DEMO_URL, type NavTo, type SearchHit } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { cn } from "../lib/cn";

const icons: Record<NavTo, typeof LayoutDashboard> = {
  "/": LayoutDashboard,
  "/infrastructure": Server,
  "/customers": Users,
  "/migration": GitMerge,
  "/security": Shield,
  "/soc": Radar,
  "/automation": Workflow,
  "/documentation": BookOpen,
};

const groups: { label: string; items: NavTo[] }[] = [
  { label: "General", items: ["/", "/infrastructure"] },
  { label: "Threat management", items: ["/customers", "/migration", "/security", "/soc"] },
  { label: "Configuration", items: ["/automation", "/documentation"] },
];

function applyHit(hit: SearchHit) {
  const store = useConsole.getState();
  if (hit.kind === "phase") store.setPhase(Number(hit.key));
  if (hit.kind === "customer") store.setCustomerId(hit.key);
  if (hit.kind === "migration") store.setMigrationId(hit.key);
  if (hit.kind === "finding") store.setFindingId(hit.key);
  if (hit.kind === "alert") store.setAlertId(hit.key);
  if (hit.kind === "doc") store.setDocPath(hit.key);
  if (hit.kind === "host") store.setHostName(hit.key);
  if (hit.kind === "workflow") store.setWorkflow(hit.key);
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const query = useConsole((s) => s.query);
  const setQuery = useConsole((s) => s.setQuery);
  const navOpen = useConsole((s) => s.navOpen);
  const setNavOpen = useConsole((s) => s.setNavOpen);
  const banner = useConsole((s) => s.banner);
  const dismissBanner = useConsole((s) => s.dismissBanner);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const hits = searchHits(query);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setNavOpen(false);
        if (document.activeElement === searchRef.current) {
          setQuery("");
          searchRef.current?.blur();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setNavOpen, setQuery]);

  function go(hit: SearchHit) {
    applyHit(hit);
    setQuery("");
    setNavOpen(false);
    void navigate(hit.to);
  }

  function itemActive(to: string) {
    return to === "/" ? pathname === "/" : pathname.startsWith(to);
  }

  const navLinks = (
    <nav className="flex flex-col gap-4" aria-label="Sections">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-xs font-semibold text-faint">{group.label}</p>
          <div className="flex flex-col">
            {group.items.map((to) => {
              const item = nav.find((entry) => entry.to === to);
              if (!item) return null;
              const Icon = icons[item.to];
              const active = itemActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm lg:min-h-9",
                    active
                      ? "border-spruce bg-spruce-soft font-semibold text-spruce-ink"
                      : "border-transparent text-ink-soft hover:bg-paper",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const searchBox = (
    <div className="relative w-full">
      <label className="sr-only" htmlFor="ledger-search">
        Search
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
      <input
        id="ledger-search"
        ref={searchRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search"
        role="combobox"
        aria-expanded={hits.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        className="h-11 w-full rounded-chip border border-transparent bg-paper pr-3 pl-10 text-sm text-ink outline-none placeholder:text-faint focus:border-spruce focus:bg-sheet lg:h-8"
      />
      {hits.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="cb-elev absolute top-12 z-40 max-h-80 w-full overflow-auto rounded-panel border border-line bg-sheet py-1 lg:top-9"
        >
          {hits.map((hit) => (
            <li key={`${hit.kind}-${hit.key}`}>
              <button
                type="button"
                role="option"
                className="flex w-full flex-col px-3 py-2 text-left hover:bg-spruce-soft"
                onClick={() => go(hit)}
              >
                <span className="text-sm text-ink">{hit.title}</span>
                <span className="truncate text-xs text-muted">{hit.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-sheet">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 lg:h-12 lg:flex-nowrap lg:py-0">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-chip lg:hidden"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setNavOpen(false)}>
            <span className="grid size-7 place-items-center rounded-chip bg-spruce text-sheet" aria-hidden="true">
              <Shield className="size-4" />
            </span>
            <span className="truncate text-sm font-semibold">CloudBridge</span>
          </Link>
          <div className="order-last w-full lg:order-none lg:mx-auto lg:max-w-xl lg:flex-1">{searchBox}</div>
          <span className="ml-auto hidden text-xs text-muted md:inline">Portfolio project</span>
          <a
            href={LIVE_DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-chip bg-spruce px-3 text-sm font-semibold text-sheet hover:bg-spruce-ink"
          >
            <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
            Live AWS demo
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center rounded-chip border border-line px-3 text-sm font-semibold text-spruce-ink hover:bg-spruce-soft sm:inline-flex"
          >
            GitHub
          </a>
        </div>
      </header>

      {navOpen ? (
        <div className="fixed inset-0 z-20 bg-ink/40 lg:hidden" onClick={() => setNavOpen(false)}>
          <div
            className="h-full w-72 overflow-auto border-r border-line bg-sheet px-2 pt-16 pb-6"
            onClick={(event) => event.stopPropagation()}
          >
            {navLinks}
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 items-center rounded-chip border border-line px-3 text-sm font-semibold text-spruce-ink"
            >
              GitHub
            </a>
          </div>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)]">
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] overflow-auto border-r border-line bg-sheet px-2 py-4 lg:block">
          {navLinks}
        </aside>
        <main className="min-w-0 px-4 py-4 lg:px-6 lg:py-5">
          {banner ? (
            <div className="mb-4 flex gap-3 border border-line bg-warn-soft px-3 py-2 text-sm text-ink">
              <span className="w-1 shrink-0 bg-warn" aria-hidden="true" />
              <p className="max-w-4xl leading-relaxed">
                <span className="font-semibold">Portfolio demonstration. </span>
                The BluePeak web demo is deployed on AWS EC2 with S3 and HTTPS. Customer profiles, security findings,
                alerts, and charts are synthetic examples—not real customer data, live cloud telemetry, or a production
                migration. Status labels distinguish deployed work from planned work.
              </p>
              <button type="button" onClick={dismissBanner} className="ml-auto h-8 shrink-0 px-2 text-sm font-semibold text-spruce-ink">
                Dismiss
              </button>
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
