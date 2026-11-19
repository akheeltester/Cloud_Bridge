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
export const JIGSAW_DEMO_URL = "https://cloudbridge-jigsaw-j2qhkxzfka-ts.a.run.app";
export const NOVARETAIL_DEMO_URL = "https://novatrail.duckdns.org";

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
    status: "implemented" as WorkStatus,
    description: "Git repo, documentation, CI/CD, and portfolio dashboard.",
    deliverables: ["GitHub repository", "README + docs", "CI workflows", "Dashboard (this)", "GitHub Pages"],
  },
  {
    number: 2,
    name: "Local Infrastructure",
    status: "implemented" as WorkStatus,
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
    status: "implemented" as WorkStatus,
    description: "Three workload migrations rehearsed end-to-end: BluePeak to AWS EC2+S3, Jigsaw to GCP Cloud Run, NovaTrail to a GCP VM — each deployed, health-checked and DB-write-verified. Runbooks document every step.",
    deliverables: ["Migration workflow defined", "3 container deployments executed", "Health + data-write validation", "Runbooks per deployment", "Rollback procedures documented"],
  },
  {
    number: 5,
    name: "Cloud Security",
    status: "in-progress" as WorkStatus,
    description: "Scans complete: Checkov 22→16 after IaC fixes, Trivy IaC (23) + 3 images (448/448/251 findings), Prowler GCP 86 checks (67 fail, 2 critical firewall rules). Remediation batch pending approval; AWS scan awaits re-auth.",
    deliverables: ["Checkov IaC scan + remediation", "Trivy config + image scans", "Prowler GCP assessment", "Security report with accepted risks", "Firewall + image remediation pending"],
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
    status: "in-progress" as WorkStatus,
    description: "Jigsaw is live on GCP Cloud Run and NovaRetail on a free-tier GCP VM — both verified. Azure deferred (signup requires a card); its App Service F1 IaC stays validated for later.",
    deliverables: ["GCP Cloud Run deployed + verified", "GCP free-tier VM deployed + verified", "NovaRetail app built + tested", "Deploy scripts + runbooks", "Azure IaC ready (deferred)"],
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
    note: "Deferred: Azure signup requires a payment card. App Service F1 IaC remains validated; customer-c was deployed to a GCP free-tier VM instead.",
  },
  {
    name: "Google Cloud Platform",
    region: "australia-southeast1 + us-central1",
    pct: 90,
    status: "deployed" as WorkStatus,
    note: "Two live workloads: Jigsaw on Cloud Run (Sydney) and NovaRetail on a free-tier e2-micro VM (us-central1). Both health- and DB-write-verified.",
  },
];

export const customers = [
  {
    id: "customer-a",
    name: "ACME Technologies",
    industry: "Technology",
    scenario: "On-premises → GCP Cloud Run",
    sourceCloud: "On-Premises / local Docker",
    targetCloud: "GCP Cloud Run · australia-southeast1",
    status: "deployed",
    assetCount: 3,
    dataStatus: "demo-data" as WorkStatus,
    summary: "Jigsaw workplace portal (Node/TanStack) is live on GCP Cloud Run. Pages and account sign-up (embedded-DB write) verified over HTTPS. Demo data only; PGlite storage is not durable across cold starts.",
    assets: [
      { name: "Jigsaw app", spec: "Node 24 · TanStack Start · nitro node-server", ip: "container :8080", role: "Web + staff portal" },
      { name: "Container image", spec: "Cloud Run image + PGlite runtime assets", ip: "Artifact Registry cloudbridge", role: "Deployed artifact" },
      { name: "Cloud Run service", spec: "scale-to-zero · 512Mi · 1 instance cap", ip: JIGSAW_DEMO_URL.replace("https://", ""), role: "Live serverless host" },
    ],
    network: "Public HTTPS via Cloud Run (allUsers invoker for demo). Embedded PGlite fallback for demo; managed PostgreSQL optional.",
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
    scenario: "Security assessment + GCP VM deploy",
    sourceCloud: "Local Docker simulation",
    targetCloud: "GCP Compute Engine e2-micro · us-central1",
    status: "deployed",
    assetCount: 4,
    dataStatus: "demo-data" as WorkStatus,
    summary: "NovaTrail trail-running storefront (black & white enterprise console, branded logo/favicon) is live on a free-tier GCP VM over HTTPS. Health, catalogue, and order creation verified. SQLite persists on the VM disk. Security assessment remains Phase 5 scope.",
    assets: [
      { name: "Retail API", spec: "FastAPI · /api/health, products, orders", ip: "container :8000 → host :80", role: "E-commerce backend" },
      { name: "Database", spec: "SQLite on stateful VM disk", ip: "/var/lib/cloudbridge-novaretail", role: "Catalogue + orders (persistent)" },
      { name: "VM", spec: "e2-micro · Container-Optimized OS · free grant", ip: NOVARETAIL_DEMO_URL.replace("https://", ""), role: "Live compute host" },
      { name: "Image registry", spec: "Artifact Registry cloudbridge-us (us-central1)", ip: "VM service-account pull", role: "Deployed artifact" },
    ],
    network: "Public HTTPS via Caddy + Let's Encrypt (novatrail.duckdns.org); HTTP auto-redirects. Approved cost: public IPv4 ~$3.60/mo; VM + 30GB disk free.",
  },
];

export const migrations = [
  {
    id: "mig-customer-a",
    customer: "ACME Technologies",
    from: "On-premises / local Docker",
    to: "GCP Cloud Run · australia-southeast1",
    stage: "validation",
    stagePercent: 90,
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
  {
    id: "mig-customer-c",
    customer: "NovaRetail",
    from: "Local Docker simulation",
    to: "GCP Compute Engine e2-micro · us-central1",
    stage: "validation",
    stagePercent: 90,
    services: 4,
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
    id: "CB-P5-001",
    tool: "trivy",
    severity: "high" as Severity,
    customer: "customer-c",
    resourceType: "Compute Engine VM",
    title: "VM has a public IP address (intentional for public demo; cost approved)",
    status: "accepted-risk",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-002",
    tool: "checkov",
    severity: "medium" as Severity,
    customer: "customer-c",
    resourceType: "Compute Engine VM",
    title: "Project-wide SSH keys not blocked (CKV_GCP_32) — fixed and applied",
    status: "fixed",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-003",
    tool: "checkov",
    severity: "medium" as Severity,
    customer: "customer-c",
    resourceType: "Compute Engine VM",
    title: "Shielded VM disabled (CKV_GCP_39) — secure boot/vTPM/integrity enabled and applied",
    status: "fixed",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-004",
    tool: "checkov",
    severity: "low" as Severity,
    customer: "platform",
    resourceType: "Dockerfiles",
    title: "No HEALTHCHECK in 3 customer images (CKV_DOCKER_2) — added",
    status: "fixed-in-iac",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-005",
    tool: "checkov",
    severity: "low" as Severity,
    customer: "platform",
    resourceType: "Disk / Artifact Registry",
    title: "CSEK not used (CKV_GCP_38/84) — Google-managed encryption accepted for demo data",
    status: "accepted-risk",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-006",
    tool: "checkov",
    severity: "medium" as Severity,
    customer: "platform",
    resourceType: "Azure App Service",
    title: "12 production-hardening checks deferred with Azure engagement (F1 free tier)",
    status: "deferred",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-007",
    tool: "prowler",
    severity: "critical" as Severity,
    customer: "platform",
    resourceType: "VPC Firewall",
    title: "GCP default-allow-ssh/rdp exposed 22/3389 to the internet — deleted; SSH now IAP-only (verified)",
    status: "fixed",
    dataStatus: "implemented" as WorkStatus,
  },
  {
    id: "CB-P5-008",
    tool: "trivy",
    severity: "critical" as Severity,
    customer: "platform",
    resourceType: "Container images",
    title: "3 perl-base CVEs in Python base images — rebuilt + redeployed both apps; re-scan shows 0 critical",
    status: "fixed",
    dataStatus: "implemented" as WorkStatus,
  },
];

export const scanners = [
  {
    tool: "Prowler",
    purpose: "AWS configuration assessment",
    phase: "Phase 5",
    checks: ["IAM", "Network", "Storage", "Logging", "Encryption"],
    status: "in-progress" as WorkStatus,
  },
  {
    tool: "Checkov",
    purpose: "Terraform IaC scanning",
    phase: "Phase 5 (CI from Phase 1)",
    checks: ["S3 public access", "SG rules", "IAM wildcards", "Encryption", "Logging"],
    status: "implemented" as WorkStatus,
  },
  {
    tool: "Trivy",
    purpose: "Container and config scanning",
    phase: "Phase 5",
    checks: ["Docker images", "Filesystem", "IaC configs", "Secrets"],
    status: "in-progress" as WorkStatus,
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
  { cloud: "Microsoft Azure", region: "australiaeast", phase: "Deferred — App Service F1 IaC validated, awaiting account (card required)" },
];

export const workflows = [
  {
    name: "ci.yml",
    triggers: "Push / PR to main + manual dispatch",
    jobs: ["TruffleHog secret scan (verified-only, incremental on push)", "Terraform fmt + init + validate (per-stack matrix)", "Checkov IaC security scan", "Markdown lint"],
    status: "implemented" as WorkStatus,
  },
  {
    name: "deploy-dashboard.yml",
    triggers: "Push to main (dashboard/** changed) + manual dispatch",
    jobs: ["npm ci + TypeScript/Vite build", "Upload Pages artifact", "Deploy to GitHub Pages (this site)"],
    status: "implemented" as WorkStatus,
  },
];

export const cicdPipeline = [
  { step: "Push / PR", detail: "Every change to main enters the pipeline" },
  { step: "Secret scan", detail: "TruffleHog — verified secrets only, incremental diff" },
  { step: "Terraform validate", detail: "fmt -check + init + validate per stack" },
  { step: "Checkov IaC scan", detail: "Policy checks on all Terraform code" },
  { step: "Build dashboard", detail: "npm ci + tsc + vite (dashboard changes only)" },
  { step: "GitHub Pages", detail: "This dashboard auto-deploys on merge" },
];

export const deployments = [
  {
    customer: "BluePeak Solutions",
    brand: "BluePeak Service Portal",
    cloud: "AWS",
    region: "ap-southeast-2 (Sydney)",
    url: LIVE_DEMO_URL,
    stack: ["EC2 · Amazon Linux 2023", "Docker Compose · Nginx + FastAPI + PostgreSQL", "Private S3 · instance role", "Caddy · automatic HTTPS"],
    verified: "2026-11-19",
    cost: "Free-tier EC2 + S3",
    checks: "Health, upload, list, HTTPS — all passed",
  },
  {
    customer: "ACME Technologies",
    brand: "Jigsaw Workplace Portal",
    cloud: "GCP",
    region: "australia-southeast1 (Sydney)",
    url: JIGSAW_DEMO_URL,
    stack: ["Cloud Run · scale-to-zero", "Node 24 · TanStack Start", "Artifact Registry", "512Mi · 1 instance cap"],
    verified: "2026-11-19",
    cost: "Cloud Run free tier",
    checks: "Pages 200, auth sign-up (DB write) verified",
  },
  {
    customer: "NovaRetail",
    brand: "NovaTrail Trail-Running Store",
    cloud: "GCP",
    region: "us-central1 (Iowa)",
    url: NOVARETAIL_DEMO_URL,
    stack: ["Compute Engine e2-micro · free grant", "Container-Optimized OS + Docker", "Caddy sidecar · Let's Encrypt", "Shielded VM · IAP-only SSH"],
    verified: "2026-11-19",
    cost: "~$3.60/mo static IPv4 (credits) — rest free",
    checks: "Health, catalogue, order write over HTTPS verified",
  },
];

export const cloudActions = [
  { cloud: "GCP", date: "Nov 19", action: "Jigsaw deployed to Cloud Run", detail: "APIs enabled, image pushed to Artifact Registry, Terraform plan→apply, scale-to-zero free-tier posture" },
  { cloud: "GCP", date: "Nov 19", action: "Image + auth fixes", detail: "Restored PGlite runtime assets dropped by the bundler; set BETTER_AUTH_URL so sign-up trusts the Cloud Run origin" },
  { cloud: "GCP", date: "Nov 19", action: "NovaTrail VM provisioned", detail: "Terraform e2-micro (COS) in us-central1; app container + Caddy sidecar; DuckDNS + Let's Encrypt HTTPS; static IP" },
  { cloud: "GCP", date: "Nov 19", action: "Security hardening applied", detail: "Shielded VM, project-wide SSH keys blocked, deletion protection, IAP-only SSH; default-allow-ssh/rdp firewall rules deleted" },
  { cloud: "GCP", date: "Nov 19", action: "Prowler posture scan", detail: "86 checks · 67 findings · both criticals remediated and verified; report in docs/security-reports/phase-5" },
  { cloud: "AWS", date: "Nov 13", action: "BluePeak deployed to EC2 + S3", detail: "Docker Compose stack, private S3 uploads via instance role (no static keys), Caddy HTTPS on DuckDNS" },
  { cloud: "AWS", date: "Nov 19", action: "Enterprise UI + patched image", detail: "New portal UI rolled out over SSH; app image rebuilt from refreshed base — 0 critical CVEs on re-scan" },
  { cloud: "AWS", date: "Next", action: "Prowler AWS + CloudTrail → SOC", detail: "Awaiting CLI re-auth; CloudTrail ingestion planned for Phase 6" },
];

export const toolchain = [
  { tool: "Terraform", role: "Infrastructure as Code", how: "Reusable modules + per-customer environments for GCP Cloud Run, GCP Compute VM, and Azure App Service. Plan-first workflow; apply only with explicit approval; local state (gitignored).", evidence: "3 stacks validated; 2 applied live", status: "implemented" as WorkStatus },
  { tool: "Checkov", role: "IaC security scanning", how: "Scans every Terraform stack and Dockerfile in CI and locally. Findings triaged into fixed / accepted-risk / deferred with written rationale.", evidence: "22 → 16 findings; 6 remediated (HEALTHCHECKs, Shielded VM, SSH keys, FTPS/HTTP2)", status: "implemented" as WorkStatus },
  { tool: "Trivy", role: "Image + config scanning", how: "Vulnerability scans of all three customer images plus an IaC/config scan of the repo. Criticals with available fixes remediated by rebuilding from refreshed base images.", evidence: "Image criticals 7 → 1 (remaining: no vendor fix yet); 23 IaC findings", status: "implemented" as WorkStatus },
  { tool: "Prowler", role: "Cloud posture (CSPM)", how: "Live assessment of the GCP project using CLI credentials. Critical firewall findings remediated the same day; AWS scan queued behind re-auth.", evidence: "86 checks · 2 criticals fixed (internet-wide SSH/RDP removed)", status: "in-progress" as WorkStatus },
  { tool: "TruffleHog", role: "Secret scanning in CI", how: "Runs first in ci.yml on every push/PR — verified-only, incremental over the push diff so credentials never reach the public repo.", evidence: "Gate for all downstream CI jobs", status: "implemented" as WorkStatus },
  { tool: "Docker", role: "Workload packaging", how: "All three apps containerized: non-root users, explicit ports, HEALTHCHECK instructions, multi-stage build for Jigsaw.", evidence: "3 images built, scanned, deployed", status: "implemented" as WorkStatus },
  { tool: "Caddy", role: "Automatic HTTPS", how: "TLS termination + Let's Encrypt on both AWS (EC2) and GCP (sidecar container), with HTTP→HTTPS redirect and auto-renewal.", evidence: "2 public HTTPS endpoints, certs auto-renew", status: "implemented" as WorkStatus },
  { tool: "GitHub Actions", role: "CI/CD", how: "ci.yml gates every change (secrets → Terraform → Checkov → lint); deploy-dashboard.yml publishes this dashboard to GitHub Pages on merge.", evidence: "2 active workflows", status: "implemented" as WorkStatus },
  { tool: "Wazuh", role: "SOC / SIEM (Phase 6)", how: "Manager already running in VirtualBox; agents enroll on the cloud VMs next, feeding alerts into this dashboard's SOC page.", evidence: "Server ready · agent rollout scheduled", status: "planned" as WorkStatus },
];

export const scanStats = {
  checkov: { before: 22, after: 16 },
  imageCriticals: { before: 7, after: 1 },
  prowler: { checks: 86, fail: 67, criticals: 2, criticalsFixed: 2 },
  trivyIac: 23,
};

export const milestones = [
  { date: "Nov 5", title: "Engineering foundation", detail: "Repo, architecture docs, CI scaffolding, customer profiles", phase: "0–1", done: true },
  { date: "Nov 6", title: "Dashboard + CI/CD live", detail: "React console published to GitHub Pages via Actions", phase: "1", done: true },
  { date: "Nov 11", title: "BluePeak simulation validated", detail: "19 unit/static tests + Compose health, upload and proxy flows", phase: "2", done: true },
  { date: "Nov 13", title: "First cloud deployment (AWS)", detail: "BluePeak on EC2 + private S3 + Caddy HTTPS", phase: "3–4", done: true },
  { date: "Nov 19", title: "GCP Cloud Run (Jigsaw)", detail: "Serverless deployment, free-tier posture, auth verified", phase: "7", done: true },
  { date: "Nov 19", title: "GCP VM + HTTPS (NovaTrail)", detail: "Free-tier e2-micro, Caddy + Let's Encrypt, enterprise rebrand", phase: "7", done: true },
  { date: "Nov 19", title: "Security scans + remediation", detail: "Checkov / Trivy / Prowler; criticals fixed and re-verified", phase: "5", done: true },
  { date: "Nov 20", title: "SOC & monitoring", detail: "Wazuh agents on cloud VMs, detection rules, live alerts", phase: "6", done: false },
];

export function phaseProgress(status: WorkStatus): number {
  switch (status) {
    case "implemented":
    case "deployed":
      return 100;
    case "tested-locally":
      return 75;
    case "in-progress":
      return 55;
    case "demo-data":
      return 50;
    default:
      return 10;
  }
}

export const catalogs = [
  {
    category: "Terraform Modules",
    items: [
      { name: "aws/modules/networking", desc: "VPC, subnets, IGW, route tables, NACLs", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/security", desc: "Security Groups, NACLs", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/identity", desc: "IAM roles, policies, instance profiles", lang: "HCL", status: "planned" as WorkStatus },
      { name: "aws/modules/logging", desc: "CloudTrail, CloudWatch Logs, S3 log bucket", lang: "HCL", status: "planned" as WorkStatus },
      { name: "azure/modules/appservice", desc: "App Service F1 plan + Linux container web app (validated)", lang: "HCL", status: "tested-locally" as WorkStatus },
      { name: "gcp/modules/cloudrun", desc: "Cloud Run v2 service, scale-to-zero, public IAM (deployed)", lang: "HCL", status: "deployed" as WorkStatus },
      { name: "gcp/modules/compute-vm", desc: "e2-micro free-tier VM, COS, AR pull via SA, guest firewall (deployed)", lang: "HCL", status: "deployed" as WorkStatus },
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
      { name: "ACME Technologies (Customer A)", path: "customers/customer-a/README.md", status: "deployed" as WorkStatus, blurb: "Jigsaw portal live on GCP Cloud Run; pages and sign-up verified. Embedded PGlite demo storage." },
      { name: "BluePeak Solutions (Customer B)", path: "customers/customer-b/README.md", status: "deployed" as WorkStatus, blurb: "Fictional portfolio demo deployed to EC2 with private S3 and HTTPS; health, upload, and list checks passed." },
      { name: "NovaRetail (Customer C)", path: "customers/customer-c/README.md", status: "deployed" as WorkStatus, blurb: "Retail API live on a free-tier GCP VM; health and order write verified. Security assessment in Phase 5." },
    ],
  },
  {
    title: "Migration Runbooks",
    docs: [
      { name: "On-Premises to AWS Runbook", path: "docs/migration-runbooks/onprem-to-aws.md", status: "planned" as WorkStatus, blurb: "ACME path: discover, plan, provision in ap-southeast-2, validate, hand off." },
      { name: "BluePeak EC2 + S3 Deployment", path: "customers/customer-b/README.md", status: "deployed" as WorkStatus, blurb: "EC2, Docker Compose, private S3, instance-role permissions, Caddy HTTPS, and smoke-test steps for the demo." },
      { name: "Jigsaw → GCP Cloud Run", path: "docs/migration-runbooks/customer-a-gcp-cloudrun.md", status: "deployed" as WorkStatus, blurb: "Deployed and live-verified on Cloud Run: pages 200, auth sign-up (DB write) 200. Runbook covers APIs, registry, plan-first deploy, validation, rollback." },
      { name: "NovaRetail → Azure App Service", path: "docs/migration-runbooks/customer-c-azure-appservice.md", status: "planned" as WorkStatus, blurb: "App Service F1 runbook (deferred — Azure needs a card). IaC validated; kept for a future Azure engagement." },
      { name: "NovaRetail → GCP Compute Engine VM", path: "docs/migration-runbooks/customer-c-gcp-vm.md", status: "deployed" as WorkStatus, blurb: "Deployed and live-verified on a free-tier e2-micro VM: health, catalogue, and order write checked externally. Cost table + COS pitfalls documented." },
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
