import { AlertTriangle } from 'lucide-react'

/**
 * Prominent banner shown on every page that contains demo/sample data.
 * This is a core honesty requirement — sample data must never be mistaken for real findings.
 */
export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-3 text-amber-300 text-sm mb-6">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
      <span>
        <strong className="font-semibold">Demo Data</strong> — This page contains sample data for
        portfolio demonstration. It does not represent real deployed infrastructure, real security
        findings, or real customer environments. Data labelled{' '}
        <span className="font-mono text-amber-400 text-xs bg-amber-950 px-1 py-0.5 rounded">
          ⚠️ Demo Data
        </span>{' '}
        will be replaced with verified real output as each phase is completed.
      </span>
    </div>
  )
}
