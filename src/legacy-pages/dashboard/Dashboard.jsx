import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Clock3, HeartPulse, Plus, UserRoundCheck, UsersRound, XCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AppointmentCard, Button, Card, ChartCard, PageHeader, QueueCard, StatCard, StatusBadge } from '../../components/common/UI'
import { hydratedAppointments, hydratedFollowUps, hydratedQueue, weeklyAppointments } from '../../data/demoData'
import { getCurrentQueueItem, getNextQueueItem } from '../../utils/queueCalculator'

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const todayAppointments = hydratedAppointments.filter((item) => item.appointment_date === today)
  const stats = [
    { label: "Today's appointments", value: todayAppointments.length, icon: CalendarDays, tone: 'cyan' },
    { label: 'Waiting patients', value: hydratedQueue.filter((item) => ['waiting', 'arrived'].includes(item.current_status)).length, icon: UsersRound, tone: 'amber' },
    { label: 'Completed', value: hydratedAppointments.filter((item) => item.status === 'completed').length, icon: CheckCircle2, tone: 'green' },
    { label: 'No-shows', value: hydratedAppointments.filter((item) => item.status === 'no_show').length, icon: XCircle, tone: 'red' },
    { label: 'Pending follow-ups', value: hydratedFollowUps.filter((item) => !['completed', 'converted', 'lost'].includes(item.status)).length, icon: HeartPulse, tone: 'violet' },
    { label: 'Average wait', value: '18m', icon: Clock3, tone: 'slate' },
    { label: 'New appointments', value: todayAppointments.filter((item) => item.appointment_type === 'new').length, icon: Plus, tone: 'cyan' },
    { label: 'Follow-ups', value: todayAppointments.filter((item) => item.appointment_type === 'follow_up').length, icon: UserRoundCheck, tone: 'green' },
  ]

  const current = getCurrentQueueItem(hydratedQueue)
  const next = getNextQueueItem(hydratedQueue)

  return (
    <div>
      <PageHeader
        eyebrow="Command center"
        title="Clinic Dashboard"
        description="Real-time appointment, queue, follow-up, and performance overview for today's clinic operations."
        action={
          <>
            <Link to="/admin/walk-ins"><Button variant="secondary"><UserRoundCheck className="h-4 w-4" />Walk-in</Button></Link>
            <Link to="/admin/appointments"><Button><Plus className="h-4 w-4" />Appointment</Button></Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => <StatCard key={item.label} {...item} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <ChartCard title="Weekly clinic flow" description="Online appointments and walk-ins by day">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="appointments" fill="#0e7490" radius={[8, 8, 0, 0]} />
              <Bar dataKey="walk_ins" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Live queue preview</h2>
            <Link to="/admin/live-queue" className="text-sm font-bold text-cyan-700">Open</Link>
          </div>
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <Activity className="h-8 w-8 text-cyan-300" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Current token</p>
            <p className="text-5xl font-black">{String(current?.token_number || 0).padStart(3, '0')}</p>
            <p className="mt-2 text-sm text-slate-400">{current?.patient?.full_name}</p>
          </div>
          {next && <div className="mt-4"><QueueCard item={next} /></div>}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Today's schedule</h2>
            <Link to="/admin/appointments" className="text-sm font-bold text-cyan-700">View all</Link>
          </div>
          <div className="grid gap-3">
            {todayAppointments.slice(0, 4).map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} compact />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Follow-up risk</h2>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-3">
            {hydratedFollowUps.slice(0, 4).map((followUp) => (
              <div key={followUp.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">{followUp.patient.full_name}</p>
                    <p className="mt-1 text-xs text-slate-500">{followUp.notes}</p>
                  </div>
                  <StatusBadge type="priority" status={followUp.priority} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
