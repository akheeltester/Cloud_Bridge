interface ProgressBarProps {
  value: number      // 0-100
  max?: number
  label?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  size?: 'sm' | 'md'
}

const colorMap = {
  blue: 'bg-sky-500',
  green: 'bg-emerald-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  purple: 'bg-indigo-500',
}

export function ProgressBar({ value, max = 100, label, color = 'blue', size = 'md' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const h = size === 'sm' ? 'h-1' : 'h-2'

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs text-slate-500">{pct}%</span>
        </div>
      )}
      <div className={`w-full ${h} bg-[#1e2d45] rounded-full overflow-hidden`}>
        <div
          className={`${h} ${colorMap[color]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
