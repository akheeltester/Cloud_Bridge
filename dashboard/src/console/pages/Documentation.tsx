import { docGroups, GITHUB, includesQuery } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

export function DocumentationPage() {
  const query = useConsole((s) => s.query);
  const docPath = useConsole((s) => s.docPath);
  const setDocPath = useConsole((s) => s.setDocPath);
  const groups = docGroups
    .map((group) => ({
      ...group,
      docs: group.docs.filter((doc) => includesQuery(query, [doc.name, doc.path, doc.blurb, group.title, doc.status])),
    }))
    .filter((group) => group.docs.length > 0);
  const flat = groups.flatMap((group) => group.docs.map((doc) => ({ ...doc, group: group.title })));
  const selected = flat.find((doc) => doc.path === docPath) ?? flat[0];

  return (
    <div>
      <PageIntro
        index="08  ·  Documentation"
        title="Documentation"
        lede="Architecture notes, customer profiles, runbooks, and setup guides. Implemented files exist in the repository. Planned files are still outlines."
      />
      {groups.length === 0 ? (
        <EmptyNote query={query} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <Panel key={group.title}>
                <h2 className="font-display text-2xl tracking-tight">{group.title}</h2>
                <ul className="mt-2">
                  {group.docs.map((doc) => {
                    const on = doc.path === selected?.path;
                    return (
                      <li key={doc.path}>
                        <button
                          type="button"
                          onClick={() => setDocPath(doc.path)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-chip px-2 py-3 text-left",
                            on ? "bg-spruce-soft" : "hover:bg-paper",
                          )}
                        >
                          <span>
                            <span className="block text-sm font-medium">{doc.name}</span>
                            <span className="mt-0.5 block font-mono text-xs text-muted">{doc.path}</span>
                          </span>
                          <StatusPill status={doc.status} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            ))}
          </div>
          {selected ? (
            <Panel className="h-fit lg:sticky lg:top-24">
              <p className="text-xs text-muted">{selected.group}</p>
              <h2 className="mt-1 font-display text-3xl leading-tight tracking-tight">{selected.name}</h2>
              <div className="mt-3">
                <StatusPill status={selected.status} />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{selected.blurb}</p>
              <p className="mt-4 font-mono text-xs text-muted">{selected.path}</p>
              <a
                href={`${GITHUB}/blob/main/${selected.path.replace(/\/$/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-11 items-center text-sm font-medium text-spruce"
              >
                View path on GitHub
              </a>
            </Panel>
          ) : null}
        </div>
      )}
    </div>
  );
}
