import { useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { detectionRules, includesQuery, splunkViews, wazuhItems, type Severity } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, SeverityPill, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

interface SocAgent {
  id: string;
  name: string;
  status: string;
  version: string;
  group: string;
}
interface SocAlert {
  timestamp: string;
  agent: string;
  rule_id: string;
  level: number;
  severity: Severity;
  description: string;
  groups: string[];
  srcip: string | null;
  location: string;
}
interface SocData {
  generated_at: string;
  window: string;
  manager: { name: string; version: string; transport: string };
  agents: SocAgent[];
  summary: {
    total_alerts_24h: number;
    sampled: number;
    by_level: Record<string, number>;
    by_agent: Record<string, number>;
    top_rules: { rule_id: string; description: string; level: number; count: number }[];
  };
  alerts: SocAlert[];
}

const sevColor: Record<string, string> = {
  critical: "var(--color-danger)",
  high: "var(--color-warn)",
  medium: "var(--color-spruce)",
  low: "var(--color-line-strong)",
};

export function SocPage() {
  const query = useConsole((s) => s.query);
  const acks = useConsole((s) => s.acks);
  const acknowledge = useConsole((s) => s.acknowledge);
  const [data, setData] = useState<SocData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}soc-data.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  const alerts = (data?.alerts ?? []).filter((a) =>
    includesQuery(query, [a.rule_id, a.description, a.agent, a.severity]),
  );
  const selected = alerts.find((a) => `${a.rule_id}-${a.timestamp}` === selectedId) ?? alerts[0];
  const activeAgents = data?.agents.filter((a) => a.status === "active").length ?? 0;
  const highPlus = (data?.summary.by_level.high ?? 0) + (data?.summary.by_level.critical ?? 0);
  const levelData = (["critical", "high", "medium", "low"] as const).map((sev) => ({
    sev,
    count: data?.summary.by_level[sev] ?? 0,
  }));

  return (
    <div>
      <PageIntro
        index="06  ·  SOC"
        title="SOC center"
        lede="Real Wazuh 4.14.6 telemetry from both cloud deployments, collected over a private Tailscale mesh. Alerts below are genuine manager output (sanitized: source IPs masked, raw logs stripped), synced as a snapshot — this static site refreshes when the sync script runs."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Agents active" value={data ? `${activeAgents}/${data.agents.length}` : "…"} />
        <Stat label="Alerts · 24h" value={data ? String(data.summary.total_alerts_24h) : "…"} />
        <Stat label="High + critical" value={data ? String(highPlus) : "…"} />
        <Stat
          label="Last sync"
          value={data ? new Date(data.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "…"}
        />
      </div>

      {error ? (
        <Panel className="mb-4">
          <p className="text-sm text-danger">Could not load soc-data.json ({error}). Run scripts/soc/sync-wazuh-soc.py and redeploy.</p>
        </Panel>
      ) : null}

      {/* ── Agents + severity chart ── */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Monitored estate</h2>
              <p className="text-xs text-muted">{data?.manager.transport ?? "Tailscale mesh"} · {data?.manager.version ?? "Wazuh"}</p>
            </div>
            <StatusPill status="implemented" />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {(data?.agents ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-chip border border-line bg-paper px-3 py-2">
                <div>
                  <p className="font-mono text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted">ID {a.id} · {a.version || "manager"} · group {a.group}</p>
                </div>
                <span className={cn("rounded-chip px-2 py-0.5 text-xs font-semibold", a.status === "active" ? "bg-ok-soft text-ok" : "bg-paper text-muted")}>
                  {a.status}
                </span>
              </li>
            ))}
            {!data && !error ? <li className="text-sm text-muted">Loading agent status…</li> : null}
          </ul>
        </Panel>
        <Panel>
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="font-display text-2xl tracking-tight">Alert severity · 24h</h2>
            <span className="text-xs text-muted">{data ? `${data.summary.sampled} sampled` : ""}</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <XAxis dataKey="sev" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--color-paper)" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={42}>
                  {levelData.map((entry) => (
                    <Cell key={entry.sev} fill={sevColor[entry.sev]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 border-t border-line pt-2">
            <p className="mb-1 text-xs font-semibold text-muted">Top rules</p>
            <ul className="flex flex-col gap-1">
              {(data?.summary.top_rules ?? []).slice(0, 4).map((r) => (
                <li key={r.rule_id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-ink-soft">
                    <span className="font-mono text-faint">{r.rule_id}</span> {r.description}
                  </span>
                  <span className="font-semibold tabular-nums">{r.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* ── Real alert feed ── */}
      <Panel className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Alert feed</h2>
            <p className="mt-1 text-xs text-muted">
              Genuine Wazuh alerts, newest first. Acknowledging marks it in this browser only — it does not write back to Wazuh.
            </p>
          </div>
          <StatusPill status="implemented" />
        </div>
        {alerts.length === 0 ? (
          <div className="mt-4">
            <EmptyNote query={query} />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {alerts.slice(0, 40).map((a) => {
              const id = `${a.rule_id}-${a.timestamp}`;
              const acked = Boolean(acks[id]);
              const on = id === (selected ? `${selected.rule_id}-${selected.timestamp}` : "");
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(id)}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-chip border px-3 py-2 text-left sm:flex-row sm:items-center sm:justify-between",
                      on ? "border-spruce bg-spruce-soft" : "border-line bg-paper",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <SeverityPill severity={a.severity} />
                        <span className="font-mono text-xs text-muted">rule {a.rule_id} · lvl {a.level}</span>
                        <span className="font-mono text-xs text-faint">{a.agent}</span>
                      </span>
                      <span className="mt-1 block truncate text-sm">{a.description}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {new Date(a.timestamp).toLocaleString()}
                        {a.srcip ? ` · src ${a.srcip}` : ""}
                        {a.location ? ` · ${a.location}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs capitalize text-ink-soft">{acked ? "Acknowledged" : "new"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {selected && !acks[`${selected.rule_id}-${selected.timestamp}`] ? (
          <button
            type="button"
            onClick={() => acknowledge(`${selected.rule_id}-${selected.timestamp}`)}
            className="mt-4 h-8 rounded-chip bg-spruce px-3 text-sm font-semibold text-sheet"
          >
            Acknowledge rule {selected.rule_id} alert
          </button>
        ) : null}
      </Panel>

      {/* ── Wazuh + Splunk status ── */}
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Wazuh SIEM</h2>
              <p className="text-xs text-muted">Endpoint monitoring, log aggregation, detection</p>
            </div>
            <StatusPill status="implemented" />
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {wazuhItems.map((item) => (
              <li key={item.label} className="flex items-start justify-between gap-3 border-t border-line pt-3">
                <div>
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-muted">{item.detail}</p>
                </div>
                <StatusPill status={item.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Splunk Free</h2>
              <p className="text-xs text-muted">Security dashboards and alerting — 500 MB/day limit</p>
            </div>
            <StatusPill status="planned" />
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {splunkViews.map((view) => (
              <li key={view} className="text-sm text-ink-soft">
                {view}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Deferred — Wazuh covers the SOC scope on current hardware.</p>
        </Panel>
      </div>

      <Panel>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-2xl tracking-tight">Detection coverage</h2>
          <StatusPill status="implemented" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detectionRules.map((rule) => (
            <article key={rule.category} className="rounded-chip border border-line bg-paper p-3">
              <h3 className="text-sm font-medium">{rule.category}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{rule.rules}</p>
              <p className="mt-2 text-xs font-medium text-spruce-ink">{rule.phase}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-line bg-sheet px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}
