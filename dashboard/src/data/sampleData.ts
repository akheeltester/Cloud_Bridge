/**
 * CloudBridge Sample Data
 *
 * ALL DATA IN THIS FILE IS DEMONSTRATION DATA.
 * It does not represent real deployed infrastructure, real scan results,
 * or real customer environments. Every item is labelled dataStatus: 'demo-data'
 * or 'planned' until replaced with verified real output.
 */

import type {
  Customer,
  InfraResource,
  MigrationProject,
  Phase,
  SecurityFinding,
  SocAlert,
} from '../types'

// ─── Customers ─────────────────────────────────────────────────────────────

export const customers: Customer[] = [
  {
    id: 'customer-a',
    name: 'ACME Technologies',
    industry: 'Technology',
    scenario: 'On-premises → AWS',
    sourceCloud: 'On-Premises',
    targetCloud: 'AWS ap-southeast-2',
    status: 'onboarding',
    assetCount: 4,
    dataStatus: 'demo-data',
  },
  {
    id: 'customer-b',
    name: 'BluePeak Solutions',
    industry: 'Professional Services',
    scenario: 'AWS → Azure',
    sourceCloud: 'AWS ap-southeast-2',
    targetCloud: 'Azure australiaeast',
    status: 'onboarding',
    assetCount: 6,
    dataStatus: 'demo-data',
  },
  {
    id: 'customer-c',
    name: 'NovaRetail',
    industry: 'Retail',
    scenario: 'Security Assessment',
    sourceCloud: 'AWS ap-southeast-2',
    targetCloud: 'AWS ap-southeast-2',
    status: 'onboarding',
    assetCount: 8,
    dataStatus: 'demo-data',
  },
]

// ─── Infrastructure Resources ──────────────────────────────────────────────

export const infraResources: InfraResource[] = [
  {
    id: 'local-vm-01',
    cloud: 'local',
    type: 'VirtualBox VM',
    name: 'customer-a-appserver',
    region: 'Local Lab',
    customer: 'customer-a',
    status: 'planned',
    dataStatus: 'planned',
  },
  {
    id: 'local-vm-02',
    cloud: 'local',
    type: 'VirtualBox VM',
    name: 'customer-a-database',
    region: 'Local Lab',
    customer: 'customer-a',
    status: 'planned',
    dataStatus: 'planned',
  },
  {
    id: 'local-docker-01',
    cloud: 'local',
    type: 'Docker Container',
    name: 'customer-b-webserver',
    region: 'Local Lab',
    customer: 'customer-b',
    status: 'planned',
    dataStatus: 'planned',
  },
  {
    id: 'aws-vpc-01',
    cloud: 'aws',
    type: 'VPC',
    name: 'cloudbridge-customer-a-vpc',
    region: 'ap-southeast-2',
    customer: 'customer-a',
    status: 'planned',
    dataStatus: 'planned',
  },
]

// ─── Migration Projects ────────────────────────────────────────────────────

export const migrationProjects: MigrationProject[] = [
  {
    id: 'mig-customer-a',
    customer: 'ACME Technologies',
    from: 'On-Premises',
    to: 'AWS ap-southeast-2',
    stage: 'onboarding',
    stagePercent: 10,
    services: 3,
    dataStatus: 'demo-data',
  },
  {
    id: 'mig-customer-b',
    customer: 'BluePeak Solutions',
    from: 'AWS ap-southeast-2',
    to: 'Azure australiaeast',
    stage: 'onboarding',
    stagePercent: 5,
    services: 4,
    dataStatus: 'demo-data',
  },
]

// ─── Security Findings ─────────────────────────────────────────────────────

export const securityFindings: SecurityFinding[] = [
  {
    id: 'CB-C-001',
    tool: 'checkov',
    severity: 'high',
    customer: 'platform',
    resourceType: 'S3 Bucket',
    title: 'S3 bucket public access not blocked (example finding)',
    status: 'open',
    dataStatus: 'demo-data',
  },
  {
    id: 'CB-C-002',
    tool: 'checkov',
    severity: 'medium',
    customer: 'platform',
    resourceType: 'Security Group',
    title: 'Security group allows unrestricted SSH ingress (example finding)',
    status: 'open',
    dataStatus: 'demo-data',
  },
  {
    id: 'CB-C-003',
    tool: 'checkov',
    severity: 'medium',
    customer: 'platform',
    resourceType: 'IAM Policy',
    title: 'IAM policy uses wildcard actions (example finding)',
    status: 'open',
    dataStatus: 'demo-data',
  },
  {
    id: 'CB-C-004',
    tool: 'checkov',
    severity: 'low',
    customer: 'platform',
    resourceType: 'S3 Bucket',
    title: 'S3 bucket versioning not enabled (example finding)',
    status: 'open',
    dataStatus: 'demo-data',
  },
]

// ─── SOC Alerts ────────────────────────────────────────────────────────────

export const socAlerts: SocAlert[] = [
  {
    id: 'ALERT-001',
    severity: 'medium',
    title: 'Multiple failed SSH login attempts (example alert)',
    source: 'Wazuh',
    customer: 'customer-a',
    timestamp: '2026-11-04T08:15:00Z',
    status: 'open',
    dataStatus: 'demo-data',
  },
  {
    id: 'ALERT-002',
    severity: 'low',
    title: 'Unusual outbound port scan detected (example alert)',
    source: 'Wazuh',
    customer: 'customer-b',
    timestamp: '2026-11-04T09:22:00Z',
    status: 'investigating',
    dataStatus: 'demo-data',
  },
]

// ─── Phase Roadmap ─────────────────────────────────────────────────────────

export const phases: Phase[] = [
  {
    number: 0,
    name: 'Repository Assessment',
    status: 'implemented',
    description: 'Inspected repository, identified tools, produced assessment report.',
    deliverables: ['Repository assessment', 'Tool inventory', 'Technical debt report'],
  },
  {
    number: 1,
    name: 'Engineering Foundation',
    status: 'in-progress',
    description: 'Git repo, documentation, CI/CD, and portfolio dashboard.',
    deliverables: [
      'GitHub repository',
      'README + docs',
      'CI workflows',
      'Dashboard (this)',
      'GitHub Pages',
    ],
  },
  {
    number: 2,
    name: 'Local Infrastructure',
    status: 'in-progress',
    description: 'VirtualBox VMs and Docker containers simulating customer environments.',
    deliverables: ['VirtualBox network', 'Customer VMs', 'Docker Compose', 'Ansible playbooks'],
  },
  {
    number: 3,
    name: 'AWS Infrastructure',
    status: 'planned',
    description: 'Terraform modules for VPC, security groups, IAM, and logging.',
    deliverables: ['Terraform modules', 'Network design', 'IAM policies', 'Validation reports'],
  },
  {
    number: 4,
    name: 'Migration Engineering',
    status: 'planned',
    description: 'Discovery scripts, migration plans, execution, and validation.',
    deliverables: ['Discovery toolkit', 'Migration scenarios', 'Validation scripts'],
  },
  {
    number: 5,
    name: 'Cloud Security',
    status: 'planned',
    description: 'Prowler, Checkov, Trivy assessments and security reports.',
    deliverables: ['CSPM assessment', 'IaC scanning', 'Security reports'],
  },
  {
    number: 6,
    name: 'SOC & Monitoring',
    status: 'planned',
    description: 'Wazuh SIEM, Splunk, detection rules, and incident response.',
    deliverables: ['Wazuh lab', 'Detection rules', 'Incident playbooks'],
  },
  {
    number: 7,
    name: 'Multi-Cloud Expansion',
    status: 'planned',
    description: 'Azure and GCP Terraform modules, cross-cloud security.',
    deliverables: ['Azure modules', 'GCP modules', 'Multi-cloud comparison'],
  },
  {
    number: 8,
    name: 'Portfolio Completion',
    status: 'planned',
    description: 'Final dashboard integration, documentation, and portfolio evidence.',
    deliverables: ['Complete portfolio', 'Public dashboard', 'Final report'],
  },
]

// ─── Summary Stats ─────────────────────────────────────────────────────────

export const platformStats = {
  customers: 3,
  cloudProviders: 1, // AWS only so far
  migrationProjects: 2,
  securityFindings: 4,
  phasesComplete: 1,
  phasesTotal: 9,
  dataStatus: 'demo-data' as const,
}
