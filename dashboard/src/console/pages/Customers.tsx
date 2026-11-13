import { customers, includesQuery, migrationStages } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, Meter, PageIntro, Panel, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

export function CustomersPage() {
  const query = useConsole((s) => s.query);
  const customerId = useConsole((s) => s.customerId);
  const setCustomerId = useConsole((s) => s.setCustomerId);
  const visible = customers.filter((item) =>
    includesQuery(query, [item.name, item.industry, item.scenario, item.sourceCloud, item.targetCloud, item.summary]),
  );
  const selected = visible.find((item) => item.id === customerId) ?? visible[0];
  const stageIndex = Math.max(0, migrationStages.findIndex((stage) => stage.id === selected?.status));
  const stagePct = Math.round((stageIndex / (migrationStages.length - 1)) * 100);

  return (
    <div>
      <PageIntro
        index="03  ·  Customers"
        title="Customer environments"
        lede="Three fictional engagements. Every name, address, and asset on this page is simulated for the portfolio."
      />
      {visible.length === 0 ? (
        <EmptyNote query={query} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            {visible.map((item) => {
              const on = item.id === selected?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCustomerId(item.id)}
                  className={cn(
                    "rounded-panel border px-3 py-3 text-left",
                    on ? "border-spruce bg-spruce-soft" : "border-line bg-sheet hover:bg-paper",
                  )}
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-muted">{item.industry}</p>
                </button>
              );
            })}
          </div>
          {selected ? (
            <Panel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl tracking-tight">{selected.name}</h2>
                  <p className="mt-1 text-sm text-muted">{selected.industry}</p>
                </div>
                <StatusPill status={selected.dataStatus} />
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{selected.summary}</p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Fact label="Scenario" value={selected.scenario} />
                <Fact label="Stage" value={selected.status} />
                <Fact label="Source" value={selected.sourceCloud} />
                <Fact label="Target" value={selected.targetCloud} />
              </dl>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-muted">
                  <span>Migration stage: {selected.status}</span>
                  <span className="tabular-nums">{stagePct}%</span>
                </div>
                <Meter value={stagePct} />
              </div>
              <h3 className="mt-6 text-sm font-medium">Known assets · {selected.assetCount} in scope</h3>
              {selected.assets.length === 0 ? (
                <p className="mt-2 text-sm text-muted">{selected.network}</p>
              ) : (
                <>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selected.assets.map((asset) => (
                      <article key={asset.name} className="rounded-chip border border-line bg-paper p-3">
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="mt-1 text-xs text-muted">{asset.spec}</p>
                        <p className="mt-2 font-mono text-xs">{asset.ip}</p>
                        <p className="mt-1 text-xs text-faint">{asset.role}</p>
                      </article>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted">{selected.network}</p>
                </>
              )}
            </Panel>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-chip border border-line bg-paper px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
