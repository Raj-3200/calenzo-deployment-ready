export const appointmentStatusConfig = {
  pending: badge('Pending', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-amber-500'),
  confirmed: badge('Confirmed', 'bg-blue-50', 'text-blue-800', 'border-blue-200', 'bg-blue-500'),
  arrived: badge('Arrived', 'bg-violet-50', 'text-violet-800', 'border-violet-200', 'bg-violet-500'),
  in_progress: badge('In Progress', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-200', 'bg-cyan-500'),
  completed: badge('Completed', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-emerald-500'),
  cancelled: badge('Cancelled', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-red-500'),
  no_show: badge('No-show', 'bg-slate-100', 'text-slate-700', 'border-slate-200', 'bg-slate-500'),
  rescheduled: badge('Rescheduled', 'bg-indigo-50', 'text-indigo-800', 'border-indigo-200', 'bg-indigo-500'),
}

export const queueStatusConfig = {
  waiting: badge('Waiting', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-amber-500'),
  arrived: badge('Arrived', 'bg-violet-50', 'text-violet-800', 'border-violet-200', 'bg-violet-500'),
  in_progress: badge('In Progress', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-200', 'bg-cyan-500'),
  completed: badge('Completed', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-emerald-500'),
  skipped: badge('Skipped', 'bg-orange-50', 'text-orange-800', 'border-orange-200', 'bg-orange-500'),
  cancelled: badge('Cancelled', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-red-500'),
}

export const followUpStatusConfig = {
  new: badge('New', 'bg-blue-50', 'text-blue-800', 'border-blue-200', 'bg-blue-500'),
  contacted: badge('Contacted', 'bg-violet-50', 'text-violet-800', 'border-violet-200', 'bg-violet-500'),
  appointment_booked: badge('Appointment Booked', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-200', 'bg-cyan-500'),
  follow_up_needed: badge('Follow-up Needed', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-amber-500'),
  completed: badge('Completed', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-emerald-500'),
  no_show: badge('No-show', 'bg-slate-100', 'text-slate-700', 'border-slate-200', 'bg-slate-500'),
  converted: badge('Converted', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-emerald-500'),
  lost: badge('Lost', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-red-500'),
}

export const priorityConfig = {
  hot: badge('Hot', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-red-500'),
  warm: badge('Warm', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-amber-500'),
  cold: badge('Cold', 'bg-blue-50', 'text-blue-800', 'border-blue-200', 'bg-blue-500'),
}

export const notificationStatusConfig = {
  sent: badge('Sent', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-emerald-500'),
  ready: badge('Ready', 'bg-cyan-50', 'text-cyan-800', 'border-cyan-200', 'bg-cyan-500'),
  pending: badge('Pending', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-amber-500'),
  failed: badge('Failed', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-red-500'),
}

function badge(label, bg, text, border, dot) {
  return { label, bg, text, border, dot }
}

export function getStatusConfig(type, status) {
  const maps = {
    appointment: appointmentStatusConfig,
    queue: queueStatusConfig,
    follow_up: followUpStatusConfig,
    priority: priorityConfig,
    notification: notificationStatusConfig,
  }

  const config = maps[type]?.[status]
  return config || badge(formatStatus(status), 'bg-slate-100', 'text-slate-700', 'border-slate-200', 'bg-slate-500')
}

export function formatStatus(status = '') {
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
