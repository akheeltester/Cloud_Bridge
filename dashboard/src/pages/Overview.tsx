import {
  Activity,
  ArrowRight,
  Cloud,
  GitMerge,
  Server,
  Shield,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, StatCard } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { phases, platformStats } from '../data/sampleData'

const BASE = '/Cloud_Bridge'

export function Overview() {
  const done = phases.filter((p) => p.status === 'implemented').length
  const inProgress = phases.filter((p) => p.status === 'in-progress').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">CloudBridge Platform</h1>
        <p className="text-slate-400 text-sm mt-1">
          Multi-Cloud Migration, Infrastructure Engineering & Cloud Security Platform
        </p>
      </div>

      <DemoBanner />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Customers"
          value={platformStats.customers}
          sub="Fictional engagements"
          icon={<Users className="w-5 h-5" />}
          accent="blue"
        />
        <StatCard
          label="Cloud Providers"
          value={platformStats.cloudProviders}
          sub="AWS (Azure & GCP planned)"
          icon={<Cloud className="w-5 h-5" />}
          accent="purple"
        />
        <StatCard
          label="Migrations"
          value={platformStats.migrationProjects}
          sub="Active projects"
          icon={<GitMerge className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          label="Phases"
          value={`${done + inProgress}/${platformStats.phasesTotal}`}
          sub={`${done} done · ${inProgress} in progress`}
          icon={<Activity className="w-5 h-5" />}
          accent="orange"
        />
      </div>

      {/* ── Two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Phase progress */}
        <Card>
          <CardHeader title="Implementation Roadmap" icon={<Activity className="w-4 h-4" />} />
          <div className="space-y-3">
            {phases.map((phase) => (
              <div key={phase.number} className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    phase.status === 'implemented'
                      ? 'bg-emerald-900 text-emerald-400'
                      : phase.status === 'in-progress'
                        ? 'bg-sky-900 text-sky-400'
                        : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {phase.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-200 font-medium truncate">{phase.name}</p>
                    <StatusBadge status={phase.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cloud coverage */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Cloud Coverage" icon={<Cloud className="w-4 h-4" />} />
            <div className="space-y-4">
              {[
                { name: 'Amazon Web Services', region: 'ap-southeast-2', pct: 15, color: 'orange' as const, status: 'in-progress' as const },
                { name: 'Microsoft Azure', region: 'australiaeast', pct: 0, color: 'blue' as const, status: 'planned' as const },
                { name: 'Google Cloud Platform', region: 'australia-southeast1', pct: 0, color: 'green' as const, status: 'planned' as const },
              ].map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <p className="text-sm text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.region}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <ProgressBar value={c.pct} color={c.color} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Security Posture" icon={<Shield className="w-4 h-4" />} />
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-amber-400">—</p>
              <p className="text-xs text-slate-500 mt-1">No real scan completed yet</p>
              <p className="text-xs text-slate-600 mt-2">Prowler assessment planned — Phase 5</p>
            </div>
            <Link
              to={`${BASE}/security`}
              className="flex items-center justify-center gap-1 text-xs text-sky-500 hover:text-sky-400 transition-colors mt-2"
            >
              View Security Center <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: `${BASE}/customers`, icon: Users, label: 'Customer Environments', sub: '3 fictional customers' },
          { to: `${BASE}/migration`, icon: GitMerge, label: 'Migration Center', sub: '2 projects in progress' },
          { to: `${BASE}/security`, icon: Shield, label: 'Security Center', sub: 'CSPM + Checkov' },
          { to: `${BASE}/infrastructure`, icon: Server, label: 'Infrastructure', sub: 'AWS Terraform modules' },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to}>
            <Card hover>
              <Icon className="w-5 h-5 text-sky-400 mb-3" />
              <p className="text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
