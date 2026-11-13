import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  clouds,
  findings,
  includesQuery,
  phases,
  scanners,
  type Severity,
} from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, SeverityPill, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

const ranges = ["Last 24 hours", "Last 7 days", "Last 30 days"] as const;

const trend: Record<(typeof ranges)[number], { t: string; n: number }[]> = {
  "Last 24 hours": [
    { t: "00:00", n: 0 },
    { t: "04:00", n: 1 },
    { t: "08:00", n: 2 },
    { t: "12:00", n: 1 },
    { t: "16:00", n: 2 },
    { t: "20:00", n: 1 },
  ],
  "Last 7 days": [
    { t: "Wed", n: 1 },
    { t: "Thu", n: 0 },
    { t: "Fri", n: 2 },
    { t: "Sat", n: 1 },
    { t: "Sun", n: 0 },
    { t: "Mon", n: 2 },
    { t: "Tue", n: 1 },
  ],
  "Last 30 days": [
    { t: "W1", n: 1 },
    { t: "W2", n: 2 },
    { t: "W3", n: 1 },
    { t: "W4", n: 3 },
  ],
};

const severityOrder: Severity[] = ["high", "medium", "low"];

export function OverviewPage() {
  const query = useConsole((s) => s.query);
  const phase = useConsole((s) => s.phase);
  const setPhase = useConsole((s) => s.setPhase);
  const [range, setRange] = useState<(typeof ranges)[number]>("Last 24 hours");
  const [refreshed, setRefreshed] = useState("Portfolio sample");
  const visible = phases.filter((item) => includesQuery(query, [item.name, item.description, item.status]));
  const selected = phases.find((item) => item.number === phase) ?? visible[0] ?? phases[0];
  const openFindings = findings.filter((item) => item.status === "open").length;
  const activePhases = phases.filter((item) => item.status === "in-progress").length;
  const closedPhases = phases.filter((item) => item.status === "implemented" || item.status === "deployed").length;
  const counts = { high: 0, medium: 0, low: 0, critical: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <PageIntro
          index="Overview"
          title="Overview"
          lede="A guided view of the project roadmap, migration rehearsal, AWS demo, and engineering work. The sample security metrics are illustrative—not live monitoring data."
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="time-range">
            Time range
          </label>
          <select
            id="time-range"
            value={range}
            onChange={(event) => setRange(event.target.value as (typeof ranges)[number])}
            className="h-8 rounded-chip border border-line bg-sheet px-2 text-sm text-ink"
          >
            {ranges.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            type="button"
            className="h-8 rounded-chip bg-spruce px-3 text-sm font-semibold text-sheet"
            onClick={() => setRefreshed(new Date().toLocaleTimeString())}
          >
            Refresh
          </button>
          <span className="text-xs text-muted">Updated {refreshed}</span>
        </div>
      </div>

      <Panel className="mb-3">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">Incidents</h2>
          <Link to="/security" className="text-sm font-semibold text-spruce">
            View all
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)_14rem]">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <Count label="New" value={openFindings} hint="Open example findings" />
            <Count label="Active" value={activePhases} hint="Phases in progress" />
            <Count label="Closed" value={closedPhases} hint="Phases implemented" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-xs text-muted">Illustrative sample trend · {range}</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend[range]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} width={24} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="n" name="Sample" stroke="var(--color-spruce)" fill="var(--color-spruce-soft)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-faint">Illustrative series for layout only. Not workspace telemetry.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-muted">By severity</p>
            <ul className="flex flex-col gap-2">
              {severityOrder.map((severity) => (
                <li key={severity} className="flex items-center justify-between gap-2 text-sm">
                  <SeverityPill severity={severity} />
                  <span className="font-semibold tabular-nums">{counts[severity]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <div className="mb-3 grid gap-3 lg:grid-cols-2">
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Data connectors</h2>
            <Link to="/infrastructure" className="text-sm font-semibold text-spruce">
              Manage
            </Link>
          </div>
          <ul className="flex flex-col">
            {clouds.map((cloud) => (
              <li key={cloud.name} className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
                <div>
                  <p className="text-sm font-semibold">{cloud.name}</p>
                  <p className="font-mono text-xs text-muted">{cloud.region}</p>
                </div>
                <StatusPill status={cloud.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold">Analytics rules</h2>
            <Link to="/security" className="text-sm font-semibold text-spruce">
              View rules
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

      <Panel className="mb-3">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-semibold">Recent incidents</h2>
          <span className="text-xs text-muted">Example findings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-semibold">Severity</th>
                <th className="py-2 pr-3 font-semibold">Incident</th>
                <th className="py-2 pr-3 font-semibold">Product</th>
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
                  <td className="py-2.5 capitalize">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

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

function Count({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-chip bg-paper px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-faint">{hint}</p>
    </div>
  );
}
