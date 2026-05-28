'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Bell, CalendarDays, Clock, LayoutDashboard, ListChecks, Settings, Stethoscope, UserPlus, Users, Workflow } from 'lucide-react'
import { Button, cn } from '@/components/ui'
import { SignOutButton } from '@/components/SignOutButton'

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
      <aside className="border-b border-slate-800 bg-slate-950/70 px-4 py-4 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300 text-slate-950 font-black">C</div>
          <div>
            <p className="font-bold text-white">Calenzo</p>
            <p className="text-xs text-slate-500">Clinic command center</p>
          </div>
        </div>
        <nav className="mt-6 grid gap-1">
          {navItems.map(([label, href, Icon]) => {
            const isActive = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-sky-300/10 text-sky-200 border border-sky-400/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-[#050816]/85 px-4 py-3 backdrop-blur md:px-8">
          <div>
            <p className="text-sm font-semibold text-white">{user?.name || user?.email}</p>
            <p className="text-xs text-slate-500">{user?.role || 'ADMIN'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button href="/" variant="ghost" size="sm">Public site</Button>
            <SignOutButton />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  )
}
