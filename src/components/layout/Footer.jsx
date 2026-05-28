import { Link } from 'react-router-dom'
import { Activity, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { CLINIC_PROFILE } from '../../data/constants'

export default function Footer() {
  const columns = [
    {
      title: 'Patient',
      links: [['Book Appointment', '/book'], ['Live Queue', '/queue'], ['Patient Login', '/patient/login'], ['AI Assistant', '/patient/chat']],
    },
    {
      title: 'Clinic',
      links: [['Admin Login', '/admin/login'], ['Dashboard', '/admin'], ['Analytics', '/admin/analytics'], ['Settings', '/admin/settings']],
    },
    {
      title: 'Platform',
      links: [['Services', '/services'], ['Contact', '/contact'], ['Virtual Window', '/queue'], ['Walk-ins', '/admin/walk-ins']],
    },
  ]

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr_1.4fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xl font-black">Calenzo</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">Clinic OS</span>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              AI-powered booking, live queue, walk-in, WhatsApp, follow-up, patient database, and clinic operations for modern healthcare teams.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">{column.title}</h4>
                <ul className="mt-4 space-y-3">
                  {column.links.map(([label, path]) => (
                    <li key={path}>
                      <Link to={path} className="text-sm text-slate-400 transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h4 className="text-sm font-bold text-white">{CLINIC_PROFILE.clinic_name}</h4>
            <div className="mt-4 space-y-3 text-sm text-slate-400">
              <p className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 text-cyan-300" />{CLINIC_PROFILE.phone}</p>
              <p className="flex gap-2"><MessageCircle className="mt-0.5 h-4 w-4 text-cyan-300" />{CLINIC_PROFILE.whatsapp_number}</p>
              <p className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 text-cyan-300" />{CLINIC_PROFILE.email}</p>
              <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />{CLINIC_PROFILE.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>Copyright 2026 Calenzo. All rights reserved.</p>
          <p>Built for clinics that value calm operations and patient trust.</p>
        </div>
      </div>
    </footer>
  )
}
