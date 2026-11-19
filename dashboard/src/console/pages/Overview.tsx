import { Link } from "react-router-dom";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  clouds,
  deployments,
  findings,
  includesQuery,
  milestones,
  phaseProgress,
  phases,
  scanStats,
  scanners,
  type Severity,
} from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, Meter, PageIntro, Panel, SeverityPill, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

const severityOrder: Severity[] = ["critical", "high", "medium", "low"];

export function OverviewPage() {
  const query = useConsole((s) => s.query);
  const phase = useConsole((s) => s.phase);
  const setPhase = useConsole((s) => s.setPhase);
  const visible = phases.filter((item) => includesQuery(query, [item.name, item.description, item.status]));
  const selected = phases.find((item) => item.number === phase) ?? visible[0] ?? phases[0];
  const counts = { high: 0, medium: 0, low: 0, critical: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  const fixedFindings = findings.filter((f) => f.status === "fixed").length;

  const progressData = phases.map((p) => ({
    name: `P${p.number} ${p.name}`,
    pct: phaseProgress(p.status),
    status: p.status,
  }));

  return (
    <div>
      <PageIntro
        index="Overview"
        title="CloudBridge — multi-cloud engineering lab"
        lede="Three fictional companies, three real cloud deployments, one control plane. This dashboard tracks the roadmap, the live estate, and the security posture — every status below reflects verified work, not projections."
      />

      {/* ── About / core of the project ── */}
      <Panel className="mb-3">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img
            src={`${import.meta.env.BASE_URL}cloud-bridge-logo.svg`}
            alt="Cloud-Bridge logo"
            className="w-24 shrink-0 rounded-panel"
            width="300"
            height="300"
          />
          <div>
            <h2 className="text-base font-semibold">What CloudBridge is</h2>
            <p className="mt-1 font-semibold text-spruce-ink">
              A repeatable playbook for deploying and managing cloud assets — securely, on a budget.
            </p>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-ink-soft">
              CloudBridge simulates a cloud consultancy running three customer engagements end-to-end:
              containerize a workload, provision it with Terraform, ship it through CI/CD, scan it with
              Checkov/Trivy/Prowler, remediate what matters, and monitor it from a single dashboard.
              It demonstrates the full lifecycle a real team follows — and every pattern
              here (plan-first IaC, free-tier hosting, automatic HTTPS, secret-scanned CI, evidence-based
              security reporting) is directly reusable for deploying and managing your own cloud assets.
            </p>
          </div>
        </div>
      </Panel>

      {/* ── Live deployments ── */}
      <Panel className="mb-3">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">Live deployments · 3 of 3 verified</h2>
          <Link to="/customers" className="text-sm font-semibold text-spruce">
            Customer details
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {deployments.map((d) => (
            <article key={d.url} className="flex flex-col rounded-chip border border-line bg-paper p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{d.brand}</p>
                  <p className="text-xs text-muted">{d.customer}</p>
                </div>
                <StatusPill status="deployed" />
              </div>
              <p className="mt-2 font-mono text-xs text-muted">
                {d.cloud} · {d.region}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {d.stack.map((s) => (
                  <li key={s} className="text-xs text-ink-soft">
                    · {s}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-faint">{d.checks}</p>
              <p className="mt-1 text-xs text-faint">Cost: {d.cost}</p>
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-9 items-center justify-center rounded-chip bg-spruce px-3 text-xs font-semibold text-sheet hover:bg-spruce-ink"
              >
                Open live demo ↗
              </a>
            </article>
          ))}
        </div>
      </Panel>

      {/* ── Roadmap progress chart + milestone timeline ── */}
      <div className="mb-3 grid gap-3 xl:grid-cols-2">
        <Panel>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Roadmap progress</h2>
            <span className="text-xs text-muted">completion by phase</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 11, fill: "var(--color-ink-soft)" }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, "Completion"]} cursor={{ fill: "var(--color-paper)" }} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={14}>
                  {progressData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.pct === 100 ? "var(--color-ok)" : entry.pct >= 50 ? "var(--color-spruce)" : "var(--color-line-strong)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-faint">
            Green = implemented/deployed · blue = in progress · grey = planned. Phase 6 (SOC) starts next.
          </p>
        </Panel>
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Delivery timeline</h2>
            <span className="text-xs text-muted">what shipped, when</span>
          </div>
          <ol className="relative ml-2 flex flex-col gap-3 border-l border-line pl-4">
            {milestones.map((m) => (
              <li key={m.title} className="relative">
                <span
                  className={cn(
                    "absolute -left-[1.42rem] top-1 size-2.5 rounded-full border-2 border-sheet",
                    m.done ? "bg-ok" : "bg-line-strong",
                  )}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-chip bg-paper px-1.5 py-0.5 font-mono text-[10px] text-muted">{m.date}</span>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <span className="font-mono text-[10px] text-faint">phase {m.phase}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{m.detail}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* ── Security posture (real scan output) ── */}
      <Panel className="mb-3">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">Security posture · real scan results</h2>
          <Link to="/security" className="text-sm font-semibold text-spruce">
            Full findings
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="grid gap-3 sm:grid-cols-3">
            <BeforeAfter label="Checkov IaC findings" before={scanStats.checkov.before} after={scanStats.checkov.after} note="6 remediated in IaC + applied" />
            <BeforeAfter label="Image critical CVEs" before={scanStats.imageCriticals.before} after={scanStats.imageCriticals.after} note="base images rebuilt + redeployed" />
            <div className="rounded-chip border border-line bg-paper p-3">
              <p className="text-xs text-muted">Prowler GCP</p>
              <p className="mt-1 font-display text-2xl tabular-nums">
                {scanStats.prowler.criticalsFixed}/{scanStats.prowler.criticals}
              </p>
              <p className="text-xs text-faint">criticals fixed · {scanStats.prowler.checks} checks run</p>
              <div className="mt-2">
                <Meter value={(scanStats.prowler.criticalsFixed / scanStats.prowler.criticals) * 100} />
              </div>
              <p className="mt-2 text-xs text-faint">internet-wide SSH/RDP removed</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">Tracked findings by severity</p>
            <ul className="flex flex-col gap-2">
              {severityOrder.map((severity) => (
                <li key={severity} className="flex items-center justify-between gap-2 text-sm">
                  <SeverityPill severity={severity} />
                  <span className="font-semibold tabular-nums">{counts[severity]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-faint">{fixedFindings} already fixed · rest accepted-risk or deferred with rationale</p>
          </div>
        </div>
      </Panel>

      {/* ── Cloud estate + scanners ── */}
      <div className="mb-3 grid gap-3 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Cloud estate</h2>
            <Link to="/infrastructure" className="text-sm font-semibold text-spruce">
              Action log
            </Link>
          </div>
          <ul className="flex flex-col">
            {clouds.map((cloud) => (
              <li key={cloud.name} className="border-t border-line py-3 first:border-t-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{cloud.name}</p>
                    <p className="font-mono text-xs text-muted">{cloud.region}</p>
                  </div>
                  <StatusPill status={cloud.status} />
                </div>
                <p className="mt-1 text-xs text-faint">{cloud.note}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Security toolchain</h2>
            <Link to="/automation" className="text-sm font-semibold text-spruce">
              How each is used
            </Link>
          </div>
          <ul className="flex flex-col">
            {scanners.map((scanner) => (
              <li key={scanner.tool} className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
                <div>
                  <p className="text-sm font-semibold">{scanner.tool}</p>
                  <p className="text-xs text-muted">{scanner.purpose}</p>
                </div>
                <StatusPill status={scanner.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ── Findings table ── */}
      <Panel className="mb-3">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Findings register</h2>
          <span className="text-xs text-muted">Checkov · Trivy · Prowler output</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-semibold">Severity</th>
                <th className="py-2 pr-3 font-semibold">Finding</th>
                <th className="py-2 pr-3 font-semibold">Tool</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((item) => (
                <tr key={item.id} className="border-b border-line">
                  <td className="py-2.5 pr-3">
                    <SeverityPill severity={item.severity} />
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="font-mono text-xs text-muted">{item.id}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-xs uppercase">{item.tool}</td>
                  <td className="py-2.5 capitalize">{item.status.replace(/-/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── Interactive roadmap ── */}
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_18rem]">
        <Panel>
          <h2 className="text-base font-semibold">Implementation roadmap</h2>
          {visible.length === 0 ? (
            <div className="mt-3">
              <EmptyNote query={query} />
            </div>
          ) : (
            <ul className="mt-2">
              {visible.map((item) => {
                const on = item.number === selected?.number;
                return (
                  <li key={item.number}>
                    <button
                      type="button"
                      onClick={() => setPhase(item.number)}
                      className={cn(
                        "flex w-full items-center gap-3 border-l-2 px-3 py-2 text-left",
                        on ? "border-spruce bg-spruce-soft" : "border-transparent hover:bg-paper",
                      )}
                    >
                      <span className="w-5 font-mono text-xs text-muted">{item.number}</span>
                      <span className="min-w-0 flex-1 text-sm">{item.name}</span>
                      <StatusPill status={item.status} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
        {selected ? (
          <Panel>
            <p className="text-xs text-muted">Phase {selected.number}</p>
            <h2 className="mt-1 text-base font-semibold">{selected.name}</h2>
            <div className="mt-2">
              <StatusPill status={selected.status} />
            </div>
            <p className="mt-3 text-sm text-ink-soft">{selected.description}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {selected.deliverables.map((item) => (
                <li key={item} className="border-t border-line pt-1">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function BeforeAfter({ label, before, after, note }: { label: string; before: number; after: number; note: string }) {
  const pct = before === 0 ? 0 : Math.round(((before - after) / before) * 100);
  return (
    <div className="rounded-chip border border-line bg-paper p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">
        {before} <span className="text-base text-faint">→</span> {after}
      </p>
      <p className="text-xs text-faint">{note}</p>
      <div className="mt-2">
        <Meter value={pct} />
      </div>
      <p className="mt-2 text-xs text-faint">{pct}% reduced</p>
    </div>
  );
}
