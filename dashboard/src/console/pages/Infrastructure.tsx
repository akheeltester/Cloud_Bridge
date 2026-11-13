import { awsModules, futureClouds, includesQuery, labHosts, LIVE_DEMO_URL, vpcLines } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

export function InfrastructurePage() {
  const query = useConsole((s) => s.query);
  const hostName = useConsole((s) => s.hostName);
  const setHostName = useConsole((s) => s.setHostName);
  const hosts = labHosts.filter((host) => includesQuery(query, [host.name, host.type, host.ip, host.customer, host.status]));
  const modules = awsModules.filter((item) => includesQuery(query, [item.title, item.desc, item.path]));
  const selected = hosts.find((host) => host.name === hostName) ?? hosts[0];

  return (
    <div>
      <PageIntro
        index="02  ·  Infrastructure"
        title="Cloud infrastructure"
        lede="See the deployed BluePeak demo, the local simulation hosts, and the separate Terraform architecture work still planned."
      />

      <Panel className="mb-4 border-l-4 border-l-ok">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-2xl tracking-tight">BluePeak AWS demo</h2>
              <StatusPill status="deployed" />
            </div>
            <p className="mt-1 text-sm text-muted">
              EC2 + Docker Compose + private S3 · ap-southeast-2 · HTTPS, health, upload, and list checks passed
            </p>
            <p className="mt-1 text-xs text-faint">
              Fictional portfolio scenario; no real customer data. Terraform did not provision this demo.
            </p>
          </div>
          <a
            href={LIVE_DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-chip bg-spruce px-4 text-sm font-semibold text-sheet hover:bg-spruce-ink"
          >
            Open live HTTPS demo
          </a>
        </div>
      </Panel>

      <Panel className="mb-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Terraform architecture backlog</h2>
            <p className="text-sm text-muted">Multi-AZ landing-zone modules · separate from the live demo</p>
          </div>
          <StatusPill status="planned" />
        </div>
        {modules.length === 0 ? (
          <EmptyNote query={query} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((item) => (
              <article key={item.path} className="rounded-chip border border-line bg-paper p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{item.desc}</p>
                <p className="mt-2 font-mono text-xs text-faint">{item.path}</p>
              </article>
            ))}
          </div>
        )}
        <div className="mt-4 rounded-chip border border-line bg-paper p-3">
          <p className="text-xs text-muted">Reference VPC layout — ACME Technologies (design only)</p>
          <ul className="mt-2 font-mono text-xs leading-6 text-ink-soft">
            {vpcLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">This ACME reference VPC has not been provisioned; the BluePeak demo is a separate EC2 deployment.</p>
        </div>
      </Panel>

      <Panel className="mb-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Local lab</h2>
            <p className="text-sm text-muted">VirtualBox and Docker simulations · Phase 2 in progress</p>
          </div>
          <StatusPill status="in-progress" />
        </div>
        {hosts.length === 0 ? (
          <EmptyNote query={query} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_16rem]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Type</th>
                    <th className="py-2 pr-3 font-medium">Address</th>
                    <th className="py-2 font-medium">Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {hosts.map((host) => {
                    const on = selected?.name === host.name;
                    return (
                      <tr
                        key={host.name}
                        className={cn("cursor-pointer border-b border-line", on ? "bg-spruce-soft" : "hover:bg-paper")}
                        onClick={() => setHostName(host.name)}
                      >
                        <td className="py-3 pr-3 font-mono text-xs">{host.name}</td>
                        <td className="py-3 pr-3 text-xs">{host.type}</td>
                        <td className="py-3 pr-3 font-mono text-xs">{host.ip}</td>
                        <td className="py-3 text-xs text-muted">{host.customer}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selected ? (
              <aside className="rounded-chip border border-line bg-paper p-3">
                <p className="font-mono text-xs text-muted">{selected.name}</p>
                <h3 className="mt-1 text-sm font-medium">{selected.type}</h3>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Address</dt>
                    <dd className="font-mono">{selected.ip}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Customer</dt>
                    <dd className="text-right">{selected.customer}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Status</dt>
                    <dd>
                      <StatusPill status={selected.status} />
                    </dd>
                  </div>
                </dl>
              </aside>
            ) : null}
          </div>
        )}
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {futureClouds.map((item) => (
          <Panel key={item.cloud}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl tracking-tight">{item.cloud}</h2>
                <p className="font-mono text-xs text-muted">
                  {item.region} · {item.phase}
                </p>
              </div>
              <StatusPill status="planned" />
            </div>
            <p className="mt-4 text-sm text-muted">Infrastructure modules planned for {item.phase}.</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
