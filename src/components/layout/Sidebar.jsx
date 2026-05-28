import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Stethoscope,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { logoutAdmin } from '../../lib/authApi'

const navSections = [
  {
    label: 'Operations',
    links: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
      { name: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
      { name: 'Live Queue', path: '/admin/live-queue', icon: Activity },
      { name: 'Walk-In Booking', path: '/admin/walk-ins', icon: UserRoundCheck },
      { name: 'Doctor Schedule', path: '/admin/doctor-schedule', icon: CalendarClock },
    ],
  },
  {
    label: 'Growth',
    links: [
      { name: 'Patients', path: '/admin/patients', icon: UsersRound },
      { name: 'Follow-Ups', path: '/admin/follow-ups', icon: HeartPulse },
      { name: 'Services', path: '/admin/services', icon: ClipboardList },
      { name: 'Notifications', path: '/admin/notifications', icon: MessageCircle },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    links: [
      { name: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  async function logout() {
    await logoutAdmin()
    localStorage.removeItem('calenzo_auth')
    localStorage.removeItem('calenzo_role')
    localStorage.removeItem('calenzo_user')
    navigate('/admin/login')
  }

  return (
    <>
      <button
        className="fixed left-4 top-3 z-50 rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent onLogout={logout} />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
            >
              <div className="absolute right-3 top-3">
                <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close navigation">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent onLogout={logout} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function SidebarContent({ onLogout, onNavigate }) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link to="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-cyan-300">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-slate-950">Calenzo</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-700">Clinic Command</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{section.label}</p>
            <div className="space-y-1">
              {section.links.map((link) => {
                const active = link.end ? location.pathname === link.path : location.pathname.startsWith(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                      active ? 'bg-cyan-50 text-cyan-800 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    <link.icon className={`h-5 w-5 ${active ? 'text-cyan-700' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-3 rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Stethoscope className="h-4 w-4 text-cyan-300" />
            Doctor Mode Ready
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Clean view for current patient, notes, and flow control.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
