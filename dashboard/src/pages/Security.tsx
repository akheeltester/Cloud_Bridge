import { CheckSquare, FileSearch, Shield, TriangleAlert } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { securityFindings } from '../data/sampleData'
import type { Severity } from '../types'

const severityCounts = (findings: typeof securityFindings) => {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  findings.forEach((f) => counts[f.severity]++)
  return counts
}

export function Security() {
  const counts = severityCounts(securityFindings)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Security Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Cloud Security Posture Management — Prowler, Checkov, Trivy
        </p>
      </div>

      <DemoBanner />

      {/* ── Tool Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          {
            tool: 'Prowler',
            purpose: 'AWS configuration assessment',
            phase: 'Phase 5',
            icon: Shield,
            checks: ['IAM', 'Network', 'Storage', 'Logging', 'Encryption'],
            status: 'planned' as const,
          },
          {
            tool: 'Checkov',
            purpose: 'Terraform IaC scanning',
            phase: 'Phase 5 (CI from Phase 1)',
            icon: CheckSquare,
            checks: ['S3 public access', 'SG rules', 'IAM wildcards', 'Encryption', 'Logging'],
            status: 'in-progress' as const,
          },
          {
            tool: 'Trivy',
            purpose: 'Container & config scanning',
            phase: 'Phase 5',
            icon: FileSearch,
            checks: ['Docker images', 'Filesystem', 'IaC configs', 'Secrets'],
            status: 'planned' as const,
          },
        ].map(({ tool, purpose, phase, icon: Icon, checks, status }) => (
          <Card key={tool}>
            <CardHeader
              title={tool}
              subtitle={purpose}
              icon={<Icon className="w-4 h-4" />}
              action={<StatusBadge status={status} />}
            />
            <p className="text-xs text-slate-600 mb-2">Planned: {phase}</p>
            <div className="flex flex-wrap gap-1">
              {checks.map((c) => (
                <span key={c} className="text-xs bg-[#0d1424] border border-[#1e2d45] text-slate-500 px-2 py-0.5 rounded">
                  {c}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Severity summary ── */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(Object.entries(counts) as [Severity, number][]).map(([sev, count]) => {
          const colors: Record<Severity, string> = {
            critical: 'border-red-900 text-red-400',
            high: 'border-orange-900 text-orange-400',
            medium: 'border-amber-900 text-amber-400',
            low: 'border-blue-900 text-blue-400',
            info: 'border-slate-700 text-slate-400',
          }
          return (
            <div key={sev} className={`bg-[#111827] border rounded-xl p-3 text-center ${colors[sev]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs capitalize mt-0.5 opacity-70">{sev}</p>
            </div>
          )
        })}
      </div>

      {/* ── Findings table ── */}
      <Card>
        <CardHeader
          title="Security Findings"
          subtitle="Example findings — will be replaced with real Checkov/Prowler output in Phase 5"
          icon={<TriangleAlert className="w-4 h-4" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-[#1e2d45]">
                <th className="text-left py-2 pr-4">ID</th>
                <th className="text-left py-2 pr-4">Severity</th>
                <th className="text-left py-2 pr-4">Tool</th>
                <th className="text-left py-2 pr-4">Resource</th>
                <th className="text-left py-2 pr-4">Title</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d45]">
              {securityFindings.map((f) => (
                <tr key={f.id} className="hover:bg-[#111827] transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-500">{f.id}</td>
                  <td className="py-3 pr-4"><SeverityBadge severity={f.severity} /></td>
                  <td className="py-3 pr-4 text-xs text-slate-400 uppercase">{f.tool}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{f.resourceType}</td>
                  <td className="py-3 pr-4 text-xs text-slate-300 max-w-xs truncate">{f.title}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      f.status === 'open' ? 'bg-red-950 text-red-400' :
                      f.status === 'resolved' ? 'bg-emerald-950 text-emerald-400' :
                      'bg-amber-950 text-amber-400'
                    }`}>{f.status}</span>
                  </td>
                  <td className="py-3"><StatusBadge status={f.dataStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-[#0a0e1a] rounded-lg border border-[#1e2d45]">
          <p className="text-xs text-slate-600">
            <strong className="text-slate-500">Remediation policy:</strong> All Critical and High findings require
            human review and written approval before any remediation action is taken. Automated destructive
            remediation is never performed.
          </p>
        </div>
      </Card>
    </div>
  )
}
