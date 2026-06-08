'use client'

import { appointmentStatusAction } from '@/app/actions'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['arrived', 'cancelled', 'no_show'],
  arrived: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
  rescheduled: ['confirmed', 'cancelled'],
}

const DESTRUCTIVE = new Set(['cancelled', 'no_show'])

const CONFIRM_CONFIG = {
  cancelled: {
    title: 'Cancel this appointment?',
    description: 'The patient will be removed from the queue. This cannot be undone.',
    confirmLabel: 'Cancel appointment',
  },
  no_show: {
    title: 'Mark as no-show?',
    description: "This increments the patient's no-show count and removes them from the queue.",
    confirmLabel: 'Mark no-show',
  },
}

export function AppointmentStatusButtons({ appointmentId, currentStatus }) {
  const allowed = TRANSITIONS[currentStatus] || []
  const toast = useToast()
  if (!allowed.length) return null

  async function submitStatus(status) {
    const formData = new FormData()
    formData.set('appointmentId', appointmentId)
    formData.set('status', status)
    try {
      await appointmentStatusAction(formData)
      toast.success(`Status updated to ${status.replaceAll('_', ' ')}.`)
    } catch (error) {
      toast.error(error?.message || 'Failed to update status.')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map((nextStatus) =>
        DESTRUCTIVE.has(nextStatus) ? (
          <ConfirmDialog
            key={nextStatus}
            title={CONFIRM_CONFIG[nextStatus].title}
            description={CONFIRM_CONFIG[nextStatus].description}
            confirmLabel={CONFIRM_CONFIG[nextStatus].confirmLabel}
            onConfirm={() => submitStatus(nextStatus)}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="rounded-2xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-400/20"
              >
                {nextStatus.replaceAll('_', ' ')}
              </button>
            )}
          />
        ) : (
          <button
            key={nextStatus}
            type="button"
            onClick={() => submitStatus(nextStatus)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-sky-400"
          >
            {nextStatus.replaceAll('_', ' ')}
          </button>
        ),
      )}
    </div>
  )
}
