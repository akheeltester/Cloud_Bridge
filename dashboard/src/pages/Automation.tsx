import { Code2, FileCode, Terminal, Workflow } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { DemoBanner } from '../components/DemoBanner'
import { StatusBadge } from '../components/StatusBadge'

const modules = [
  {
    category: 'Terraform Modules',
    icon: FileCode,
    items: [
      { name: 'aws/modules/networking', desc: 'VPC, subnets, IGW, route tables, NACLs', lang: 'HCL', status: 'planned' as const },
      { name: 'aws/modules/security', desc: 'Security Groups, NACLs', lang: 'HCL', status: 'planned' as const },
      { name: 'aws/modules/identity', desc: 'IAM roles, policies, instance profiles', lang: 'HCL', status: 'planned' as const },
      { name: 'aws/modules/logging', desc: 'CloudTrail, CloudWatch Logs, S3 log bucket', lang: 'HCL', status: 'planned' as const },
      { name: 'azure/modules/networking', desc: 'VNet, subnets, NSGs', lang: 'HCL', status: 'planned' as const },
      { name: 'gcp/modules/networking', desc: 'VPC, subnets, firewall rules', lang: 'HCL', status: 'planned' as const },
    ],
  },
  {
    category: 'Ansible Playbooks',
    icon: Workflow,
    items: [
      { name: 'provision-base.yml', desc: 'Base OS configuration, security hardening', lang: 'YAML', status: 'planned' as const },
      { name: 'deploy-postgres.yml', desc: 'PostgreSQL installation and configuration', lang: 'YAML', status: 'planned' as const },
      { name: 'deploy-webserver.yml', desc: 'Nginx + application deployment', lang: 'YAML', status: 'planned' as const },
      { name: 'configure-wazuh-agent.yml', desc: 'Wazuh agent installation and enrolment', lang: 'YAML', status: 'planned' as const },
    ],
  },
  {
    category: 'Python Scripts',
    icon: Code2,
    items: [
      { name: 'discovery/scan_host.py', desc: 'Infrastructure discovery — OS, services, ports', lang: 'Python', status: 'planned' as const },
      { name: 'inventory/build_inventory.py', desc: 'Asset inventory builder (JSON + PostgreSQL)', lang: 'Python', status: 'planned' as const },
      { name: 'security/normalize_findings.py', desc: 'Security finding normalisation across tools', lang: 'Python', status: 'planned' as const },
      { name: 'security/generate_report.py', desc: 'Security report generation (Markdown + JSON)', lang: 'Python', status: 'planned' as const },
      { name: 'migration/validate_migration.py', desc: 'Post-migration validation checks', lang: 'Python', status: 'planned' as const },
    ],
  },
  {
    category: 'Bash Scripts',
    icon: Terminal,
    items: [
      { name: 'scripts/setup/install-tools.sh', desc: 'Install Prowler, Checkov, Trivy', lang: 'Bash', status: 'planned' as const },
      { name: 'scripts/validation/check-gitignore.sh', desc: 'Verify no secrets in staged files', lang: 'Bash', status: 'planned' as const },
      { name: 'scripts/setup/fix-vboxdrv.sh', desc: 'Install VirtualBox kernel module', lang: 'Bash', status: 'in-progress' as const },
    ],
  },
]

export function Automation() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Automation</h1>
        <p className="text-slate-400 text-sm mt-1">
          Terraform modules, Ansible playbooks, Python scripts, and CI/CD workflows
        </p>
      </div>

      <DemoBanner />

      {/* ── CI/CD ── */}
      <Card className="mb-6">
        <CardHeader
          title="GitHub Actions CI/CD"
          subtitle="Active workflows — running on every push to main"
          icon={<Workflow className="w-4 h-4" />}
          action={<StatusBadge status="in-progress" />}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            {
              name: 'ci.yml',
              triggers: 'Push / PR to main',
              jobs: ['TruffleHog secret scan', 'Terraform fmt + validate', 'Checkov IaC scan', 'Markdown lint'],
              status: 'in-progress' as const,
            },
            {
              name: 'security-scan.yml',
              triggers: 'Scheduled (Monday 06:00 UTC)',
              jobs: ['Full repo secret scan', 'Checkov full scan (SARIF)'],
              status: 'in-progress' as const,
            },
            {
              name: 'deploy-dashboard.yml',
              triggers: 'Push to main (dashboard/ changed)',
              jobs: ['npm ci + build', 'Upload Pages artifact', 'Deploy to GitHub Pages'],
              status: 'in-progress' as const,
            },
          ].map(({ name, triggers, jobs, status }) => (
            <div key={name} className="bg-[#0d1424] border border-[#1e2d45] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-mono font-semibold text-sky-400">{name}</p>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-slate-500 mb-3">{triggers}</p>
              <ul className="space-y-1">
                {jobs.map((j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-sky-700" />
                    {j}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Module catalogue ── */}
      {modules.map(({ category, icon: Icon, items }) => (
        <Card key={category} className="mb-4">
          <CardHeader title={category} icon={<Icon className="w-4 h-4" />} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-[#1e2d45]">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Description</th>
                  <th className="text-left py-2 pr-4">Lang</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d45]">
                {items.map((item) => (
                  <tr key={item.name} className="hover:bg-[#111827] transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-xs text-sky-400 whitespace-nowrap">{item.name}</td>
                    <td className="py-2.5 pr-4 text-xs text-slate-400">{item.desc}</td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500">{item.lang}</td>
                    <td className="py-2.5"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  )
}
