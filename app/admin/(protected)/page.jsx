import { CalendarCheck2, Clock, ListChecks, UserRoundCheck, Users, XCircle } from 'lucide-react'
import { getDashboardData } from '@/lib/data'
import { formatDate, formatTime } from '@/lib/time'
import { AppointmentTrendChart, SourceBreakdownChart } from '@/components/Charts'
import { Badge, Card, EmptyState, PageHeader, StatCard, StatusBadge } from '@/components/ui'

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        title="Clinic command center"
        description="Database-backed appointments, queue, follow-ups, patient activity, and delay health for today."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's appointments" value={data.stats.todayAppointments} icon={CalendarCheck2} />
        <StatCard label="Waiting patients" value={data.stats.waitingPatients} icon={Users} tone="amber" />
        <StatCard label="Completed" value={data.stats.completedAppointments} icon={UserRoundCheck} tone="green" />
        <StatCard label="No-shows" value={data.stats.noShows} icon={XCircle} tone="red" />
        <StatCard label="Pending follow-ups" value={data.stats.pendingFollowUps} icon={ListChecks} tone="violet" />
        <StatCard label="Average wait" value={`${data.stats.averageWaitTime}m`} icon={Clock} />
        <StatCard label="New patients" value={data.stats.newPatients} icon={Users} tone="green" />
        <StatCard label="Follow-up appointments" value={data.stats.followUpAppointments} icon={ListChecks} tone="violet" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AppointmentTrendChart data={data.trend} />
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">Current token</p>
              <p className="mt-2 text-5xl font-bold text-white">{data.stats.currentToken ? `#${data.stats.currentToken}` : '-'}</p>
            </div>
            <Badge tone={data.queue.some((item) => item.delayMinutes > 0) ? 'amber' : 'green'}>
              {data.queue.some((item) => item.delayMinutes > 0) ? 'Delayed' : 'Stable'}
            </Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">Next patient: <span className="font-semibold text-white">{data.stats.nextPatient}</span></p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Today's schedule</h2>
          {data.appointments.length ? (
            <div className="space-y-3">
              {data.appointments.slice(0, 7).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <div>
                    <p className="font-semibold text-white">#{appointment.tokenNumber} {appointment.patient.fullName}</p>
                    <p className="text-sm text-slate-400">{formatTime(appointment.appointmentTime)} - {appointment.service?.title || 'Consultation'}</p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              ))}
            </div>
          ) : <EmptyState title="No appointments today." />}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Pending follow-ups</h2>
          {data.followUps.length ? (
            <div className="space-y-3">
              {data.followUps.map((followUp) => (
                <div key={followUp.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{followUp.patient.fullName}</p>
                    <Badge tone={followUp.priority === 'hot' ? 'red' : followUp.priority === 'warm' ? 'amber' : 'slate'}>{followUp.priority}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">Next: {followUp.nextFollowupDate ? formatDate(followUp.nextFollowupDate) : 'Not set'}</p>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No follow-ups pending." />}
        </Card>
      </div>

      <div className="mt-5">
        <SourceBreakdownChart data={data.sourceBreakdown} />
      </div>
    </>
  )
}
