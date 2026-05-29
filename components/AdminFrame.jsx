'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Bell, CalendarDays, Clock, Home, LayoutDashboard, ListChecks, Settings, Stethoscope, UserPlus, Users, Workflow } from 'lucide-react'
import { Button, cn } from '@/components/ui'
import { AdminSignOutButton } from '@/components/AdminSignOutButton'

const navItems = [
  ['Dashboard', '/admin', LayoutDashboard],
  ['Appointments', '/admin/appointments', CalendarDays],
  ['Live Queue', '/admin/queue', Workflow],
  ['Walk-Ins', '/admin/walk-ins', UserPlus],
  ['Patients', '/admin/patients', Users],
  ['Follow-Ups', '/admin/follow-ups', ListChecks],
  ['Services', '/admin/services', Stethoscope],
  ['Doctor Schedule', '/admin/doctor-schedule', Clock],
  ['Notifications', '/admin/notifications', Bell],
  ['Analytics', '/admin/analytics', BarChart3],
  ['Settings', '/admin/settings', Settings],
]

export function AdminFrame({ children, user }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="border-b border-slate-800 bg-slate-950/70 px-3 py-3 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-4">
        <div className="flex items-center gap-3 px-1 lg:px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-300 text-slate-950 font-black">C</div>
          <div className="min-w-0">
            <p className="truncate font-bold text-white">Calenzo</p>
            <p className="truncate text-xs text-slate-500">Clinic command center</p>
          </div>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:grid lg:overflow-visible lg:pb-0">
          {navItems.map(([label, href, Icon]) => {
            const isActive = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition lg:gap-3',
                  isActive
                    ? 'bg-sky-300/10 text-sky-200 border border-sky-400/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline lg:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-800 bg-[#050816]/85 px-3 py-3 backdrop-blur md:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || user?.email}</p>
            <p className="truncate text-xs text-slate-500">{user?.role || 'ADMIN'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button href="/" variant="ghost" size="sm" title="Public site" aria-label="Public site">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Public site</span>
            </Button>
            <AdminSignOutButton />
          </div>
        </header>
        <main className="min-w-0 px-3 py-5 sm:px-4 md:px-8 md:py-6">{children}</main>
      </div>
    </div>
  )
}
