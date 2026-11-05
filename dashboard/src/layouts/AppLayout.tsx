import {
  Activity,
  BookOpen,
  Cloud,
  Code2,
  GitMerge,
  LayoutDashboard,
  Menu,
  Server,
  Shield,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const BASE = '/Cloud_Bridge'

const navItems = [
  { to: `${BASE}/`, label: 'Overview', icon: LayoutDashboard },
  { to: `${BASE}/infrastructure`, label: 'Infrastructure', icon: Cloud },
  { to: `${BASE}/customers`, label: 'Customers', icon: Users },
  { to: `${BASE}/migration`, label: 'Migration', icon: GitMerge },
  { to: `${BASE}/security`, label: 'Security', icon: Shield },
  { to: `${BASE}/soc`, label: 'SOC', icon: Activity },
  { to: `${BASE}/automation`, label: 'Automation', icon: Code2 },
  { to: `${BASE}/docs`, label: 'Documentation', icon: BookOpen },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-60 bg-[#0d1424] border-r border-[#1e2d45]
          flex flex-col transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e2d45]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">CloudBridge</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = to === `${BASE}/`
              ? location.pathname === to
              : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a2236]'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#1e2d45]">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs text-slate-600">Phase 1 — Foundation</span>
          </div>
          <a
            href="https://github.com/akheeltester/Cloud_Bridge"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sky-600 hover:text-sky-400 transition-colors mt-1 block"
          >
            github.com/akheeltester/Cloud_Bridge
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#0a0e1a]/90 backdrop-blur border-b border-[#1e2d45] px-4 lg:px-6 py-3 flex items-center justify-between">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-[#111827] border border-[#1e2d45] rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Portfolio Project
            </div>
            <a
              href="https://github.com/akheeltester/Cloud_Bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-sky-400 transition-colors bg-[#111827] border border-[#1e2d45] rounded-full px-3 py-1"
            >
              GitHub
            </a>
          </div>
          {mobileOpen && (
            <button
              className="lg:hidden text-slate-400 ml-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
