import type { ImplementationStatus, Severity } from '../types'

// ─── Implementation Status Badge ──────────────────────────────────────────

const statusConfig: Record<ImplementationStatus, { label: string; classes: string }> = {
  implemented: { label: '✅ Implemented', classes: 'bg-emerald-950 text-emerald-400 border border-emerald-800' },
  'tested-locally': { label: '🧪 Tested Locally', classes: 'bg-blue-950 text-blue-400 border border-blue-800' },
  deployed: { label: '☁️ Deployed', classes: 'bg-sky-950 text-sky-400 border border-sky-800' },
  'in-progress': { label: '🔵 In Progress', classes: 'bg-indigo-950 text-indigo-400 border border-indigo-800' },
  planned: { label: '📋 Planned', classes: 'bg-slate-800 text-slate-400 border border-slate-700' },
  'demo-data': { label: '⚠️ Demo Data', classes: 'bg-amber-950 text-amber-400 border border-amber-800' },
}

interface StatusBadgeProps {
  status: ImplementationStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.classes}`}>
      {config.label}
    </span>
  )
}

// ─── Severity Badge ────────────────────────────────────────────────────────

const severityConfig: Record<Severity, { label: string; classes: string; dot: string }> = {
  critical: { label: 'Critical', classes: 'bg-red-950 text-red-400 border border-red-800', dot: 'bg-red-500' },
  high: { label: 'High', classes: 'bg-orange-950 text-orange-400 border border-orange-800', dot: 'bg-orange-500' },
  medium: { label: 'Medium', classes: 'bg-amber-950 text-amber-400 border border-amber-800', dot: 'bg-amber-500' },
  low: { label: 'Low', classes: 'bg-blue-950 text-blue-400 border border-blue-800', dot: 'bg-blue-500' },
  info: { label: 'Info', classes: 'bg-slate-800 text-slate-400 border border-slate-700', dot: 'bg-slate-500' },
}

interface SeverityBadgeProps {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}
