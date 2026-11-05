import { BookOpen, ExternalLink, FileText, Map } from 'lucide-react'
import { Card, CardHeader } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'

const docSections = [
  {
    title: 'Architecture',
    icon: Map,
    docs: [
      { name: 'Platform Overview', path: 'docs/architecture/overview.md', status: 'implemented' as const },
      { name: 'AWS Network Design', path: 'docs/architecture/aws-network.md', status: 'implemented' as const },
      { name: 'Local Lab Topology', path: 'docs/architecture/local-lab.md', status: 'implemented' as const },
      { name: 'Migration Workflow', path: 'docs/architecture/migration-workflow.md', status: 'implemented' as const },
      { name: 'Security Architecture', path: 'docs/architecture/security-architecture.md', status: 'implemented' as const },
    ],
  },
  {
    title: 'Customer Profiles',
    icon: BookOpen,
    docs: [
      { name: 'ACME Technologies (Customer A)', path: 'customers/customer-a/README.md', status: 'implemented' as const },
      { name: 'BluePeak Solutions (Customer B)', path: 'customers/customer-b/README.md', status: 'implemented' as const },
      { name: 'NovaRetail (Customer C)', path: 'customers/customer-c/README.md', status: 'implemented' as const },
    ],
  },
  {
    title: 'Migration Runbooks',
    icon: FileText,
    docs: [
      { name: 'On-Premises → AWS Runbook', path: 'docs/migration-runbooks/onprem-to-aws.md', status: 'planned' as const },
      { name: 'AWS → Azure Runbook', path: 'docs/migration-runbooks/aws-to-azure.md', status: 'planned' as const },
      { name: 'Data Migration Procedures', path: 'docs/migration-runbooks/data-migration.md', status: 'planned' as const },
      { name: 'Rollback Procedures', path: 'docs/migration-runbooks/rollback.md', status: 'planned' as const },
    ],
  },
  {
    title: 'Security Reports',
    icon: FileText,
    docs: [
      { name: 'NovaRetail — CSPM Assessment', path: 'customers/customer-c/security-assessment/', status: 'planned' as const },
      { name: 'Terraform IaC Scan Baseline', path: 'security/checkov/', status: 'planned' as const },
      { name: 'IAM Policy Review', path: 'security/iam/', status: 'planned' as const },
    ],
  },
  {
    title: 'Setup Guides',
    icon: BookOpen,
    docs: [
      { name: 'VirtualBox Lab Setup', path: 'docs/setup/virtualbox-lab.md', status: 'planned' as const },
      { name: 'AWS CLI + Profile Setup', path: 'docs/setup/aws-cli.md', status: 'planned' as const },
      { name: 'Terraform Workflow', path: 'docs/setup/terraform-workflow.md', status: 'planned' as const },
      { name: 'Wazuh Deployment Guide', path: 'docs/setup/wazuh-deploy.md', status: 'planned' as const },
    ],
  },
]

export function Docs() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Documentation</h1>
        <p className="text-slate-400 text-sm mt-1">
          Architecture docs, runbooks, security reports, and setup guides
        </p>
      </div>

      <div className="space-y-4">
        {docSections.map(({ title, icon: Icon, docs }) => (
          <Card key={title}>
            <CardHeader title={title} icon={<Icon className="w-4 h-4" />} />
            <div className="space-y-2">
              {docs.map(({ name, path, status }) => (
                <div key={path} className="flex items-center justify-between p-3 bg-[#0d1424] border border-[#1e2d45] rounded-lg hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-200">{name}</p>
                      <p className="text-xs font-mono text-slate-600">{path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    {status === 'implemented' && (
                      <a
                        href={`https://github.com/akheeltester/Cloud_Bridge/blob/main/${path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-400"
                        aria-label="View on GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
