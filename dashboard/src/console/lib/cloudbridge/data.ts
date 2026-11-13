export type WorkStatus =
  | "implemented"
  | "in-progress"
  | "planned"
  | "tested-locally"
  | "deployed"
  | "demo-data";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export const GITHUB = "https://github.com/akheeltester/Cloud_Bridge";
export const LIVE_DEMO_URL = "https://cloudbridge-bluepeak.duckdns.org";

export const phases = [
  {
    number: 0,
    name: "Repository Assessment",
    status: "implemented" as WorkStatus,
    description: "Inspected repository, identified tools, produced assessment report.",
    deliverables: ["Repository assessment", "Tool inventory", "Technical debt report"],
  },
  {
    number: 1,
    name: "Engineering Foundation",
    status: "in-progress" as WorkStatus,
    description: "Git repo, documentation, CI/CD, and portfolio dashboard.",
    deliverables: ["GitHub repository", "README + docs", "CI workflows", "Dashboard (this)", "GitHub Pages"],
  },
  {
    number: 2,
    name: "Local Infrastructure",
    status: "in-progress" as WorkStatus,
    description: "Customer environments are modeled with local Docker simulations; the BluePeak demo has also been deployed to EC2.",
    deliverables: ["Docker Compose simulation", "Customer environment models", "EC2 deployment rehearsal", "Ansible playbooks planned"],
  },
  {
    number: 3,
    name: "AWS Infrastructure",
    status: "deployed" as WorkStatus,
    description: "A portfolio demo is running on EC2 in ap-southeast-2 with a private S3 bucket and HTTPS. The production-style Terraform landing zone is still planned.",
    deliverables: ["EC2 demo deployment", "Private S3 uploads", "Instance-role access", "Caddy HTTPS endpoint", "Terraform landing zone planned"],
  },
  {
    number: 4,
    name: "Migration Engineering",
    status: "in-progress" as WorkStatus,
    description: "The BluePeak demo deployment and health, upload, and list smoke tests are complete. This validates a portfolio scenario, not a real customer data migration.",
    deliverables: ["Migration workflow defined", "Container deployment rehearsal", "Health validation", "S3 upload/list validation", "Production migration runbooks planned"],
  },
  {
    number: 5,
    name: "Cloud Security",
    status: "planned" as WorkStatus,
    description: "Prowler, Checkov, Trivy assessments and security reports.",
    deliverables: ["CSPM assessment", "IaC scanning", "Security reports"],
  },
  {
    number: 6,
    name: "SOC & Monitoring",
    status: "planned" as WorkStatus,
    description: "Wazuh SIEM, Splunk, detection rules, and incident response.",
    deliverables: ["Wazuh lab", "Detection rules", "Incident playbooks"],
  },
  {
    number: 7,
    name: "Multi-Cloud Expansion",
    status: "planned" as WorkStatus,
    description: "Azure and GCP Terraform modules, cross-cloud security.",
    deliverables: ["Azure modules", "GCP modules", "Multi-cloud comparison"],
  },
  {
    number: 8,
    name: "Portfolio Completion",
    status: "in-progress" as WorkStatus,
    description: "GitHub Pages dashboard and public AWS demo are available; roadmap clarity, evidence, and final documentation are being refined.",
    deliverables: ["GitHub Pages dashboard", "Public AWS demo", "Deployment evidence", "Final report planned"],
  },
];

export const clouds = [
  {
    name: "Amazon Web Services",
    region: "ap-southeast-2",
    pct: 45,
    status: "deployed" as WorkStatus,
    note: "BluePeak demo verified over HTTPS on EC2 with S3-backed uploads. This is not a production workload.",
  },
  {
    name: "Microsoft Azure",
    region: "australiaeast",
    pct: 0,
    status: "planned" as WorkStatus,
    note: "Landing zone modules planned for Phase 7.",
  },
  {
    name: "Google Cloud Platform",
    region: "australia-southeast1",
    pct: 0,
    status: "planned" as WorkStatus,
    note: "Networking module planned for Phase 7.",
  },
];

export const customers = [
  {
    id: "customer-a",
    name: "ACME Technologies",
    industry: "Technology",
    scenario: "On-premises → AWS",
    sourceCloud: "On-Premises",
    targetCloud: "AWS ap-southeast-2",
    status: "onboarding",
    assetCount: 4,
    dataStatus: "demo-data" as WorkStatus,
    summary: "Fictional engagement. Source environment is a VirtualBox lab, target is an AWS design in Sydney.",
    assets: [
      { name: "Workstation", spec: "Ubuntu Desktop 22.04", ip: "192.168.56.20", role: "Employee workstation" },
      { name: "App Server", spec: "Ubuntu Server 22.04", ip: "192.168.56.30", role: "Node.js / Python app" },
      { name: "Database", spec: "Ubuntu Server + PG 14", ip: "192.168.56.31", role: "PostgreSQL database" },
      { name: "File Storage", spec: "Samba share", ip: "192.168.56.30", role: "Shared file storage" },
    ],
    network: "192.168.56.0/24 — VirtualBox host-only (Phase 2)",
  },
  {
    id: "customer-b",
    name: "BluePeak Solutions",
    industry: "Professional Services",
    scenario: "Local Docker demo → AWS EC2 + S3",
    sourceCloud: "Local Docker simulation",
    targetCloud: "AWS ap-southeast-2",
    status: "validation",
    assetCount: 5,
    dataStatus: "demo-data" as WorkStatus,
    summary: "Fictional portfolio scenario deployed to EC2 with private S3 uploads. HTTPS, API health, object upload, and listing were verified; no real customer data was migrated.",
    assets: [
      { name: "EC2 instance", spec: "Amazon Linux 2023 · ap-southeast-2", ip: "AWS public endpoint", role: "Demo host" },
      { name: "Web + API", spec: "Nginx · FastAPI · Docker Compose", ip: LIVE_DEMO_URL.replace("https://", ""), role: "Public HTTPS application" },
      { name: "Database", spec: "PostgreSQL 14 container", ip: "Private Compose network", role: "Application database" },
      { name: "Object Storage", spec: "Private Amazon S3 bucket", ip: "uploads/ prefix", role: "Application uploads" },
      { name: "TLS reverse proxy", spec: "Caddy · automatic certificate renewal", ip: "Ports 80/443", role: "HTTPS ingress" },
    ],
    network: "Public access via HTTPS; application and database container ports remain private. All business names and example content are fictional.",
  },
  {
    id: "customer-c",
    name: "NovaRetail",
    industry: "Retail",
    scenario: "Security Assessment",
    sourceCloud: "AWS ap-southeast-2",
    targetCloud: "AWS ap-southeast-2",
    status: "onboarding",
    assetCount: 8,
    dataStatus: "demo-data" as WorkStatus,
    summary: "No migration. Scope is a security posture review and SOC setup. Scans are planned for Phase 5.",
    assets: [],
    network: "Security assessment scope documented. Prowler and Checkov scans planned for Phase 5.",
  },
];

export const migrations = [
  {
    id: "mig-customer-a",
    customer: "ACME Technologies",
    from: "On-Premises",
    to: "AWS ap-southeast-2",
    stage: "onboarding",
    stagePercent: 10,
    services: 3,
    dataStatus: "demo-data" as WorkStatus,
  },
  {
    id: "mig-customer-b",
    customer: "BluePeak Solutions",
    from: "Local Docker simulation",
    to: "AWS EC2 + S3 · ap-southeast-2",
    stage: "validation",
    stagePercent: 85,
    services: 5,
    dataStatus: "demo-data" as WorkStatus,
  },
];

export const migrationStages = [
  { id: "onboarding", label: "Onboarding", description: "Scope, access, timeline" },
  { id: "discovery", label: "Discovery", description: "Asset enumeration" },
  { id: "assessment", label: "Assessment", description: "Readiness + dependencies" },
  { id: "planning", label: "Planning", description: "Sequenced migration plan" },
  { id: "execution", label: "Execution", description: "Provision + migrate" },
  { id: "validation", label: "Validation", description: "Tests + data integrity" },
  { id: "complete", label: "Complete", description: "Report + handoff" },
];

export const workflowSteps = [
  { n: 1, title: "Customer Onboarding", desc: "Scope, constraints, access requirements" },
  { n: 2, title: "Infrastructure Discovery", desc: "OS, services, ports, applications" },
  { n: 3, title: "Asset Inventory", desc: "Structured JSON+PostgreSQL inventory" },
  { n: 4, title: "Dependency Mapping", desc: "App to database, auth, and storage dependencies" },
  { n: 5, title: "Readiness Assessment", desc: "RAG status per component" },
  { n: 6, title: "Target Architecture", desc: "Cloud design + Terraform plan" },
  { n: 7, title: "Migration Planning", desc: "Sequence, maintenance window, rollback" },
  { n: 8, title: "Migration Execution", desc: "Provision, configure, transfer" },
  { n: 9, title: "Validation & Testing", desc: "Health checks, data integrity, performance" },
  { n: 10, title: "Rollback & Completion", desc: "Rollback doc + final report" },
];

export const findings = [
  {
    id: "CB-C-001",
    tool: "checkov",
    severity: "high" as Severity,
    customer: "platform",
    resourceType: "S3 Bucket",
    title: "S3 bucket public access not blocked (example finding)",
    status: "open",
    dataStatus: "demo-data" as WorkStatus,
  },
  {
    id: "CB-C-002",
    tool: "checkov",
    severity: "medium" as Severity,
    customer: "platform",
    resourceType: "Security Group",
    title: "Security group allows unrestricted SSH ingress (example finding)",
    status: "open",
    dataStatus: "demo-data" as WorkStatus,
  },
  {
    id: "CB-C-003",
    tool: "checkov",
    severity: "medium" as Severity,
    customer: "platform",
    resourceType: "IAM Policy",
    title: "IAM policy uses wildcard actions (example finding)",
    status: "open",
    dataStatus: "demo-data" as WorkStatus,
  },
  {
    id: "CB-C-004",
    tool: "checkov",
    severity: "low" as Severity,
    customer: "platform",
    resourceType: "S3 Bucket",
    title: "S3 bucket versioning not enabled (example finding)",
    status: "open",
    dataStatus: "demo-data" as WorkStatus,
  },
];

export const scanners = [
  {
    tool: "Prowler",
    purpose: "AWS configuration assessment",
    phase: "Phase 5",
    checks: ["IAM", "Network", "Storage", "Logging", "Encryption"],
    status: "planned" as WorkStatus,
  },
  {
    tool: "Checkov",
    purpose: "Terraform IaC scanning",
    phase: "Phase 5 (CI from Phase 1)",
    checks: ["S3 public access", "SG rules", "IAM wildcards", "Encryption", "Logging"],
    status: "in-progress" as WorkStatus,
  },
  {
    tool: "Trivy",
    purpose: "Container and config scanning",
    phase: "Phase 5",
    checks: ["Docker images", "Filesystem", "IaC configs", "Secrets"],
    status: "planned" as WorkStatus,
  },
];

export const alerts = [
  {
    id: "ALERT-001",
    severity: "medium" as Severity,
    title: "Multiple failed SSH login attempts (example alert)",
    source: "Wazuh",
    customer: "customer-a",
    timestamp: "2026-11-04T08:15:00Z",
    status: "open",
    dataStatus: "demo-data" as WorkStatus,
  },
  {
    id: "ALERT-002",
    severity: "low" as Severity,
    title: "Unusual outbound port scan detected (example alert)",
    source: "Wazuh",
    customer: "customer-b",
    timestamp: "2026-11-04T09:22:00Z",
    status: "investigating",
    dataStatus: "demo-data" as WorkStatus,
  },
];

export const wazuhItems = [
  { label: "Wazuh Manager VM", detail: "Ubuntu Server — local VirtualBox", status: "planned" as WorkStatus },
  { label: "Agent — customer-a-appserver", detail: "Monitors auth.log, syslog, FIM", status: "planned" as WorkStatus },
  { label: "Agent — customer-a-database", detail: "Monitors PG logs, auth.log", status: "planned" as WorkStatus },
  { label: "AWS CloudTrail ingestion", detail: "Wazuh AWS module — Phase 6", status: "planned" as WorkStatus },
];

export const splunkViews = [
  "Authentication dashboard",
  "Network event monitoring",
  "Cloud event ingestion",
  "Alert classification",
  "Incident investigation",
];

export const detectionRules = [
  { category: "Authentication", rules: "Brute force, failed SSH, privilege escalation", phase: "Phase 6" },
  { category: "Network", rules: "Port scans, unexpected outbound connections", phase: "Phase 6" },
  { category: "File Integrity", rules: "Changes to critical system files (FIM)", phase: "Phase 6" },
  { category: "Cloud (AWS)", rules: "CloudTrail anomalies, API abuse patterns", phase: "Phase 6" },
  { category: "Application", rules: "SQL injection patterns, unusual query volumes", phase: "Phase 6" },
  { category: "Incident Response", rules: "Playbooks for common attack scenarios", phase: "Phase 6" },
];

export const awsModules = [
  {
    title: "Networking Module",
    desc: "VPC, public/private subnets (2 AZs), Internet Gateway, route tables, NACLs",
    path: "terraform/aws/modules/networking",
    status: "planned" as WorkStatus,
  },
  {
    title: "Security Module",
    desc: "Security Groups (default-deny), NACLs, WAF if needed",
    path: "terraform/aws/modules/security",
    status: "planned" as WorkStatus,
  },
  {
    title: "Identity Module",
    desc: "IAM roles, policies (least-privilege), instance profiles",
    path: "terraform/aws/modules/identity",
    status: "planned" as WorkStatus,
  },
  {
    title: "Logging Module",
    desc: "CloudTrail, CloudWatch Logs, S3 log bucket",
    path: "aws/modules/logging",
    status: "planned" as WorkStatus,
  },
];

export const vpcLines = [
  "VPC  10.10.0.0/16   ap-southeast-2",
  "Public A   10.10.1.0/24    ap-southeast-2a   Internet Gateway",
  "Public B   10.10.2.0/24    ap-southeast-2b   Internet Gateway",
  "Private A  10.10.10.0/24   ap-southeast-2a",
  "Private B  10.10.11.0/24   ap-southeast-2b",
];

export const labHosts = [
  { name: "customer-a-workstation", type: "Ubuntu Desktop VM", ip: "192.168.56.20", customer: "ACME Technologies", status: "planned" as WorkStatus },
  { name: "customer-a-appserver", type: "Ubuntu Server VM", ip: "192.168.56.30", customer: "ACME Technologies", status: "planned" as WorkStatus },
  { name: "customer-a-database", type: "Ubuntu Server VM (PG)", ip: "192.168.56.31", customer: "ACME Technologies", status: "planned" as WorkStatus },
  { name: "customer-b-webserver", type: "Docker Container (Nginx)", ip: "192.168.57.30", customer: "BluePeak Solutions", status: "planned" as WorkStatus },
  { name: "customer-b-database", type: "Docker Container (PG)", ip: "192.168.57.31", customer: "BluePeak Solutions", status: "planned" as WorkStatus },
];

export const futureClouds = [
  { cloud: "Microsoft Azure", region: "australiaeast", phase: "Phase 7" },
  { cloud: "Google Cloud Platform", region: "australia-southeast1", phase: "Phase 7" },
];

export const workflows = [
  {
    name: "ci.yml",
    triggers: "Push / PR to main",
    jobs: ["TruffleHog secret scan", "Terraform fmt + validate", "Checkov IaC scan", "Markdown lint"],
    status: "in-progress" as WorkStatus,
  },
  {
    name: "security-scan.yml",
    triggers: "Scheduled (Monday 06:00 UTC)",
    jobs: ["Full repo secret scan", "Checkov full scan (SARIF)"],
    status: "in-progress" as WorkStatus,
  },
  {
    name: "deploy-dashboard.yml",
    triggers: "Push to main (dashboard/ changed)",
    jobs: ["npm ci + build", "Upload Pages artifact", "Deploy to GitHub Pages"],
    status: "in-progress" as WorkStatus,
  },
];

export const catalogs = [
  {
    category: "Terraform Modules",
    items: [
      { name: "aws/modules/networking", desc: "VPC, subnets, IGW, route tables, NACLs", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/security", desc: "Security Groups, NACLs", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/identity", desc: "IAM roles, policies, instance profiles", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/logging", desc: "CloudTrail, CloudWatch Logs, S3 log bucket", lang: "HCL", status: "planned" as WorkStatus },
      { name: "azure/modules/networking", desc: "VNet, subnets, NSGs", lang: "HCL", status: "planned" as WorkStatus },
      { name: "gcp/modules/networking", desc: "VPC, subnets, firewall rules", lang: "HCL", status: "planned" as WorkStatus },
    ],
  },
  {
    category: "Ansible Playbooks",
    items: [
      { name: "provision-base.yml", desc: "Base OS configuration, security hardening", lang: "YAML", status: "planned" as WorkStatus },
      { name: "deploy-postgres.yml", desc: "PostgreSQL installation and configuration", lang: "YAML", status: "planned" as WorkStatus },
      { name: "deploy-webserver.yml", desc: "Nginx + application deployment", lang: "YAML", status: "planned" as WorkStatus },
      { name: "configure-wazuh-agent.yml", desc: "Wazuh agent installation and enrolment", lang: "YAML", status: "planned" as WorkStatus },
    ],
  },
  {
    category: "Python Scripts",
    items: [
      { name: "discovery/scan_host.py", desc: "Infrastructure discovery — OS, services, ports", lang: "Python", status: "planned" as WorkStatus },
      { name: "inventory/build_inventory.py", desc: "Asset inventory builder (JSON + PostgreSQL)", lang: "Python", status: "planned" as WorkStatus },
      { name: "security/normalize_findings.py", desc: "Security finding normalisation across tools", lang: "Python", status: "planned" as WorkStatus },
      { name: "security/generate_report.py", desc: "Security report generation (Markdown + JSON)", lang: "Python", status: "planned" as WorkStatus },
      { name: "migration/validate_migration.py", desc: "Post-migration validation checks", lang: "Python", status: "planned" as WorkStatus },
    ],
  },
  {
    category: "Bash Scripts",
    items: [
      { name: "scripts/setup/install-tools.sh", desc: "Install Prowler, Checkov, Trivy", lang: "Bash", status: "planned" as WorkStatus },
      { name: "scripts/validation/check-gitignore.sh", desc: "Verify no secrets in staged files", lang: "Bash", status: "planned" as WorkStatus },
      { name: "scripts/setup/fix-vboxdrv.sh", desc: "Install VirtualBox kernel module", lang: "Bash", status: "in-progress" as WorkStatus },
    ],
  },
];

export const docGroups = [
  {
    title: "Architecture",
    docs: [
      { name: "Platform Overview", path: "docs/architecture/overview.md", status: "implemented" as WorkStatus, blurb: "What CloudBridge is: migration, infrastructure engineering, and cloud security in one portfolio program." },
      { name: "AWS Network Design", path: "docs/architecture/aws-network.md", status: "implemented" as WorkStatus, blurb: "VPC 10.10.0.0/16 in ap-southeast-2 with two public and two private subnets. Design only." },
      { name: "Local Lab Topology", path: "docs/architecture/local-lab.md", status: "implemented" as WorkStatus, blurb: "VirtualBox host-only networks 192.168.56.0/24 and 192.168.57.0/24, plus Docker stand-ins." },
      { name: "Migration Workflow", path: "docs/architecture/migration-workflow.md", status: "implemented" as WorkStatus, blurb: "Ten-stage process from onboarding through rollback. Full implementation is Phase 4." },
      { name: "Security Architecture", path: "docs/architecture/security-architecture.md", status: "implemented" as WorkStatus, blurb: "Prowler, Checkov, and Trivy for posture. Wazuh and Splunk for the SOC in Phase 6." },
    ],
  },
  {
    title: "Customer Profiles",
    docs: [
      { name: "ACME Technologies (Customer A)", path: "customers/customer-a/README.md", status: "implemented" as WorkStatus, blurb: "On-premises to AWS. Four lab assets on 192.168.56.0/24." },
      { name: "BluePeak Solutions (Customer B)", path: "customers/customer-b/README.md", status: "deployed" as WorkStatus, blurb: "Fictional portfolio demo deployed to EC2 with private S3 and HTTPS; health, upload, and list checks passed." },
      { name: "NovaRetail (Customer C)", path: "customers/customer-c/README.md", status: "implemented" as WorkStatus, blurb: "Security assessment only. No migration. Scans planned for Phase 5." },
    ],
  },
  {
    title: "Migration Runbooks",
    docs: [
      { name: "On-Premises to AWS Runbook", path: "docs/migration-runbooks/onprem-to-aws.md", status: "planned" as WorkStatus, blurb: "ACME path: discover, plan, provision in ap-southeast-2, validate, hand off." },
      { name: "BluePeak EC2 + S3 Deployment", path: "customers/customer-b/README.md", status: "deployed" as WorkStatus, blurb: "EC2, Docker Compose, private S3, instance-role permissions, Caddy HTTPS, and smoke-test steps for the demo." },
      { name: "Data Migration Procedures", path: "docs/migration-runbooks/data-migration.md", status: "planned" as WorkStatus, blurb: "PostgreSQL and object-storage transfer checks." },
      { name: "Rollback Procedures", path: "docs/migration-runbooks/rollback.md", status: "planned" as WorkStatus, blurb: "How a wave is reversed if validation fails." },
    ],
  },
  {
    title: "Security Reports",
    docs: [
      { name: "NovaRetail — CSPM Assessment", path: "customers/customer-c/security-assessment/", status: "planned" as WorkStatus, blurb: "Placeholder for the Phase 5 Prowler report. No real scan yet." },
      { name: "Terraform IaC Scan Baseline", path: "security/checkov/", status: "planned" as WorkStatus, blurb: "Checkov baseline. Example findings on this dashboard are not scan output." },
      { name: "IAM Policy Review", path: "security/iam/", status: "planned" as WorkStatus, blurb: "Least-privilege review planned with the identity module." },
    ],
  },
  {
    title: "Setup Guides",
    docs: [
      { name: "VirtualBox Lab Setup", path: "docs/setup/virtualbox-lab.md", status: "planned" as WorkStatus, blurb: "Host-only networks and the kernel module script." },
      { name: "AWS CLI + Profile Setup", path: "docs/setup/aws-cli.md", status: "planned" as WorkStatus, blurb: "Local AWS CLI setup for future infrastructure-as-code work; the live demo uses an EC2 instance role." },
      { name: "Terraform Workflow", path: "docs/setup/terraform-workflow.md", status: "planned" as WorkStatus, blurb: "fmt, validate, and Checkov before any apply." },
      { name: "Wazuh Deployment Guide", path: "docs/setup/wazuh-deploy.md", status: "planned" as WorkStatus, blurb: "Manager VM and two agents. Phase 6." },
    ],
  },
];

export const nav = [
  { to: "/", label: "Overview", index: "01" },
  { to: "/infrastructure", label: "Infrastructure", index: "02" },
  { to: "/customers", label: "Customers", index: "03" },
  { to: "/migration", label: "Migration", index: "04" },
  { to: "/security", label: "Security", index: "05" },
  { to: "/soc", label: "SOC", index: "06" },
  { to: "/automation", label: "Automation", index: "07" },
  { to: "/documentation", label: "Documentation", index: "08" },
] as const;

export type NavTo = (typeof nav)[number]["to"];

export function doneCount() {
  return phases.filter((p) => p.status === "implemented" || p.status === "deployed").length;
}

export function progressCount() {
  return phases.filter((p) => p.status === "in-progress").length;
}

export function includesQuery(query: string, parts: Array<string | number>) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return parts.join(" ").toLowerCase().includes(q);
}

export type SearchHit = {
  title: string;
  hint: string;
  to: NavTo;
  kind: "phase" | "customer" | "migration" | "finding" | "alert" | "doc" | "host" | "workflow" | "page";
  key: string;
};

export function searchHits(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  for (const item of nav) {
    if (item.label.toLowerCase().includes(q)) {
      hits.push({ title: item.label, hint: "Section", to: item.to, kind: "page", key: item.to });
    }
  }
  for (const phase of phases) {
    if (includesQuery(q, [phase.name, phase.description, ...phase.deliverables])) {
      hits.push({ title: phase.name, hint: `Phase ${phase.number}`, to: "/", kind: "phase", key: String(phase.number) });
    }
  }
  for (const customer of customers) {
    if (includesQuery(q, [customer.name, customer.scenario, customer.industry])) {
      hits.push({ title: customer.name, hint: customer.scenario, to: "/customers", kind: "customer", key: customer.id });
    }
  }
  for (const host of labHosts) {
    if (includesQuery(q, [host.name, host.ip, host.customer])) {
      hits.push({ title: host.name, hint: host.ip, to: "/infrastructure", kind: "host", key: host.name });
    }
  }
  for (const finding of findings) {
    if (includesQuery(q, [finding.id, finding.title, finding.resourceType])) {
      hits.push({ title: finding.id, hint: finding.title, to: "/security", kind: "finding", key: finding.id });
    }
  }
  for (const alert of alerts) {
    if (includesQuery(q, [alert.id, alert.title])) {
      hits.push({ title: alert.id, hint: alert.title, to: "/soc", kind: "alert", key: alert.id });
    }
  }
  for (const flow of workflows) {
    if (includesQuery(q, [flow.name, flow.triggers, ...flow.jobs])) {
      hits.push({ title: flow.name, hint: flow.triggers, to: "/automation", kind: "workflow", key: flow.name });
    }
  }
  for (const group of docGroups) {
    for (const doc of group.docs) {
      if (includesQuery(q, [doc.name, doc.path, doc.blurb])) {
        hits.push({ title: doc.name, hint: doc.path, to: "/documentation", kind: "doc", key: doc.path });
      }
    }
  }
  for (const mig of migrations) {
    if (includesQuery(q, [mig.customer, mig.from, mig.to, mig.id])) {
      hits.push({ title: mig.customer, hint: `${mig.from} to ${mig.to}`, to: "/migration", kind: "migration", key: mig.id });
    }
  }
  return hits.slice(0, 8);
}
