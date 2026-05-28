import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, CalendarCheck2, Menu, MonitorUp, UserRound, X } from 'lucide-react'
import { Button } from '../common/UI'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Book', path: '/book' },
  { name: 'Live Queue', path: '/queue' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-cyan-900/15">
            <Activity className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <span className="block text-lg font-black tracking-tight text-slate-950">Calenzo</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700 sm:block">Clinic OS</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  active ? 'bg-cyan-50 text-cyan-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/patient/login">
            <Button variant="ghost" size="sm">
              <UserRound className="h-4 w-4" />
              Patient
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="secondary" size="sm">
              <MonitorUp className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Link to="/book">
            <Button size="sm">
              <CalendarCheck2 className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>

        <button
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                    location.pathname === link.path ? 'bg-cyan-50 text-cyan-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link to="/patient/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">Patient</Button>
                </Link>
                <Link to="/admin/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Admin</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
