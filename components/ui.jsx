import Link from 'next/link'
import { Activity, ArrowUpRight, Search } from 'lucide-react'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Button({ as: Tag = 'button', href, variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-2xl text-center font-semibold leading-tight transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0'
  const variants = {
    primary: 'bg-sky-300 text-slate-950 shadow-[0_18px_48px_rgba(56,189,248,0.22)] hover:bg-sky-200',
    secondary: 'border border-slate-700 bg-slate-900/80 text-slate-100 hover:border-sky-400/70 hover:bg-slate-800',
    ghost: 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
    danger: 'bg-red-500 text-white hover:bg-red-400',
    success: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
  }
  const sizes = {
    sm: 'min-h-9 px-3 py-2 text-sm',
    md: 'min-h-11 px-4 py-2.5 text-sm',
    lg: 'min-h-12 px-5 py-3 text-base',
  }
  const propsWithClass = { className: cn(base, variants[variant], sizes[size], className), ...props }
  if (href) return <Link href={href} {...propsWithClass}>{children}</Link>
  return <Tag {...propsWithClass}>{children}</Tag>
}

export function Card({ className = '', children }) {
  return <div className={cn('dark-panel rounded-2xl p-5', className)}>{children}</div>
}

export function Badge({ children, tone = 'slate', className = '' }) {
  const tones = {
    slate: 'border-slate-700 bg-slate-900/80 text-slate-300',
    sky: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    red: 'border-red-400/30 bg-red-400/10 text-red-200',
    violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  }
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>
}

export function Input({ className = '', ...props }) {
  return <input className={cn('h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10', className)} {...props} />
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={cn('min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10', className)} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return <select className={cn('h-11 w-full rounded-2xl border border-slate-700 bg-slate-950/50 px-3 text-sm text-white outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10', className)} {...props}>{children}</select>
}

export function Label({ children }) {
  return <label className="mb-2 block text-sm font-medium text-slate-300">{children}</label>
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="mb-2 text-sm font-semibold text-sky-300">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{action}</div> : null}
    </div>
  )
}

export function StatCard({ label, value, helper, icon: Icon = Activity, tone = 'sky' }) {
  const tones = {
    sky: 'bg-sky-400/10 text-sky-200',
    green: 'bg-emerald-400/10 text-emerald-200',
    amber: 'bg-amber-400/10 text-amber-200',
    violet: 'bg-violet-400/10 text-violet-200',
    red: 'bg-red-400/10 text-red-200',
  }
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
        </div>
        <div className={cn('rounded-2xl p-2.5', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  )
}

export function EmptyState({ title = 'No data available yet.', description = 'Once activity starts, this panel will update automatically.', action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/35 p-5 text-center sm:p-8">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-200">
        <Search className="h-5 w-5" />
      </div>
      <p className="font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').replaceAll('_', ' ')
  const tone = {
    pending: 'amber',
    confirmed: 'sky',
    arrived: 'violet',
    in_progress: 'green',
    completed: 'green',
    cancelled: 'red',
    no_show: 'red',
    rescheduled: 'amber',
    waiting: 'sky',
    skipped: 'amber',
  }[status] || 'slate'

  return <Badge tone={tone}>{normalized}</Badge>
}

export function SearchBox({ name = 'q', defaultValue = '', placeholder = 'Search' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} className="pl-9" />
    </div>
  )
}

export function SectionLink({ href, children }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200">
      {children}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  )
}
