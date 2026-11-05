import { ArrowRight, Building2, Server } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { ProgressBar } from '../components/ProgressBar'
import { StatusBadge } from '../components/StatusBadge'
import { customers } from '../data/sampleData'
import type { MigrationStage } from '../types'

const BASE = '/Cloud_Bridge'

const stageOrder: MigrationStage[] = [
  'onboarding', 'discovery', 'assessment', 'planning', 'execution', 'validation', 'complete',
]

const stagePct = (stage: MigrationStage) =>
  Math.round((stageOrder.indexOf(stage) / (stageOrder.length - 1)) * 100)

const customerColor = ['blue', 'green', 'purple'] as const

export function Customers() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customer Environments</h1>
        <p className="text-slate-400 text-sm mt-1">
          Fictional customer engagements — all data is simulated
        </p>
      </div>

      <DemoBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {customers.map((c, i) => (
          <Card key={c.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                i === 0 ? 'bg-sky-950 text-sky-400' :
                i === 1 ? 'bg-emerald-950 text-emerald-400' :
                'bg-indigo-950 text-indigo-400'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>
              <StatusBadge status={c.dataStatus} />
            </div>
            <h3 className="text-base font-bold text-white mb-0.5">{c.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{c.industry}</p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Scenario</span>
                <span className="text-slate-300">{c.scenario}</span>
              </div>
              <div className="flex justify-between">
                <span>Source</span>
                <span className="text-slate-300">{c.sourceCloud}</span>
              </div>
              <div className="flex justify-between">
                <span>Target</span>
                <span className="text-slate-300">{c.targetCloud}</span>
              </div>
              <div className="flex justify-between">
                <span>Assets</span>
                <span className="text-slate-300">{c.assetCount} discovered</span>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={stagePct(c.status)}
                label={`Migration stage: ${c.status}`}
                color={customerColor[i]}
                size="sm"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Detailed Environment Cards ── */}
      <div className="space-y-4">
        {/* Customer A */}
        <Card>
          <CardHeader
            title="ACME Technologies — On-Premises Infrastructure"
            subtitle="Source environment before migration"
            icon={<Server className="w-4 h-4" />}
            action={<StatusBadge status="planned" />}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Workstation', spec: 'Ubuntu Desktop 22.04', ip: '192.168.56.20', role: 'Employee workstation' },
              { name: 'App Server', spec: 'Ubuntu Server 22.04', ip: '192.168.56.30', role: 'Node.js / Python app' },
              { name: 'Database', spec: 'Ubuntu Server + PG 14', ip: '192.168.56.31', role: 'PostgreSQL database' },
              { name: 'File Storage', spec: 'Samba share', ip: '192.168.56.30', role: 'Shared file storage' },
            ].map((asset) => (
              <div key={asset.name} className="bg-[#0d1424] border border-[#1e2d45] rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-200 mb-1">{asset.name}</p>
                <p className="text-xs text-slate-500">{asset.spec}</p>
                <p className="font-mono text-xs text-sky-600 mt-1">{asset.ip}</p>
                <p className="text-xs text-slate-600 mt-1">{asset.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-600">Network: 192.168.56.0/24 — VirtualBox host-only (Phase 2)</p>
            <Link
              to={`${BASE}/migration`}
              className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-400"
            >
              View migration plan <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Customer B */}
        <Card>
          <CardHeader
            title="BluePeak Solutions — AWS Source Environment"
            subtitle="Simulated locally — actual AWS environment not deployed"
            icon={<Server className="w-4 h-4" />}
            action={<StatusBadge status="demo-data" />}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Web Server', spec: 'Nginx + Python (EC2 sim)', ip: '192.168.57.30', role: 'Web application' },
              { name: 'Database', spec: 'PostgreSQL (EC2 sim)', ip: '192.168.57.31', role: 'App database' },
              { name: 'Object Storage', spec: 'S3 simulation (MinIO)', ip: 'localhost:9000', role: 'Application uploads' },
              { name: 'Workstation', spec: 'Ubuntu Desktop', ip: '192.168.57.20', role: 'Admin workstation' },
            ].map((asset) => (
              <div key={asset.name} className="bg-[#0d1424] border border-[#1e2d45] rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-200 mb-1">{asset.name}</p>
                <p className="text-xs text-slate-500">{asset.spec}</p>
                <p className="font-mono text-xs text-sky-600 mt-1">{asset.ip}</p>
                <p className="text-xs text-slate-600 mt-1">{asset.role}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer C */}
        <Card>
          <CardHeader
            title="NovaRetail — Cloud Security Assessment"
            subtitle="No migration — security posture review and SOC setup"
            icon={<Server className="w-4 h-4" />}
            action={<StatusBadge status="planned" />}
          />
          <div className="text-center py-4 text-slate-600">
            <p className="text-sm">Security assessment scope documented.</p>
            <p className="text-xs mt-1">Prowler and Checkov scans planned for Phase 5.</p>
            <Link
              to={`${BASE}/security`}
              className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-400 mt-2"
            >
              View Security Center <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
