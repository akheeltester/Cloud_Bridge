// ─── Status Types ──────────────────────────────────────────────────────────

export type ImplementationStatus =
  | 'implemented'
  | 'tested-locally'
  | 'deployed'
  | 'in-progress'
  | 'planned'
  | 'demo-data'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type MigrationStage =
  | 'onboarding'
  | 'discovery'
  | 'assessment'
  | 'planning'
  | 'execution'
  | 'validation'
  | 'complete'

// ─── Customer ──────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  name: string
  industry: string
  scenario: string
  sourceCloud: string
  targetCloud: string
  status: MigrationStage
  assetCount: number
  dataStatus: ImplementationStatus
}

// ─── Security Finding ──────────────────────────────────────────────────────

export interface SecurityFinding {
  id: string
  tool: 'prowler' | 'checkov' | 'trivy'
  severity: Severity
  customer: string
  resourceType: string
  title: string
  status: 'open' | 'in-remediation' | 'resolved' | 'accepted'
  dataStatus: ImplementationStatus
}

// ─── Infrastructure Resource ───────────────────────────────────────────────

export interface InfraResource {
  id: string
  cloud: 'aws' | 'azure' | 'gcp' | 'local'
  type: string
  name: string
  region: string
  customer: string
  status: 'running' | 'stopped' | 'planned' | 'simulated'
  dataStatus: ImplementationStatus
}

// ─── Migration Project ─────────────────────────────────────────────────────

export interface MigrationProject {
  id: string
  customer: string
  from: string
  to: string
  stage: MigrationStage
  stagePercent: number
  services: number
  dataStatus: ImplementationStatus
}

// ─── SOC Alert ─────────────────────────────────────────────────────────────

export interface SocAlert {
  id: string
  severity: Severity
  title: string
  source: string
  customer: string
  timestamp: string
  status: 'open' | 'investigating' | 'resolved'
  dataStatus: ImplementationStatus
}

// ─── Phase Progress ────────────────────────────────────────────────────────

export interface Phase {
  number: number
  name: string
  status: ImplementationStatus
  description: string
  deliverables: string[]
}
