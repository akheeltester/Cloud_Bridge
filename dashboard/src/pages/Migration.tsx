import { ArrowRight, CheckCircle, Circle, Clock, GitMerge } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { migrationProjects } from '../data/sampleData'
import type { MigrationStage } from '../types'

const stages: { id: MigrationStage; label: string; description: string }[] = [
  { id: 'onboarding', label: 'Onboarding', description: 'Scope, access, timeline' },
  { id: 'discovery', label: 'Discovery', description: 'Asset enumeration' },
  { id: 'assessment', label: 'Assessment', description: 'Readiness + dependencies' },
  { id: 'planning', label: 'Planning', description: 'Sequenced migration plan' },
  { id: 'execution', label: 'Execution', description: 'Provision + migrate' },
  { id: 'validation', label: 'Validation', description: 'Tests + data integrity' },
  { id: 'complete', label: 'Complete', description: 'Report + handoff' },
]

const stageIndex = (s: MigrationStage) => stages.findIndex((x) => x.id === s)

export function Migration() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Migration Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Active migration projects and workflow tracking
        </p>
      </div>

      <DemoBanner />

      {/* ── Active projects ── */}
      <div className="space-y-4 mb-6">
        {migrationProjects.map((proj, idx) => {
          const current = stageIndex(proj.stage)
          return (
            <Card key={proj.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    idx === 0 ? 'bg-sky-950 text-sky-400' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{proj.customer}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <span>{proj.from}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{proj.to}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{proj.services} services</span>
                  <StatusBadge status={proj.dataStatus} />
                </div>
              </div>

              {/* Stage pipeline */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
                {stages.map((stage, i) => {
                  const done = i < current
                  const active = i === current
                  return (
                    <div key={stage.id} className="flex items-center gap-1 min-w-0">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                        done ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        active ? 'bg-sky-900 text-sky-300 border border-sky-700' :
                        'bg-[#0d1424] text-slate-600 border border-[#1e2d45]'
                      }`}>
                        {done ? <CheckCircle className="w-3 h-3" /> :
                         active ? <Clock className="w-3 h-3" /> :
                         <Circle className="w-3 h-3" />}
                        {stage.label}
                      </div>
                      {i < stages.length - 1 && (
                        <ArrowRight className={`w-3 h-3 shrink-0 ${done ? 'text-emerald-700' : 'text-slate-700'}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              <ProgressBar
                value={proj.stagePercent}
                label={`Overall progress — currently: ${proj.stage}`}
                color={idx === 0 ? 'blue' : 'green'}
              />
            </Card>
          )
        })}
      </div>

      {/* ── Workflow reference ── */}
      <Card>
        <CardHeader
          title="Migration Workflow — 10 Stages"
          subtitle="Standard process applied to every engagement"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            { n: 1, title: 'Customer Onboarding', desc: 'Scope, constraints, access requirements' },
            { n: 2, title: 'Infrastructure Discovery', desc: 'OS, services, ports, applications' },
            { n: 3, title: 'Asset Inventory', desc: 'Structured JSON+PostgreSQL inventory' },
            { n: 4, title: 'Dependency Mapping', desc: 'App→DB, auth, storage dependencies' },
            { n: 5, title: 'Readiness Assessment', desc: 'RAG status per component' },
            { n: 6, title: 'Target Architecture', desc: 'Cloud design + Terraform plan' },
            { n: 7, title: 'Migration Planning', desc: 'Sequence, maintenance window, rollback' },
            { n: 8, title: 'Migration Execution', desc: 'Provision → configure → transfer' },
            { n: 9, title: 'Validation & Testing', desc: 'Health checks, data integrity, performance' },
            { n: 10, title: 'Rollback & Completion', desc: 'Rollback doc + final report' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-3 p-3 bg-[#0d1424] rounded-lg border border-[#1e2d45]">
              <div className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                {n}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <StatusBadge status="planned" />
          <span className="text-xs text-slate-600">Full workflow implementation — Phase 4</span>
        </div>
      </Card>
    </div>
  )
}
