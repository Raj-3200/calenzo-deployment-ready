import { Bell, Command, Search, ShieldCheck } from 'lucide-react'
import { Badge, Button } from '../common/UI'
import { DEFAULT_USER } from '../../data/constants'

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 lg:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            placeholder="Search patient, phone, token, appointment..."
          />
          <Badge variant="slate" className="hidden xl:inline-flex">
            <Command className="h-3 w-3" />
            K
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="green" className="hidden sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Protected
          </Badge>
          <Button variant="secondary" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-sm font-black text-cyan-800">
              {DEFAULT_USER.name.charAt(0)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-slate-950">{DEFAULT_USER.name}</p>
              <p className="text-xs font-medium capitalize text-slate-500">{DEFAULT_USER.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
