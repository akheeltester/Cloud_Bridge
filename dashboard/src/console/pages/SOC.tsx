import { alerts, customers, detectionRules, includesQuery, splunkViews, wazuhItems } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, SeverityPill, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

export function SocPage() {
  const query = useConsole((s) => s.query);
  const alertId = useConsole((s) => s.alertId);
  const setAlertId = useConsole((s) => s.setAlertId);
  const acks = useConsole((s) => s.acks);
  const acknowledge = useConsole((s) => s.acknowledge);
  const visible = alerts.filter((item) => includesQuery(query, [item.id, item.title, item.source, item.customer, item.severity]));
  const selected = visible.find((item) => item.id === alertId) ?? visible[0];
  const open = alerts.filter((item) => item.status === "open" && !acks[item.id]).length;
  const investigating = alerts.filter((item) => (item.status === "investigating" || acks[item.id]) && !acks[item.id]).length;
  const acknowledged = Object.keys(acks).length;

  return (
    <div>
      <PageIntro
        index="06  ·  SOC"
        title="SOC center"
        lede="Security operations — Wazuh, Splunk, detection rules, and incident response. Example alerts stand in until Phase 6 produces real Wazuh output."
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Open" value={open} />
        <Stat label="Investigating" value={investigating} />
        <Stat label="Acknowledged here" value={acknowledged} />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Wazuh SIEM</h2>
              <p className="text-xs text-muted">Endpoint monitoring, log aggregation, detection</p>
            </div>
            <StatusPill status="planned" />
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
          <p className="mt-4 text-xs text-muted">Wazuh deployment — Phase 6.</p>
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
          <p className="mt-4 text-xs text-muted">Hardware availability review required before Phase 6.</p>
        </Panel>
      </div>

      <Panel className="mb-4">
        <h2 className="font-display text-2xl tracking-tight">Security alerts</h2>
        <p className="mt-1 text-xs text-muted">
          Example alerts. Acknowledging one only marks it in this browser — it does not update Wazuh.
        </p>
        {visible.length === 0 ? (
          <div className="mt-4">
            <EmptyNote query={query} />
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {visible.map((item) => {
              const acked = Boolean(acks[item.id]);
              const on = item.id === selected?.id;
              const customer = customers.find((entry) => entry.id === item.customer)?.name ?? item.customer;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setAlertId(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-3 rounded-chip border px-3 py-3 text-left sm:flex-row sm:items-center sm:justify-between",
                      on ? "border-spruce bg-spruce-soft" : "border-line bg-paper",
                    )}
                  >
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <SeverityPill severity={item.severity} />
                        <span className="font-mono text-xs text-muted">{item.id}</span>
                      </span>
                      <span className="mt-1 block text-sm">{item.title}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {item.source} · {customer} · {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </span>
                    <span className="text-xs capitalize text-ink-soft">{acked ? "Acknowledged" : item.status}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {selected && !acks[selected.id] ? (
          <button
            type="button"
            onClick={() => acknowledge(selected.id)}
            className="mt-4 h-8 rounded-chip bg-spruce px-3 text-sm font-semibold text-sheet"
          >
            Acknowledge {selected.id}
          </button>
        ) : null}
      </Panel>

      <Panel>
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-2xl tracking-tight">Detection rule categories</h2>
          <StatusPill status="planned" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detectionRules.map((rule) => (
            <article key={rule.category} className="rounded-chip border border-line bg-paper p-3">
              <h3 className="text-sm font-medium">{rule.category}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">{rule.rules}</p>
              <p className="mt-2 text-xs text-faint">{rule.phase}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-panel border border-line bg-sheet px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}
