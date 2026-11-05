import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-[#111827] border border-[#1e2d45] rounded-xl p-5
        ${hover ? 'hover:border-sky-700 hover:bg-[#121e32] transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-[#1a2236] flex items-center justify-center text-sky-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const accentMap = {
  blue: 'text-sky-400 bg-sky-950',
  green: 'text-emerald-400 bg-emerald-950',
  orange: 'text-orange-400 bg-orange-950',
  red: 'text-red-400 bg-red-950',
  purple: 'text-indigo-400 bg-indigo-950',
}

export function StatCard({ label, value, sub, icon, accent = 'blue' }: StatCardProps) {
  const colors = accentMap[accent]
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colors.split(' ')[0]}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
