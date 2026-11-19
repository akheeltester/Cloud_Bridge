import { catalogs, cicdPipeline, includesQuery, toolchain, workflows } from "../lib/cloudbridge/data";
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
        lede="How changes ship: the CI/CD pipeline that gates every push, the security toolchain with real scan evidence, and the Terraform/Ansible/script catalog."
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

      {/* ── CI/CD pipeline flow ── */}
      <Panel className="mb-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">CI/CD pipeline</h2>
            <p className="text-sm text-muted">Every push to main passes these gates before anything ships</p>
          </div>
          <StatusPill status="implemented" />
        </div>
        <ol className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {cicdPipeline.map((stage, i) => (
            <li key={stage.step} className="relative rounded-chip border border-line bg-paper p-3">
              <span className="font-mono text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-1 text-xs font-semibold">{stage.step}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted">{stage.detail}</p>
              {i < cicdPipeline.length - 1 ? (
                <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-faint xl:inline" aria-hidden="true">→</span>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-faint">
          Secret scanning runs first and gates the rest — a verified secret blocks the entire pipeline. Dashboard changes additionally
          trigger the Pages deploy workflow, which is how this site updates itself.
        </p>
      </Panel>

      {/* ── Toolchain: how each tool is used ── */}
      <Panel className="mb-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Toolchain in practice</h2>
            <p className="text-sm text-muted">What each tool does here, with the actual results it produced</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {toolchain
            .filter((t) => includesQuery(query, [t.tool, t.role, t.how, t.evidence]))
            .map((t) => (
              <article key={t.tool} className="rounded-chip border border-line bg-paper p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">{t.tool}</h3>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t.how}</p>
                <p className="mt-2 rounded-chip bg-sheet px-2 py-1 text-[11px] font-medium text-spruce-ink">{t.evidence}</p>
              </article>
            ))}
        </div>
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
