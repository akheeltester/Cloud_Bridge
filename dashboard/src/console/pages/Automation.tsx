import { catalogs, includesQuery, workflows } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

const langs = ["all", "HCL", "YAML", "Python", "Bash"] as const;

export function AutomationPage() {
  const query = useConsole((s) => s.query);
  const workflow = useConsole((s) => s.workflow);
  const setWorkflow = useConsole((s) => s.setWorkflow);
  const lang = useConsole((s) => s.lang);
  const setLang = useConsole((s) => s.setLang);
  const flows = workflows.filter((item) => includesQuery(query, [item.name, item.triggers, ...item.jobs]));
  const selected = flows.find((item) => item.name === workflow) ?? flows[0];

  return (
    <div>
      <PageIntro
        index="07  ·  Automation"
        title="Automation"
        lede="Terraform modules, Ansible playbooks, Python scripts, and the GitHub Actions workflows already running on main."
      />

      <Panel className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">GitHub Actions</h2>
            <p className="text-sm text-muted">Active workflows — running on every push to main</p>
          </div>
          <StatusPill status="in-progress" />
        </div>
        {flows.length === 0 ? (
          <div className="mt-4">
            <EmptyNote query={query} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid gap-2">
              {flows.map((item) => {
                const on = item.name === selected?.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setWorkflow(item.name)}
                    className={cn(
                      "rounded-chip border px-3 py-3 text-left",
                      on ? "border-spruce bg-spruce-soft" : "border-line bg-paper",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm">{item.name}</span>
                      <StatusPill status={item.status} />
                    </span>
                    <span className="mt-1 block text-xs text-muted">{item.triggers}</span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <aside className="rounded-chip border border-line bg-paper p-3">
                <p className="font-mono text-sm">{selected.name}</p>
                <p className="mt-1 text-xs text-muted">{selected.triggers}</p>
                <ol className="mt-3 flex flex-col gap-2">
                  {selected.jobs.map((job, index) => (
                    <li key={job} className="flex gap-2 text-sm">
                      <span className="font-mono text-xs text-faint">{index + 1}</span>
                      {job}
                    </li>
                  ))}
                </ol>
              </aside>
            ) : null}
          </div>
        )}
      </Panel>

      <div className="mb-3 flex flex-wrap gap-1" aria-label="Language">
        {langs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLang(item)}
            className={cn(
              "h-9 rounded-chip px-3 text-xs font-medium",
              lang === item ? "bg-spruce text-sheet" : "border border-line bg-sheet text-ink-soft",
            )}
          >
            {item === "all" ? "All languages" : item}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {catalogs.map((group) => {
          const items = group.items.filter(
            (item) => (lang === "all" || item.lang === lang) && includesQuery(query, [item.name, item.desc, item.lang, group.category]),
          );
          if (items.length === 0) return null;
          return (
            <Panel key={group.category}>
              <h2 className="font-display text-2xl tracking-tight">{group.category}</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-xs text-muted">
                    <tr className="border-b border-line">
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 pr-3 font-medium">Description</th>
                      <th className="py-2 pr-3 font-medium">Lang</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.name} className="border-b border-line">
                        <td className="py-3 pr-3 font-mono text-xs">{item.name}</td>
                        <td className="py-3 pr-3 text-xs text-ink-soft">{item.desc}</td>
                        <td className="py-3 pr-3 text-xs text-muted">{item.lang}</td>
                        <td className="py-3">
                          <StatusPill status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
