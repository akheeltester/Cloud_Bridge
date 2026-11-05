import { Activity, AlertOctagon, Eye, Radio } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { SeverityBadge, StatusBadge } from '../components/StatusBadge'
import { socAlerts } from '../data/sampleData'

export function SOC() {
  const open = socAlerts.filter((a) => a.status === 'open').length
  const investigating = socAlerts.filter((a) => a.status === 'investigating').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">SOC Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Security Operations — Wazuh, Splunk, detection rules and incident response
        </p>
      </div>

      <DemoBanner />

      {/* ── Tool deployment status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader
            title="Wazuh SIEM"
            subtitle="Endpoint monitoring, log aggregation, detection"
            icon={<Radio className="w-4 h-4" />}
            action={<StatusBadge status="planned" />}
          />
          <div className="space-y-3 text-sm">
            {[
              { label: 'Wazuh Manager VM', detail: 'Ubuntu Server — local VirtualBox', status: 'planned' as const },
              { label: 'Agent — customer-a-appserver', detail: 'Monitors auth.log, syslog, FIM', status: 'planned' as const },
              { label: 'Agent — customer-a-database', detail: 'Monitors PG logs, auth.log', status: 'planned' as const },
              { label: 'AWS CloudTrail ingestion', detail: 'Wazuh AWS module — Phase 6', status: 'planned' as const },
            ].map(({ label, detail, status }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{detail}</p>
                </div>
                <StatusBadge status={status} />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center py-4 bg-[#0a0e1a] rounded-lg">
            <Radio className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-xs text-slate-600">Wazuh deployment — Phase 6</p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Splunk Free"
            subtitle="Security dashboards and alerting — 500 MB/day limit"
            icon={<Activity className="w-4 h-4" />}
            action={<StatusBadge status="planned" />}
          />
          <div className="space-y-2">
            {[
              'Authentication dashboard',
              'Network event monitoring',
              'Cloud event ingestion',
              'Alert classification',
              'Incident investigation',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center py-4 bg-[#0a0e1a] rounded-lg">
            <p className="text-xs text-slate-600">Hardware availability review required before Phase 6</p>
          </div>
        </Card>
      </div>

      {/* ── Alert examples ── */}
      <Card className="mb-4">
        <CardHeader
          title="Security Alerts"
          subtitle="Example alerts — will be replaced with real Wazuh output in Phase 6"
          icon={<AlertOctagon className="w-4 h-4" />}
        />
        <div className="space-y-2">
          {socAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between p-3 bg-[#0d1424] border border-[#1e2d45] rounded-lg">
              <div className="flex items-start gap-3">
                <SeverityBadge severity={alert.severity} />
                <div>
                  <p className="text-sm text-slate-200">{alert.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {alert.source} · {alert.customer} · {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  alert.status === 'open' ? 'bg-red-950 text-red-400' :
                  alert.status === 'investigating' ? 'bg-amber-950 text-amber-400' :
                  'bg-emerald-950 text-emerald-400'
                }`}>{alert.status}</span>
                <StatusBadge status={alert.dataStatus} />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="bg-[#0a0e1a] rounded-lg p-3">
            <p className="text-2xl font-bold text-red-400">{open}</p>
            <p className="text-xs text-slate-500">Open</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3">
            <p className="text-2xl font-bold text-amber-400">{investigating}</p>
            <p className="text-xs text-slate-500">Investigating</p>
          </div>
          <div className="bg-[#0a0e1a] rounded-lg p-3">
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="text-xs text-slate-500">Resolved</p>
          </div>
        </div>
      </Card>

      {/* ── Detection categories ── */}
      <Card>
        <CardHeader title="Detection Rule Categories" icon={<Eye className="w-4 h-4" />} action={<StatusBadge status="planned" />} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { category: 'Authentication', rules: 'Brute force, failed SSH, privilege escalation', phase: 'Phase 6' },
            { category: 'Network', rules: 'Port scans, unexpected outbound connections', phase: 'Phase 6' },
            { category: 'File Integrity', rules: 'Changes to critical system files (FIM)', phase: 'Phase 6' },
            { category: 'Cloud (AWS)', rules: 'CloudTrail anomalies, API abuse patterns', phase: 'Phase 6' },
            { category: 'Application', rules: 'SQL injection patterns, unusual query volumes', phase: 'Phase 6' },
            { category: 'Incident Response', rules: 'Playbooks for common attack scenarios', phase: 'Phase 6' },
          ].map(({ category, rules, phase }) => (
            <div key={category} className="p-3 bg-[#0d1424] border border-[#1e2d45] rounded-lg">
              <p className="text-sm font-semibold text-slate-200 mb-1">{category}</p>
              <p className="text-xs text-slate-500 mb-2">{rules}</p>
              <span className="text-xs text-slate-600">{phase}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
