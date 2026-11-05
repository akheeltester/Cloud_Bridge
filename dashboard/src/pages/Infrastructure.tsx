import { Cloud, HardDrive, Network, Server } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { StatusBadge } from '../components/StatusBadge'

export function Infrastructure() {

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Cloud Infrastructure</h1>
        <p className="text-slate-400 text-sm mt-1">
          Terraform-managed cloud resources and local simulation environment
        </p>
      </div>

      <DemoBanner />

      {/* ── AWS Architecture ── */}
      <Card className="mb-4">
        <CardHeader
          title="AWS Architecture — ap-southeast-2"
          subtitle="Terraform modules — Phase 3 planned"
          icon={<Cloud className="w-4 h-4" />}
          action={<StatusBadge status="planned" />}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {[
            {
              title: 'Networking Module',
              desc: 'VPC, public/private subnets (2 AZs), Internet Gateway, route tables, NACLs',
              path: 'terraform/aws/modules/networking',
              status: 'planned' as const,
              icon: Network,
            },
            {
              title: 'Security Module',
              desc: 'Security Groups (default-deny), NACLs, WAF (if needed)',
              path: 'terraform/aws/modules/security',
              status: 'planned' as const,
              icon: HardDrive,
            },
            {
              title: 'Identity Module',
              desc: 'IAM roles, policies (least-privilege), instance profiles',
              path: 'terraform/aws/modules/identity',
              status: 'planned' as const,
              icon: Server,
            },
          ].map(({ title, desc, path, status, icon: Icon }) => (
            <div key={title} className="bg-[#0d1424] border border-[#1e2d45] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-sky-400" />
                <p className="text-sm font-semibold text-slate-200">{title}</p>
              </div>
              <p className="text-xs text-slate-400 mb-3">{desc}</p>
              <p className="text-xs font-mono text-slate-600 mb-2">{path}</p>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>

        {/* VPC Diagram */}
        <div className="bg-[#0a0e1a] rounded-lg p-4 border border-[#1a2236]">
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">VPC Layout — ACME Technologies (Customer A)</p>
          <div className="font-mono text-xs text-slate-400 space-y-1">
            <p className="text-slate-300">VPC: 10.10.0.0/16  ←  ap-southeast-2</p>
            <p className="text-slate-600 pl-4">│</p>
            <p className="pl-4">├── Public Subnet A   10.10.1.0/24  (ap-southeast-2a)  ── Internet Gateway</p>
            <p className="pl-4">├── Public Subnet B   10.10.2.0/24  (ap-southeast-2b)  ── Internet Gateway</p>
            <p className="pl-4">├── Private Subnet A  10.10.10.0/24 (ap-southeast-2a)</p>
            <p className="pl-4">└── Private Subnet B  10.10.11.0/24 (ap-southeast-2b)</p>
          </div>
          <div className="flex gap-3 mt-3">
            <StatusBadge status="planned" />
            <span className="text-xs text-slate-600">No resources deployed — design only</span>
          </div>
        </div>
      </Card>

      {/* ── Local Simulation ── */}
      <Card className="mb-4">
        <CardHeader
          title="Local Infrastructure — VirtualBox Lab"
          subtitle="Customer environment simulations"
          icon={<Server className="w-4 h-4" />}
          action={<StatusBadge status="in-progress" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-[#1e2d45]">
                <th className="text-left py-2 pr-4">Name</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">IP Address</th>
                <th className="text-left py-2 pr-4">Customer</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d45]">
              {[
                { name: 'customer-a-workstation', type: 'Ubuntu Desktop VM', ip: '192.168.56.20', customer: 'ACME Technologies', status: 'planned' as const },
                { name: 'customer-a-appserver', type: 'Ubuntu Server VM', ip: '192.168.56.30', customer: 'ACME Technologies', status: 'planned' as const },
                { name: 'customer-a-database', type: 'Ubuntu Server VM (PG)', ip: '192.168.56.31', customer: 'ACME Technologies', status: 'planned' as const },
                { name: 'customer-b-webserver', type: 'Docker Container (Nginx)', ip: '192.168.57.30', customer: 'BluePeak Solutions', status: 'planned' as const },
                { name: 'customer-b-database', type: 'Docker Container (PG)', ip: '192.168.57.31', customer: 'BluePeak Solutions', status: 'planned' as const },
              ].map((r) => (
                <tr key={r.name} className="hover:bg-[#111827] transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-sky-400">{r.name}</td>
                  <td className="py-3 pr-4 text-xs text-slate-300">{r.type}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-slate-400">{r.ip}</td>
                  <td className="py-3 pr-4 text-xs text-slate-400">{r.customer}</td>
                  <td className="py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Azure + GCP placeholders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { cloud: 'Microsoft Azure', region: 'australiaeast', phase: 'Phase 7' },
          { cloud: 'Google Cloud Platform', region: 'australia-southeast1', phase: 'Phase 7' },
        ].map(({ cloud, region, phase }) => (
          <Card key={cloud}>
            <CardHeader
              title={cloud}
              subtitle={`${region} · ${phase}`}
              icon={<Cloud className="w-4 h-4" />}
              action={<StatusBadge status="planned" />}
            />
            <div className="text-center py-6 text-slate-600">
              <Cloud className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Infrastructure modules planned for {phase}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
