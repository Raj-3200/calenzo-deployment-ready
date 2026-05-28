import { CheckCircle2, ClipboardList, Stethoscope, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { AppointmentCard, Button, Card, PageHeader, StatCard, StatusBadge, Textarea } from '../../components/common/UI'
import { hydratedAppointments, hydratedQueue } from '../../data/demoData'

export default function DoctorSchedule() {
  const current = hydratedQueue.find((item) => item.current_status === 'in_progress') || hydratedQueue[1]
  const next = hydratedQueue.find((item) => item.current_status === 'arrived') || hydratedQueue[2]
  const todayAppointments = hydratedAppointments.filter((item) => item.appointment_date === new Date().toISOString().slice(0, 10))

  return (
    <div>
      <PageHeader
        eyebrow="Doctor view"
        title="Doctor Schedule"
        description="A simplified clinical view focused on current patient, next patient, notes, and status actions."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Completed" value={todayAppointments.filter((item) => item.status === 'completed').length} icon={CheckCircle2} tone="green" />
        <StatCard label="No-shows" value={todayAppointments.filter((item) => item.status === 'no_show').length} icon={UserX} tone="red" />
        <StatCard label="Follow-up required" value="3" icon={ClipboardList} tone="amber" />
        <StatCard label="Remaining" value={todayAppointments.filter((item) => !['completed', 'cancelled'].includes(item.status)).length} icon={UserCheck} tone="cyan" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><Stethoscope className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Current patient</p>
              <h2 className="text-2xl font-black text-slate-950">{current.patient.full_name}</h2>
            </div>
          </div>
          <AppointmentCard appointment={current.appointment} />
          <div className="mt-5">
            <Textarea label="Patient notes" defaultValue={current.appointment.internal_notes || 'Vitals reviewed. Add consultation notes here.'} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => toast.success('Consultation completed')}><CheckCircle2 className="h-4 w-4" />Complete</Button>
            <Button variant="secondary" onClick={() => toast.success('Follow-up marked required')}>Follow-up required</Button>
            <Button variant="danger" onClick={() => toast.success('Patient marked no-show')}>No-show</Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-black text-slate-950">Today&apos;s list</h2>
          <div className="mt-4 space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-black text-slate-950">{String(appointment.token_number).padStart(3, '0')} - {appointment.patient.full_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{appointment.service.title}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">Next patient</p>
            <p className="mt-1 text-sm text-slate-500">{next.patient.full_name} - Token {String(next.token_number).padStart(3, '0')}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
