import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Download,
  Filter,
  MessageCircle,
  Search,
  X,
} from 'lucide-react'
import { getStatusConfig } from '../../utils/statusColors'
import { formatDate, formatTime } from '../../utils/formatDate'
import { getWhatsAppLink } from '../../utils/whatsappTemplates'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const variants = {
    primary: 'bg-cyan-700 text-white shadow-[0_10px_22px_rgba(14,116,144,0.24)] hover:bg-cyan-800',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm',
    subtle: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    dark: 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded-lg',
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3 text-base rounded-2xl',
    icon: 'h-10 w-10 rounded-xl',
  }

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-700/15 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.06)] ${hover ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.1)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function SoftPanel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-cyan-900/10 bg-gradient-to-br from-white to-cyan-50/45 ${className}`}>
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'slate', className = '' }) {
  const variants = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    dark: 'bg-slate-950 text-white border-slate-950',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status, type = 'appointment', config, className = '' }) {
  const current = config || getStatusConfig(type, status)
  if (!current) return null
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${current.bg} ${current.text} ${current.border} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot || 'bg-current'}`} />
      {current.label}
    </span>
  )
}

export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
        <input
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 placeholder:text-slate-400 ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
          {...props}
        />
      </span>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
      <textarea
        rows={4}
        className={`w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 placeholder:text-slate-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-semibold text-slate-700">{label}</span>}
      <span className="relative block">
        <select
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-950 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10"
      />
    </div>
  )
}

export function FilterDropdown({ value, onChange, options = [], label = 'Filter' }) {
  return (
    <div className="relative min-w-[160px]">
      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-8 text-sm text-slate-700 outline-none transition focus:border-cyan-700 focus:ring-4 focus:ring-cyan-700/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export function DatePicker({ value, onChange, label }) {
  return <Input label={label} type="date" value={value} onChange={(event) => onChange(event.target.value)} icon={CalendarDays} />
}

export function TimeSlotSelector({ slots, selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.time)}
          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
            !slot.available
              ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
              : selected === slot.time
                ? 'border-cyan-700 bg-cyan-50 text-cyan-900 ring-4 ring-cyan-700/10'
                : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/40'
          }`}
        >
          {slot.display}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold transition ${
              index < current
                ? 'bg-cyan-700 text-white'
                : index === current
                  ? 'bg-white text-cyan-800 ring-4 ring-cyan-700/12 border border-cyan-200'
                  : 'bg-slate-100 text-slate-400'
            }`}
          >
            {index < current ? <Check className="h-4 w-4" /> : index + 1}
          </div>
          {index < steps.length - 1 && <div className={`mx-1 h-0.5 w-8 sm:w-12 ${index < current ? 'bg-cyan-700' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = AlertTriangle, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center"
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}

export function LoadingSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded-full bg-slate-100" />
            <div className="h-3 w-1/2 rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative max-h-[88vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${sizes[size]}`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-950">{title}</h3>
              <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(88vh-65px)] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function Drawer({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            aria-label="Close drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <h3 className="text-base font-bold text-slate-950">{title}</h3>
              <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export function PageHeader({ title, description, action, eyebrow }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">{eyebrow}</p>}
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, trend, tone = 'cyan', helper }) {
  const tones = {
    cyan: 'bg-cyan-50 text-cyan-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    violet: 'bg-violet-50 text-violet-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-1 text-xs font-medium text-slate-400">{helper}</p>}
          {trend && <p className="mt-2 text-xs font-bold text-emerald-600">{trend}</p>}
        </div>
        {Icon && (
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  )
}

export function ChartCard({ title, description, children, action }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-950">{title}</h3>
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

export function AppointmentCard({ appointment, compact = false, actions }) {
  const patient = appointment.patient
  const service = appointment.service
  return (
    <Card hover className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-slate-950">{patient?.full_name}</p>
            <StatusBadge status={appointment.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Token {String(appointment.token_number).padStart(3, '0')} - {service?.title}
          </p>
          {!compact && (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-cyan-50 px-3 py-2 text-center text-cyan-800">
          <p className="text-[10px] font-bold uppercase">Token</p>
          <p className="text-lg font-black">{String(appointment.token_number).padStart(3, '0')}</p>
        </div>
      </div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </Card>
  )
}

export function PatientCard({ patient, action }) {
  return (
    <Card hover className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-base font-black text-cyan-800">
          {patient.full_name?.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-950">{patient.full_name}</p>
          <p className="mt-1 text-xs text-slate-500">{patient.phone}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-base font-black text-slate-950">{patient.total_visits}</p>
              <p className="text-[10px] font-semibold text-slate-400">Visits</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-base font-black text-red-600">{patient.no_show_count}</p>
              <p className="text-[10px] font-semibold text-slate-400">No-show</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="truncate text-xs font-bold text-slate-700">{patient.last_visit ? formatDate(patient.last_visit) : 'New'}</p>
              <p className="text-[10px] font-semibold text-slate-400">Last</p>
            </div>
          </div>
        </div>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  )
}

export function QueueCard({ item, actions }) {
  return (
    <Card hover className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
            {String(item.token_number).padStart(3, '0')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950">{item.patient?.full_name}</p>
            <p className="text-xs text-slate-500">{item.service?.title} - {formatTime(item.appointment?.appointment_time)}</p>
          </div>
        </div>
        <StatusBadge type="queue" status={item.current_status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="font-black text-slate-950">{item.position}</p>
          <p className="font-semibold text-slate-400">Position</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="font-black text-slate-950">{item.estimated_wait_time}m</p>
          <p className="font-semibold text-slate-400">Wait</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2">
          <p className="font-black text-amber-700">{item.delay_minutes}m</p>
          <p className="font-semibold text-amber-700/70">Delay</p>
        </div>
      </div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </Card>
  )
}

export function TicketCard({ appointment, clinic, patient, className = '' }) {
  return (
    <div className={`ticket-print rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">{clinic.clinic_name}</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Appointment Ticket</h2>
          <p className="mt-1 text-sm text-slate-500">{clinic.address}</p>
        </div>
        <div className="rounded-2xl bg-cyan-700 px-5 py-4 text-center text-white">
          <p className="text-xs font-bold uppercase">Token</p>
          <p className="text-3xl font-black">{String(appointment.token_number).padStart(3, '0')}</p>
        </div>
      </div>
      <div className="grid gap-4 py-5 sm:grid-cols-2">
        <TicketRow label="Patient" value={patient.full_name} />
        <TicketRow label="Phone" value={patient.phone} />
        <TicketRow label="Date" value={formatDate(appointment.appointment_date)} />
        <TicketRow label="Time" value={formatTime(appointment.appointment_time)} />
        <TicketRow label="Arrival window" value={`${formatTime(appointment.arrival_window_start)} - ${formatTime(appointment.arrival_window_end)}`} />
        <TicketRow label="Appointment type" value={appointment.appointment_type === 'follow_up' ? 'Follow-Up Appointment' : 'New Appointment'} />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Save this token number. Please check the live queue before leaving home, and arrive within your suggested arrival window.
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{clinic.phone}</span>
        <span>{clinic.email}</span>
      </div>
    </div>
  )
}

function TicketRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

export function WhatsAppButton({ phone, message, children = 'WhatsApp', className = '', variant = 'success' }) {
  return (
    <a href={getWhatsAppLink(phone, message)} target="_blank" rel="noreferrer" className={className}>
      <Button variant={variant} className="w-full">
        <MessageCircle className="h-4 w-4" />
        {children}
      </Button>
    </a>
  )
}

export function DownloadTicketButton({ onClick, children = 'Download Ticket' }) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <Download className="h-4 w-4" />
      {children}
    </Button>
  )
}

export function DataTable({ columns, rows, emptyTitle = 'No records found' }) {
  if (!rows.length) return <EmptyState title={emptyTitle} description="Try another search, filter, or date range." />
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-cyan-50/30">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-sm text-slate-700">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
