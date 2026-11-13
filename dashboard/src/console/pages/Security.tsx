import { findings, includesQuery, scanners, type Severity } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, PageIntro, Panel, SeverityPill, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

const filters: Array<"all" | Severity> = ["all", "critical", "high", "medium", "low"];

export function SecurityPage() {
  const query = useConsole((s) => s.query);
  const severity = useConsole((s) => s.severity);
  const setSeverity = useConsole((s) => s.setSeverity);
  const findingId = useConsole((s) => s.findingId);
  const setFindingId = useConsole((s) => s.setFindingId);
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  const visible = findings.filter((item) => {
    const sev = severity === "all" || item.severity === severity;
    return sev && includesQuery(query, [item.id, item.title, item.tool, item.resourceType, item.severity]);
  });
  const selected = visible.find((item) => item.id === findingId) ?? visible[0];

  return (
    <div>
      <PageIntro
        index="05  ·  Security"
        title="Security center"
        lede="Cloud security posture — Prowler, Checkov, and Trivy. The findings below are labelled examples. They are not the output of a completed scan."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Count label="Critical" value={counts.critical} />
        <Count label="High" value={counts.high} />
        <Count label="Medium" value={counts.medium} />
        <Count label="Low" value={counts.low} />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        {scanners.map((scanner) => (
          <Panel key={scanner.tool}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl tracking-tight">{scanner.tool}</h2>
                <p className="text-xs text-muted">{scanner.purpose}</p>
              </div>
              <StatusPill status={scanner.status} />
            </div>
            <p className="mt-3 text-xs text-faint">Planned: {scanner.phase}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {scanner.checks.map((check) => (
                <li key={check} className="rounded-chip border border-line bg-paper px-2 py-1 text-xs text-ink-soft">
                  {check}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Example findings</h2>
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Severity">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSeverity(item)}
                className={cn(
                  "h-9 rounded-chip px-3 text-xs font-medium capitalize",
                  severity === item ? "bg-spruce text-sheet" : "border border-line bg-paper text-ink-soft",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <EmptyNote query={query || severity} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3 font-medium">ID</th>
                    <th className="py-2 pr-3 font-medium">Severity</th>
                    <th className="py-2 pr-3 font-medium">Resource</th>
                    <th className="py-2 font-medium">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const on = item.id === selected?.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setFindingId(item.id)}
                        className={cn("cursor-pointer border-b border-line", on ? "bg-spruce-soft" : "hover:bg-paper")}
                      >
                        <td className="py-3 pr-3 font-mono text-xs">{item.id}</td>
                        <td className="py-3 pr-3">
                          <SeverityPill severity={item.severity} />
                        </td>
                        <td className="py-3 pr-3 text-xs">{item.resourceType}</td>
                        <td className="py-3 text-xs">{item.title}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selected ? (
              <aside className="rounded-chip border border-line bg-paper p-3">
                <p className="font-mono text-xs text-muted">{selected.id}</p>
                <h3 className="mt-2 text-sm font-medium leading-snug">{selected.title}</h3>
                <dl className="mt-3 space-y-2 text-xs">
                  <Row label="Tool" value={selected.tool} />
                  <Row label="Customer" value={selected.customer} />
                  <Row label="Status" value={selected.status} />
                </dl>
                <div className="mt-3">
                  <StatusPill status={selected.dataStatus} />
                </div>
              </aside>
            ) : null}
          </div>
        )}
        <p className="mt-4 rounded-chip border border-line bg-paper p-3 text-xs leading-relaxed text-muted">
          <span className="font-medium text-ink-soft">Remediation policy. </span>
          All Critical and High findings require human review and written approval before any remediation action is
          taken. Automated destructive remediation is never performed.
        </p>
      </Panel>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-panel border border-line bg-sheet px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="capitalize">{value}</dd>
    </div>
  );
}
