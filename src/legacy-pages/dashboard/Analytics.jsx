import { Activity, CalendarDays, CheckCircle2, HeartPulse, TimerReset, TrendingUp, UserPlus, XCircle } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard, PageHeader, StatCard } from '../../components/common/UI'
import { useAnalytics } from '../../hooks/useAnalytics'

const colors = ['#0e7490', '#10b981', '#f59e0b', '#6366f1', '#ef4444']

export default function Analytics() {
  const { stats, charts } = useAnalytics()
  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Track appointment volume, completion, no-shows, follow-up load, demand by service, peak hours, source mix, and patient retention."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total appointments" value={stats.total} icon={CalendarDays} />
        <StatCard label="Today" value={stats.todayCount} icon={Activity} tone="cyan" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="green" />
        <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} tone="red" />
        <StatCard label="No-shows" value={stats.noShows} icon={XCircle} tone="slate" />
        <StatCard label="Pending follow-ups" value={stats.followUpsPending} icon={HeartPulse} tone="amber" />
        <StatCard label="Average wait" value={stats.averageWait} icon={TimerReset} />
        <StatCard label="Patient retention" value={stats.retention} icon={TrendingUp} tone="green" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Walk-ins vs online bookings" description="Operational mix by weekday">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.weeklyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="appointments" fill="#0e7490" radius={[8, 8, 0, 0]} />
              <Bar dataKey="walk_ins" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak booking hours" description="Reception staffing and delay planning">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.peakHourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="bookings" fill="#0891b2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service-wise demand" description="Most requested care categories">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.serviceDemandData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis type="category" dataKey="service" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="bookings" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Appointment source analytics" description="Channel mix across online, WhatsApp, walk-in, and phone">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={charts.sourceData} dataKey="value" nameKey="source" innerRadius={58} outerRadius={98} paddingAngle={3}>
                {charts.sourceData.map((entry, index) => <Cell key={entry.source} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient retention" description="Repeat patients compared with new patients" action={<UserPlus className="h-5 w-5 text-cyan-700" />}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              <Line dataKey="retained" stroke="#0e7490" strokeWidth={3} dot={{ r: 4 }} />
              <Line dataKey="new_patients" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delay frequency" description="Realtime queue signal">
          <div className="flex h-[280px] flex-col items-center justify-center rounded-2xl bg-slate-50">
            <p className="text-6xl font-black text-amber-600">{stats.delayFrequency}</p>
            <p className="mt-3 max-w-sm text-center text-sm leading-6 text-slate-500">Appointments affected by delay alerts this month. Calenzo can generate affected-patient WhatsApp messages.</p>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
