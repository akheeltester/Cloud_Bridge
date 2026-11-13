import { useState } from "react";
import { includesQuery, migrationStages, migrations, workflowSteps } from "../lib/cloudbridge/data";
import { useConsole } from "../lib/cloudbridge/store";
import { EmptyNote, Meter, PageIntro, Panel, StatusPill } from "../components/bits";
import { cn } from "../lib/cn";

export function MigrationPage() {
  const query = useConsole((s) => s.query);
  const migrationId = useConsole((s) => s.migrationId);
  const setMigrationId = useConsole((s) => s.setMigrationId);
  const [step, setStep] = useState(1);
  const visible = migrations.filter((item) => includesQuery(query, [item.customer, item.from, item.to, item.stage, item.id]));
  const selected = visible.find((item) => item.id === migrationId) ?? visible[0];
  const stageIndex = migrationStages.findIndex((stage) => stage.id === selected?.stage);
  const activeStep = workflowSteps.find((item) => item.n === step) ?? workflowSteps[0];

  return (
    <div>
      <PageIntro
        index="04  ·  Migration"
        title="Migration roadmap & execution"
        lede="BluePeak's fictional portfolio scenario has reached validation: the app is deployed on EC2, stores uploads in S3, and passed public HTTPS and API smoke checks. This is not a production customer-data migration."
      />

      {visible.length === 0 ? (
        <EmptyNote query={query} />
      ) : (
        <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex flex-col gap-3">
            {visible.map((item) => {
              const on = item.id === selected?.id;
              const index = migrationStages.findIndex((stage) => stage.id === item.stage);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMigrationId(item.id)}
                  className={cn(
                    "rounded-panel border p-4 text-left",
                    on ? "border-spruce bg-sheet" : "border-line bg-sheet hover:bg-paper",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-2xl tracking-tight">{item.customer}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.from} → {item.to}
                      </p>
                    </div>
                    <StatusPill status={item.dataStatus} />
                  </div>
                  <div className="mt-4 flex gap-1" aria-hidden="true">
                    {migrationStages.map((stage, i) => (
                      <span key={stage.id} className={cn("h-1.5 flex-1 rounded-full", i <= index ? "bg-spruce" : "bg-line")} />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span className="capitalize">{item.stage}</span>
                    <span className="tabular-nums">{item.services} services · {item.stagePercent}%</span>
                  </div>
                </button>
              );
            })}
          </div>
          {selected ? (
            <Panel>
              <p className="text-xs text-muted">{selected.id}</p>
              <h2 className="mt-1 font-display text-2xl tracking-tight">Stage rail</h2>
              <ol className="mt-4 flex flex-col gap-2">
                {migrationStages.map((stage, index) => {
                  const state = index < stageIndex ? "done" : index === stageIndex ? "now" : "later";
                  return (
                    <li key={stage.id} className="flex items-start gap-2 text-sm">
                      <span
                        className={cn(
                          "mt-1 size-2 shrink-0 rounded-full",
                          state === "later" ? "bg-line-strong" : "bg-spruce",
                        )}
                        aria-hidden="true"
                      />
                      <span>
                        <span className={cn("block", state === "now" ? "font-medium text-ink" : "text-muted")}>{stage.label}</span>
                        <span className="text-xs text-faint">{stage.description}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4">
                <Meter value={selected.stagePercent} />
                <p className="mt-2 text-xs text-muted">Milestone estimate for this demo scenario, not a production migration completion percentage.</p>
              </div>
            </Panel>
          ) : null}
        </div>
      )}

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Workflow — 10 stages</h2>
            <p className="text-sm text-muted">Standard process applied to every engagement</p>
          </div>
          <StatusPill status="planned" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {workflowSteps.map((item) => {
            const on = item.n === activeStep.n;
            return (
              <button
                key={item.n}
                type="button"
                onClick={() => setStep(item.n)}
                className={cn(
                  "flex min-h-11 items-start gap-3 rounded-chip border px-3 py-3 text-left",
                  on ? "border-spruce bg-spruce-soft" : "border-line bg-paper",
                )}
              >
                <span className="font-mono text-xs text-muted">{String(item.n).padStart(2, "0")}</span>
                <span>
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Reading stage {activeStep.n}: {activeStep.title}. The workflow is a roadmap; production runbooks and real-data migration remain planned.
        </p>
      </Panel>
    </div>
  );
}
